"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Stethoscope, ShieldCheck, Sparkles } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { CheckupWizard } from "@/components/features/finance/checkup-wizard";
import { Badge } from "@/components/ui/badge";

export default function FinancialCheckupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] relative selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Grid Pattern */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
         
         {/* Soft Ambient Glows */}
         <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-100/40 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-100/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
        
        {/* --- TOP NAVIGATION BAR --- */}
        <div className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <Button 
              variant="ghost" 
              className="text-slate-500 hover:text-slate-900 hover:bg-white/60 -ml-2 transition-all gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </Button>
            
            <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400 hidden md:block">
                    Modul Diagnosa v1.0
                </span>
                <Badge variant="outline" className="bg-white/50 backdrop-blur-sm border-emerald-200 text-emerald-700 gap-1.5 py-1 px-3 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="font-semibold">Secure Encryption</span>
                </Badge>
            </div>
        </div>

        {/* --- HEADER SECTION (CENTERED) --- */}
        <div className="text-center max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
           {/* Icon Badge */}
           <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-xl shadow-emerald-900/5 border border-slate-100 flex items-center justify-center mb-6 relative group">
              <div className="absolute inset-0 bg-emerald-50 rounded-2xl transform rotate-6 scale-90 transition-transform group-hover:rotate-12" />
              <Stethoscope className="w-8 h-8 text-emerald-600 relative z-10" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
           </div>

           <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
             Financial Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Check Up</span>
           </h1>
           
           <p className="text-slate-500 text-lg leading-relaxed">
             Mari periksa vitalitas keuangan Anda. Isi data dengan jujur untuk mendapatkan 
             <span className="font-medium text-slate-700 mx-1 border-b border-emerald-300 border-dashed cursor-help" title="Diagnosa berdasarkan 8 rasio standar perencana keuangan">resep perbaikan</span> 
             yang akurat.
           </p>
        </div>

        {/* --- WIZARD CONTENT --- */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            {/* Wrapper agar wizard terlihat menonjol */}
            <div className="relative">
                {/* Decorative Elements behind card */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full blur-2xl opacity-10" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-2xl opacity-10" />
                
                <CheckupWizard />
            </div>
        </div>

        {/* --- FOOTER INFO --- */}
        <div className="mt-12 text-center flex items-center justify-center gap-2 text-slate-400 text-xs animate-in fade-in duration-1000 delay-500">
            <Sparkles className="w-3 h-3" />
            <p>Powered by KeuanganKu Financial Engine</p>
        </div>

      </div>
    </div>
  );
}