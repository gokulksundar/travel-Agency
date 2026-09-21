/**
 * Package Domain Model
 */
class Package {
    constructor({ id = null, destination, travelDate, pricePerPerson, createdAt = null }) {
        this.id = id;
        this.destination = destination;
        this.travelDate = travelDate;
        this.pricePerPerson = Number(pricePerPerson) || 0;
        this.createdAt = createdAt || new Date().toISOString();
        this.status = this.computeStatus();
    }

    computeStatus() {
        if (!this.travelDate) return 'Upcoming';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const departure = new Date(this.travelDate);
        departure.setHours(0, 0, 0, 0);

        if (departure.getTime() > today.getTime()) return 'Upcoming';
        if (departure.getTime() === today.getTime()) return 'Today';
        return 'Completed';
    }

    getStatusBadge() {
        switch (this.status) {
            case 'Upcoming':
                return `<span class="px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 font-bold text-[10px] inline-flex items-center space-x-1 border border-sky-100">
                            <i class="fa-solid fa-paper-plane text-[9px]"></i>
                            <span>Upcoming</span>
                        </span>`;
            case 'Today':
                return `<span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[10px] inline-flex items-center space-x-1 border border-emerald-100 animate-pulse">
                            <i class="fa-solid fa-circle-dot text-[9px]"></i>
                            <span>Departs Today</span>
                        </span>`;
            case 'Completed':
            default:
                return `<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold text-[10px] inline-flex items-center space-x-1 border border-slate-200">
                            <i class="fa-solid fa-flag-checkered text-[9px]"></i>
                            <span>Completed</span>
                        </span>`;
        }
    }

    toJSON() {
        return {
            destination: this.destination,
            travelDate: this.travelDate,
            pricePerPerson: this.pricePerPerson,
            createdAt: this.createdAt
        };
    }
}