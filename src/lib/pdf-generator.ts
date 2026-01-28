  import jsPDF from "jspdf";
  import autoTable, { RowInput } from "jspdf-autotable";
  import { formatRupiah } from "./financial-math";
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
  } from "./types";

  // --- KONFIGURASI WARNA & FONT ---
  const COLORS = {
    primary: [15, 23, 42] as [number, number, number], // Slate-900
    accent: [59, 130, 246] as [number, number, number], // Blue-500
    success: [22, 163, 74] as [number, number, number], // Green-600
    danger: [220, 38, 38] as [number, number, number],  // Red-600
    text: [51, 65, 85] as [number, number, number],     // Slate-700
    lightBg: [248, 250, 252] as [number, number, number] // Slate-50
  };

  // --- HELPER FUNCTIONS ---
  const drawCorporateHeader = (doc: jsPDF, title: string, subtitle?: string) => {
    const pageWidth = doc.internal.pageSize.width;
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 5, "F");
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 25);
    if (subtitle) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(subtitle, 14, 32);
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 40, pageWidth - 14, 40);
  };

  const calculateAge = (dobString: string): string => {
    if (!dobString) return "-";
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} Tahun`;
  };

  // ==========================================
  // 1. PDF GENERAL CHECKUP (ROBUST VERSION)
  // ==========================================
  export const generateCheckupPDF = (
    data: FinancialRecord,
    analysis: HealthAnalysisResult
  ) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // 1. Header
    drawCorporateHeader(doc, "Laporan Kesehatan Finansial", `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}`);

    let finalY = 50;

    // --- CALCULATE TOTALS LOCALLY (Fallback mechanism) ---
    // A. ASET
    const totalAssets = 
      (data.assetCash || 0) + (data.assetHome || 0) + (data.assetVehicle || 0) + (data.assetJewelry || 0) + (data.assetAntique || 0) + (data.assetPersonalOther || 0) +
      (data.assetInvHome || 0) + (data.assetInvVehicle || 0) + (data.assetGold || 0) + (data.assetInvAntique || 0) + 
      (data.assetStocks || 0) + (data.assetMutualFund || 0) + (data.assetBonds || 0) + (data.assetDeposit || 0) + (data.assetInvOther || 0);

    // B. UTANG
    const totalDebt = 
      (data.debtKPR || 0) + (data.debtKPM || 0) + (data.debtCC || 0) + (data.debtCoop || 0) + (data.debtConsumptiveOther || 0) + (data.debtBusiness || 0);

    const calculatedNetWorth = totalAssets - totalDebt;

    // C. ARUS KAS (DATA DI INPUT SUDAH TAHUNAN, JANGAN DIKALI 12)
    const totalIncomeAnnual = (data.incomeFixed || 0) + (data.incomeVariable || 0);
    
    const totalExpenseAnnual = 
      (data.installmentKPR || 0) + (data.installmentKPM || 0) + (data.installmentCC || 0) + (data.installmentCoop || 0) + (data.installmentConsumptiveOther || 0) + (data.installmentBusiness || 0) +
      (data.insuranceLife || 0) + (data.insuranceHealth || 0) + (data.insuranceHome || 0) + (data.insuranceVehicle || 0) + (data.insuranceBPJS || 0) + (data.insuranceOther || 0) +
      (data.savingEducation || 0) + (data.savingRetirement || 0) + (data.savingPilgrimage || 0) + (data.savingHoliday || 0) + (data.savingEmergency || 0) + (data.savingOther || 0) +
      (data.expenseFood || 0) + (data.expenseSchool || 0) + (data.expenseTransport || 0) + (data.expenseCommunication || 0) + (data.expenseHelpers || 0) + (data.expenseLifestyle || 0) + (data.expenseTax || 0);

    const surplusDeficitAnnual = totalIncomeAnnual - totalExpenseAnnual;

    // --- START PDF CONTENT ---

    // 2. Section: Profil Klien
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text("1. Profil Klien", 14, finalY);
    finalY += 5;

    const profileRows: RowInput[] = [
      [
        { content: "DATA KEPALA KELUARGA", styles: { fontStyle: "bold" as const, fillColor: COLORS.lightBg } },
        { content: data.userProfile.maritalStatus === "MARRIED" ? "DATA PASANGAN" : "", styles: { fontStyle: "bold" as const, fillColor: COLORS.lightBg } }
      ],
      [
        `Nama: ${data.userProfile.name || "-"}\n` +
        `Usia: ${calculateAge(data.userProfile.dob)}\n` +
        `Pekerjaan: ${data.userProfile.occupation || "-"}\n` +
        `Domisili: ${data.userProfile.city || "-"}\n` +
        `Tanggungan: ${(data.userProfile.childrenCount || 0) + (data.userProfile.dependentParents || 0)} Orang`,

        data.userProfile.maritalStatus === "MARRIED" && data.spouseProfile ?
          `Nama: ${data.spouseProfile.name || "-"}\n` +
          `Usia: ${calculateAge(data.spouseProfile.dob)}\n` +
          `Pekerjaan: ${data.spouseProfile.occupation || "-"}\n` +
          `Agama: ${data.spouseProfile.religion || "-"}`
          : ""
      ]
    ];

    autoTable(doc, {
      startY: finalY,
      body: profileRows,
      theme: "plain",
      styles: { cellPadding: 5, fontSize: 10, valign: "top" },
      columnStyles: {
        0: { cellWidth: (pageWidth - 28) / 2 },
        1: { cellWidth: (pageWidth - 28) / 2 }
      },
      margin: { left: 14, right: 14 }
    });

    finalY = (doc as any).lastAutoTable.finalY + 15;

    // 3. Section: Ringkasan Eksekutif
    doc.setDrawColor(...COLORS.accent);
    doc.setFillColor(240, 249, 255); 
    doc.roundedRect(14, finalY, pageWidth - 28, 25, 2, 2, "FD");

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("STATUS KESEHATAN", 20, finalY + 8);
    doc.text("TOTAL KEKAYAAN BERSIH (NET WORTH)", pageWidth / 2 + 10, finalY + 8);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    
    // Safe Access to Analysis Score
    const score = analysis?.score ?? 0;
    if (score >= 80) doc.setTextColor(...COLORS.success);
    else if (score >= 50) doc.setTextColor(234, 179, 8); 
    else doc.setTextColor(...COLORS.danger);

    const statusLabel = analysis?.globalStatus || (score >= 80 ? "SEHAT" : score >= 50 ? "WASPADA" : "TIDAK SEHAT");
    doc.text(statusLabel.toUpperCase(), 20, finalY + 18);

    // Net Worth Display
    if (calculatedNetWorth >= 0) doc.setTextColor(...COLORS.primary);
    else doc.setTextColor(...COLORS.danger);
    doc.text(formatRupiah(calculatedNetWorth), pageWidth / 2 + 10, finalY + 18);

    finalY += 40;

    // 4. Section: Laporan Keuangan
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(12);
    doc.text("2. Ringkasan Laporan Keuangan", 14, finalY);
    finalY += 5;

    const financialTable: RowInput[] = [
      [
        { content: "NERACA (POSISI HARTA)", styles: { fontStyle: "bold" as const, fillColor: COLORS.lightBg } },
        { content: "ARUS KAS (TAHUNAN)", styles: { fontStyle: "bold" as const, fillColor: COLORS.lightBg } }
      ],
      [
        `Total Aset: ${formatRupiah(totalAssets)}\n` +
        `Total Utang: ${formatRupiah(totalDebt)}\n\n` +
        `Kekayaan Bersih: ${formatRupiah(calculatedNetWorth)}`,

        `Total Pemasukan: ${formatRupiah(totalIncomeAnnual)}\n` +
        `Total Pengeluaran: ${formatRupiah(totalExpenseAnnual)}\n\n` +
        `Surplus/Defisit: ${formatRupiah(surplusDeficitAnnual)}`
      ]
    ];

    autoTable(doc, {
      startY: finalY,
      body: financialTable,
      theme: "grid",
      styles: { cellPadding: 5, fontSize: 10 },
      margin: { left: 14, right: 14 }
    });

    finalY = (doc as any).lastAutoTable.finalY + 15;

    // 5. Section: Diagnosa Rasio
    doc.text("3. Diagnosa Indikator Kesehatan", 14, finalY);
    finalY += 5;

    // Safe access ratios
    const ratios = analysis?.ratios || [];
    
    if (ratios.length > 0) {
      const ratioRows: RowInput[] = ratios.map((r: any) => [
        r.label,
        r.benchmark,
        r.value + (r.id === "emergency_fund" ? "x" : "%"), 
        {
          content: r.status === "PASS" ? "SEHAT" : r.status === "WARN" ? "WASPADA" : "BAHAYA",
          styles: {
            textColor: r.status === "PASS" ? COLORS.success : r.status === "WARN" ? [234, 179, 8] : COLORS.danger,
            fontStyle: "bold" as const
          }
        }
      ]);

      autoTable(doc, {
        startY: finalY,
        head: [["Indikator", "Target Ideal", "Kondisi Anda", "Status"]],
        body: ratioRows,
        theme: "striped",
        headStyles: { fillColor: COLORS.primary },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      });
      
      finalY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text("(Data rasio belum tersedia dari server)", 14, finalY + 10);
      finalY += 20;
    }

    // 6. Section: Rekomendasi
    if (finalY > 250) { doc.addPage(); finalY = 20; }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("4. Rekomendasi Prioritas", 14, finalY);
    finalY += 8;

    let hasRecommendation = false;
    ratios.forEach((r: any) => {
      if (r.status !== "PASS") {
        hasRecommendation = true;
        if (finalY > 270) { doc.addPage(); finalY = 20; }
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...COLORS.text);
        doc.text(`• ${r.label}:`, 14, finalY);

        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(r.recommendation, pageWidth - 25);
        doc.text(splitText, 20, finalY + 5);
        finalY += (splitText.length * 5) + 8;
      }
    });

    if (!hasRecommendation && ratios.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.success);
      doc.text("Selamat! Semua indikator keuangan Anda dalam kondisi SEHAT. Pertahankan.", 14, finalY + 5);
    }

    doc.save(`Laporan_Checkup_${data.userProfile.name.replace(/\s+/g, "_")}.pdf`);
  };

  