"use client";

import { useState } from "react";
import { 
  Save, Settings, Percent, Building, 
  Power, AlertTriangle, CheckCircle2, RefreshCcw 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SystemSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // MOCK DATA: Konfigurasi saat ini
  const [settings, setSettings] = useState<SystemSettings>({
    defaultInflationRate: 5.5, // %
    defaultInvestmentRate: 6.0, // %
    companyName: "PAM JAYA",
    maintenanceMode: false
  });

  const handleSave = async () => {
    setLoading(true);
    setIsSaved(false);

    // Simulasi API Call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setIsSaved(true);
    
    // Hilangkan notif sukses setelah 3 detik
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">
      {/* Header Decoration */}
      <div className="h-48 w-full bg-slate-900 absolute top-0 left-0 z-0" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 md:pt-12">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 text-white">
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-80">
                <Settings className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">System Control</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Konfigurasi Sistem</h1>
            <p className="text-slate-300 text-sm">Atur parameter global untuk kalkulator dan operasional aplikasi.</p>
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={loading}
            className={cn(
                "font-bold shadow-lg transition-all",
                isSaved 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/20" 
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20"
            )}
          >
            {loading ? (
                <>
                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                </>
            ) : isSaved ? (
                <>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Tersimpan!
                </>
            ) : (
                <>
                    <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
                </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 1: PARAMETER KEUANGAN DEFAULT */}
            <Card className="p-6 md:p-8 rounded-2xl shadow-lg border-slate-200 bg-white md:col-span-2">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Percent className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Parameter Ekonomi Default</h3>
                        <p className="text-sm text-slate-500">Angka acuan dasar untuk seluruh simulasi user baru.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* INFLASI */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-600 flex justify-between">
                            Asumsi Inflasi Tahunan
                            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Default: 5.5%</span>
                        </label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                value={settings.defaultInflationRate}
                                onChange={(e) => setSettings({...settings, defaultInflationRate: parseFloat(e.target.value)})}
                                className="pl-4 pr-12 h-12 text-lg font-bold border-slate-200 focus:border-red-400 focus:ring-red-400/20"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Digunakan sebagai tingkat kenaikan harga barang di masa depan (FV). <br/>
                            <span className="text-red-500 font-medium">Saran: Gunakan rata-rata inflasi nasional (4% - 6%).</span>
                        </p>
                    </div>

                    {/* INVESTASI */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-600 flex justify-between">
                            Asumsi Return Investasi
                            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Default: 6.0%</span>
                        </label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                value={settings.defaultInvestmentRate}
                                onChange={(e) => setSettings({...settings, defaultInvestmentRate: parseFloat(e.target.value)})}
                                className="pl-4 pr-12 h-12 text-lg font-bold border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Digunakan untuk menghitung pertumbuhan aset tabungan (PMT). <br/>
                            <span className="text-emerald-600 font-medium">Saran: Gunakan asumsi moderat (5% - 8%).</span>
                        </p>
                    </div>
                </div>
            </Card>

            {/* CARD 2: PENGATURAN APLIKASI */}
            <Card className="p-6 rounded-2xl shadow-md border-slate-200 bg-white h-full">
                <div className="flex items-center gap-3 mb-4">
                    <Building className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold text-slate-700">Identitas Aplikasi</h3>
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Perusahaan / Header</label>
                    <Input 
                        value={settings.companyName}
                        onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                        className="font-bold text-slate-800"
                    />
                    <p className="text-xs text-slate-400">
                        Akan muncul pada Header PDF Laporan dan Halaman Login.
                    </p>
                </div>
            </Card>

            {/* CARD 3: MAINTENANCE MODE */}
            <Card className={cn(
                "p-6 rounded-2xl shadow-md border h-full transition-all duration-300",
                settings.maintenanceMode ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
            )}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <Power className={cn("w-5 h-5", settings.maintenanceMode ? "text-amber-600" : "text-slate-400")} />
                        <h3 className={cn("font-bold", settings.maintenanceMode ? "text-amber-800" : "text-slate-700")}>
                            Maintenance Mode
                        </h3>
                    </div>
                    
                    {/* CUSTOM SWITCH TOGGLE */}
                    <button 
                        onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                        className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                            settings.maintenanceMode ? "bg-amber-500 focus:ring-amber-500" : "bg-slate-200 focus:ring-slate-400"
                        )}
                    >
                        <span className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
                        )}/>
                    </button>
                </div>
                
                <div className="space-y-2">
                    <p className={cn("text-sm", settings.maintenanceMode ? "text-amber-700" : "text-slate-500")}>
                        {settings.maintenanceMode 
                            ? "Sistem sedang dalam mode perbaikan. User (kecuali Admin) tidak dapat login." 
                            : "Sistem berjalan normal. Semua user dapat mengakses aplikasi."}
                    </p>
                    
                    {settings.maintenanceMode && (
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-100 p-2 rounded-lg mt-2">
                            <AlertTriangle className="w-4 h-4" />
                            Akses Karyawan Ditutup Sementara
                        </div>
                    )}
                </div>
            </Card>

        </div>
      </div>
    </div>
  );
}