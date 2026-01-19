import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRupiah } from "./financial-math";
import { 
  PortfolioSummary, BudgetResult, PensionInput, PensionResult, 
  InsuranceInput, InsuranceResult, SpecialGoalInput, SpecialGoalResult 
} from "./types";

// --- 1. PDF PENDIDIKAN (TETAP) ---
export const generateEducationPDF = (
  portfolio: PortfolioSummary, 
  assumptions: { inflation: number, returnRate: number }
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
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
      
      let gradeInfo = "";
      if (stage.startGrade > 1) {
        if (stage.stageId === "TK") gradeInfo = "(Mulai TK B)";
        else if (stage.paymentFrequency === "SEMESTER") gradeInfo = `(Mulai Smt ${stage.startGrade})`;
        else gradeInfo = `(Mulai Kls ${stage.startGrade})`;
      }
      
      doc.text(`• ${stage.label} ${gradeInfo}`, 14, finalY);

      const tableBody = stage.details?.map((item, i) => {
        let label = item.item;
        if (stage.stageId === "TK" && item.item.toLowerCase().includes("spp")) {
             const currentGrade = stage.startGrade + i;
             label = currentGrade === 1 ? "SPP TK A" : "SPP TK B";
        } else if (stage.paymentFrequency === "SEMESTER" && item.item.toLowerCase().includes("ukt")) {
             const startSem = stage.startGrade + (i * 2);
             const endSem = startSem + 1;
             label = `Biaya Semester ${startSem} - ${endSem}`;
        }
        return [
          label,
          `${item.dueYear} Tahun`,
          formatRupiah(item.futureCost),
          formatRupiah(item.requiredSaving)
        ];
      }) || [];

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

  doc.save(`Rencana_Pendidikan.pdf`);
};

// --- 2. PDF BUDGET (TETAP) ---
export const generateBudgetPDF = (
  monthly: BudgetResult,
  annual: BudgetResult,
  profile: { name: string; age: string; fixedIncome: number }
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  const drawHeader = (title: string) => {
    doc.setFillColor(16, 185, 129); // Emerald
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Klien: ${profile.name || "Pengguna"} (${profile.age} Th) • ${new Date().toLocaleDateString("id-ID")}`, 14, 28);
  };

  // Hal 1: Bulanan
  drawHeader("Financial Checkup: Bulanan");
  let finalY = 50;

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Pemasukkan Tetap (Gaji Bulan Ini)", 14, finalY);
  finalY += 5;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(14, finalY, pageWidth - 28, 20, 2, 2, "FD");
  doc.setFontSize(14);
  doc.setTextColor(6, 78, 59);
  doc.text(formatRupiah(profile.fixedIncome), 20, finalY + 13);
  finalY += 35;

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
  doc.text("Gunakan dana ini untuk operasional bulan ini.", 14, finalY + 8);
  finalY += 20;

  let tableBody = monthly.allocations.map(item => [
    item.label, `${item.percentage}%`, formatRupiah(item.amount), item.description
  ]);

  autoTable(doc, {
    startY: finalY + 5,
    head: [["Pos Alokasi", "Porsi", "Nominal (Bln)", "Keterangan"]],
    body: tableBody,
    theme: "striped",
    headStyles: { fillColor: [6, 95, 70] },
    margin: { left: 14, right: 14 }
  });

  // Hal 2: Tahunan
  doc.addPage();
  drawHeader("Financial Checkup: Proyeksi Tahunan");
  finalY = 50;
  
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.text("Potensi akumulasi kekayaan jika disiplin 12 bulan:", 14, finalY);
  finalY += 15;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, finalY, (pageWidth - 35) / 2, 25, 2, 2, "F");
  doc.setFontSize(10);
  doc.text("Total Pemasukkan Setahun", 20, finalY + 8);
  doc.setFontSize(14);
  doc.setTextColor(6, 78, 59);
  doc.text(formatRupiah(profile.fixedIncome * 12), 20, finalY + 18);

  doc.setFillColor(255, 241, 242);
  doc.roundedRect(14 + (pageWidth - 35) / 2 + 7, finalY, (pageWidth - 35) / 2, 25, 2, 2, "F");
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.text("Total Biaya Hidup Setahun", 20 + (pageWidth - 35) / 2 + 7, finalY + 8);
  doc.setFontSize(14);
  doc.setTextColor(190, 18, 60);
  doc.text(formatRupiah(annual.safeToSpend), 20 + (pageWidth - 35) / 2 + 7, finalY + 18);

  finalY += 40;
  
  tableBody = annual.allocations.map(item => [
    item.label, `${item.percentage}%`, formatRupiah(item.amount), "Akumulasi 12 Bulan"
  ]);

  autoTable(doc, {
    startY: finalY + 5,
    head: [["Pos Alokasi", "Porsi", "Proyeksi Tahunan", "Catatan"]],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 }
  });

  doc.save(`Financial_Checkup_${profile.name}.pdf`);
};

// --- 3. PDF DANA PENSIUN (UPDATE: REAL RATE) ---
export const generatePensionPDF = (
  input: PensionInput,
  result: PensionResult,
  userName: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Rencana Dana Pensiun", 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Disiapkan untuk: ${userName} • ${new Date().toLocaleDateString("id-ID")}`, 14, 28);

  let finalY = 55;

  // Profil & Asumsi
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Profil & Asumsi Dasar", 14, finalY);
  
  const tableData = [
    ["Usia Sekarang", `${input.currentAge} Tahun`, "Asumsi Inflasi", `${input.inflationRate}% / tahun`],
    ["Usia Pensiun", `${input.retirementAge} Tahun`, "Return Investasi", `${input.investmentRate}% / tahun`],
    ["Saldo Awal Pensiun", formatRupiah(input.currentFund), "Lama Masa Pensiun", `${input.retirementDuration} Tahun`],
    ["Target Pemasukan (Real)", formatRupiah(input.currentExpense), "Masa Menabung", `${result.workingYears} Tahun`]
  ];

  autoTable(doc, {
    startY: finalY + 5,
    head: [],
    body: tableData,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [243, 244, 246] },
      2: { fontStyle: "bold", fillColor: [243, 244, 246] }
    },
    margin: { left: 14, right: 14 }
  });

  finalY = (doc as any).lastAutoTable.finalY + 20;

  // Analisa Corpus
  doc.setFillColor(238, 242, 255); // Indigo-50
  doc.setDrawColor(79, 70, 229);
  doc.roundedRect(14, finalY, pageWidth - 28, 45, 3, 3, "FD");

  doc.setTextColor(55, 48, 163); // Indigo-900
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Total Dana Pensiun", 20, finalY + 12);

  doc.setFontSize(28);
  doc.setTextColor(79, 70, 229);
  doc.text(formatRupiah(result.totalFundNeeded), 20, finalY + 25);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Target dana ini menggunakan asumsi 'Uang Terus Bekerja' (Real Rate) selama ${input.retirementDuration} tahun masa pensiun.`, 20, finalY + 35);
  
  // Biaya Hidup FV
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`Nilai Nominal (FV) dari Target Pemasukan:`, pageWidth / 2, finalY + 15);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(formatRupiah(result.fvMonthlyExpense), pageWidth / 2, finalY + 25);

  finalY += 60;

  // Action Plan
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Rencana Aksi (Action Plan)", 14, finalY);

  finalY += 5;
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(14, finalY, pageWidth - 28, 30, 3, 3, "FD");

  doc.setTextColor(6, 78, 59); // Emerald-900
  doc.setFontSize(11);
  doc.text("Investasi Bulanan yang Diperlukan:", 20, finalY + 10);
  
  doc.setFontSize(20);
  doc.setTextColor(5, 150, 105);
  doc.setFont("helvetica", "bold");
  doc.text(formatRupiah(result.monthlySaving), 20, finalY + 22);
  
  doc.setFontSize(10);
  doc.setTextColor(6, 78, 59);
  doc.setFont("helvetica", "normal");
  doc.text(`Rutin selama ${result.workingYears} tahun ke depan pada instrumen return ${input.investmentRate}%.`, pageWidth / 2, finalY + 18);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Simulasi ini menggunakan metode Real Rate of Return (Net Investasi - Inflasi) sesuai standar perencanaan keuangan.`, 14, doc.internal.pageSize.height - 10);

  doc.save(`Rencana_Pensiun_${userName}.pdf`);
};

// --- 4. PDF ASURANSI JIWA (MENU 4) ---
export const generateInsurancePDF = (
  input: InsuranceInput,
  result: InsuranceResult,
  userName: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFillColor(225, 29, 72); // Rose-600
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Perencanaan Asuransi Jiwa", 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Proteksi Keluarga untuk: ${userName} • ${new Date().toLocaleDateString("id-ID")}`, 14, 28);

  let finalY = 55;

  // Profil & Asumsi
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Data Finansial Saat Ini", 14, finalY);
  
  const tableData = [
    ["Penghasilan Tahunan", formatRupiah(input.annualIncome), "Masa Perlindungan", `${input.protectionDuration} Tahun`],
    ["Asumsi Inflasi", `${input.inflationRate}%`, "Return Investasi (Low Risk)", `${input.investmentRate}%`],
    ["Total Utang Saat Ini", formatRupiah(result.totalDebt), "Asuransi Sudah Dimiliki", formatRupiah(input.existingInsurance)]
  ];

  autoTable(doc, {
    startY: finalY + 5,
    head: [],
    body: tableData,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [255, 241, 242] }, // Rose-50
      2: { fontStyle: "bold", fillColor: [255, 241, 242] }
    },
    margin: { left: 14, right: 14 }
  });

  finalY = (doc as any).lastAutoTable.finalY + 20;

  // Rincian Perhitungan
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Analisa Kebutuhan Uang Pertanggungan (UP)", 14, finalY);

  const breakdownData = [
    ["1. Dana Pelunasan Utang", formatRupiah(result.totalDebt), "Membersihkan kewajiban agar keluarga bebas beban."],
    ["2. Dana Pengganti Penghasilan", formatRupiah(result.incomeReplacementValue), `Modal untuk mengganti gaji ${formatRupiah(input.annualIncome)} selama ${input.protectionDuration} tahun (Metode PVAD).`],
    ["3. Biaya Akhir Hayat", formatRupiah(input.finalExpense), "Biaya pemakaman, upacara, dan administrasi."],
    ["TOTAL KEBUTUHAN", formatRupiah(result.totalFundNeeded), "Total dana tunai yang harus tersedia jika risiko terjadi."],
    ["DIKURANGI: Asuransi Lama", `(${formatRupiah(input.existingInsurance)})`, "UP dari polis yang sudah aktif saat ini."]
  ];

  autoTable(doc, {
    startY: finalY + 5,
    head: [["Komponen", "Nilai", "Keterangan"]],
    body: breakdownData,
    theme: "striped",
    headStyles: { fillColor: [225, 29, 72] },
    bodyStyles: { fontSize: 10 },
    columnStyles: { 
      1: { fontStyle: "bold", halign: "right" },
      0: { fontStyle: "bold" } 
    },
    margin: { left: 14, right: 14 }
  });

  finalY = (doc as any).lastAutoTable.finalY + 25;

  // Result Box
  doc.setFillColor(255, 241, 242); // Rose-50
  doc.setDrawColor(225, 29, 72);
  doc.roundedRect(14, finalY, pageWidth - 28, 40, 3, 3, "FD");

  doc.setTextColor(159, 18, 57); // Rose-900
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Asuransi Tambahan yg Dibutuhkan", 20, finalY + 12);

  doc.setFontSize(24);
  doc.setTextColor(225, 29, 72);
  doc.text(formatRupiah(result.shortfall), 20, finalY + 25);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Ini adalah nilai pertanggungan polis asuransi jiwa BARU yang disarankan untuk Anda miliki.", 20, finalY + 35);

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Perhitungan Dana Pengganti Penghasilan menggunakan metode Present Value Annuity Due (Kebutuhan di awal periode).", 14, doc.internal.pageSize.height - 10);

  doc.save(`Perencanaan_Asuransi_${userName}.pdf`);
};

// --- 5. PDF SPECIAL GOALS (MENU 6) ---
export const generateSpecialGoalPDF = (
  input: SpecialGoalInput,
  result: SpecialGoalResult,
  userName: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header - Violet Theme
  doc.setFillColor(124, 58, 237); // Violet-600
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Perencanaan Tujuan Khusus", 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`KeuanganKu Enterprise • ${userName} • ${new Date().toLocaleDateString("id-ID")}`, 14, 28);

  let finalY = 55;

  // Section 1: Parameter Tujuan
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Parameter Tujuan Finansial", 14, finalY);

  const tableData = [
    ["Jenis Tujuan", input.goalType, "Biaya Saat Ini", formatRupiah(input.currentCost)],
    ["Target Waktu", `${input.duration} Tahun`, "Asumsi Inflasi", `${input.inflationRate}% / tahun`],
    ["Return Investasi", `${input.investmentRate}% / tahun`, "", ""]
  ];

  autoTable(doc, {
    startY: finalY + 5,
    head: [],
    body: tableData,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [245, 243, 255] }, // Violet-50
      2: { fontStyle: "bold", fillColor: [245, 243, 255] }
    },
    margin: { left: 14, right: 14 }
  });

  finalY = (doc as any).lastAutoTable.finalY + 20;

  // Section 2: Hasil Analisa
  doc.setFillColor(245, 243, 255); // Violet-50
  doc.setDrawColor(124, 58, 237);
  doc.roundedRect(14, finalY, pageWidth - 28, 50, 3, 3, "FD");

  doc.setTextColor(76, 29, 149); // Violet-900
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Target Dana di Masa Depan", 20, finalY + 12);

  doc.setFontSize(26);
  doc.setTextColor(124, 58, 237); // Violet-600
  doc.text(formatRupiah(result.futureValue), 20, finalY + 25);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Nilai ini memperhitungkan kenaikan harga (inflasi) sebesar ${input.inflationRate}% selama ${input.duration} tahun.`, 20, finalY + 35);

  finalY += 60;

  // Section 3: Rekomendasi Tabungan
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Rekomendasi Strategi Menabung", 14, finalY);

  finalY += 5;
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(14, finalY, pageWidth - 28, 35, 3, 3, "FD");

  doc.setTextColor(6, 78, 59); // Emerald-900
  doc.setFontSize(11);
  doc.text("Setoran Rutin Bulanan:", 20, finalY + 10);

  doc.setFontSize(22);
  doc.setTextColor(5, 150, 105); // Emerald-600
  doc.setFont("helvetica", "bold");
  doc.text(formatRupiah(result.monthlySaving), 20, finalY + 23);

  doc.setFontSize(9);
  doc.setTextColor(6, 78, 59);
  doc.setFont("helvetica", "normal");
  doc.text(`*Asumsi dana diinvestasikan dengan return ${input.investmentRate}% per tahun.`, 20, finalY + 30);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Perhitungan menggunakan metode Future Value (Compound Interest) dan Sinking Fund.", 14, doc.internal.pageSize.height - 10);

  doc.save(`Rencana_${input.goalType}_${userName}.pdf`);
};