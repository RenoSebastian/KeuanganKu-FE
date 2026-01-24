"use client";

import { AuditProfile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Mail, Calendar, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeProfileHeaderProps {
  profile: AuditProfile;
}

export default function EmployeeProfileHeader({ profile }: EmployeeProfileHeaderProps) {
  
  // Logic Pewarnaan Skor
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-rose-600";
  };

  // Logic Pewarnaan Badge Status
  const getStatusVariant = (status: string) => {
    const s = status.toUpperCase();
    if (["SEHAT", "SANGAT SEHAT", "AMAN", "IDEAL"].includes(s)) {
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
    if (["WASPADA", "HATI-HATI"].includes(s)) {
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
    if (["BAHAYA", "KURANG", "CRITICAL"].includes(s)) {
        return "bg-rose-100 text-rose-700 border-rose-200";
    }
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  // Helper Format Tanggal
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        
        {/* Banner Background */}
        <div className="h-32 bg-slate-900 relative">
            <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-10"></div>
            {/* Visual Accent */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent"></div>
        </div>

        <div className="px-6 pb-6 -mt-12 flex flex-col md:flex-row items-start justify-between gap-6 relative z-10">
            
            {/* LEFT: Identitas Karyawan */}
            <div className="flex items-end gap-5">
                {/* Avatar / Inisial */}
                <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg shrink-0">
                    <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-3xl font-black text-slate-400 border border-slate-200">
                        {profile.fullName ? profile.fullName.substring(0, 2).toUpperCase() : "??"}
                    </div>
                </div>
                
                <div className="pb-1 space-y-1">
                    <h1 className="text-2xl font-black text-slate-900 leading-tight">
                        {profile.fullName}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <span>{profile.unitName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{profile.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Score Badge Summary */}
            <div className="flex flex-col items-end gap-2 mt-4 md:mt-12 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60 backdrop-blur-sm shadow-sm w-full md:w-auto">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" /> Financial Health
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-4 w-full">
                    {/* Score Number */}
                    <span className={cn("text-4xl font-black tracking-tighter", getScoreColor(profile.healthScore))}>
                        {profile.healthScore}
                    </span>
                    
                    {/* Status Text & Date */}
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className={cn("px-2.5 py-0.5 border text-[10px] font-black uppercase", getStatusVariant(profile.status))}>
                            {profile.status}
                        </Badge>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Checked: {formatDate(profile.lastCheckDate)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}