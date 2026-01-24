"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Printer, ShieldCheck, User, 
  Briefcase, Calendar, AlertTriangle, Wallet, 
  TrendingDown, TrendingUp, DollarSign, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types & Services
import { EmployeeAuditDetail } from "@/lib/types";
import { directorService } from "@/services/director.service";

export default function EmployeeAuditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<EmployeeAuditDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const result = await directorService.getEmployeeDetail(id);
        if (!result) {
            setError("Data checkup karyawan tidak ditemukan.");
        } else {
            setData(result);
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data audit. Terjadi kesalahan sistem.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Helper: Format Rupiah
  const formatMoney = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  // Helper: Format Tanggal
  const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // --- RENDERING ---

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-slate-800" />
        <div className="text-center">
            <p className="font-bold text-sm uppercase tracking-widest">Retrieving Secure Data</p>
            <p className="text-xs text-slate-400">Logging audit trail event...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Data Tidak Tersedia</h2>
        <p className="text-slate-500 max-w-md mb-6">{error || "Karyawan ini belum pernah melakukan Financial Checkup."}</p>
        <Button onClick={() => router.back()} variant="outline">Kembali ke List</Button>
      </div>
    );
  }

  const { profile, record, analysis } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* 1. TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <Button 
            variant="ghost" 
            className="w-fit pl-0 text-slate-500 hover:text-slate-800 hover:bg-transparent"
            onClick={() => router.back()}
        >
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
        <div className="flex gap-2">
            <div className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Audit Mode: Read Only</span>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
                <Printer className="w-4 h-4" /> Print Report
            </Button>
        </div>
      </div>

      {/* 2. PROFILE HEADER CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="h-32 bg-slate-900 relative">
            <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-10"></div>
        </div>
        <div className="px-8 pb-8 flex flex-col md:flex-row items-start justify-between gap-6 -mt-12 relative z-10">
            <div className="flex items-end gap-6">
                <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg">
                    <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-2xl font-black text-slate-400">
                        {profile.fullName.substring(0,2).toUpperCase()}
                    </div>
                </div>
                <div className="pb-2">
                    <h1 className="text-2xl font-black text-slate-800">{profile.fullName}</h1>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {profile.unitName}</span>
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {profile.email}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-100 shadow-sm mt-4 md:mt-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Health Score</p>
                <div className="flex items-center gap-3">
                    <span className={cn(
                        "text-4xl font-black",
                        analysis.score >= 80 ? "text-emerald-600" : analysis.score >= 60 ? "text-amber-500" : "text-rose-600"
                    )}>
                        {analysis.score}
                    </span>
                    <Badge className={cn(
                        "text-xs px-2 py-0.5 border-0",
                        analysis.globalStatus === "SEHAT" ? "bg-emerald-100 text-emerald-700" :
                        analysis.globalStatus === "WASPADA" ? "bg-amber-100 text-amber-700" :
                        "bg-rose-100 text-rose-700"
                    )}>
                        {analysis.globalStatus}
                    </Badge>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Last checkup: {formatDate(profile.lastCheckDate)}
                </p>
            </div>
        </div>
      </div>

      {/* 3. EXECUTIVE SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard 
            label="Total Net Worth" 
            value={formatMoney(analysis.netWorth)} 
            icon={Wallet} 
            color="blue"
        />
        <SummaryCard 
            label="Monthly Surplus/Deficit" 
            value={formatMoney(analysis.surplusDeficit)} 
            icon={analysis.surplusDeficit >= 0 ? TrendingUp : TrendingDown} 
            color={analysis.surplusDeficit >= 0 ? "emerald" : "rose"}
        />
        <SummaryCard 
            label="Total Monthly Income" 
            value={formatMoney((record.incomeFixed || 0) + (record.incomeVariable || 0))} 
            icon={DollarSign} 
            color="slate"
        />
      </div>

      {/* 4. DETAILED BREAKDOWN TABS/LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: ASSETS & INCOME */}
        <div className="space-y-8">
            {/* ASSETS SECTION */}
            <SectionContainer title="Assets Breakdown" icon={Wallet}>
                <DetailRow label="Cash & Equivalents" value={record.assetCash} />
                <DetailRow label="Investments (Stocks, Mutual Funds)" value={record.assetMutualFund + record.assetStocks + record.assetBonds} />
                <DetailRow label="Real Estate (Home)" value={record.assetHome} />
                <DetailRow label="Vehicles" value={record.assetVehicle} />
                <DetailRow label="Gold & Precious Metals" value={record.assetGold} />
                <DetailRow label="Other Assets" value={record.assetAntique + record.assetPersonalOther} highlight />
                <div className="pt-2 border-t border-slate-200 mt-2">
                    <DetailRow label="TOTAL ASSETS" value={analysis.netWorth + (record.debtKPR + record.debtCC + record.debtKPM + record.debtConsumptiveOther)} bold />
                </div>
            </SectionContainer>

            {/* INCOME SECTION */}
            <SectionContainer title="Monthly Income Source" icon={TrendingUp}>
                <DetailRow label="Fixed Income (Salary)" value={record.incomeFixed} />
                <DetailRow label="Variable Income" value={record.incomeVariable} />
                <div className="pt-2 border-t border-slate-200 mt-2">
                    <DetailRow label="TOTAL INCOME" value={record.incomeFixed + record.incomeVariable} bold />
                </div>
            </SectionContainer>
        </div>

        {/* RIGHT COLUMN: LIABILITIES & EXPENSES */}
        <div className="space-y-8">
            {/* LIABILITIES SECTION */}
            <SectionContainer title="Liabilities (Debts)" icon={AlertTriangle} headerColor="rose">
                <DetailRow label="Mortgage (KPR)" value={record.debtKPR} />
                <DetailRow label="Vehicle Loans (KPM)" value={record.debtKPM} />
                <DetailRow label="Credit Cards" value={record.debtCC} />
                <DetailRow label="Cooperative Loan (Koperasi)" value={record.debtCoop} />
                <DetailRow label="Business/Other Debts" value={record.debtBusiness + record.debtConsumptiveOther} />
                <div className="pt-2 border-t border-slate-200 mt-2">
                    <DetailRow label="TOTAL DEBT" value={record.debtKPR + record.debtKPM + record.debtCC + record.debtCoop + record.debtBusiness + record.debtConsumptiveOther} bold />
                </div>
            </SectionContainer>

            {/* EXPENSES SECTION */}
            <SectionContainer title="Monthly Outflows" icon={TrendingDown}>
                <DetailRow label="Debt Installments" value={record.installmentKPR + record.installmentKPM + record.installmentCC + record.installmentCoop + record.installmentBusiness} highlight />
                <DetailRow label="Living Cost (Food, Transport, etc)" value={record.expenseFood + record.expenseTransport + record.expenseLifestyle + record.expenseCommunication} />
                <DetailRow label="Education & School" value={record.expenseSchool} />
                <DetailRow label="Insurance Premiums" value={record.insuranceLife + record.insuranceHealth + record.insuranceVehicle} />
                <DetailRow label="Savings & Investments" value={record.savingRetirement + record.savingEducation + record.savingEmergency} />
                <div className="pt-2 border-t border-slate-200 mt-2">
                    <DetailRow 
                        label="TOTAL OUTFLOW" 
                        value={
                            (record.incomeFixed + record.incomeVariable) - analysis.surplusDeficit
                        } 
                        bold 
                    />
                </div>
            </SectionContainer>
        </div>

      </div>

      <div className="text-center pt-10 pb-6 text-slate-400 text-xs">
        <p>AUDIT ID: {params.id} • GENERATED AT: {new Date().toISOString()}</p>
        <p className="mt-1">CONFIDENTIAL DOCUMENT - FOR DIRECTOR EYES ONLY</p>
      </div>

    </div>
  );
}

// --- SUB-COMPONENTS ---

function SummaryCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: "blue" | "emerald" | "rose" | "slate" }) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        rose: "bg-rose-50 text-rose-600",
        slate: "bg-slate-100 text-slate-600",
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={cn("p-3 rounded-lg", colorStyles[color])}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{label}</p>
                <p className="text-lg font-black text-slate-800">{value}</p>
            </div>
        </div>
    );
}

function SectionContainer({ title, icon: Icon, children, headerColor = "slate" }: { title: string, icon: any, children: React.ReactNode, headerColor?: "slate" | "rose" }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className={cn(
                "px-5 py-3 border-b border-slate-100 flex items-center gap-2",
                headerColor === "rose" ? "bg-rose-50/50 text-rose-700" : "bg-slate-50/50 text-slate-700"
            )}>
                <Icon className="w-4 h-4" />
                <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
            </div>
            <div className="p-5 space-y-3">
                {children}
            </div>
        </div>
    );
}

function DetailRow({ label, value, highlight = false, bold = false }: { label: string, value: number, highlight?: boolean, bold?: boolean }) {
    return (
        <div className={cn("flex justify-between items-center text-sm", highlight && "text-slate-500 italic")}>
            <span className={cn(bold && "font-bold text-slate-800")}>{label}</span>
            <span className={cn("font-mono", bold ? "font-black text-slate-900" : "text-slate-600")}>
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)}
            </span>
        </div>
    );
}