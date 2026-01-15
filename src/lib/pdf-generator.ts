import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRupiah } from "./financial-math";
import { PortfolioSummary, BudgetResult } from "./types";

// --- PDF PENDIDIKAN (TETAP SAMA - JANGAN DIHAPUS) ---
export const generateEducationPDF = (
  portfolio: PortfolioSummary, 
  assumptions: { inflation: number, returnRate: number }
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header Background
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Rencana Pendidikan Anak", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`KeuanganKu Enterprise • ${new Date().toLocaleDateString("id-ID")}`, 14, 28);

  let finalY = 50;

  // Ringkasan
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

  // Rincian Per Anak
  portfolio.details.forEach((child) => {
    if (finalY > 250) { doc.addPage(); finalY = 20; }

    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.setFont("helvetica", "bold");
    doc.text(`Anak: ${child.childName}`, 14, finalY);
    finalY += 8;

    child.stages.forEach((stage) => {
      if (finalY > 230) { doc.addPage(); finalY = 20; }

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "bold");
      const gradeInfo = stage.startGrade > 1 
        ? `(Mulai ${stage.paymentFrequency === "SEMESTER" ? "Semester" : "Kelas"} ${stage.startGrade})`
        : "";
      doc.text(`• ${stage.label} ${gradeInfo}`, 14, finalY);

      const tableBody = stage.details?.map(item => [
        item.item,
        `${item.dueYear} Tahun`,
        formatRupiah(item.futureCost),
        formatRupiah(item.requiredSaving)
      ]) || [];

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
        margin: { left: 14, right: 14 }
      });

      finalY = (doc as any).lastAutoTable.finalY + 12;
    });

    doc.setDrawColor(220, 220, 220);
    doc.line(14, finalY, pageWidth - 14, finalY);
    finalY += 15;
  });

  doc.save(`Rencana_Pendidikan_Lengkap.pdf`);
};

// --- PDF BUDGET (DUAL VIEW UPDATE) ---
export const generateBudgetPDF = (
  monthly: BudgetResult,
  annual: BudgetResult,
  profile: { name: string; age: string; fixedIncome: number }
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- HEADER (Shared) ---
  const drawHeader = (title: string) => {
    doc.setFillColor(16, 185, 129); // Emerald-500
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Klien: ${profile.name || "Pengguna"} (${profile.age} Th) • ${new Date().toLocaleDateString("id-ID")}`, 14, 28);
  };

  // ==========================
  // HALAMAN 1: STRATEGI BULANAN
  // ==========================
  drawHeader("Financial Checkup: Bulanan");
  
  let finalY = 50;

  // Ringkasan Gaji Bulanan
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Pemasukkan Tetap (Gaji Bulan Ini)", 14, finalY);
  
  finalY += 5;
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(14, finalY, pageWidth - 28, 20, 2, 2, "FD");
  
  doc.setFontSize(14);
  doc.setTextColor(6, 78, 59); // Emerald-900
  doc.text(formatRupiah(profile.fixedIncome), 20, finalY + 13);
  
  finalY += 35;

  // Safe To Spend Bulanan
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.text("Batas Aman Biaya Hidup (45%)", 14, finalY);
  
  finalY += 8;
  doc.setFontSize(26);
  doc.setTextColor(16, 185, 129);
  doc.setFont("helvetica", "bold");
  doc.text(formatRupiah(monthly.safeToSpend), 14, finalY);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Gunakan dana ini untuk operasional bulan ini (Makan, Transport, Listrik).", 14, finalY + 8);

  finalY += 20;

  // Tabel Alokasi Bulanan
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Rincian Pos Wajib (Bulanan)", 14, finalY);

  let tableBody = monthly.allocations.map(item => [
    item.label,
    `${item.percentage}%`,
    formatRupiah(item.amount),
    item.description
  ]);

  autoTable(doc, {
    startY: finalY + 5,
    head: [["Pos Alokasi", "Porsi", "Nominal (Bln)", "Keterangan"]],
    body: tableBody,
    theme: "striped",
    headStyles: { fillColor: [6, 95, 70] },
    columnStyles: { 2: { fontStyle: "bold" } },
    margin: { left: 14, right: 14 }
  });

  // Surplus Bulanan
  finalY = (doc as any).lastAutoTable.finalY + 15;
  if (monthly.surplus > 0) {
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(59, 130, 246);
    doc.roundedRect(14, finalY, pageWidth - 28, 20, 2, 2, "FD");
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.setFont("helvetica", "bold");
    doc.text(`Surplus Bulanan (Dana Dingin): ${formatRupiah(monthly.surplus)}`, 20, finalY + 12);
  }

  // ==========================
  // HALAMAN 2: PROYEKSI TAHUNAN
  // ==========================
  doc.addPage();
  drawHeader("Financial Checkup: Proyeksi Tahunan");

  finalY = 50;

  // Intro
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.text("Berikut adalah potensi akumulasi kekayaan Anda jika disiplin selama 12 bulan:", 14, finalY);
  finalY += 15;

  // Highlights Card (Tahunan)
  // 1. Total Gaji Setahun
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, finalY, (pageWidth - 35) / 2, 25, 2, 2, "F");
  doc.setFontSize(10);
  doc.text("Total Pemasukkan Setahun", 20, finalY + 8);
  doc.setFontSize(14);
  doc.setTextColor(6, 78, 59);
  doc.text(formatRupiah(profile.fixedIncome * 12), 20, finalY + 18);

  // 2. Total Gaya Hidup
  doc.setFillColor(255, 241, 242);
  doc.roundedRect(14 + (pageWidth - 35) / 2 + 7, finalY, (pageWidth - 35) / 2, 25, 2, 2, "F");
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.text("Total Biaya Hidup Setahun", 20 + (pageWidth - 35) / 2 + 7, finalY + 8);
  doc.setFontSize(14);
  doc.setTextColor(190, 18, 60);
  doc.text(formatRupiah(annual.safeToSpend), 20 + (pageWidth - 35) / 2 + 7, finalY + 18);

  finalY += 40;

  // Tabel Proyeksi Tahunan
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.text("Rincian Akumulasi Setahun", 14, finalY);

  tableBody = annual.allocations.map(item => [
    item.label,
    `${item.percentage}%`,
    formatRupiah(item.amount),
    "Akumulasi 12 Bulan"
  ]);

  autoTable(doc, {
    startY: finalY + 5,
    head: [["Pos Alokasi", "Porsi", "Proyeksi Tahunan", "Catatan"]],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] }, // Blue Header for Annual
    columnStyles: { 2: { fontStyle: "bold", textColor: [30, 58, 138] } },
    margin: { left: 14, right: 14 }
  });

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Metode: Financial Health Checkup (20/15/10/10). Konsistensi adalah kunci.", 14, doc.internal.pageSize.height - 10);

  doc.save(`Financial_Checkup_Lengkap_${profile.name}.pdf`);
};