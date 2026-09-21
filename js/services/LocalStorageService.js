/**
 * LocalStorage Fallback Persistence Service
 */
class LocalStorageService {
    constructor() {
        this.PKG_KEY = 'travel_app_packages';
        this.CUST_KEY = 'travel_app_customers';
        this.initDefaultData();
    }

    initDefaultData() {
        if (!localStorage.getItem(this.PKG_KEY)) {
            const defaultPackages = [
                new Package({ id: 'pkg-1', destination: 'Manali Adventure Tour', travelDate: '2026-10-15', pricePerPerson: 18500 }),
                new Package({ id: 'pkg-2', destination: 'Goa Beach Express', travelDate: '2026-11-05', pricePerPerson: 12000 }),
                new Package({ id: 'pkg-3', destination: 'Kashmir Paradise', travelDate: '2026-12-01', pricePerPerson: 25000 })
            ];
            localStorage.setItem(this.PKG_KEY, JSON.stringify(defaultPackages));
        }

        if (!localStorage.getItem(this.CUST_KEY)) {
            const defaultCustomers = [
                new Customer({ id: 'cust-1', packageId: 'pkg-1', name: 'Rahul Sharma', phone: '+91 9876543210', email: 'rahul@gmail.com', totalAmount: 37000, advanceAmount: 10000, travelDate: '2026-10-15' }),
                new Customer({ id: 'cust-2', packageId: 'pkg-2', name: 'Priya Patel', phone: '+91 9822011223', email: 'priya@gmail.com', totalAmount: 24000, advanceAmount: 24000, travelDate: '2026-11-05' })
            ];
            localStorage.setItem(this.CUST_KEY, JSON.stringify(defaultCustomers));
        }
    }

    getPackages() {
        const data = JSON.parse(localStorage.getItem(this.PKG_KEY) || '[]');
        return data.map(item => new Package(item));
    }

    getCustomers() {
        const data = JSON.parse(localStorage.getItem(this.CUST_KEY) || '[]');
        return data.map(item => new Customer(item));
    }

    savePackage(pkg) {
        const packages = this.getPackages();
        if (!pkg.id) pkg.id = 'pkg-' + Date.now();
        const index = packages.findIndex(p => p.id === pkg.id);
        if (index >= 0) packages[index] = pkg;
        else packages.unshift(pkg);
        localStorage.setItem(this.PKG_KEY, JSON.stringify(packages));
        return packages;
    }

    deletePackage(id) {
        const packages = this.getPackages().filter(p => p.id !== id);
        localStorage.setItem(this.PKG_KEY, JSON.stringify(packages));
        return packages;
    }

    saveCustomer(customer) {
        const customers = this.getCustomers();
        if (!customer.id) customer.id = 'cust-' + Date.now();
        const index = customers.findIndex(c => c.id === customer.id);
        if (index >= 0) customers[index] = customer;
        else customers.unshift(customer);
        localStorage.setItem(this.CUST_KEY, JSON.stringify(customers));
        return customers;
    }

    deleteCustomer(id) {
        const customers = this.getCustomers().filter(c => c.id !== id);
        localStorage.setItem(this.CUST_KEY, JSON.stringify(customers));
        return customers;
    }
}