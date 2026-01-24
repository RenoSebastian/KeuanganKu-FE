"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";

// Services & Types
import { directorService } from "@/services/director.service";
import { User } from "@/lib/types";

// UI Components (Molecules)
import SearchResultItem from "@/components/features/director/search/search-result-item";

export default function DirectorOmniSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // --- LOCAL STATE ---
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // --- 1. CLICK OUTSIDE HANDLER ---
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
        
        {/* Loading Spinner */}
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
          
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            
            {/* STATE: EMPTY */}
            {!isLoading && results.length === 0 && (
              <div className="p-6 text-center text-slate-400">
                <p className="text-sm font-medium">Tidak ditemukan hasil.</p>
                <p className="text-xs mt-1">Coba kata kunci lain.</p>
              </div>
            )}

            {/* STATE: LIST RESULTS */}
            {/* Menggunakan Molecule SearchResultItem */}
            {results.map((user) => (
              <SearchResultItem 
                key={user.id} 
                user={user} 
                onClick={() => handleSelectEmployee(user.id)} 
              />
            ))}
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