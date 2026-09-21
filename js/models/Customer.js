class Customer {
    constructor({ id = null, packageId, name, phone, gender,email = '', totalAmount, advanceAmount, travelDate, createdAt = null }) {
        this.id = id;
        this.packageId = packageId;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.gender = gender;
        this.totalAmount = Number(totalAmount) || 0;
        this.advanceAmount = Number(advanceAmount) || 0;
        this.remainingAmount = Math.max(0, this.totalAmount - this.advanceAmount);
        this.travelDate = travelDate;
        this.createdAt = createdAt || new Date().toISOString();
        this.paymentStatus = this.calculateStatus();
    }

    calculateStatus() {
        if (this.remainingAmount <= 0) return 'Paid';
        if (this.advanceAmount > 0) return 'Partial';
        return 'Pending';
    }

    toJSON() {
        return {
            packageId: this.packageId,
            name: this.name,
            phone: this.phone,
            email: this.email,
            gender: this.gender, 
            totalAmount: this.totalAmount,
            advanceAmount: this.advanceAmount,
            remainingAmount: this.remainingAmount,
            travelDate: this.travelDate,
            paymentStatus: this.paymentStatus,
            createdAt: this.createdAt
        };
    }
}
