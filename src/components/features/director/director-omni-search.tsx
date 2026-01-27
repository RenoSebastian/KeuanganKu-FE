"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2, User, Building2 } from 'lucide-react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export const DirectorOmniSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tahap 1 & 2: Debouncing Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setIsOpen(true);
    try {
      const response = await api.get('/search/employees', {
        params: { q: searchQuery }
      });
      
      if (response.data.success) {
        setResults(response.data.data);
      }
    } catch (error) {
      console.error("OmniSearch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (userId: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/director/employees/${userId}/checkup`);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Cari nama atau unit kerja..."
          className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
        )}
      </div>

      {/* Tahap 4: Search Result Dropdown */}
      {isOpen && (results.length > 0 || !isLoading) && (
        <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl z-99 overflow-hidden animate-in fade-in zoom-in duration-200">
          {results.length > 0 ? (
            <div className="max-h-100 overflow-y-auto">
              <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                Hasil Pencarian Karyawan
              </div>
              {results.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="w-full p-3 hover:bg-blue-50 flex items-center gap-3 transition-colors text-left border-b border-slate-50 last:border-0"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Rendering matchedHighlight dengan <em> tag */}
                    <span 
                      className="text-sm font-semibold text-slate-700 truncate search-highlight"
                      dangerouslySetInnerHTML={{ __html: item.matchedHighlight }}
                    />
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Building2 className="h-3 w-3" />
                      <span>{item.unitKerja}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              {query.length >= 2 ? "Tidak ada hasil ditemukan" : "Ketik minimal 2 karakter..."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};