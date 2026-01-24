"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, User as UserIcon, Building, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Services & Types
import { directorService } from "@/services/director.service";
import { User } from "@/lib/types";

export default function DirectorOmniSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // --- LOCAL STATE ---
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // --- 1. CLICK OUTSIDE HANDLER ---
  // Menutup dropdown jika user klik di luar area komponen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- 2. DEBOUNCE SEARCH LOGIC ---
  useEffect(() => {
    // Jangan search jika query terlalu pendek
    if (query.length <= 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await directorService.searchEmployees(query);
        setResults(data);
      } catch (error) {
        console.error("Omni-search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400); // Wait 400ms after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // --- 3. NAVIGATION HANDLER ---
  const handleSelectEmployee = (userId: string) => {
    setIsOpen(false);
    setQuery(""); // Clear input setelah navigasi
    router.push(`/director/employees/${userId}/checkup`);
  };

  // Helper untuk Status Badge Color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "SEHAT": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
      case "WASPADA": return "bg-amber-100 text-amber-700 hover:bg-amber-100";
      case "BAHAYA": return "bg-rose-100 text-rose-700 hover:bg-rose-100";
      default: return "bg-slate-100 text-slate-600 hover:bg-slate-100";
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      
      {/* INPUT FIELD */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
        <Input 
          placeholder="Cari karyawan (Nama/Unit)..." 
          className="pl-9 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:bg-slate-800 focus:border-brand-500 transition-all rounded-full h-9 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.length > 2) setIsOpen(true);
          }}
        />
        {/* Loading Spinner di kanan Input */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
          </div>
        )}
        {/* Clear Button */}
        {!isLoading && query && (
          <button 
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* DROPDOWN RESULTS (POPOVER) */}
      {isOpen && query.length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
            
            {/* STATE: EMPTY */}
            {!isLoading && results.length === 0 && (
              <div className="p-6 text-center text-slate-400">
                <p className="text-sm font-medium">Tidak ditemukan hasil.</p>
                <p className="text-xs mt-1">Coba kata kunci lain.</p>
              </div>
            )}

            {/* STATE: LIST RESULTS */}
            {results.map((user) => {
              // Extract status & score dari array financialChecks (sesuai struktur backend)
              // Biasanya array checkup terakhir ada di index 0 jika backend sort desc
              const lastCheck = user['financialChecks']?.[0]; 
              const status = lastCheck?.status || "UNKNOWN";
              const score = lastCheck?.healthScore;

              return (
                <div 
                  key={user.id}
                  onClick={() => handleSelectEmployee(user.id)}
                  className="p-3 hover:bg-slate-50 cursor-pointer transition-colors group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Avatar Initials */}
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                      {user.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-brand-700">
                        {user.fullName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                          <Building className="w-3 h-3" /> {user.unitKerja?.name || "Unit -"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {status !== "UNKNOWN" ? (
                      <>
                        <Badge className={cn("text-[9px] px-1.5 py-0 border-0 uppercase font-bold", getStatusColor(status))}>
                          {status}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400">
                          Score: <span className={cn("font-bold", score < 60 ? "text-rose-500" : "text-slate-600")}>{score ?? '-'}</span>
                        </span>
                      </>
                    ) : (
                      <span className="text-[9px] text-slate-400 italic">Belum Checkup</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="bg-slate-50 p-2 text-center border-t border-slate-100">
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              Tekan hasil untuk <span className="font-bold text-slate-500">Deep Dive Audit</span> <ArrowRight className="w-2 h-2" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}