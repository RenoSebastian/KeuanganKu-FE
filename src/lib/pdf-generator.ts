import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRupiah } from "./financial-math";
import { PortfolioSummary } from "./types";

export const generateEducationPDF = (
  portfolio: PortfolioSummary, 
  assumptions: { inflation: number, returnRate: number }
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- HEADER (Tetap Sama) ---
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Rencana Pendidikan Anak", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`KeuanganKu Enterprise • ${new Date().toLocaleDateString("id-ID")}`, 14, 28);

  let finalY = 50;

  // --- RINGKASAN GLOBAL ---
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan Portfolio Keluarga", 14, finalY);

  finalY += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, finalY, pageWidth - 28, 25, 3, 3, "FD");

  doc.setFontSize(10);
  doc.text("Total Investasi Bulanan:", 20, finalY + 10);
  doc.text("Total Dana Masa Depan:", pageWidth / 2 + 5, finalY + 10);

  doc.setFontSize(16);
  doc.setTextColor(22, 163, 74);
  doc.text(formatRupiah(portfolio.grandTotalMonthlySaving), 20, finalY + 19);
  doc.setTextColor(220, 38, 38);
  doc.text(formatRupiah(portfolio.totalFutureCost), pageWidth / 2 + 5, finalY + 19);

  finalY += 35;

  // --- RINCIAN PER ANAK ---
  portfolio.details.forEach((child) => {
    if (finalY > 250) { doc.addPage(); finalY = 20; }

    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.setFont("helvetica", "bold");
    doc.text(`Anak: ${child.childName}`, 14, finalY);
    finalY += 8;

    // LOOP SETIAP JENJANG
    child.stages.forEach((stage) => {
      if (finalY > 230) { doc.addPage(); finalY = 20; }

      // Judul Jenjang (Misal: Sekolah Dasar)
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "bold");
      const gradeInfo = stage.startGrade > 1 
        ? `(Mulai ${stage.paymentFrequency === "SEMESTER" ? "Semester" : "Kelas"} ${stage.startGrade})`
        : "";
      doc.text(`• ${stage.label} ${gradeInfo}`, 14, finalY);

      // Siapkan Data Tabel Detail
      // Kita ambil detail cashflow dari logic 'calculateStageGranular'
      const tableBody = stage.details?.map(item => [
        item.item, // "Uang Pangkal" atau "SPP Tahun ke-1"
        `${item.dueYear} Tahun`, // Periode Waktu
        formatRupiah(item.futureCost), // Biaya Mendatang
        formatRupiah(item.requiredSaving) // Tabungan Bulanan
      ]) || [];

      // Row Total per Jenjang
      tableBody.push([
        { content: "Subtotal Jenjang", colSpan: 3, styles: { fontStyle: "bold", halign: "right" } },
        { content: formatRupiah(stage.monthlySaving), styles: { fontStyle: "bold", textColor: [22, 163, 74] } }
      ] as any);

      autoTable(doc, {
        startY: finalY + 2,
        head: [["Komponen Biaya", "Waktu Tunggu", "Biaya Nanti (fv)", "Nabung /Bln"]],
        body: tableBody,
        theme: "grid",
        headStyles: { fillColor: [100, 116, 139], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 60 },
          2: { fontStyle: "bold" },
          3: { fontStyle: "bold", textColor: [22, 163, 74] }
        },
        margin: { left: 14, right: 14 }
      });

      finalY = (doc as any).lastAutoTable.finalY + 12;
    });

    // Garis Pemisah Antar Anak
    doc.setDrawColor(220, 220, 220);
    doc.line(14, finalY, pageWidth - 14, finalY);
    finalY += 15;
  });

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Asumsi: Inflasi ${assumptions.inflation}%, Return ${assumptions.returnRate}%. Simulasi bukan jaminan hasil investasi.`, 14, doc.internal.pageSize.height - 10);

  doc.save(`Rencana_Pendidikan_Lengkap.pdf`);
};