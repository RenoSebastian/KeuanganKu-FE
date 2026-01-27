"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, Download, ChevronRight, Search, Filter,
  History as HistoryIcon, TrendingUp, Loader2, X, Eye,
  Wallet, ShieldCheck, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { financialService } from "@/services/financial.service";
import { CheckupDetailResponse } from "@/lib/types";

// --- HELPER FORMATTER ---
const formatMoney = (val: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
};

export default function HistoryPage() {
  // --- STATE MANAGEMENT ---
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Modal Detail
  const [selectedCheckup, setSelectedCheckup] = useState<CheckupDetailResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // --- 1. FETCH DATA (INIT) ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Menggunakan Service untuk mengambil data Checkup
        const data = await financialService.getCheckupHistory();
        setHistoryData(data);
      } catch (error) {
        console.error("Gagal load history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // --- 2. INTERACTION (VIEW DETAIL) ---
  const handleViewDetail = async (id: string) => {
    setIsDetailLoading(true);
    setShowModal(true); // Buka modal dulu agar UX lebih responsif
    try {
      const detail = await financialService.getCheckupDetail(id);
      setSelectedCheckup(detail);
    } catch (error) {
      console.error("Gagal load detail:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // --- FILTERING ---
  const filteredData = historyData.filter(item => {
    const dateStr = formatDate(item.checkDate).toLowerCase();
    return dateStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="relative min-h-screen w-full bg-slate-50/50 pb-20">

      {/* Background Decorations */}
      <div className="hidden md:block absolute top-0 right-0 w-125 h-125 bg-blue-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="hidden md:block absolute bottom-0 left-0 w-100 h-100 bg-purple-100/40 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 px-5 pt-6 md:px-10 md:pt-12 max-w-7xl mx-auto">

        {/* === HEADER SECTION === */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="animate-in slide-in-from-left-4 duration-700">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl hidden md:block">
                <HistoryIcon className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">
                Riwayat Checkup
              </h1>
            </div>
            <p className="text-sm md:text-base text-slate-600 font-medium max-w-md leading-relaxed">
              Pantau evolusi skor kesehatan finansial Anda. Data ini diambil dari hasil diagnosa Financial Checkup.
            </p>
          </div>

          {/* Stats Widget */}
          <div className="hidden md:flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-700 delay-100">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Pemeriksaan</p>
              <p className="text-lg font-bold text-slate-800">
                {loading ? "..." : historyData.length} Kali
              </p>
            </div>
          </div>
        </div>

        {/* === TOOLBAR === */}
        <div className="flex gap-3 mb-6 animate-in slide-in-from-bottom-2 duration-500">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari tanggal pemeriksaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* === LIST CONTENT === */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Mengambil rekam medis finansial...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredData.map((item, index) => (
              <HistoryCard
                key={item.id}
                item={item}
                index={index}
                onDetail={() => handleViewDetail(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-500">Belum ada riwayat checkup</p>
            <Button variant="link" className="text-blue-600 mt-2" onClick={() => window.location.href = '/finance/checkup'}>
              Lakukan Checkup Sekarang
            </Button>
          </div>
        )}
      </div>

      {/* === MODAL POP-UP DETAIL === */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 transform transition-all">

            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Detail Hasil Analisa</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <HistoryIcon className="w-3 h-3" />
                  {isDetailLoading ? "Memuat data..." : formatDate(selectedCheckup?.generatedAt || "")}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowModal(false)} className="rounded-full hover:bg-slate-200">
                <X className="w-5 h-5 text-slate-500" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar">
              {isDetailLoading ? (
                <div className="h-60 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  <p className="text-sm text-slate-500">Sedang mengambil rincian...</p>
                </div>
              ) : selectedCheckup ? (
                <div className="space-y-6">
                  {/* Score & Status Banner */}
                  <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-linear-to-br from-blue-50 to-white rounded-2xl border border-blue-100 shadow-sm">
                    <div className="mb-4 sm:mb-0 text-center sm:text-left">
                      <p className="text-sm text-blue-600 font-semibold mb-1 uppercase tracking-wider">Skor Kesehatan</p>
                      <div className="flex items-baseline justify-center sm:justify-start gap-2">
                        <span className={cn(
                          "text-5xl font-black",
                          selectedCheckup.score >= 80 ? "text-green-600" :
                            selectedCheckup.score >= 60 ? "text-yellow-600" : "text-red-600"
                        )}>{selectedCheckup.score}</span>
                        <span className="text-sm text-slate-400 font-bold">/ 100</span>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-base px-6 py-2 h-auto rounded-xl shadow-sm bg-white border",
                        selectedCheckup.globalStatus === "SEHAT"
                          ? "text-green-600 border-green-300"
                          : selectedCheckup.globalStatus === "WASPADA"
                            ? "text-yellow-600 border-yellow-300"
                            : "text-red-600 border-red-300"
                      )}
                    >
                      {selectedCheckup.globalStatus}
                    </Badge>

                  </div>

                  {/* Ringkasan Keuangan */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-slate-500 font-semibold">Kekayaan Bersih</p>
                      </div>
                      <p className="font-bold text-slate-800 text-lg">{formatMoney(selectedCheckup.netWorth)}</p>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-slate-500 font-semibold">Surplus Bulanan</p>
                      </div>
                      <p className={cn(
                        "font-bold text-lg",
                        selectedCheckup.surplusDeficit >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {formatMoney(selectedCheckup.surplusDeficit)}
                      </p>
                    </div>
                  </div>

                  {/* Rincian Indikator (Ratios) */}
                  <div>
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Diagnosa Indikator
                    </h4>
                    <div className="space-y-3">
                      {selectedCheckup.ratios?.map((ratio: any, idx: number) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-slate-100 bg-white rounded-xl hover:border-blue-200 transition-colors">
                          <div className="mb-2 sm:mb-0">
                            <span className="text-slate-700 font-medium text-sm block">{ratio.label}</span>
                            <span className="text-[10px] text-slate-400">{ratio.recommendation}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800 text-sm bg-slate-100 px-2 py-1 rounded-md">
                              {typeof ratio.value === 'number' ? ratio.value.toFixed(1) + '%' : ratio.value}
                            </span>
                            <div className={cn(
                              "w-3 h-3 rounded-full shadow-sm ring-2 ring-white",
                              ratio.grade === "EXCELLENT" || ratio.grade === "GOOD" ? "bg-green-500" :
                                ratio.grade === "WARNING" ? "bg-yellow-500" : "bg-red-500"
                            )} title={ratio.grade} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-500">Data detail tidak tersedia.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Tutup</Button>
              {selectedCheckup && (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Cetak Laporan
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- KOMPONEN KARTU ---
function HistoryCard({ item, index, onDetail }: { item: any, index: number, onDetail: () => void }) {
  const statusColor =
    item.status === "SEHAT" ? "bg-green-500" :
      item.status === "WASPADA" ? "bg-yellow-500" : "bg-red-500";

  const badgeStyle =
    item.status === "SEHAT" ? "bg-green-100 text-green-700 hover:bg-green-200" :
      item.status === "WASPADA" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" :
        "bg-red-100 text-red-700 hover:bg-red-200";

  return (
    <div
      className="animate-in slide-in-from-bottom-4 duration-700 fade-in fill-mode-backwards"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 bg-white hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1">
        {/* Strip Status */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2", statusColor)}></div>

        <div className="pl-5 pr-4 py-5 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                {formatDate(item.checkDate)}
              </span>
              <Badge className={cn("border-0 font-bold tracking-wide", badgeStyle)}>
                {item.status}
              </Badge>
            </div>

            <div className="flex items-end gap-3 mb-4">
              <span className={cn(
                "text-5xl font-black tracking-tighter leading-none",
                item.status === "SEHAT" ? "text-green-600" :
                  item.status === "WASPADA" ? "text-yellow-600" : "text-red-600"
              )}>
                {item.healthScore}
              </span>
              <span className="text-xs text-slate-400 font-bold mb-1.5 uppercase">Skor Kesehatan</span>
            </div>

            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg mb-2">
              <Wallet className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-500 font-medium leading-none">Net Worth</p>
                <p className="text-sm font-bold text-slate-700 leading-tight">
                  {formatMoney(Number(item.totalNetWorth))}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-2">
            <span className="text-[10px] text-slate-300 font-mono">#{item.id.slice(0, 8)}</span>
            <Button
              size="sm"
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-0 text-xs font-bold h-8"
              onClick={onDetail}
            >
              Lihat Detail
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}