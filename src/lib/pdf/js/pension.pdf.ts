import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { formatRupiah } from "@/lib/financial-math";
import {
    PensionInput,
    PensionResult,
} from "@/lib/types";  
import { drawCorporateHeader, COLORS } from "@/lib/pdf/shared";

  // ==========================================
  // 4. PDF PENSIUN & ASURANSI (Shared Style)
  // ==========================================
  export const generatePensionPDF = (input: PensionInput, result: PensionResult, userName: string) => {
    const doc = new jsPDF();
    drawCorporateHeader(doc, "Perencanaan Dana Pensiun", userName);

    let finalY = 55;

    // Summary Box
    doc.setDrawColor(...COLORS.accent);
    doc.roundedRect(14, finalY, doc.internal.pageSize.width - 28, 30, 2, 2, "S");
    
    doc.setFontSize(12);
    doc.text("Total Dana Dibutuhkan:", 20, finalY + 10);
    doc.setFontSize(20);
    doc.setTextColor(...COLORS.primary);
    doc.text(formatRupiah(result.totalFundNeeded), 20, finalY + 22);
    
    finalY += 40;

    // Parameter Table
    autoTable(doc, {
      startY: finalY,
      head: [["Parameter", "Nilai"]],
      body: [
        ["Usia Sekarang", `${input.currentAge} Tahun`],
        ["Usia Pensiun", `${input.retirementAge} Tahun`],
        ["Lama Masa Pensiun", `${input.retirementDuration} Tahun`],
        ["Target Pengeluaran Bulanan (Saat Ini)", formatRupiah(input.currentExpense)],
        ["Asumsi Inflasi", `${input.inflationRate}%`],
        ["Return Investasi", `${input.investmentRate}%`]
      ],
      theme: "grid",
      headStyles: { fillColor: COLORS.primary },
      margin: { left: 14, right: 14, bottom: 20 },
      tableWidth: (doc.internal.pageSize.width - 28) / 2
    });

    // Result Table
    autoTable(doc, {
      startY: finalY,
      head: [["Hasil Analisa", "Nilai"]],
      body: [
        ["Nilai Pengeluaran Nanti (FV)", formatRupiah(result.fvMonthlyExpense)],
        ["Total Dana Dibutuhkan", formatRupiah(result.totalFundNeeded)],
        ["Investasi Bulanan Diperlukan", formatRupiah(result.monthlySaving)]
      ],
      theme: "grid",
      headStyles: { fillColor: COLORS.success },
      margin: { left: doc.internal.pageSize.width / 2 + 5, right: 14 },
      tableWidth: (doc.internal.pageSize.width - 28) / 2
    });

    doc.save(`Pensiun_${userName}.pdf`);
  };