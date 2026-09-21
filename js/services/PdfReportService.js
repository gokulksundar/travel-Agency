/**
 * jsPDF Annual GST/ITR Report Service
 */
class PdfReportService {
    static generateAnnualReport({ selectedYear, businessName, customers, packages }) {
        if (typeof window.jspdf === 'undefined') {
            alert('jsPDF library failed to load!');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title & Business Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(3, 105, 161);
        doc.text("ANNUAL TAX & REVENUE REPORT", 14, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(`Entity: ${businessName}`, 14, 28);
        doc.text(`Financial Year: FY ${selectedYear} - ${Number(selectedYear) + 1}`, 14, 34);
        doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 40);

        // Filter bookings by year
        const yearCustomers = customers.filter(c => {
            if (!c.travelDate) return false;
            return new Date(c.travelDate).getFullYear().toString() === selectedYear;
        });

        const totalTravelers = yearCustomers.length;
        const totalGross = yearCustomers.reduce((acc, c) => acc + c.totalAmount, 0);
        const totalCollected = yearCustomers.reduce((acc, c) => acc + c.advanceAmount, 0);
        const totalPending = yearCustomers.reduce((acc, c) => acc + c.remainingAmount, 0);

        // Summary KPI Box
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 46, 182, 28, 3, 3, 'FD');

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50);
        doc.text(`Total Bookings: ${totalTravelers}`, 20, 56);
        doc.text(`Gross Booking Value: RS. ${totalGross.toLocaleString()}`, 20, 66);
        doc.text(`Total Revenue Collected: RS. ${totalCollected.toLocaleString()}`, 100, 56);
        doc.text(`Uncollected Balance: RS. ${totalPending.toLocaleString()}`, 100, 66);

        // Audit Booking Details Table
            const tableData = yearCustomers.map(rawC => {
            const c = rawC instanceof Customer ? rawC : new Customer(rawC);
            const pkg = packages.find(p => p.id === c.packageId);
            return [
                `${c.name} (${c.gender || 'N/A'})`, // Appends gender next to name
                pkg ? pkg.destination : 'N/A',
                c.travelDate || '-',
                `RS. ${c.totalAmount.toLocaleString()}`,
                `RS. ${c.advanceAmount.toLocaleString()}`,
                `RS. ${c.remainingAmount.toLocaleString()}`,
                c.paymentStatus
            ];
        });

        doc.autoTable({
            startY: 80,
            head: [['Customer Name', 'Package', 'Travel Date', 'Total', 'Collected', 'Pending', 'Status']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [3, 105, 161] },
            styles: { fontSize: 8 }
        });

        const finalY = doc.lastAutoTable.finalY || 150;
        doc.setFontSize(9);
        doc.text("Authorized Signatory: ________________________", 120, finalY + 25);

        doc.save(`GST_ITR_Report_FY${selectedYear}.pdf`);
    }
}