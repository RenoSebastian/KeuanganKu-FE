"use client";

import { CheckupWizard } from "@/components/features/finance/checkup-wizard";
import { CheckupResult } from "@/components/features/finance/checkup-result";
import { financialService } from "@/services/financial.service";
import { FinancialRecord, HealthAnalysisResult } from "@/lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming you use sonner or similar

export default function FinancialCheckupPage() {
  const router = useRouter();
  const [result, setResult] = useState<HealthAnalysisResult | null>(null);
  const [rawData, setRawData] = useState<FinancialRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- LEGACY LOGIC: SAVE TO DATABASE ---
  const handleLegacyComplete = async (data: any) => {
    setIsLoading(true);
    try {
      // 1. Data Cleaning (Hapus spouse jika single) - Logic dipindah kesini dari Wizard lama
      const payload: any = { ...data };
      if (payload.userProfile?.maritalStatus !== "MARRIED") {
        delete payload.spouseProfile;
      }

      // 2. Call API (Save to DB)
      const analysis = await financialService.createCheckup(payload);

      setRawData(payload);
      setResult(analysis);
      toast.success("Data berhasil disimpan dan dianalisa.");

    } catch (error: any) {
      console.error("Error creating checkup:", error);
      toast.error("Gagal memproses data. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Jika di step awal wizard di-back, mungkin redirect ke dashboard?
    router.push("/finance");
  };

  const handleReset = () => {
    setResult(null);
    setRawData(null);
  };

  // --- RENDER ---

  if (result && rawData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <CheckupResult
          data={result}
          rawData={rawData}
          onReset={handleReset}
          mode="USER_VIEW" // Mode standard user
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800">Financial Checkup</h1>
        <p className="text-slate-500">Cek kesehatan finansial pribadi Anda secara komprehensif.</p>
      </div>

      <CheckupWizard
        onComplete={handleLegacyComplete}
        onBack={handleBack}
        isLoading={isLoading}
      // initialData bisa kosong untuk mode user baru
      />
    </div>
  );
}