"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Stethoscope, ShieldCheck, Sparkles } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { CheckupWizard } from "@/components/features/finance/checkup-wizard";
import { Badge } from "@/components/ui/badge";

export default function FinancialCheckupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-surface-ground">
      
      {/* --- HEADER (PAM IDENTITY) --- */}
      <div className="bg-brand-900 pt-8 pb-32 px-5 relative overflow-hidden shadow-2xl">
         {/* Ambient Background Effects */}
         <div className="absolute top-0 right-0 w-125 h-125 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
         <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.05] mix-blend-overlay"></div>

         <div className="relative z-10 max-w-5xl mx-auto">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between mb-8 text-white">
                <Button 
                  variant="ghost" 
                  onClick={() => router.back()}
                  className="text-brand-100 hover:text-white hover:bg-brand-800 -ml-4 gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Kembali</span>
                </Button>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-brand-200 hidden md:block">
                        Modul Diagnosa v1.0
                    </span>
                    <Badge variant="outline" className="bg-brand-800/50 backdrop-blur-sm border-brand-500 text-brand-100 gap-1.5 py-1 px-3">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="font-semibold">Secure Encryption</span>
                    </Badge>
                </div>
            </div>

            {/* Title Section */}
            <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4 shadow-sm">
                   <Stethoscope className="w-4 h-4 text-cyan-300" />
                   <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Financial Health Check Up</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-sm">
                  Periksa Vitalitas Keuangan
                </h1>
                <p className="text-brand-100 text-sm md:text-lg leading-relaxed opacity-90">
                  Diagnosa kesehatan finansial Anda secara menyeluruh dengan standar perencana keuangan profesional. Data Anda dijamin kerahasiaannya.
                </p>
            </div>
         </div>
      </div>

      {/* --- CONTENT SHEET (Overlapping) --- */}
      <div className="relative z-20 bg-surface-ground rounded-t-[2.5rem] -mt-16 pt-10 pb-20 px-4 md:px-8 min-h-[60vh] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
         
         <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* The Wizard Component */}
            <CheckupWizard />
         </div>

         {/* Footer Info */}
         <div className="mt-12 text-center flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Sparkles className="w-3 h-3" />
            <p>Powered by KeuanganKu Financial Engine</p>
         </div>
      </div>

    </div>
  );
}