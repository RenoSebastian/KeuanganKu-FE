"use client";

import { useState, useEffect } from "react";
import {
  Save, Percent, Building,
  CheckCircle2, RefreshCcw,
  Sliders, ShieldAlert, MonitorCog
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/axios";

// Mendefinisikan tipe berdasarkan DTO Backend
interface MasterSettings {
  inflationRate: number;
  interestRate: number;
  companyName: string;
  maintenanceMode: boolean;
}

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // State Konfigurasi
  const [settings, setSettings] = useState<MasterSettings>({
    inflationRate: 5.5,
    interestRate: 6.0,
    companyName: "MAXIPRO",
    maintenanceMode: false
  });

  // Ambil data konfigurasi saat halaman dimuat
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/admin/master-data/settings');
        if (response.data) {
          setSettings(prev => ({
            ...prev,
            inflationRate: Number(response.data.inflationRate) || prev.inflationRate,
            interestRate: Number(response.data.interestRate) || prev.interestRate,
            // Jika backend mendukung field ini nanti, bisa di-mapping langsung
            // companyName: response.data.companyName || prev.companyName,
            // maintenanceMode: response.data.maintenanceMode || prev.maintenanceMode,
          }));
        }
      } catch (error) {
        toast.error("Gagal memuat pengaturan sistem dari server.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setIsSaved(false);

    try {
      // Menembak endpoint PATCH yang telah kita buat di Phase 3
      await api.patch('/admin/master-data/settings', {
        inflationRate: settings.inflationRate,
        interestRate: settings.interestRate,
      });

      toast.success("Pengaturan ekonomi global berhasil diperbarui.");
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan saat menyimpan pengaturan.");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">

      {/* --- HEADER --- */}
      <div className="bg-slate-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-[0.05] mix-blend-overlay"></div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 mb-3">
              <Sliders className="w-4 h-4 text-emerald-300" />
              <span className="text-[10px] font-bold text-emerald-100 tracking-widest uppercase">System Control</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Konfigurasi Sistem
            </h1>
            <p className="text-blue-100 text-sm mt-1 opacity-90 max-w-lg">
              Atur parameter global untuk kalkulator finansial dan operasional aplikasi secara terpusat.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading}
            className={cn(
              "font-bold shadow-xl transition-all h-12 px-6 rounded-xl",
              isSaved
                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent"
                : "bg-white text-slate-800 hover:bg-slate-50 border-0"
            )}
          >
            {loading ? (
              <>
                <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Berhasil Disimpan!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-5 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CARD 1: PARAMETER KEUANGAN DEFAULT */}
          <Card className="p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-slate-200 bg-white/95 backdrop-blur-xl md:col-span-2">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Parameter Ekonomi Global</h3>
                <p className="text-sm text-slate-500">Angka acuan dasar untuk seluruh kalkulator simulasi pengguna.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* INFLASI */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="font-bold text-slate-700">Asumsi Inflasi Tahunan</Label>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">System Wide</span>
                </div>

                <div className="relative group">
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.inflationRate}
                    onChange={(e) => setSettings({ ...settings, inflationRate: parseFloat(e.target.value) })}
                    className="pl-4 pr-12 h-12 text-lg font-bold bg-white border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 rounded-xl transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-500 transition-colors">%</div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Digunakan sebagai tingkat kenaikan harga barang di masa depan (FV). <br />
                  <span className="text-blue-500 font-bold">Saran: Gunakan rata-rata inflasi nasional (4% - 6%).</span>
                </p>
              </div>

              {/* INVESTASI */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="font-bold text-slate-700">Asumsi Return Investasi (IHSG/SBN)</Label>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">System Wide</span>
                </div>

                <div className="relative group">
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.interestRate}
                    onChange={(e) => setSettings({ ...settings, interestRate: parseFloat(e.target.value) })}
                    className="pl-4 pr-12 h-12 text-lg font-bold bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 rounded-xl transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-emerald-500 transition-colors">%</div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Digunakan untuk menghitung pertumbuhan aset tabungan (PMT). <br />
                  <span className="text-emerald-600 font-bold">Saran: Gunakan asumsi moderat (5% - 8%).</span>
                </p>
              </div>
            </div>
          </Card>

          {/* CARD 2: PENGATURAN APLIKASI */}
          <Card className="p-6 rounded-[1.5rem] shadow-sm border-slate-200 bg-white h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Building className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Identitas Aplikasi</h3>
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-slate-700">Nama Perusahaan / Header</Label>
                <Input
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="h-11 font-bold text-slate-800 border-slate-200 focus:border-blue-500 rounded-xl"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Akan muncul pada Header PDF Laporan dan Halaman Login.
                </p>
              </div>
            </div>
          </Card>

          {/* CARD 3: MAINTENANCE MODE */}
          <Card className={cn(
            "p-6 rounded-[1.5rem] shadow-sm border h-full transition-all duration-300 flex flex-col justify-between overflow-hidden relative",
            settings.maintenanceMode ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
          )}>
            {settings.maintenanceMode && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            )}

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    settings.maintenanceMode ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600"
                  )}>
                    <MonitorCog className="w-5 h-5" />
                  </div>
                  <h3 className={cn("font-bold text-lg", settings.maintenanceMode ? "text-amber-900" : "text-slate-800")}>
                    Maintenance Mode
                  </h3>
                </div>

                <button
                  onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                  className={cn(
                    "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                    settings.maintenanceMode ? "bg-amber-500 focus:ring-amber-500" : "bg-slate-200 focus:ring-slate-400 hover:bg-slate-300"
                  )}
                >
                  <span className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                    settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              <div className="space-y-3">
                <p className={cn("text-sm leading-relaxed", settings.maintenanceMode ? "text-amber-800" : "text-slate-500")}>
                  {settings.maintenanceMode
                    ? "Sistem sedang dalam mode perbaikan. Pengguna umum tidak dapat mengakses kalkulator untuk sementara waktu."
                    : "Sistem berjalan normal. Semua pengguna dapat mengakses aplikasi tanpa hambatan."}
                </p>

                {settings.maintenanceMode && (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-white/50 border border-amber-200 p-3 rounded-xl mt-2 backdrop-blur-sm">
                    <ShieldAlert className="w-4 h-4" />
                    Akses Publik Ditutup Sementara
                  </div>
                )}
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}