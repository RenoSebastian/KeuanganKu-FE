import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { formatRupiah } from "@/lib/financial-math";
import {
    PortfolioSummary,
} from "@/lib/types";
import { drawCorporateHeader, COLORS } from "@/lib/pdf/shared";

// ==========================================
  // 2. PDF PENDIDIKAN (Clean Corporate Style)
  // ==========================================
  export const generateEducationPDF = (
    portfolio: PortfolioSummary,
    assumptions: { inflation: number, returnRate: number }
  ) => {
    const doc = new jsPDF();
    drawCorporateHeader(doc, "Rencana Pendidikan Anak");

    let finalY = 50;

    // Ringkasan Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(...COLORS.lightBg);
    doc.roundedRect(14, finalY, doc.internal.pageSize.width - 28, 25, 2, 2, "FD");

    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    doc.text("Total Investasi Bulanan:", 20, finalY + 10);
    doc.text("Total Dana Masa Depan:", doc.internal.pageSize.width / 2 + 5, finalY + 10);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.success);
    doc.text(formatRupiah(portfolio.grandTotalMonthlySaving), 20, finalY + 19);
    doc.setTextColor(...COLORS.primary);
    doc.text(formatRupiah(portfolio.totalFutureCost), doc.internal.pageSize.width / 2 + 5, finalY + 19);

    finalY += 35;

    portfolio.details.forEach((child) => {
      if (finalY > 250) { doc.addPage(); finalY = 20; }

      doc.setFontSize(13);
      doc.setTextColor(...COLORS.primary);
      doc.setFont("helvetica", "bold");
      doc.text(`Anak: ${child.childName}`, 14, finalY);
      finalY += 8;

      const stages = child.stages || [];
      stages.forEach((stage: any) => {
        if (finalY > 230) { doc.addPage(); finalY = 20; }

        doc.setFontSize(11);
        doc.setTextColor(...COLORS.text);
        doc.text(`• ${stage.label}`, 14, finalY);

        const tableBody: RowInput[] = stage.details?.map((item: any) => [
          item.item,
          `${item.dueYear} Th`,
          formatRupiah(item.futureCost),
          formatRupiah(item.requiredSaving)
        ]) || [];

        // Subtotal
        tableBody.push([
          { content: "Subtotal", colSpan: 3, styles: { fontStyle: "bold" as const, halign: "right" } },
          { content: formatRupiah(stage.monthlySaving), styles: { fontStyle: "bold" as const, textColor: COLORS.success } }
        ]);

        autoTable(doc, {
          startY: finalY + 2,
          head: [["Komponen", "Waktu", "Biaya Nanti", "Nabung/Bln"]],
          body: tableBody,
          theme: "plain",
          headStyles: { fillColor: COLORS.lightBg, textColor: COLORS.primary, fontStyle: "bold" as const },
          styles: { fontSize: 9, cellPadding: 3, lineColor: 230, lineWidth: 0.1 },
          margin: { left: 14, right: 14 }
        });

        finalY = (doc as any).lastAutoTable.finalY + 10;
      });
      finalY += 5;
    });

    doc.save(`Rencana_Pendidikan.pdf`);
  };