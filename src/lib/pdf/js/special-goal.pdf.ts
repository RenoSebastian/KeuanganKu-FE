import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { formatRupiah } from "@/lib/financial-math";
import {
    PortfolioSummary,
    BudgetResult,
    PensionInput,
    PensionResult,
    InsuranceInput,
    InsuranceResult,
    SpecialGoalInput,
    SpecialGoalResult,
    FinancialRecord,
    HealthAnalysisResult
} from "@/lib/types";
import { drawCorporateHeader, COLORS } from "@/lib/pdf/shared";

export const generateSpecialGoalPDF = (input: SpecialGoalInput, result: SpecialGoalResult, userName: string) => {
    const doc = new jsPDF();
    drawCorporateHeader(doc, `Rencana: ${input.goalType}`, userName);

    let finalY = 50;

    doc.setFontSize(12);
    doc.setTextColor(...COLORS.text);
    doc.text("Target Dana Masa Depan (Future Value):", 14, finalY);
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text(formatRupiah(result.futureValue), 14, finalY + 10);

    finalY += 20;

    autoTable(doc, {
        startY: finalY,
        head: [["Parameter", "Nilai"]],
        body: [
            ["Biaya Saat Ini", formatRupiah(input.currentCost)],
            ["Waktu Pencapaian", `${input.duration} Tahun`],
            ["Asumsi Inflasi", `${input.inflationRate}%`],
            ["Target Return Investasi", `${input.investmentRate}%`],
            ["Investasi Rutin Diperlukan", formatRupiah(result.monthlySaving)]
        ],
        theme: "striped",
        headStyles: { fillColor: COLORS.primary },
        margin: { left: 14, right: 14 }
    });

    doc.save(`Goal_${input.goalType}.pdf`);
};