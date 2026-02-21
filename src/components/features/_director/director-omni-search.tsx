"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, Command, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { directorService } from "@/services/director.service";
import { SearchResult } from "@/lib/types"; // [UPDATED] Use new type
import SearchResultItem from "@/components/features/director/search/search-result-item";

export default function DirectorOmniSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]); // [UPDATED] Type
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search Effect
  useEffect(() => {
    // Min 2 chars to trigger search (agar sesuai dengan config backend typo tolerance)
    if (query.length < 2) { 
      setResults([]); 
      return; 
    }

    setIsLoading(true); 
    setIsOpen(true);

    const timeout = setTimeout(async () => {
      try {
        const data = await directorService.searchEmployees(query);
        setResults(data);
      } catch (e) { 
        console.error("Search failed", e); 
        setResults([]);
      } finally { 
        setIsLoading(false); 
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeout);
  }, [query]);

  // [NEW] Navigation Handler
  const handleSelect = (item: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    
    if (item.type === "PERSON") {
      // Masuk ke halaman detail checkup karyawan
      router.push(`/director/employees/${item.redirectId}/checkup`);
    } else if (item.type === "UNIT") {
      // Masuk ke halaman detail unit kerja (jika ada)
      // router.push(`/director/units/${item.redirectId}`);
      console.log("Navigating to unit:", item.redirectId);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg z-50">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
        
        <Input 
          placeholder="Cari karyawan atau divisi (cth: 'Reno' atau 'IT')..." 
          className="pl-10 h-11 bg-white border-slate-200 rounded-lg shadow-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-cyan-600" />
        ) : query ? (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
             <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40 pointer-events-none">
            <Command className="w-3 h-3" />
            <span className="text-[10px]">K</span>
          </div>
        )}
      </div>

      {/* Result Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden ring-1 ring-black/5">
          <div className="max-h-87.5 overflow-y-auto">
            
            {!isLoading && results.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-slate-500 text-sm">Tidak ditemukan hasil untuk "{query}"</p>
                <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci yang lebih spesifik.</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  Hasil Pencarian
                </div>
                {results.map((item) => (
                  <SearchResultItem 
                    key={item.id} 
                    result={item} 
                    onClick={() => handleSelect(item)} 
                  />
                ))}
              </div>
            )}

          </div>
          
          {/* Footer Info */}
          {results.length > 0 && (
            <div className="bg-slate-50 px-3 py-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400">
                Menampilkan {results.length} hasil teratas
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                Enter untuk pilih <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}