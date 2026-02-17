"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { GraduationCap, User, Baby, Calculator as CalcIcon, FileUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

// Wizard Steps Components
import { ClientFormStep } from "@/components/features/education/wizard/client-form-step";
import { ChildrenFormStep } from "@/components/features/education/wizard/children-form-step";
import { SimulationResultStep } from "@/components/features/education/wizard/simulation-result-step";

// Types, Schema & Services
import { EducationSimulationForm } from "@/lib/schemas/education-simulation.schema";
import {
  EducationSimulationResult,
  EducationSimulationPayload,
  ChildSimulationResult,
  StageBreakdownItem,
  SchoolLevel // Import Enum
} from "@/lib/types/education";
import { financialService } from "@/services/financial.service";
// [FIX] Import Logic Kalkulasi Frontend
import { calculateEducationInvestment } from "@/lib/financial-math";

export default function EducationCalculatorPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<EducationSimulationForm>>({});
  const [result, setResult] = useState<EducationSimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // --- HANDLER STEP 1: CLIENT DATA ---
  const handleClientNext = (data: Partial<EducationSimulationForm>) => {
    setFormData((prev) => ({
      ...prev,
      ...data
    }));
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- HANDLER STEP 2: CHILDREN & CALCULATION ---
  const handleChildrenSubmit = async (data: EducationSimulationForm) => {
    setIsLoading(true);
    try {
      // 1. Gabungkan data Form Step 1 & 2
      const finalFormData = { ...formData, ...data } as EducationSimulationForm;

      // -----------------------------------------------------------------------
      // [LOGIC PERBAIKAN] 2. KALKULASI DI FRONTEND (Agar UI Tampil Instant)
      // -----------------------------------------------------------------------
      const inflationRate = finalFormData.inflationRate || 10;
      const returnRate = finalFormData.returnRate || 12;

      let grandTotalFutureCost = 0;
      let grandTotalMonthlySaving = 0;
      const childrenResults: ChildSimulationResult[] = [];

      // Siapkan payload untuk Backend (sambil menghitung angka untuk UI)
      const childrenPlansPayload = finalFormData.childrenPlans.map(child => {
        // A. Hitung Angka Finansial menggunakan Utility Lokal
        const calc = calculateEducationInvestment({
          inflationRate,
          returnRate,
          childDob: child.childDob,
          stages: child.stages
        });

        // B. Update Grand Total
        grandTotalFutureCost += calc.totalFutureCost;
        grandTotalMonthlySaving += calc.totalMonthlySaving;

        // C. Siapkan Data Breakdown untuk Tampilan UI
        const currentYear = new Date().getFullYear();
        const stagesBreakdown: StageBreakdownItem[] = child.stages.map((stage, idx) => {
          const res = calc.stageResults[idx];

          let costTypeLabel: any = "MONTHLY";
          if (stage.costEntry > 0 && !stage.costMonthly) costTypeLabel = "ENTRY";
          if (stage.costSemester) costTypeLabel = "SEMESTER";
          if (stage.costFull) costTypeLabel = "FULL";

          return {
            level: stage.level,
            costType: costTypeLabel,
            yearsToStart: Math.max(0, stage.startYear - currentYear),
            currentCost: stage.costEntry + (stage.costMonthly || 0) * 12 * stage.duration,
            futureCost: res.totalFv,
            monthlySaving: res.totalPmt
          };
        });

        childrenResults.push({
          name: child.childName,
          age: new Date().getFullYear() - new Date(child.childDob).getFullYear(),
          totalFutureCost: calc.totalFutureCost,
          monthlySaving: calc.totalMonthlySaving,
          stages: stagesBreakdown
        });

        // D. Kembalikan struktur untuk Payload Backend
        return {
          ...child,
          stages: child.stages.map((stage, idx) => ({
            ...stage,
            level: stage.level as SchoolLevel, // Casting Enum
            calculatedFutureValue: calc.stageResults[idx].totalFv,
            calculatedMonthlySaving: calc.stageResults[idx].totalPmt
          }))
        };
      });

      // 3. Construct Result Object untuk UI (Dari hasil hitungan lokal)
      const uiResult: EducationSimulationResult = {
        financial: { inflationRate, returnRate },
        summary: {
          totalChildren: finalFormData.childrenPlans.length,
          totalFutureCost: grandTotalFutureCost,
          totalMonthlyInvestment: grandTotalMonthlySaving
        },
        children: childrenResults
      };

      // 4. Request ke Backend (Hanya untuk PDF & Log)
      const payload: EducationSimulationPayload = {
        clientName: finalFormData.clientName,
        clientDob: finalFormData.clientDob || "",
        clientCity: finalFormData.clientCity,
        clientJob: finalFormData.clientJob,
        clientPhone: finalFormData.clientPhone,
        inflationRate,
        returnRate,
        childrenPlans: childrenPlansPayload
      };

      // Panggil API (Akan return Blob PDF)
      const response = await financialService.simulateAgentEducation(payload);

      // 5. Gabungkan Hasil UI + File PDF dari Backend
      // Header ini bisa dibaca JIKA Langkah 1 (CORS Backend) sudah dilakukan
      const mgcToken = response.headers['x-mgc-token'];

      // Ambil Binary Data PDF
      const pdfBlobData = response.data; // Ini adalah Blob/Buffer

      // Set State Akhir
      setResult({
        ...uiResult, // Pakai angka hitungan frontend (JAMINAN TIDAK KOSONG)
        // Convert Blob ke struktur yang dimengerti helper download
        pdfBuffer: { data: await (pdfBlobData as any).arrayBuffer() },
        mgcToken: mgcToken,
        filename: `Simulasi_Pendidikan_${finalFormData.clientName}.pdf`
      });

      setStep(3);
      toast.success("Simulasi berhasil!", {
        description: "Laporan PDF siap diunduh."
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error: any) {
      console.error(error);
      toast.error("Gagal menyimpan data ke server", {
        description: "Namun hasil hitungan tetap ditampilkan."
      });
      // Fallback: Jika backend error, tetap tampilkan hasil hitungan lokal (tanpa PDF)
      // Ini membuat aplikasi terasa 'Offline-First'
      // setResult(uiResult); // Uncomment jika ingin fallback aktif
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLER IMPORT FILE ---
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.mgc')) {
      toast.error("Format file salah", { description: "Harap upload file dengan ekstensi .mgc" });
      return;
    }

    setIsImporting(true);
    toast.loading("Membaca file simulasi...");

    try {
      const fileContent = await file.text();
      const response = await financialService.decodeSimulationToken(fileContent);

      if (response && response.data) {
        const importedData = response.data.data as any;
        const mappedForm: EducationSimulationForm = {
          clientName: importedData.clientName || "",
          clientCity: importedData.clientCity || "",
          clientDob: importedData.clientDob,
          clientJob: importedData.clientJob,
          clientPhone: importedData.clientPhone,
          inflationRate: importedData.inflationRate || 10,
          returnRate: importedData.returnRate || 12,
          childrenPlans: importedData.childrenPlans || []
        };
        setFormData(mappedForm);
        toast.dismiss();
        toast.success("File berhasil dimuat!", {
          description: `Melanjutkan simulasi untuk klien: ${mappedForm.clientName}`
        });
        if (mappedForm.childrenPlans.length > 0) {
          setStep(2);
        }
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error("Gagal memuat file.", { description: "File corrupt atau token tidak valid." });
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="container max-w-4xl py-8 pb-24 space-y-8 animate-in fade-in duration-700">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl shadow-sm">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Kalkulator Dana Pendidikan
              </h1>
              <p className="text-muted-foreground text-sm">
                Rencanakan masa depan pendidikan buah hati Anda dengan metode anuitas tetap.
              </p>
            </div>
          </div>
          {step === 1 && (
            <div className="relative">
              <input type="file" accept=".mgc" onChange={handleImportFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={isImporting} />
              <Button variant="outline" className="gap-2 bg-background border-dashed border-primary/50 text-primary hover:bg-primary/5 w-full md:w-auto" disabled={isImporting}>
                <FileUp className="w-4 h-4" /> {isImporting ? "Memuat..." : "Load Session (.mgc)"}
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span className={step >= 1 ? "text-primary" : ""}>1. Identitas Klien</span>
            <span className={step >= 2 ? "text-primary" : ""}>2. Rencana Anak</span>
            <span className={step >= 3 ? "text-primary" : ""}>3. Hasil Simulasi</span>
          </div>
          <Progress value={step === 1 ? 33 : step === 2 ? 66 : 100} className="h-2" />
        </div>
      </div>

      <Card className="border shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6 md:p-8">
          {step === 1 && <ClientFormStep initialData={formData as any} onNext={handleClientNext} />}
          {step === 2 && <ChildrenFormStep initialData={formData} onNext={handleChildrenSubmit} onBack={() => setStep(1)} />}
          {step === 3 && result && (
            <SimulationResultStep
              result={result}
              onReset={() => { setStep(1); setFormData({}); setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          )}
        </CardContent>
      </Card>

      {step < 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard icon={User} title="Data Klien" desc="Informasi ini digunakan untuk personalisasi header laporan PDF hasil simulasi." />
          <InfoCard icon={Baby} title="Multi-Anak" desc="Anda dapat menambahkan lebih dari satu anak dengan jenjang sekolah berbeda dalam satu sesi." />
          <InfoCard icon={CalcIcon} title="Metode PAM Jaya" desc="Kalkulasi menggunakan asumsi inflasi geometrik dan investasi anuitas (sinking fund)." />
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-muted/40 border flex gap-3 items-start hover:bg-muted/60 transition-colors">
      <div className="bg-background p-2 rounded-lg shadow-sm">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h4 className="text-xs font-bold text-foreground mb-1">{title}</h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}