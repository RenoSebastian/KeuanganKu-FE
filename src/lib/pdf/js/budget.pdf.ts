import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { formatRupiah } from "@/lib/financial-math";
import { BudgetResult } from "@/lib/types";
import { drawCorporateHeader, COLORS } from "@/lib/pdf/shared";

// ==========================================
// 3. PDF BUDGET (Clean Corporate Style)
// ==========================================
export const generateBudgetPDF = (
    monthly: BudgetResult,
    annual: BudgetResult,
    profile: { name: string; age: string; fixedIncome: number }
) => {
    const doc = new jsPDF();
    drawCorporateHeader(doc, "Financial Checkup: Budgeting", `Klien: ${profile.name}`);

    let finalY = 50;

    // Monthly Overview
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Alokasi Bulanan", 14, finalY);
    finalY += 5;

    doc.setFillColor(...COLORS.lightBg);
    doc.rect(14, finalY, doc.internal.pageSize.width - 28, 20, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Pemasukan Tetap:", 20, finalY + 13);
    doc.setFont("helvetica", "bold");
    doc.text(formatRupiah(profile.fixedIncome), 60, finalY + 13);

    doc.setFont("helvetica", "normal");
    doc.text("Batas Aman Biaya Hidup:", doc.internal.pageSize.width / 2 + 10, finalY + 13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.success);
    doc.text(formatRupiah(monthly.safeToSpend), doc.internal.pageSize.width / 2 + 60, finalY + 13);
    doc.setTextColor(...COLORS.text); // Reset text color

    finalY += 30;

    const tableBody: RowInput[] = monthly.allocations.map(item => [
        item.label, `${item.percentage}%`, formatRupiah(item.amount), item.description
    ]);

    autoTable(doc, {
        startY: finalY,
        head: [["Pos Alokasi", "Porsi", "Nominal (Bln)", "Keterangan"]],
        body: tableBody,
        theme: "striped",
        headStyles: { fillColor: COLORS.primary },
        margin: { left: 14, right: 14 }
    });

    doc.save(`Budgeting_${profile.name}.pdf`);
};