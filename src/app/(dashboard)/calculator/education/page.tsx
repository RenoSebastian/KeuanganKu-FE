"use client";

import React, { useState, useRef } from "react"; // [FIX] Import useRef
import { toast } from "sonner";
import Link from "next/link";
import { v4 as uuidv4 } from 'uuid'; // [FIX] Import UUID
import {
  GraduationCap,
  User,
  Baby,
  Calculator as CalcIcon,
  FileUp,
  Sparkles,
  Loader2,
  Lock
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Wizard Steps Components
import { ClientFormStep } from "@/components/features/calculator/education/client-form-step";
import { ChildrenFormStep } from "@/components/features/calculator/education/children-form-step";
import { SimulationResultStep } from "@/components/features/calculator/education/simulation-result-step";

// Types, Schema & Services
import { EducationSimulationForm } from "@/lib/schemas/education-simulation.schema";
import {
  EducationSimulationPayload,
  SchoolLevel,
  EducationSimulationResponse
} from "@/lib/types/education";
import { financialService } from "@/services/financial.service";
import { calculateEducationInvestment } from "@/lib/financial-math";
import { useAuthUser } from "@/hooks/use-auth-user";

export default function EducationCalculatorPage() {
  // Auth & Quota Logic
  const { isPro, quota, refreshUser, isLoading: isAuthLoading } = useAuthUser();
  const hasAccess = isPro || quota > 0;

  // [FIX] Session ID untuk Idempotency (Mencegah pemotongan kuota ganda)
  const sessionId = useRef(uuidv4());

  const [step, setStep] = useState(1);

  // State Form Input
  const [formData, setFormData] = useState<Partial<EducationSimulationForm>>({});

  // State Hasil Simulasi
  const [result, setResult] = useState<EducationSimulationResponse | null>(null);

  // State Loading & Proses
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // --- HANDLER STEP 1: CLIENT DATA ---
  const handleClientNext = (data: Partial<EducationSimulationForm>) => {
    // Cek akses di awal
    if (!hasAccess && !isAuthLoading) {
      toast.error("Akses Dibatasi", {
        description: "Kuota simulasi Anda telah habis. Silakan upgrade ke PRO."
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      ...data
    }));
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- HANDLER BACK / REVISI ---
  const handleBackToRevision = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- HANDLER STEP 2: CHILDREN & CALCULATION ---
  const handleChildrenSubmit = async (data: EducationSimulationForm) => {
    // Double Check Access sebelum hit ke API
    if (!hasAccess) {
      toast.error("Kuota Habis", { description: "Silakan upgrade akun Anda." });
      return;
    }

    setIsLoading(true);
    setFormData((prev) => ({ ...prev, ...data }));

    try {
      const finalFormData = { ...formData, ...data } as EducationSimulationForm;
      const inflationRate = finalFormData.inflationRate || 10;
      const returnRate = finalFormData.returnRate || 12;

      // 1. Client Side Calculation (Preview)
      const childrenPlansPayload = finalFormData.childrenPlans.map(child => {
        const calc = calculateEducationInvestment({
          inflationRate,
          returnRate,
          childDob: child.childDob,
          stages: child.stages
        });

        return {
          childName: child.childName,
          childDob: child.childDob,
          stages: child.stages.map((stage, idx) => ({
            ...stage,
            level: stage.level as SchoolLevel,
            calculatedFutureValue: calc.stageResults[idx].totalFv,
            calculatedMonthlySaving: calc.stageResults[idx].totalPmt,
            costEntry: stage.costEntry || 0,
            costMonthly: stage.costMonthly || 0,
            costSemester: stage.costSemester || 0,
            costFull: stage.costFull || 0,
          }))
        };
      });

      // [FIX] Update Payload dengan sessionId
      const payload: EducationSimulationPayload & { sessionId: string } = {
        clientName: finalFormData.clientName,
        clientDob: finalFormData.clientDob || "",
        clientCity: finalFormData.clientCity,
        clientJob: finalFormData.clientJob,
        clientPhone: finalFormData.clientPhone,
        inflationRate,
        returnRate,
        childrenPlans: childrenPlansPayload,
        sessionId: sessionId.current // [FIX] Sertakan Session ID
      };

      // 2. Server Side Processing (Generate PDF & Token)
      const response: EducationSimulationResponse = await financialService.simulateAgentEducation(payload);

      // [UPDATE: REALTIME SYNC]
      // Update state di hook halaman ini
      await refreshUser();

      // Kirim sinyal ke Sidebar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('refresh_user_data'));
      }

      setResult(response);
      setStep(3);
      toast.success("Simulasi berhasil dihitung!", {
        icon: <Sparkles className="w-4 h-4 text-yellow-500" />
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error: any) {
      console.error(error);
      // Handle Quota Error
      if (error.response?.status === 403) {
        toast.error("Akses Ditolak", { description: "Kuota simulasi habis." });
        await refreshUser();
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('refresh_user_data'));
      } else {
        toast.error("Gagal memproses simulasi", {
          description: "Terjadi kesalahan pada server saat menyimpan data."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLER IMPORT FILE (FIXED) ---
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.mgc')) {
      toast.error("Format file salah", { description: "Harap upload file dengan ekstensi .mgc" });
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading("Membaca file simulasi...");

    try {
      const fileContent = await file.text();
      const response = await financialService.decodeSimulationToken(fileContent);

      const importedData = response.data || response;
      const metaData = response.meta || {};

      if (!importedData || !importedData.clientName) {
        throw new Error("Struktur data file tidak valid atau kosong.");
      }

      const inflationRate = Number(importedData.inflationRate) || 10;
      const returnRate = Number(importedData.returnRate) || 12;

      // RE-CALCULATE Logic
      const recalculatedChildrenPlans = Array.isArray(importedData.childrenPlans)
        ? importedData.childrenPlans.map((child: any) => {
          const rawStages = Array.isArray(child.stages) ? child.stages.map((s: any) => ({
            level: s.level,
            startYear: Number(s.startYear),
            duration: Number(s.duration),
            costEntry: Number(s.costEntry || 0),
            costMonthly: Number(s.costMonthly || 0),
            costSemester: Number(s.costSemester || 0),
            costFull: Number(s.costFull || 0),
          })) : [];

          const calculation = calculateEducationInvestment({
            inflationRate,
            returnRate,
            childDob: child.childDob ? String(child.childDob).split('T')[0] : "",
            stages: rawStages
          });

          return {
            childName: child.childName || "",
            childDob: child.childDob ? String(child.childDob).split('T')[0] : "",
            stages: rawStages.map((stage: any, idx: number) => ({
              ...stage,
              calculatedFutureValue: calculation.stageResults[idx]?.totalFv || 0,
              calculatedMonthlySaving: calculation.stageResults[idx]?.totalPmt || 0,
            }))
          };
        })
        : [];

      const mappedForm: EducationSimulationForm = {
        clientName: importedData.clientName || "",
        clientCity: importedData.clientCity || "",
        clientDob: importedData.clientDob ? String(importedData.clientDob).split('T')[0] : "",
        clientJob: importedData.clientJob || "",
        clientPhone: importedData.clientPhone || "",
        inflationRate,
        returnRate,
        childrenPlans: recalculatedChildrenPlans
      };

      setFormData(mappedForm);

      let totalFutureCost = 0;
      let totalMonthlySaving = 0;

      mappedForm.childrenPlans.forEach(child => {
        child.stages.forEach(stage => {
          totalMonthlySaving += (stage as any).calculatedMonthlySaving || 0;
          totalFutureCost += (stage as any).calculatedFutureValue || 0;
        });
      });

      // [FIX] Reset session ID on Import
      sessionId.current = uuidv4();

      if (totalFutureCost > 0) {
        const reconstructedResult: EducationSimulationResponse = {
          status: "success",
          simulationId: metaData.simulationId || "imported-session",
          mgcToken: fileContent,
          filename: `imported-${metaData.generatedAt || 'session'}.pdf`,
          data: {
            ...mappedForm,
            totalMonthlySaving,
            totalFutureCost,
            childrenPlans: mappedForm.childrenPlans.map(child => ({
              ...child,
              totalFutureCost: child.stages.reduce((acc, s: any) => acc + (s.calculatedFutureValue || 0), 0),
              monthlySaving: child.stages.reduce((acc, s: any) => acc + (s.calculatedMonthlySaving || 0), 0),
              stages: child.stages.map((s: any) => ({
                ...s,
                costType: s.costEntry > 0 ? "ENTRY" : "MONTHLY",
                futureCost: s.calculatedFutureValue,
                monthlySaving: s.calculatedMonthlySaving,
                yearsToStart: s.startYear - new Date().getFullYear()
              }))
            })) as any
          }
        };

        setResult(reconstructedResult);
        setStep(3);
        toast.success("Sesi berhasil dipulihkan!");
      } else {
        setStep(2);
        toast.success("Draft berhasil dimuat. Silakan lengkapi biaya.");
      }

    } catch (err: any) {
      console.error("Import error FULL:", err);
      toast.error("Gagal memuat file.", {
        description: "File corrupt atau struktur data tidak sesuai."
      });
    } finally {
      toast.dismiss(toastId);
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleReset = () => {
    setStep(1);
    setFormData({});
    setResult(null);
    // [FIX] Reset session ID for new session
    sessionId.current = uuidv4();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container max-w-5xl py-10 pb-32 space-y-10 animate-in fade-in duration-1000">

      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
              Kalkulator Pendidikan
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Rencanakan masa depan pendidikan buah hati dengan presisi.
            </p>
          </div>
        </div>

        {/* LOAD SESSION BUTTON */}
        {step === 1 && (
          <div className="relative group">
            <input
              type="file"
              accept=".mgc"
              onChange={handleImportFile}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
              disabled={isImporting}
            />
            <div className={cn(
              "relative flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 overflow-hidden select-none",
              "bg-white border-slate-200 shadow-sm",
              !isImporting && "group-hover:border-blue-400 group-hover:shadow-lg group-hover:shadow-blue-500/10 group-hover:-translate-y-0.5",
              isImporting && "bg-slate-50 border-slate-200 opacity-80 cursor-wait"
            )}>
              <div className="absolute inset-0 bg-linear-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className={cn(
                "relative z-10 flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300",
                isImporting ? "bg-slate-200 text-slate-500" : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110"
              )}>
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
              </div>
              <div className="relative z-10 flex flex-col items-start text-left">
                <span className={cn("text-xs font-bold transition-colors", isImporting ? "text-slate-500" : "text-slate-700 group-hover:text-blue-700")}>
                  {isImporting ? "Memproses..." : "Muat Sesi"}
                </span>
                <span className="text-[10px] font-medium text-slate-400">File .mgc</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* [NEW] QUOTA ALERT CARD */}
      {!hasAccess && !isAuthLoading && step === 1 && (
        <Card className="p-5 rounded-2xl bg-red-50 border border-red-200 shadow-sm animate-pulse max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-xl text-red-600">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-800">Kuota Simulasi Habis</h3>
              <p className="text-xs text-red-600 mt-1 leading-relaxed">
                Anda telah menggunakan semua token gratis. Silakan upgrade ke paket PRO untuk akses tanpa batas.
              </p>
              <Link href="/pricing">
                <Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold w-full rounded-xl shadow-red-200">
                  Upgrade Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* PROGRESS INDICATOR */}
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between mb-4 px-2">
          {['Klien', 'Rencana', 'Hasil'].map((label, index) => {
            const stepNum = index + 1;
            const isActive = step >= stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={label} className={cn("flex flex-col items-center gap-2 transition-all duration-500", isActive ? "text-blue-600" : "text-slate-400")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ring-4",
                  isActive ? "bg-blue-600 text-white ring-blue-50" : "bg-slate-100 ring-transparent",
                  isCurrent && "ring-blue-100 scale-110"
                )}>
                  {stepNum}
                </div>
                <span className={cn("text-[10px] uppercase tracking-wider font-bold", isCurrent ? "text-blue-700" : "text-slate-400")}>{label}</span>
              </div>
            )
          })}
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-in-out"
            style={{ width: step === 1 ? '33.33%' : step === 2 ? '66.66%' : '100%' }}
          />
        </div>
      </div>

      {/* MAIN CONTENT CARD */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl ring-1 ring-white/50 rounded-3xl overflow-hidden relative">
        {/* Overlay Lock jika tidak ada akses */}
        {!hasAccess && !isAuthLoading && (
          <div className="absolute inset-0 bg-white/50 z-50 cursor-not-allowed" />
        )}

        <CardContent className="pt-8 md:p-10 min-h-100">
          {step === 1 && (
            <ClientFormStep
              initialData={formData as any}
              onNext={handleClientNext}
            />
          )}

          {step === 2 && (
            <ChildrenFormStep
              initialData={formData}
              onNext={handleChildrenSubmit}
              onBack={() => setStep(1)}
              isLoading={isLoading}
            />
          )}

          {step === 3 && result && (
            <SimulationResultStep
              result={result}
              onReset={handleReset}
              onBack={handleBackToRevision}
            />
          )}
        </CardContent>
      </Card>

      {/* FOOTER INFO CARDS */}
      {step < 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={User}
            title="Personalisasi Laporan"
            desc="Identitas klien akan ditampilkan di header laporan PDF untuk memberikan kesan profesional."
          />
          <InfoCard
            icon={Baby}
            title="Multi-Simulasi"
            desc="Dapat merancang rencana pendidikan untuk banyak anak sekaligus dalam satu sesi simulasi."
          />
          <InfoCard
            icon={CalcIcon}
            title="Metode Sinking Fund"
            desc="Perhitungan akurat menggunakan asumsi inflasi geometrik dan investasi anuitas (Future Value)."
          />
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">{title}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}
