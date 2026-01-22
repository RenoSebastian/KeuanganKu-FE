"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Loader2, User as UserIcon, Building2, 
  Mail, Calendar, ShieldCheck, Download, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckupResult } from "@/components/features/finance/checkup-result";
import { 
  FinancialRecord, 
  HealthAnalysisResult, 
  RiskyEmployeeDetail 
} from "@/lib/types";
import { 
  RISKY_EMPLOYEES_MOCK, 
  USER_PROFILE 
} from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

// --- MOCK DATA GENERATOR FOR DETAIL VIEW ---
// Simulasi data mentah (FinancialRecord) untuk keperluan demo auditor
const MOCK_RAW_DATA: FinancialRecord = {
  userProfile: {
    name: "Ahmad Junaedi",
    dob: "1985-06-12",
    gender: "L",
    ethnicity: "Jawa",
    religion: "Islam",
    maritalStatus: "MARRIED",
    childrenCount: 3,
    dependentParents: 2,
    occupation: "Staff Operasional",
    city: "Jakarta"
  },
  assetCash: 5000000,
  assetHome: 500000000,
  assetVehicle: 150000000,
  assetJewelry: 10000000,
  assetAntique: 0,
  assetPersonalOther: 0,
  assetInvHome: 0,
  assetInvVehicle: 0,
  assetGold: 5000000,
  assetInvAntique: 0,
  assetStocks: 0,
  assetMutualFund: 0,
  assetBonds: 0,
  assetDeposit: 0,
  assetInvOther: 0,
  debtKPR: 350000000,
  debtKPM: 120000000,
  debtCC: 25000000,
  debtCoop: 15000000,
  debtConsumptiveOther: 5000000,
  debtBusiness: 0,
  incomeFixed: 12000000,
  incomeVariable: 2000000,
  installmentKPR: 4500000,
  installmentKPM: 2800000,
  installmentCC: 1500000,
  installmentCoop: 500000,
  installmentConsumptiveOther: 0,
  installmentBusiness: 0,
  insuranceLife: 500000,
  insuranceHealth: 0,
  insuranceHome: 0,
  insuranceVehicle: 0,
  insuranceBPJS: 150000,
  insuranceOther: 0,
  savingEducation: 500000,
  savingRetirement: 0,
  savingPilgrimage: 0,
  savingHoliday: 0,
  savingEmergency: 200000,
  savingOther: 0,
  expenseFood: 4000000,
  expenseSchool: 2000000,
  expenseTransport: 1500000,
  expenseCommunication: 500000,
  expenseHelpers: 0,
  expenseTax: 200000,
  expenseLifestyle: 1500000
};

// Simulasi hasil analisa kesehatan
const MOCK_ANALYSIS_RESULT: HealthAnalysisResult = {
  score: 35,
  globalStatus: "BAHAYA",
  netWorth: 295000000,
  surplusDeficit: -1250000,
  generatedAt: new Date().toISOString(),
  ratios: [
    { id: "liquidity", label: "Rasio Likuiditas", value: 0.5, benchmark: "> 3x", statusColor: "RED", recommendation: "Dana darurat sangat tipis, segera alokasikan aset likuid." },
    { id: "debt_ratio", label: "Rasio Hutang", value: 68, benchmark: "< 35%", statusColor: "RED", recommendation: "Cicilan bulanan sudah menggerus pendapatan utama." },
    { id: "saving_ratio", label: "Rasio Menabung", value: 5, benchmark: "> 10%", statusColor: "YELLOW", recommendation: "Tingkatkan porsi tabungan dengan menekan biaya lifestyle." }
  ]
};

export default function EmployeeFinancialDetail() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState<RiskyEmployeeDetail | null>(null);

  useEffect(() => {
    const initPage = async () => {
      // 1. Pengecekan Otoritas Direksi
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(storedUser);
      if (user.role !== "DIRECTOR") {
        alert("AKSES DITOLAK: Anda tidak memiliki otoritas audit.");
        router.push("/");
        return;
      }

      // 2. Simulasi Fetch Data Karyawan berdasarkan ID URL
      const foundEmployee = RISKY_EMPLOYEES_MOCK.find(e => e.id === params.id);
      
      if (!foundEmployee) {
        alert("Data karyawan tidak ditemukan.");
        router.push("/director");
        return;
      }

      setEmployee(foundEmployee);
      setIsLoading(false);
    };

    initPage();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-slate-800 animate-spin" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Membuka Brankas Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-20">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/director")}
              className="text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
            </Button>
            <div className="h-6 w-px bg-slate-200 hidden md:block" />
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">ID: {employee?.id}</Badge>
              <span className="text-xs text-slate-400 font-medium">Audit Financial Personal</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 border-slate-200">
               <Printer className="w-4 h-4 mr-2" /> Cetak Laporan
            </Button>
            <Button size="sm" className="h-9 bg-slate-900 hover:bg-slate-800 text-white">
               <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* --- EMPLOYEE MINI PROFILE --- */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <ShieldCheck className="w-40 h-40 text-slate-900" />
           </div>

           <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner">
                 <UserIcon className="w-10 h-10" />
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">{employee?.fullName}</h1>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-1">
                       <Building2 className="w-3.5 h-3.5" /> {employee?.unitName}
                    </p>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                       <Mail className="w-4 h-4 text-slate-400" /> 
                       <span>{employee?.fullName.toLowerCase().replace(" ", ".")}@pamjaya.co.id</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                       <Calendar className="w-4 h-4 text-slate-400" /> 
                       <span>Terakhir Update: {employee?.lastCheckupDate}</span>
                    </div>
                 </div>

                 <div className="flex flex-col md:items-end justify-center">
                    <Badge className={cn(
                      "px-4 py-1.5 text-xs font-bold uppercase tracking-widest",
                      employee?.status === "BAHAYA" ? "bg-red-600 text-white" : "bg-amber-500 text-white"
                    )}>
                       Status Audit: {employee?.status}
                    </Badge>
                 </div>
              </div>
           </div>
        </section>

        {/* --- REUSED FINANCIAL ANALYSIS COMPONENT (Read-Only) --- */}
        <section>
          <div className="flex items-center gap-2 mb-6 px-2">
             <div className="w-2 h-2 rounded-full bg-blue-600" />
             <h2 className="text-lg font-bold text-slate-800">Analisa Rekam Medis Keuangan</h2>
          </div>
          
          {/* Tahap 4 & 5: Memanggil kembali komponen CheckupResult.
            Kita mematikan tombol interaktif di dalam komponen ini melalui CSS atau wrapper jika perlu, 
            namun di sini kita kirimkan data auditor untuk keperluan visualisasi profesional.
          */}
          <CheckupResult 
            data={MOCK_ANALYSIS_RESULT} 
            rawData={MOCK_RAW_DATA} 
            onReset={() => {}} // Disabled for Auditor
          />
        </section>

      </main>
    </div>
  );
}