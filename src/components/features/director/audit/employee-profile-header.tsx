"use client";

import { AuditProfile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmployeeProfileHeader({ profile }: { profile: AuditProfile }) {
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start justify-between pb-6 mb-6 border-b border-slate-100">
        
        {/* LEFT: Identity */}
        <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold border-4 border-white shadow-sm">
                {profile.fullName?.substring(0, 2).toUpperCase() || "??"}
            </div>
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{profile.fullName}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> {profile.unitName}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> {profile.email}
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT: Key Stats */}
        <div className="flex items-center gap-3 w-full md:w-auto bg-slate-50 p-3 rounded-xl border border-slate-100">
             <div className="text-right px-2">
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Health Score</p>
                 <p className={cn("text-2xl font-black leading-none mt-1", 
                    profile.healthScore >= 50 ? "text-slate-800" : "text-rose-600"
                 )}>
                    {profile.healthScore}
                 </p>
             </div>
             <div className="w-px h-8 bg-slate-200 mx-1" />
             <div className="text-left px-2">
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                 <Badge variant="outline" className={cn("mt-1 border font-bold h-6", getScoreColor(profile.healthScore))}>
                    {profile.status}
                 </Badge>
             </div>
        </div>
    </div>
  );
}