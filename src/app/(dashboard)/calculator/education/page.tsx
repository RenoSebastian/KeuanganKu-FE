"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calculator,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import Wizard Steps
import { ClientFormStep, ClientFormValues } from "@/components/features/education/wizard/client-form-step";
import { ChildrenFormStep } from "@/components/features/education/wizard/children-form-step";
import { SimulationResultStep } from "@/components/features/education/wizard/simulation-result-step";

// Types & Services
import {
  EducationSimulationPayload,
  EducationSimulationResult,
  EducationMethod // Diperlukan untuk default value saat mapping data
} from "@/lib/types/education";
import { financialService } from "@/services/financial.service";
import { PdfLoadingModal } from "@/components/features/finance/pdf-loading-modal";
import { toast } from "sonner";

type SimulationStep = "CLIENT" | "CHILDREN" | "RESULT";

export default function EducationSimulationPage() {
  // --- WIZARD STATES ---
  const [currentStep, setCurrentStep] = useState<SimulationStep>("CLIENT");
  const [payload, setPayload] = useState<Partial<EducationSimulationPayload>>({});
  const [simulationResult, setSimulationResult] = useState<EducationSimulationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // --- UI STATES ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = [
    '/images/pendidikan/rancangdanapendidikan1.webp',
    '/images/pendidikan/rancangdanapendidikan2.webp'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === backgroundImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // --- HANDLERS ---

  const handleClientSubmit = (data: ClientFormValues) => {
    setPayload((prev) => ({ ...prev, ...data }));
    setCurrentStep("CHILDREN");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChildrenSubmit = async (data: any) => {
    setIsCalculating(true);

    // Gabungkan data client dan data children
    // Note: data.childrenPlans dari form sudah strict (method ada isinya), aman untuk di-assign ke payload
    const finalPayload: EducationSimulationPayload = {
      ...(payload as EducationSimulationPayload), // Cast as Payload untuk memastikan base property ada
      childrenPlans: data.childrenPlans
    };

    try {
      // 1. Panggil Service Simulasi (Response Blob PDF)
      const response = await financialService.simulateAgentEducation(finalPayload);

      // 2. Extract Token & Filename dari Header (Standard Agent Tool Pattern)
      const mgcToken = response.headers['x-mgc-token'];
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `Education_Simulation_${Date.now()}.pdf`;

      // 3. Simpan Result ke State
      setSimulationResult({
        pdfBuffer: response.data as any, // Blob data
        mgcToken,
        filename,
        // Mock data detail untuk UI preview (sinkronisasi visual dengan input user)
        data: {
          totalMonthlyInvestment: 0, // Nilai ini idealnya dihitung BE, tapi untuk preview PDF-first bisa 0 dulu
          totalFutureCost: 0,
          details: data.childrenPlans.map((c: any) => ({
            childName: c.childName,
            detail: { stagesBreakdown: c.stages },
            summary: { totalMonthlySaving: 0 }
          }))
        }
      });

      setCurrentStep("RESULT");
      toast.success("Kalkulasi simulasi berhasil!");
    } catch (error) {
      console.error("Simulation Error:", error);
      toast.error("Gagal melakukan kalkulasi. Silakan periksa kembali data input.");
    } finally {
      setIsCalculating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setPayload({});
    setSimulationResult(null);
    setCurrentStep("CLIENT");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12 overflow-x-hidden selection:bg-cyan-100 selection:text-cyan-900">

      <PdfLoadingModal isOpen={isCalculating} />

      {/* --- HERO HEADER --- */}
      <div className="relative pt-10 pb-32 px-5 overflow-hidden shadow-2xl bg-cyan-900">
        <div className="absolute inset-0 w-full h-full z-0">
          {backgroundImages.map((image, index) => (
            <div
              key={image}
              className={cn(
                "absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out",
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              )}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-cyan-500/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-linear-to-t from-cyan-600 via-cyan-600/40 to-transparent" />
        </div>

        <div className="relative z-20 max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
            <Calculator className="w-4 h-4 text-cyan-300" />
            <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Agent Sales Tools</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl">
            Simulasi Dana <span className="text-cyan-300">Pendidikan</span>
          </h1>

          <p className="text-cyan-50 text-sm md:text-base max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Bantu klien merancang masa depan pendidikan putra-putri mereka dengan perhitungan akurat dan laporan profesional.
          </p>
        </div>
      </div>

      {/* --- WIZARD CONTAINER --- */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 md:px-6 -mt-16">

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={cn("h-2 w-12 rounded-full transition-all", currentStep === "CLIENT" ? "bg-white w-20 shadow-lg" : "bg-white/40")} />
          <div className={cn("h-2 w-12 rounded-full transition-all", currentStep === "CHILDREN" ? "bg-white w-20 shadow-lg" : "bg-white/40")} />
          <div className={cn("h-2 w-12 rounded-full transition-all", currentStep === "RESULT" ? "bg-white w-20 shadow-lg" : "bg-white/40")} />
        </div>

        <Card className="p-6 md:p-10 rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">

          {currentStep === "CLIENT" && (
            <ClientFormStep
              initialData={payload}
              onNext={handleClientSubmit}
            />
          )}

          {currentStep === "CHILDREN" && (
            <ChildrenFormStep
              // FIX: Mapping payload untuk memastikan tipe data sesuai dengan Schema Form Strict
              // Terutama pada field 'method' yang optional di payload tapi required di form
              initialData={{
                childrenPlans: payload.childrenPlans?.map(plan => ({
                  ...plan,
                  method: plan.method ?? EducationMethod.GEOMETRIC, // Fallback default value
                  stages: plan.stages // Stages biasanya sudah kompatibel
                }))
              }}
              onBack={() => setCurrentStep("CLIENT")}
              onNext={handleChildrenSubmit}
            />
          )}

          {currentStep === "RESULT" && (
            <SimulationResultStep
              result={simulationResult}
              onReset={handleReset}
            />
          )}

          {/* Wizard Footer Note */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Stateless Simulation</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Data yang Anda masukkan tidak disimpan sebagai profil permanen. Hasil simulasi hanya tersimpan dalam bentuk log aktivitas agen dan laporan PDF yang dapat diunduh.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Help */}
        {currentStep !== "RESULT" && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-cyan-600"
              onClick={handleReset}
            >
              <RefreshCcw className="w-3 h-3 mr-2" />
              Reset & Ulang dari Awal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}