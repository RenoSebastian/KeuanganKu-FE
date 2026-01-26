"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { directorService } from "@/services/director.service";
import { User } from "@/lib/types";
import SearchResultItem from "@/components/features/director/search/search-result-item";

export default function DirectorOmniSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length <= 2) { setResults([]); return; }
    setIsLoading(true); setIsOpen(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await directorService.searchEmployees(query);
        setResults(data);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Cari data karyawan..." 
          className="pl-10 h-11 bg-white border-slate-200 rounded-lg shadow-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setIsOpen(true)}
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-cyan-600" />
        ) : query ? (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
             <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40">
            <Command className="w-3 h-3" />
            <span className="text-[10px]">K</span>
          </div>
        )}
      </div>

      {isOpen && query.length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden z-50">
          <div className="max-h-[350px] overflow-y-auto">
            {!isLoading && results.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-sm">Tidak ditemukan hasil.</div>
            )}
            {results.map((user) => (
              <SearchResultItem 
                key={user.id} 
                user={user} 
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                  router.push(`/director/employees/${user.id}/checkup`);
                }} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}