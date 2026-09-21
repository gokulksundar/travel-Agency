/**
 * Cloud Firestore Database Service
 */
class FirestoreService {
    constructor() {
        this.db = db;
    }

    subscribePackages(callback) {
        if (!firebaseInitialized || !this.db) return null;
        return this.db.collection('packages')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const packages = snapshot.docs.map(doc => new Package({ id: doc.id, ...doc.data() }));
                callback(packages);
            }, err => console.error("Firestore Package Sync Error:", err));
    }

    subscribeCustomers(callback) {
        if (!firebaseInitialized || !this.db) return null;
        return this.db.collection('customers')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const customers = snapshot.docs.map(doc => new Customer({ id: doc.id, ...doc.data() }));
                callback(customers);
            }, err => console.error("Firestore Customer Sync Error:", err));
    }

    async savePackage(pkgData) {
        // Ensure object is instantiated as a Package class
        const pkg = pkgData instanceof Package ? pkgData : new Package(pkgData);
        const data = pkg.toJSON();

        if (pkg.id) {
            await this.db.collection('packages').doc(pkg.id).update(data);
            return pkg.id;
        } else {
            const docRef = await this.db.collection('packages').add(data);
            return docRef.id;
        }
    }

    async deletePackage(id) {
        await this.db.collection('packages').doc(id).delete();
    }

    async saveCustomer(customerData) {
        // Ensure object is instantiated as a Customer class
        const customer = customerData instanceof Customer ? customerData : new Customer(customerData);
        const data = customer.toJSON();

        if (customer.id) {
            await this.db.collection('customers').doc(customer.id).update(data);
            return customer.id;
        } else {
            const docRef = await this.db.collection('customers').add(data);
            return docRef.id;
        }
    }

    async deleteCustomer(id) {
        await this.db.collection('customers').doc(id).delete();
    }
}