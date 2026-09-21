/**
 * View Layer Manager (MVVM)
 */
class AppView {
    constructor(viewModel) {
        this.vm = viewModel;
        this.revenueChart = null;

        this.bindEvents();
        this.vm.subscribe(() => this.render());
    }

    bindEvents() {
        // Navigation Bar Switches
        document.getElementById('nav-dashboard').addEventListener('click', () => this.switchTab('dashboard'));
        document.getElementById('nav-packages').addEventListener('click', () => this.switchTab('packages'));
        document.getElementById('nav-customers').addEventListener('click', () => this.switchTab('customers'));
        document.getElementById('nav-reports').addEventListener('click', () => this.switchTab('reports'));
        document.getElementById('btn-view-all-customers').addEventListener('click', () => this.switchTab('customers'));

        // Filter Controls
        document.getElementById('filter-year').addEventListener('change', (e) => this.vm.setFilter('year', e.target.value));
        document.getElementById('filter-month').addEventListener('change', (e) => this.vm.setFilter('month', e.target.value));
        document.getElementById('filter-package').addEventListener('change', (e) => this.vm.setFilter('packageId', e.target.value));
        document.getElementById('filter-search').addEventListener('input', (e) => this.vm.setFilter('searchQuery', e.target.value));
        document.getElementById('btn-reset-filters').addEventListener('click', () => {
            document.getElementById('filter-year').value = 'ALL';
            document.getElementById('filter-month').value = 'ALL';
            document.getElementById('filter-package').value = 'ALL';
            document.getElementById('filter-search').value = '';
            this.vm.resetFilters();
        });

        // Modals Open/Close
        document.getElementById('btn-open-package-modal').addEventListener('click', () => this.openPackageModal());
        document.getElementById('btn-add-package-alt').addEventListener('click', () => this.openPackageModal());
        document.getElementById('btn-open-customer-modal').addEventListener('click', () => this.openCustomerModal());
        document.getElementById('btn-add-customer-alt').addEventListener('click', () => this.openCustomerModal());

        document.querySelectorAll('.btn-close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Modal Form Submissions
        document.getElementById('form-package').addEventListener('submit', (e) => this.handlePackageSubmit(e));
        document.getElementById('form-customer').addEventListener('submit', (e) => this.handleCustomerSubmit(e));

        // Auto balance calculation
        const totalIn = document.getElementById('customer-total');
        const advIn = document.getElementById('customer-advance');
        const remIn = document.getElementById('customer-remaining');

        const calcRem = () => {
            const tot = Number(totalIn.value) || 0;
            const adv = Number(advIn.value) || 0;
            remIn.value = Math.max(0, tot - adv);
        };
        totalIn.addEventListener('input', calcRem);
        advIn.addEventListener('input', calcRem);

        // Dynamic pricing autofill on package selection
        document.getElementById('customer-package-id').addEventListener('change', (e) => {
            const pkg = this.vm.packages.find(p => p.id === e.target.value);
            if (pkg) {
                totalIn.value = pkg.pricePerPerson;
                if (pkg.travelDate) document.getElementById('customer-travel-date').value = pkg.travelDate;
                calcRem();
            }
        });

        // GST PDF Generation
        document.getElementById('btn-generate-pdf').addEventListener('click', () => {
            const selectedYear = document.getElementById('report-year').value;
            const businessName = document.getElementById('report-business-name').value;
            PdfReportService.generateAnnualReport({
                selectedYear,
                businessName,
                customers: this.vm.customers,
                packages: this.vm.packages
            });
        });
    }

    switchTab(tab) {
        ['dashboard', 'packages', 'customers', 'reports'].forEach(t => {
            document.getElementById(`view-${t}`).classList.add('hidden');
            const navBtn = document.getElementById(`nav-${t}`);
            if (navBtn) {
                navBtn.classList.remove('bg-sky-600/10', 'text-sky-400', 'border', 'border-sky-500/20');
                navBtn.classList.add('text-slate-400');
            }
        });

        document.getElementById(`view-${tab}`).classList.remove('hidden');
        const activeNav = document.getElementById(`nav-${tab}`);
        if (activeNav) {
            activeNav.classList.add('bg-sky-600/10', 'text-sky-400', 'border', 'border-sky-500/20');
            activeNav.classList.remove('text-slate-400');
        }

        const titles = {
            dashboard: 'Dashboard Overview',
            packages: 'Manage Tour Packages',
            customers: 'Customer Booking Directory',
            reports: 'Annual Financial & GST Audit Reports'
        };
        document.getElementById('page-title').textContent = titles[tab];
    }

    render() {
        this.renderDatabaseStatus();
        this.renderKPICards();
        this.renderPackageFilterOptions();
        this.renderRecentDashboardTable();
        this.renderPackagesGrid();
        this.renderFullCustomersTable();
        this.renderRevenueChart();
    }

    renderDatabaseStatus() {
        const title = document.getElementById('db-status-title');
        const subtitle = document.getElementById('db-status-subtitle');
        const dot = document.getElementById('db-status-dot');

        if (firebaseInitialized) {
            title.textContent = "Firestore Active";
            subtitle.textContent = "Project: travel-test-o7";
            dot.className = "relative inline-flex rounded-full h-3 w-3 bg-emerald-500";
        } else {
            title.textContent = "Local Storage Mode";
            subtitle.textContent = "Offline Fallback Persistent";
            dot.className = "relative inline-flex rounded-full h-3 w-3 bg-amber-500";
        }
    }

    renderKPICards() {
        const metrics = this.vm.getKPIMetrics();
        document.getElementById('kpi-customers').textContent = metrics.totalTravelers;
        document.getElementById('kpi-collected').textContent = `₹${metrics.totalCollected.toLocaleString()}`;
        document.getElementById('kpi-remaining').textContent = `₹${metrics.totalRemaining.toLocaleString()}`;
        document.getElementById('kpi-packages').textContent = metrics.activePackagesCount;
    }

    renderPackageFilterOptions() {
        const select = document.getElementById('filter-package');
        const modalSelect = document.getElementById('customer-package-id');
        const currentVal = select.value;

        let options = '<option value="ALL">All Destinations / Packages</option>';
        let modalOptions = '<option value="">-- Select Package Destination --</option>';

        this.vm.packages.forEach(p => {
            options += `<option value="${p.id}">${p.destination}</option>`;
            modalOptions += `<option value="${p.id}">${p.destination} (₹${p.pricePerPerson.toLocaleString()})</option>`;
        });

        select.innerHTML = options;
        modalSelect.innerHTML = modalOptions;
        select.value = currentVal;
    }

    renderRecentDashboardTable() {
        const tbody = document.getElementById('table-dashboard-recent');
        const list = this.vm.getFilteredCustomers().slice(0, 5);

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400">No recent bookings found.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(c => {
            const pkg = this.vm.packages.find(p => p.id === c.packageId);
            const statusBadge = c.paymentStatus === 'Paid'
                ? '<span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[10px]">Fully Paid</span>'
                : '<span class="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 font-bold text-[10px]">Pending</span>';

            return `
                <tr class="hover:bg-slate-50/50">
                    <td class="py-3 px-6 font-bold text-slate-800">${c.name}</td>
                    <td class="py-3 px-6 font-medium text-slate-600">${pkg ? pkg.destination : 'N/A'}</td>
                    <td class="py-3 px-6 text-slate-500">${c.travelDate || '-'}</td>
                    <td class="py-3 px-6 font-bold text-slate-800">₹${c.totalAmount.toLocaleString()}</td>
                    <td class="py-3 px-6 font-semibold text-emerald-600">₹${c.advanceAmount.toLocaleString()}</td>
                    <td class="py-3 px-6 font-semibold text-rose-600">₹${c.remainingAmount.toLocaleString()}</td>
                    <td class="py-3 px-6">${statusBadge}</td>
                </tr>
            `;
        }).join('');
    }

    renderPackagesGrid() {
    const grid = document.getElementById('grid-packages');
    if (!this.vm.packages || this.vm.packages.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-8 text-center text-slate-400 text-xs">No active packages registered yet.</div>`;
        return;
    }

    grid.innerHTML = this.vm.packages.map(rawPkg => {
        // Ensure object is instantiated as Package class so prototype methods exist
        const p = rawPkg instanceof Package ? rawPkg : new Package(rawPkg);

        return `
            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 hover:border-sky-300 transition-all flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <!-- Dynamic Status Badge Indicator -->
                        ${p.getStatusBadge()}
                        
                        <div class="space-x-1">
                            <button onclick="window.appView.openPackageModal('${p.id}')" class="text-slate-400 hover:text-sky-600 px-1"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button onclick="window.appView.deletePackage('${p.id}')" class="text-slate-400 hover:text-rose-600 px-1"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    <h4 class="font-bold text-slate-800 text-sm mb-1">${p.destination}</h4>
                    <p class="text-xs text-slate-500 mb-3"><i class="fa-regular fa-calendar mr-1"></i>Departure: ${p.travelDate || 'TBD'}</p>
                </div>
                <div class="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span class="text-xs text-slate-400">Price / Person</span>
                    <span class="font-extrabold text-slate-900 text-sm">₹${p.pricePerPerson.toLocaleString()}</span>
                </div>
            </div>
        `;
    }).join('');
    }

    renderFullCustomersTable() {
        const tbody = document.getElementById('table-customers-full');
    const list = this.vm.getFilteredCustomers();

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-400">No matching customer records found.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(rawC => {
        const c = rawC instanceof Customer ? rawC : new Customer(rawC);
        const pkg = this.vm.packages.find(p => p.id === c.packageId);
        
        const statusBadge = c.paymentStatus === 'Paid'
            ? '<span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[10px]">Fully Paid</span>'
            : '<span class="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 font-bold text-[10px]">Pending</span>';

        return `
            <tr class="hover:bg-slate-50/50">
                <td class="py-3.5 px-6">
                    <div class="flex items-center space-x-2">
                        <span class="font-bold text-slate-900">${c.name}</span>
                        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">${c.gender || 'O'}</span>
                    </div>
                    <div class="text-[11px] text-slate-400">${c.phone} ${c.email ? '• ' + c.email : ''}</div>
                </td>
                <td class="py-3.5 px-6 font-medium text-slate-700">${pkg ? pkg.destination : 'N/A'}</td>
                <td class="py-3.5 px-6 text-slate-500">${c.travelDate || '-'}</td>
                <td class="py-3.5 px-6 font-bold text-slate-900">₹${c.totalAmount.toLocaleString()}</td>
                <td class="py-3.5 px-6 font-semibold text-emerald-600">₹${c.advanceAmount.toLocaleString()}</td>
                <td class="py-3.5 px-6 font-semibold text-rose-600">₹${c.remainingAmount.toLocaleString()}</td>
                <td class="py-3.5 px-6">${statusBadge}</td>
                <td class="py-3.5 px-6 text-right space-x-2">
                    <button onclick="window.appView.openCustomerModal('${c.id}')" class="text-slate-400 hover:text-sky-600"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="window.appView.deleteCustomer('${c.id}')" class="text-slate-400 hover:text-rose-600"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
    }

    renderRevenueChart() {
        const ctx = document.getElementById('chart-revenue');
        if (!ctx) return;

        const analytics = this.vm.getMonthlyAnalytics();

        if (this.revenueChart) {
            this.revenueChart.destroy();
        }

        this.revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: analytics.labels,
                datasets: [
                    {
                        label: 'Revenue Collected (₹)',
                        data: analytics.collectedData,
                        backgroundColor: '#0284c7',
                        borderRadius: 6
                    },
                    {
                        label: 'Pending Balance (₹)',
                        data: analytics.pendingData,
                        backgroundColor: '#f43f5e',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { family: 'Plus Jakarta Sans', size: 11 } } }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: '#f1f5f9' }, ticks: { callback: v => '₹' + v } }
                }
            }
        });
    }

    openPackageModal(id = null) {
        document.getElementById('form-package').reset();
        document.getElementById('package-id').value = id || '';
        document.getElementById('modal-package-title').textContent = id ? 'Edit Package' : 'Add New Travel Package';

        if (id) {
            const pkg = this.vm.packages.find(p => p.id === id);
            if (pkg) {
                document.getElementById('package-destination').value = pkg.destination;
                document.getElementById('package-date').value = pkg.travelDate;
                document.getElementById('package-price').value = pkg.pricePerPerson;
            }
        }

        document.getElementById('modal-package').classList.remove('hidden');
    }

    openCustomerModal(id = null) {
        document.getElementById('form-customer').reset();
        document.getElementById('customer-id').value = id || '';
        document.getElementById('modal-customer-title').textContent = id ? 'Edit Customer Booking' : 'New Customer Booking';

        if (id) {
            const c = this.vm.customers.find(item => item.id === id);
            if (c) {
                document.getElementById('customer-name').value = c.name;
                document.getElementById('customer-phone').value = c.phone;
                document.getElementById('customer-gender').value = c.gender || 'Male'; 
                document.getElementById('customer-email').value = c.email || '';
                document.getElementById('customer-package-id').value = c.packageId;
                document.getElementById('customer-travel-date').value = c.travelDate;
                document.getElementById('customer-total').value = c.totalAmount;
                document.getElementById('customer-advance').value = c.advanceAmount;
                document.getElementById('customer-remaining').value = c.remainingAmount;
            }
        }

        document.getElementById('modal-customer').classList.remove('hidden');
    }

    closeModals() {
        document.getElementById('modal-package').classList.add('hidden');
        document.getElementById('modal-customer').classList.add('hidden');
    }

    async handlePackageSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('package-id').value;
        const destination = document.getElementById('package-destination').value;
        const travelDate = document.getElementById('package-date').value;
        const pricePerPerson = document.getElementById('package-price').value;

        await this.vm.savePackage({ id, destination, travelDate, pricePerPerson });
        this.closeModals();
    }

    async handleCustomerSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('customer-id').value;
        const name = document.getElementById('customer-name').value;
        const gender = document.getElementById('customer-gender').value;
        const phone = document.getElementById('customer-phone').value;
        const email = document.getElementById('customer-email').value;
        const packageId = document.getElementById('customer-package-id').value;
        const travelDate = document.getElementById('customer-travel-date').value;
        const totalAmount = document.getElementById('customer-total').value;
        const advanceAmount = document.getElementById('customer-advance').value;

        await this.vm.saveCustomer({ id, name, phone,gender, email, packageId, travelDate, totalAmount, advanceAmount });
        this.closeModals();
    }

    async deletePackage(id) {
        if (confirm('Are you sure you want to delete this travel package?')) {
            await this.vm.deletePackage(id);
        }
    }

    async deleteCustomer(id) {
        if (confirm('Are you sure you want to delete this customer booking record?')) {
            await this.vm.deleteCustomer(id);
        }
    }


}

