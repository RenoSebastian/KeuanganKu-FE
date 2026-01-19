"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, Building, Activity, Settings, 
  Plus, FileText, ShieldAlert, ArrowUpRight,
  Server, CheckCircle2, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDashboardStats } from "@/lib/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulasi Fetch Data (Nanti diganti API Call)
  useEffect(() => {
    const fetchStats = async () => {
      // Simulasi delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">
      
      {/* --- HEADER BACKGROUND --- */}
      <div className="h-48 md:h-64 w-full absolute top-0 left-0 bg-slate-900 rounded-b-[2.5rem] shadow-xl z-0 overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 pt-8 md:pt-16">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 text-white">
           <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 mb-3">
                 <ShieldAlert className="w-4 h-4 text-emerald-400" />
                 <span className="text-xs font-bold tracking-wider uppercase text-emerald-50">Admin Console</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">System Overview</h1>
              <p className="text-slate-300 text-sm md:text-base max-w-lg">
                Pantau kesehatan sistem, kelola pengguna, dan konfigurasi aplikasi PAM JAYA.
              </p>
           </div>
           
           <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white/5 p-2 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-200">
                Server Status: <span className="text-emerald-400 font-bold">{stats?.systemHealth || "Checking..."}</span>
              </span>
           </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            
            {/* CARD 1: USER STATS */}
            <Card className="p-6 rounded-2xl shadow-lg border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users className="w-24 h-24 text-blue-600" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total User</h3>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <h2 className="text-4xl font-black text-slate-800">
                            {loading ? "..." : stats?.totalUsers}
                        </h2>
                        <span className="text-sm text-slate-400 font-medium">Akun</span>
                    </div>
                    
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                        <div 
                            className="bg-blue-500 h-full" 
                            style={{ width: `${stats ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%` }} 
                        />
                        <div className="bg-slate-300 h-full flex-1" />
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-bold">
                        <span className="text-blue-600">{stats?.activeUsers} Aktif</span>
                        <span className="text-slate-400">{stats?.inactiveUsers} Non-Aktif</span>
                    </div>
                </div>
            </Card>

            {/* CARD 2: ORG STATS */}
            <Card className="p-6 rounded-2xl shadow-lg border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Building className="w-24 h-24 text-violet-600" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
                            <Building className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Struktur Organisasi</h3>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <h2 className="text-4xl font-black text-slate-800">
                            {loading ? "..." : stats?.totalUnits}
                        </h2>
                        <span className="text-sm text-slate-400 font-medium">Unit Kerja</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                        Unit kerja terdaftar meliputi Sekretariat, Bidang, dan Sub-Bidang yang aktif dalam sistem.
                    </p>
                </div>
            </Card>

            {/* CARD 3: SYSTEM HEALTH */}
            <Card className="p-6 rounded-2xl shadow-lg border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-24 h-24 text-emerald-600" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <Server className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">System Health</h3>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                        {stats?.systemHealth === "Normal" ? (
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        ) : (
                            <AlertTriangle className="w-8 h-8 text-amber-500" />
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {loading ? "Checking..." : stats?.systemHealth}
                            </h2>
                            <p className="text-xs text-slate-400">Database & API Services</p>
                        </div>
                    </div>

                    <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-medium">Response Time</span>
                            <span className="text-emerald-600 font-bold">~45ms</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>

        {/* --- QUICK ACTIONS SECTION --- */}
        <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                ⚡ Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <button 
                    onClick={() => handleNavigate('/admin/users/create')}
                    className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-700 group-hover:text-blue-700">Tambah User Baru</h4>
                        <p className="text-xs text-slate-500">Daftarkan karyawan ke sistem</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-blue-500" />
                </button>

                <button 
                    onClick={() => handleNavigate('/admin/logs')}
                    className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-md transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-700 group-hover:text-amber-700">Lihat Error Log</h4>
                        <p className="text-xs text-slate-500">Monitoring masalah sistem</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-amber-500" />
                </button>

                <button 
                    onClick={() => handleNavigate('/admin/settings')}
                    className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                        <Settings className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-700 group-hover:text-slate-900">Konfigurasi Sistem</h4>
                        <p className="text-xs text-slate-500">Atur parameter global app</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-slate-600" />
                </button>

            </div>
        </div>

      </div>
    </div>
  );
}