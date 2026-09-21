/**
 * Observable Dashboard ViewModel (MVVM)
 */
class DashboardViewModel {
    constructor() {
        this.firestoreService = new FirestoreService();
        this.localStorageService = new LocalStorageService();
        
        this.packages = [];
        this.customers = [];
        this.listeners = [];

        this.filters = {
            year: 'ALL',
            month: 'ALL',
            packageId: 'ALL',
            searchQuery: ''
        };

        this.init();
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(callback => callback());
    }

    init() {
        if (firebaseInitialized) {
            this.firestoreService.subscribePackages(packages => {
                this.packages = packages;
                this.notify();
            });

            this.firestoreService.subscribeCustomers(customers => {
                this.customers = customers;
                this.notify();
            });
        } else {
            this.packages = this.localStorageService.getPackages();
            this.customers = this.localStorageService.getCustomers();
            this.notify();
        }
    }

    setFilter(key, value) {
        this.filters[key] = value;
        this.notify();
    }

    resetFilters() {
        this.filters = { year: 'ALL', month: 'ALL', packageId: 'ALL', searchQuery: '' };
        this.notify();
    }

    getFilteredCustomers() {
        return this.customers.filter(c => {
            const date = c.travelDate ? new Date(c.travelDate) : null;
            
            if (this.filters.year !== 'ALL' && date && date.getFullYear().toString() !== this.filters.year) {
                return false;
            }

            if (this.filters.month !== 'ALL' && date && date.getMonth().toString() !== this.filters.month) {
                return false;
            }

            if (this.filters.packageId !== 'ALL' && c.packageId !== this.filters.packageId) {
                return false;
            }

            if (this.filters.searchQuery) {
                const q = this.filters.searchQuery.toLowerCase();
                const matchName = c.name.toLowerCase().includes(q);
                const matchPhone = c.phone.toLowerCase().includes(q);
                const matchEmail = c.email.toLowerCase().includes(q);
                if (!matchName && !matchPhone && !matchEmail) return false;
            }

            return true;
        });
    }

    getKPIMetrics() {
        const filtered = this.getFilteredCustomers();
        const totalTravelers = filtered.length;
        const totalCollected = filtered.reduce((acc, c) => acc + c.advanceAmount, 0);
        const totalRemaining = filtered.reduce((acc, c) => acc + c.remainingAmount, 0);
        
        // Filter package counts by status
    const upcomingCount = this.packages.filter(p => p.status === 'Upcoming' || p.status === 'Today').length;
    const completedCount = this.packages.filter(p => p.status === 'Completed').length;

       return { 
        totalTravelers, 
        totalCollected, 
        totalRemaining, 
        activePackagesCount: this.packages.length,
        upcomingCount,
        completedCount
    };
    }

    getMonthlyAnalytics() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const collectedData = new Array(12).fill(0);
        const pendingData = new Array(12).fill(0);

        this.getFilteredCustomers().forEach(c => {
            if (c.travelDate) {
                const m = new Date(c.travelDate).getMonth();
                collectedData[m] += c.advanceAmount;
                pendingData[m] += c.remainingAmount;
            }
        });

        return { labels: months, collectedData, pendingData };
    }

    async savePackage(pkgData) {
        const pkg = new Package(pkgData);
        if (firebaseInitialized) {
            await this.firestoreService.savePackage(pkg);
        } else {
            this.packages = this.localStorageService.savePackage(pkg);
            this.notify();
        }
    }

    async deletePackage(id) {
        if (firebaseInitialized) {
            await this.firestoreService.deletePackage(id);
        } else {
            this.packages = this.localStorageService.deletePackage(id);
            this.notify();
        }
    }

    async saveCustomer(customerData) {
        const customer = new Customer(customerData);
        if (firebaseInitialized) {
            await this.firestoreService.saveCustomer(customer);
        } else {
            this.customers = this.localStorageService.saveCustomer(customer);
            this.notify();
        }
    }

    async deleteCustomer(id) {
        if (firebaseInitialized) {
            await this.firestoreService.deleteCustomer(id);
        } else {
            this.customers = this.localStorageService.deleteCustomer(id);
            this.notify();
        }
    }
}