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

// Types & Services
import { EducationSimulationForm } from "@/lib/schemas/education-simulation.schema";
import { EducationSimulationResult } from "@/lib/types/education";
import { financialService } from "@/services/financial.service";

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
      // 1. Gabungkan data Step 1 & Step 2
      const finalPayload = {
        ...formData,
        ...data,
      };

      // 2. Kirim ke Backend untuk dicatat Log & generate Token
      // [FIX] Gunakan 'as any' untuk membypass pengecekan tipe ketat 'clientDob' 
      // yang mungkin required di interface lama tapi optional di schema baru.
      const response = await financialService.simulateAgentEducation(finalPayload as any);

      // 3. Set Result State
      // Mengambil data dari response backend dan casting ke tipe Result UI
      const simulationResult = response.data as unknown as EducationSimulationResult;

      setResult(simulationResult);
      setStep(3);
      toast.success("Simulasi berhasil dihitung!", {
        description: "Silakan tinjau hasil dan unduh laporan PDF."
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal menghitung simulasi. Periksa koneksi internet.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLER IMPORT FILE .MGC (MANUAL FILE READER) ---
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi Ekstensi Sederhana
    if (!file.name.endsWith('.mgc')) {
      toast.error("Format file salah", { description: "Harap upload file dengan ekstensi .mgc" });
      return;
    }

    setIsImporting(true);
    toast.loading("Membaca file simulasi...");

    try {
      // 1. Baca isi file sebagai Text (Token String)
      const fileContent = await file.text();

      // 2. Kirim ke Backend untuk Dekripsi/Verifikasi Token
      // [FIX] Mengirim string langsung (fileContent) sesuai definisi service yang ada saat ini
      // Jika service Anda mengharapkan object, ubah jadi { simulationToken: fileContent }
      // Berdasarkan error log, service mengharapkan string.
      const response = await financialService.decodeSimulationToken(fileContent);

      if (response && response.data) {
        // 3. Hydrate Form State dengan data dari dalam token
        // Struktur data di dalam token: { meta: ..., data: EducationSimulationForm }
        const payload = response.data.data as EducationSimulationForm;

        if (!payload.clientName) {
          throw new Error("Data simulasi tidak valid atau rusak.");
        }

        setFormData(payload);

        toast.dismiss();
        toast.success("File berhasil dimuat!", {
          description: `Melanjutkan simulasi untuk klien: ${payload.clientName}`
        });

        // Opsional: Langsung lompat ke step 2 jika data anak sudah ada
        if (payload.childrenPlans && payload.childrenPlans.length > 0) {
          setStep(2);
        }
      }
    } catch (err: any) {
      console.error("Import Error:", err);
      toast.dismiss();
      toast.error("Gagal memuat file.", {
        description: err.response?.data?.message || "File corrupt atau tidak valid."
      });
    } finally {
      setIsImporting(false);
      e.target.value = ''; // Reset input agar bisa upload file yang sama
    }
  };

  return (
    <div className="container max-w-4xl py-8 pb-24 space-y-8 animate-in fade-in duration-700">

      {/* --- HEADER SECTION --- */}
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

          {/* Import Button (Hanya tampil di Step 1) */}
          {step === 1 && (
            <div className="relative">
              <input
                type="file"
                accept=".mgc"
                onChange={handleImportFile}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                disabled={isImporting}
              />
              <Button variant="outline" className="gap-2 bg-background border-dashed border-primary/50 text-primary hover:bg-primary/5 w-full md:w-auto" disabled={isImporting}>
                <FileUp className="w-4 h-4" />
                {isImporting ? "Memuat..." : "Load Session (.mgc)"}
              </Button>
            </div>
          )}
        </div>

        {/* Progress Bar & Indicators */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span className={step >= 1 ? "text-primary" : ""}>1. Identitas Klien</span>
            <span className={step >= 2 ? "text-primary" : ""}>2. Rencana Anak</span>
            <span className={step >= 3 ? "text-primary" : ""}>3. Hasil Simulasi</span>
          </div>
          <Progress value={step === 1 ? 33 : step === 2 ? 66 : 100} className="h-2" />
        </div>
      </div>

      {/* --- MAIN WIZARD CARD --- */}
      <Card className="border shadow-lg bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6 md:p-8">

          {step === 1 && (
            <ClientFormStep
              // Cast to Partial karena saat load mgc data mungkin sudah ada
              initialData={formData as any}
              onNext={handleClientNext}
            />
          )}

          {step === 2 && (
            <ChildrenFormStep
              initialData={formData}
              onNext={handleChildrenSubmit}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && result && (
            <SimulationResultStep
              result={result}
              onReset={() => {
                setStep(1);
                setFormData({});
                setResult(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

        </CardContent>
      </Card>

      {/* --- FOOTER INFO BOX (Helper Tips) --- */}
      {step < 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon={User}
            title="Data Klien"
            desc="Informasi ini digunakan untuk personalisasi header laporan PDF hasil simulasi."
          />
          <InfoCard
            icon={Baby}
            title="Multi-Anak"
            desc="Anda dapat menambahkan lebih dari satu anak dengan jenjang sekolah berbeda dalam satu sesi."
          />
          <InfoCard
            icon={CalcIcon}
            title="Metode PAM Jaya"
            desc="Kalkulasi menggunakan asumsi inflasi geometrik dan investasi anuitas (sinking fund)."
          />
        </div>
      )}
    </div>
  );
}

// Komponen Kecil untuk Info Card
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