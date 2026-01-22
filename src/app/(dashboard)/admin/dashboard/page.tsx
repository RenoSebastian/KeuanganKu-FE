"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { 
  Users, Building, Activity, Settings, 
  Plus, FileText, ShieldAlert, ArrowUpRight,
  Server, CheckCircle2, AlertTriangle, LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDashboardStats } from "@/lib/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi Fetch Data (Mock)
    const fetchStats = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setStats({
        totalUsers: 145,
        activeUsers: 140,
        inactiveUsers: 5,
        totalUnits: 12,
        systemHealth: "Normal"
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-full w-full pb-24 md:pb-12">
      
      {/* --- HEADER BACKGROUND (PAM Brand Identity) --- */}
      {/* Menggunakan brand-900 (Deep Blue) agar berbeda secara hierarki dari User Dashboard */}
      <div className="h-56 md:h-72 w-full absolute top-0 left-0 bg-brand-900 shadow-2xl z-0 overflow-hidden">
         {/* Decorative Ambient Blobs - Nuansa Biru Laut Dalam */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />
         
         {/* Pattern Overlay Halus */}
         <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-5 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 pt-8 md:pt-12">
        
        {/* --- HEADER TITLE --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 text-white">
           <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                 <ShieldAlert className="w-4 h-4 text-emerald-400" />
                 <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-50">Admin Console</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-sm">
                System Overview
              </h1>
              <p className="text-brand-100 text-sm md:text-base max-w-xl leading-relaxed">
                Pusat kendali ekosistem KeuanganKu PAM JAYA. Pantau metrik vital, kelola akses pengguna, dan konfigurasi sistem.
              </p>
           </div>
           
           {/* Server Status Widget (Glass Style) */}
           <div className="mt-6 md:mt-0 glass-panel bg-white/5 border-white/10 p-3 rounded-2xl flex items-center gap-4">
              <div className="relative">
                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse absolute inset-0 m-auto" />
                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute inset-0 m-auto opacity-75" />
              </div>
              <div>
                <p className="text-[10px] text-brand-200 uppercase font-bold tracking-wider">Server Status</p>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                   {stats?.systemHealth || "Checking..."}
                </p>
              </div>
           </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            
            {/* CARD 1: USER STATS (Brand Theme) */}
            <div className="card-clean p-6 relative overflow-hidden group border-t-4 border-t-brand-500">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                    <Users className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-brand-50 rounded-xl text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pengguna</h3>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-3">
                        <h2 className="text-5xl font-black text-slate-800 tracking-tight">
                            {loading ? "-" : stats?.totalUsers}
                        </h2>
                        <span className="text-sm text-slate-500 font-medium">Akun Terdaftar</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex mb-2">
                        <div 
                            className="bg-brand-500 h-full rounded-full" 
                            style={{ width: `${stats ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%` }} 
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-brand-600">{stats?.activeUsers} Aktif</span>
                        <span className="text-slate-400">{stats?.inactiveUsers} Inactive</span>
                    </div>
                </div>
            </div>

            {/* CARD 2: ORGANIZATION (Cyan Brand Secondary) */}
            {/* Menggunakan Cyan agar tetap "Biru" tapi berbeda dari User Card */}
            <div className="card-clean p-6 relative overflow-hidden group border-t-4 border-t-cyan-500">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                    <Building className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                            <Building className="w-6 h-6" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unit Kerja</h3>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-3">
                        <h2 className="text-5xl font-black text-slate-800 tracking-tight">
                            {loading ? "-" : stats?.totalUnits}
                        </h2>
                        <span className="text-sm text-slate-500 font-medium">Divisi / Bidang</span>
                    </div>
                    
                    <p className="text-xs text-slate-500 leading-relaxed mt-4">
                        Mencakup Sekretariat, Bidang Operasional, Keuangan, dan unit teknis lainnya.
                    </p>
                </div>
            </div>

            {/* CARD 3: HEALTH (Emerald Theme) */}
            <div className="card-clean p-6 relative overflow-hidden group border-t-4 border-t-emerald-500">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                    <Activity className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Server className="w-6 h-6" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Health</h3>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                        {stats?.systemHealth === "Normal" ? (
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        ) : (
                            <AlertTriangle className="w-10 h-10 text-amber-500" />
                        )}
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                {loading ? "Checking..." : stats?.systemHealth}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Operational Status</p>
                        </div>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                         <span className="text-xs text-slate-500 font-medium">Latency</span>
                         <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">45ms</span>
                    </div>
                </div>
            </div>
        </div>

        {/* --- QUICK ACTIONS --- */}
        <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-brand-600" />
                Akses Cepat Administrator
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickActionCard 
                   icon={Plus}
                   title="Tambah User Baru"
                   subtitle="Registrasi karyawan baru"
                   onClick={() => handleNavigate('/admin/users/create')}
                   color="blue"
                />
                <QuickActionCard 
                   icon={FileText}
                   title="System Logs"
                   subtitle="Cek error & aktivitas"
                   onClick={() => handleNavigate('/admin/logs')}
                   color="amber"
                />
                <QuickActionCard 
                   icon={Settings}
                   title="Global Settings"
                   subtitle="Parameter aplikasi"
                   onClick={() => handleNavigate('/admin/settings')}
                   color="slate"
                />
            </div>
        </div>

      </div>
    </div>
  );
}

// Component Helper untuk Quick Actions
function QuickActionCard({ icon: Icon, title, subtitle, onClick, color }: any) {
    const colorStyles: any = {
        // Menggunakan palette Brand dan Amber (Warning)
        blue: "bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white border-brand-200",
        amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white border-amber-200",
        slate: "bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white border-slate-200"
    };

    return (
        <button 
            onClick={onClick}
            className="group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-left"
        >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300", colorStyles[color])}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{title}</h4>
                <p className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors">{subtitle}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-slate-400 transition-colors" />
        </button>
    )
}