"use client";

import React, { useState } from "react";
import {
  EducationSimulationPayload,
  EducationSimulationResult,
  SchoolLevel,
  CostType
} from "@/lib/types/education";
import { financialService } from "@/services/financial.service";
import { toast } from "sonner";

// Wizard Steps
import { ClientFormStep, ClientFormValues } from "@/components/features/education/wizard/client-form-step";
import { ChildrenFormStep } from "@/components/features/education/wizard/children-form-step";
import { SimulationResultStep } from "@/components/features/education/wizard/simulation-result-step";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, User, Baby, Calculator as CalcIcon } from "lucide-react";

export default function EducationCalculatorPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<EducationSimulationPayload>>({});
  const [result, setResult] = useState<EducationSimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Step 1 -> Step 2
  const handleClientNext = (data: ClientFormValues) => {
    setFormData((prev) => ({
      ...prev,
      clientName: data.clientName,
      clientDob: data.clientDob,
      clientCity: data.clientCity,
      clientJob: data.clientJob,
      clientPhone: data.clientPhone,
      // [REMOVED] currentSaving dihapus dari sini sesuai roadmap
    }));
    setStep(2);
  };

  const handleChildrenSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const payload: EducationSimulationPayload = {
        clientName: formData.clientName!,
        clientDob: formData.clientDob!,
        clientCity: formData.clientCity!,
        clientJob: formData.clientJob,
        clientPhone: formData.clientPhone,
        childrenPlans: data.childrenPlans.map((plan: any) => ({
          childName: plan.childName,
          childDob: plan.childDob,
          inflationRate: plan.inflationRate,
          returnRate: plan.returnRate,
          stages: plan.stages.map((stage: any) => ({
            level: stage.level as SchoolLevel,
            costType: stage.costType as CostType,
            currentCost: stage.currentCost,
            yearsToStart: stage.yearsToStart
          }))
        }))
      };

      // PERBAIKAN DI SINI:
      // Service Anda mengembalikan AxiosResponse. Kita butuh .data nya.
      // Dan kita perlu memastikan tipenya sesuai dengan EducationSimulationResult
      const response = await financialService.simulateAgentEducation(payload);

      // Jika service mengembalikan { data, pdfBuffer, mgcToken }
      setResult(response as unknown as EducationSimulationResult);

      setStep(3);
      toast.success("Simulasi berhasil dihitung!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal menghitung simulasi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-6 pb-24 space-y-6">
      {/* Header Wizard */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kalkulator Dana Pendidikan</h1>
            <p className="text-muted-foreground text-sm">
              Rencanakan masa depan pendidikan buah hati Anda dengan metode anuitas tetap.
            </p>
          </div>
        </div>

        {/* Progress Bar & Indicators */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span className={step >= 1 ? "text-primary" : ""}>Identitas Klien</span>
            <span className={step >= 2 ? "text-primary" : ""}>Rencana Anak</span>
            <span className={step >= 3 ? "text-primary" : ""}>Hasil Simulasi</span>
          </div>
          <Progress value={step === 1 ? 33 : step === 2 ? 66 : 100} className="h-2" />
        </div>
      </div>

      {/* Step Content */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6">
          {step === 1 && (
            <ClientFormStep
              initialData={formData}
              onNext={handleClientNext}
            />
          )}

          {step === 2 && (
            <ChildrenFormStep
              initialData={{ childrenPlans: formData.childrenPlans as any }}
              onNext={handleChildrenSubmit}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && result && (
            <SimulationResultStep
              result={result}
              onReset={() => {
                setStep(1);
                setResult(null);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Info Box (Hanya tampil di step 1 & 2) */}
      {step < 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border flex gap-3 items-start">
            <User className="w-5 h-5 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Data Klien:</strong> Digunakan untuk personalisasi laporan PDF hasil simulasi.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border flex gap-3 items-start">
            <Baby className="w-5 h-5 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Multi-Anak:</strong> Anda dapat memasukkan lebih dari satu anak dalam satu kali simulasi.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border flex gap-3 items-start">
            <CalcIcon className="w-5 h-5 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Metode PAM Jaya:</strong> Kalkulasi menggunakan asumsi menabung tetap setiap bulan (Flat Annuity).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}