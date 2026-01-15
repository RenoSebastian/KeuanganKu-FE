"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ChevronRight, Search, Filter, History as HistoryIcon, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios"; // Import Helper Axios

// --- HELPER: NAMA BULAN ---
const getMonthName = (monthIndex: number) => {
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return months[monthIndex - 1] || "";
};

// --- HELPER: FORMAT RUPIAH ---
const formatMoney = (val: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/financial/budget/history");
        
        // Transform Data Backend ke Format UI
        const mappedData = response.data.map((item: any) => {
          // Logika Penentuan Status & Skor (Frontend Logic)
          // Karena endpoint history mengembalikan BudgetPlan, kita hitung status berdasarkan balance
          const balance = Number(item.balance);
          const ratio = (Number(item.totalExpense) / Number(item.totalIncome)) * 100;
          
          let statusUI = "Sehat";
          let scoreUI = 85;
          let summaryUI = "Kondisi keuangan stabil. Pemasukan lebih besar dari pengeluaran.";

          if (balance < 0) {
            statusUI = "Bahaya";
            scoreUI = 40;
            summaryUI = `Terjadi Defisit sebesar ${formatMoney(Math.abs(balance))}. Pengeluaran terlalu besar.`;
          } else if (ratio > 90) {
            statusUI = "Waspada";
            scoreUI = 65;
            summaryUI = "Hampir impas. Sisihkan lebih banyak untuk tabungan.";
          }

          return {
            id: item.id,
            date: `${getMonthName(item.month)} ${item.year}`,
            rawDate: new Date(item.year, item.month - 1), // Untuk sorting/filtering
            status: statusUI,
            score: scoreUI,
            summary: summaryUI,
            totalIncome: item.totalIncome,
            totalExpense: item.totalExpense
          };
        });

        setHistoryData(mappedData);
      } catch (error) {
        console.error("Gagal load history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // --- FILTERING ---
  const filteredData = historyData.filter(item => 
    item.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full bg-slate-50/50">
      
      {/* Background Decorations */}
      <div className="hidden md:block absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="hidden md:block absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/40 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 px-5 pt-6 pb-24 md:px-10 md:pt-12 max-w-7xl mx-auto">
        
        {/* === 1. HEADER SECTION === */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
           
           <div className="animate-in slide-in-from-left-4 duration-700">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-xl hidden md:block">
                    <HistoryIcon className="w-6 h-6" />
                 </div>
                 <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">
                   Riwayat Analisa
                 </h1>
              </div>
              <p className="text-xs md:text-base text-slate-600 font-medium max-w-md leading-relaxed">
                 Arsip lengkap pemeriksaan kesehatan keuangan Anda. Pantau perkembangan skor dari waktu ke waktu.
              </p>
           </div>

           {/* Stats Widget */}
           <div className="hidden md:flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-700 delay-100">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                 <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-xs text-slate-500 font-semibold">Total Laporan</p>
                 <p className="text-lg font-bold text-slate-800">
                   {loading ? "..." : historyData.length} Data
                 </p>
              </div>
           </div>
        </div>

        {/* === 2. TOOLBAR (SEARCH & FILTER) === */}
        <div className="flex gap-3 mb-6 md:mb-10 animate-in slide-in-from-bottom-2 duration-700 delay-100">
           {/* Search Bar */}
           <div className="relative flex-1 max-w-md">
              <input 
                 type="text" 
                 placeholder="Cari bulan atau tahun..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-white/80 md:bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all hover:shadow-md"
              />
              <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
           </div>

           {/* Filter Button (Visual Only for now) */}
           <button className="px-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-all flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline text-sm font-semibold">Filter</span>
           </button>
        </div>

        {/* === 3. LIST CONTENT === */}
        {loading ? (
          // LOADING STATE
          <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
             <p className="text-slate-500 font-medium">Memuat riwayat...</p>
          </div>
        ) : filteredData.length > 0 ? (
          // DATA GRID
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
             {filteredData.map((item, index) => (
               <HistoryCard key={item.id} item={item} index={index} />
             ))}
          </div>
        ) : (
          // EMPTY STATE
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-lg font-bold text-slate-500">Belum ada riwayat</p>
             <p className="text-sm text-slate-400 mt-1">
               {searchTerm ? "Tidak ditemukan data yang cocok." : "Lakukan analisa pertama Anda sekarang."}
             </p>
          </div>
        )}

      </div>
    </div>
  );
}

// --- KOMPONEN KARTU ---
function HistoryCard({ item, index }: { item: any, index: number }) {
  // Logic Warna berdasarkan Status UI
  const statusColor = 
    item.status === "Sehat" ? "bg-green-500" :
    item.status === "Waspada" ? "bg-yellow-500" : "bg-red-500";
    
  // Badge Style (Manual ClassName agar tidak merusak component library)
  const badgeStyle = 
    item.status === "Sehat" ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" : 
    item.status === "Waspada" ? "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200" : 
    "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";

  return (
    <div 
      className="animate-in slide-in-from-bottom-4 duration-700 fade-in fill-mode-backwards"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Card className={cn(
          "group relative overflow-hidden border-0 shadow-sm transition-all duration-300 bg-white/90 backdrop-blur-sm",
          "hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1",
          "md:h-full md:flex md:flex-col"
      )}>
          
          {/* Strip Warna Indikator */}
          <div className={cn(
              "absolute left-0 top-0 bottom-0 w-1.5 md:w-full md:h-1.5 md:bottom-auto", 
              statusColor
          )}></div>

          <div className="pl-4 pr-3 py-3 md:p-6 md:pt-8 flex flex-col h-full justify-between">
            
            {/* Bagian Atas */}
            <div>
               <div className="flex items-center justify-between mb-3">
                  <span className="text-xs md:text-sm font-bold text-slate-500 flex items-center gap-1.5">
                     <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                     {item.date}
                  </span>
                  <Badge className={cn("md:px-3 md:py-1 border", badgeStyle)}>
                    {item.status}
                  </Badge>
               </div>

               <div className="flex items-baseline gap-2 mb-3">
                  <span className={cn(
                    "text-3xl md:text-5xl font-black tracking-tighter",
                    item.status === "Sehat" ? "text-green-600" : 
                    item.status === "Waspada" ? "text-yellow-600" : "text-red-600"
                  )}>
                    {item.score}
                  </span>
                  <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">
                    / 100 Poin
                  </span>
               </div>

               <p className="text-[11px] md:text-sm text-slate-600 leading-relaxed line-clamp-2 md:line-clamp-3 mb-4">
                  {item.summary}
               </p>
            </div>

            {/* Bagian Bawah (Aksi) */}
            <div className="flex items-center justify-end gap-2 mt-2 md:mt-4 md:pt-4 md:border-t md:border-slate-50">
               
               <Button 
                  size="sm" 
                  variant="outline" 
                  className="hidden md:flex h-9 border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 text-xs"
               >
                  <Download className="w-3.5 h-3.5 mr-2" />
                  Unduh PDF
               </Button>

               <Button 
                  size="sm" 
                  className="hidden md:flex h-9 bg-blue-600 text-white hover:bg-blue-700 text-xs shadow-md shadow-blue-200"
               >
                  Lihat Detail
                  <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
               </Button>

               {/* Mobile Buttons */}
               <Button size="sm" variant="outline" className="md:hidden h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-500">
                  <Download className="w-4 h-4" />
               </Button>
               <Button size="sm" className="md:hidden h-8 w-8 p-0 rounded-lg bg-blue-50 text-blue-600">
                  <ChevronRight className="w-4 h-4" />
               </Button>
            </div>
         </div>
      </Card>
    </div>
  );
}