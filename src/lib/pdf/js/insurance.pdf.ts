import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { formatRupiah } from "@/lib/financial-math";
import {
    InsuranceInput,
    InsuranceResult,
} from "@/lib/types";
import { drawCorporateHeader, COLORS } from "@/lib/pdf/shared";

export const generateInsurancePDF = (input: InsuranceInput, result: InsuranceResult, userName: string) => {
    const doc = new jsPDF();
    drawCorporateHeader(doc, "Perencanaan Proteksi Jiwa", userName);

    let finalY = 50;

    // Result Highlight
    doc.setFillColor(254, 226, 226); // Red-100 (soft)
    doc.rect(14, finalY, doc.internal.pageSize.width - 28, 25, "F");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.danger);
    doc.text("Kekurangan Uang Pertanggungan (Shortfall):", 20, finalY + 10);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(formatRupiah(result.shortfall), 20, finalY + 20);

    finalY += 35;

    const breakdownData: RowInput[] = [
        ["1. Pelunasan Utang", formatRupiah(result.totalDebt)],
        ["2. Pengganti Penghasilan", formatRupiah(result.incomeReplacementValue)],
        ["3. Biaya Akhir Hayat", formatRupiah(input.finalExpense)],
        ["TOTAL KEBUTUHAN", formatRupiah(result.totalFundNeeded)],
        ["DIKURANGI: Asuransi Lama", `(${formatRupiah(input.existingInsurance)})`]
    ];

    autoTable(doc, {
        startY: finalY,
        head: [["Komponen Perhitungan", "Nilai"]],
        body: breakdownData,
        theme: "striped",
        headStyles: { fillColor: COLORS.primary },
        margin: { left: 14, right: 14 }
    });

    doc.save(`Asuransi_${userName}.pdf`);
};