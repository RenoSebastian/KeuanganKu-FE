"use client";

import { AlertTriangle, ShieldCheck, Eye, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditNoticeProps {
  auditId?: string;
  viewerName?: string;
  className?: string;
}

export default function AuditNotice({ 
  auditId = "AUD-" + Math.random().toString(36).substr(2, 9).toUpperCase(), 
  viewerName = "DIRECTOR",
  className 
}: AuditNoticeProps) {
  
  const timestamp = new Date().toLocaleString("id-ID", {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-amber-200 bg-amber-50/50 p-4 mb-6 shadow-sm",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 p-8 opacity-5 -translate-y-1/2 translate-x-1/4 pointer-events-none">
        <ShieldCheck className="w-32 h-32 text-amber-600" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Warning Message */}
        <div className="flex gap-3">
          <div className="bg-amber-100 p-2 rounded-lg h-fit shrink-0 border border-amber-200">
            <Eye className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Mode Audit Aktif
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-white rounded uppercase tracking-wider">
                Read Only
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-xl">
              Anda sedang mengakses data sensitif karyawan. Seluruh aktivitas pencarian, 
              melihat, dan mengunduh data di halaman ini <strong className="text-amber-700">telah dicatat</strong> dalam Audit Trail Sistem.
            </p>
          </div>
        </div>

        {/* Right: Technical Details (Log Info) */}
        <div className="w-full md:w-auto bg-white/60 border border-amber-100 rounded-lg p-3 text-[10px] font-mono text-slate-500 flex flex-col gap-1 shrink-0">
          <div className="flex justify-between gap-4">
            <span>SESSION ID:</span>
            <span className="font-bold text-slate-700">{auditId}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>ACCESS BY:</span>
            <span className="font-bold text-slate-700 uppercase">{viewerName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>TIMESTAMP:</span>
            <span className="font-bold text-slate-700">{timestamp}</span>
          </div>
          <div className="mt-1 pt-1 border-t border-amber-100 flex items-center gap-1 text-emerald-600 font-bold justify-end">
            <Lock className="w-2.5 h-2.5" /> ENCRYPTED CONNECTION
          </div>
        </div>

      </div>
    </div>
  );
}