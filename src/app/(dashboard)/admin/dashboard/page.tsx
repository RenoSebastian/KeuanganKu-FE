"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Settings,
    ShieldCheck,
    CreditCard,
    Users,
    Activity,
    Bell,
    TrendingUp,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Import Service & Types
import { adminService } from "@/services/admin.service";
import { DashboardMetricsResponse, CashflowLedgerResponse } from "@/lib/types/dashboard";

// Import Components
import { DashboardKpiCards } from "@/components/features/admin/dashboard/kpi-cards";
import { FeatureUsageChart } from "@/components/features/admin/dashboard/feature-usage-chart";
import { CashflowLedgerTable } from "@/components/features/admin/dashboard/cashflow-ledger-table";
import { DashboardSkeleton } from "@/components/features/admin/dashboard/dashboard-skeleton";
import { PendingApprovalsWidget } from "@/components/features/admin/dashboard/pending-approvals-widget";

export default function AdminDashboardPage() {
    const router = useRouter();

    // State Management
    const [loadingMetrics, setLoadingMetrics] = useState(true);
    const [loadingLedger, setLoadingLedger] = useState(true);
    const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
    const [ledger, setLedger] = useState<CashflowLedgerResponse | null>(null);

    // Paginasi State untuk Ledger
    const [currentPage, setCurrentPage] = useState(1);
    const limitPerPage = 5;

    // Pull-to-Refresh State
    const [touchStart, setTouchStart] = useState(0);
    const [touchMove, setTouchMove] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // --- LOGIKA RE-FETCH (Data Invalidation) ---
    // Menggunakan useCallback agar fungsi tetap stabil saat di-pass ke child component
    const fetchMetrics = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoadingMetrics(true);
            const data = await adminService.getDashboardMetrics();
            setMetrics(data);
        } catch (error) {
            toast.error("Gagal memuat metrik dashboard");
        } finally {
            setLoadingMetrics(false);
        }
    }, []);

    const fetchLedger = useCallback(async (page: number, isSilent = false) => {
        try {
            if (!isSilent) setLoadingLedger(true);
            const data = await adminService.getCashflowLedger(page, limitPerPage);
            setLedger(data);
        } catch (error) {
            toast.error("Gagal memuat buku besar arus kas");
        } finally {
            setLoadingLedger(false);
        }
    }, []);

    // Initial Load & Page Change Load
    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    useEffect(() => {
        fetchLedger(currentPage);
    }, [currentPage, fetchLedger]);

    // Handler yang dipanggil saat ada transaksi disetujui/ditolak di widget
    const handleActionCompleted = () => {
        // Melakukan fetch ulang secara diam-diam (tanpa memicu skeleton loading total)
        // agar transisi angka terasa mulus bagi admin.
        fetchMetrics(true);
        fetchLedger(1, true); // Kembali ke halaman 1 untuk melihat transaksi terbaru
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    // --- PULL TO REFRESH LOGIC ---
    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) setTouchStart(e.touches[0].clientY);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStart > 0) setTouchMove(e.touches[0].clientY);
    };
    const handleTouchEnd = () => {
        const pullDist = touchMove - touchStart;
        if (touchStart > 0 && pullDist > 100) {
            setIsRefreshing(true);
            Promise.all([fetchMetrics(), fetchLedger(1)]).finally(() => {
                setIsRefreshing(false);
                toast.success("Dashboard diperbarui");
            });
        }
        setTouchStart(0);
        setTouchMove(0);
    };

    return (
        <div 
            className="min-h-screen bg-slate-50/50 pb-24 md:pb-12"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull to Refresh Indicator */}
            {touchStart > 0 && touchMove - touchStart > 0 && (
                <div 
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center bg-white shadow-xl rounded-full w-10 h-10 transition-transform"
                    style={{ transform: `translateX(-50%) translateY(${Math.min((touchMove - touchStart) * 0.5, 60)}px) rotate(${(touchMove - touchStart)}deg)` }}
                >
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                </div>
            )}
            {isRefreshing && (
                <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center bg-white shadow-xl rounded-full w-10 h-10 animate-bounce">
                    <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
            )}

            {/* --- HERO SECTION (The Central Bank Vibe) --- */}
            <div className="relative bg-slate-900 pt-8 pb-20 md:pt-12 md:pb-32 overflow-hidden rounded-b-[2.5rem] md:rounded-b-[3.5rem] shadow-xl">
                {/* Abstract Tech Patterns */}
                <div className="absolute top-0 right-0 w-125 h-125 bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-75 h-75 bg-emerald-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
                <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10 mix-blend-overlay"></div>

                <div className="relative z-10 px-6 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-200 border-blue-500/20 backdrop-blur-md">
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    Admin Operator
                                </Badge>
                                <span className="text-slate-400 text-xs font-medium">
                                    {metrics?.lastUpdatedAt ? `Last Synced: ${new Date(metrics.lastUpdatedAt).toLocaleTimeString('id-ID')}` : 'Syncing...'}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                                Revenue Command Center
                            </h1>
                            <p className="text-slate-400 text-sm md:text-base mt-1 max-w-md">
                                Pantau performa bisnis, utilitas sistem, dan riwayat transaksi secara real-time.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 rounded-full">
                                <Bell className="w-5 h-5" />
                            </Button>
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-3">
                                <div className={cn("w-2 h-2 rounded-full", loadingMetrics ? "bg-amber-500" : "bg-emerald-500 animate-pulse")} />
                                <span className="text-xs font-medium text-white">
                                    {loadingMetrics ? "Fetching Data..." : "System Active"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT (Overlap Hero) --- */}
            <div className="px-5 max-w-7xl mx-auto -mt-16 md:-mt-24 relative z-20 space-y-6">

                {loadingMetrics || !metrics ? (
                    <DashboardSkeleton />
                ) : (
                    <>
                        {/* 1. KPI CARDS ROW */}
                        <DashboardKpiCards revenue={metrics.revenue} users={metrics.users} />

                        {/* 2. OPERATIONAL GRID & CHARTS */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                            {/* LEFT: Quick Actions & Chart */}
                            <div className="lg:col-span-2 space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-slate-500" />
                                    Operational Controls
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <ActionCard
                                        icon={TrendingUp}
                                        label="Parameter"
                                        desc="Atur Inflasi & Bunga"
                                        onClick={() => router.push('/admin/settings')}
                                        color="blue"
                                    />
                                    <ActionCard
                                        icon={CreditCard}
                                        label="Verifikasi"
                                        desc="Cek Bukti Bayar"
                                        onClick={() => router.push('/admin/verification')}
                                        color="emerald"
                                        badge={metrics.revenue.pendingValue > 0 ? "!" : null}
                                    />
                                    <ActionCard
                                        icon={Users}
                                        label="User Data"
                                        desc="Edit Quota / Akses"
                                        onClick={() => router.push('/admin/users')}
                                        color="slate"
                                    />
                                    <ActionCard
                                        icon={Activity}
                                        label="System Logs"
                                        desc="Audit Trail & Error"
                                        onClick={() => router.push('/admin/maintenance')}
                                        color="amber"
                                    />
                                </div>

                                <FeatureUsageChart data={metrics.systemUsage.featureDistribution} />
                            </div>

                            {/* RIGHT: Quick Action Center (Widget Baru) */}
                            <div className="space-y-6">
                                {/* Integrasi Widget dengan Callback Invalidation */}
                                <PendingApprovalsWidget onActionComplete={handleActionCompleted} />

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                                        <Activity className="w-4 h-4 text-blue-500" />
                                        Metrik Utilitas
                                    </h3>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Konversi (Free to Pro)</p>
                                            <div className="flex items-end gap-2">
                                                <span className="text-2xl font-black text-slate-800">{metrics.users.conversionRate}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${Math.min(metrics.users.conversionRate, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-50">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Rata-rata Konsumsi Kuota</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-bold text-slate-800">{metrics.systemUsage.averageFreeQuotaConsumption}</span>
                                                <span className="text-[10px] font-medium text-slate-400">Token/User</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. CASHFLOW LEDGER ROW */}
                        <div className="pt-4">
                            {ledger && (
                                <CashflowLedgerTable
                                    data={ledger.data}
                                    meta={ledger.meta}
                                    isLoading={loadingLedger}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// --- REUSABLE SUB-COMPONENTS ---

function ActionCard({ icon: Icon, label, desc, onClick, color, badge }: any) {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
        slate: "bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white",
        amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
    };

    return (
        <button
            onClick={onClick}
            className="group flex flex-col items-start p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative"
        >
            {badge && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                    {badge}
                </span>
            )}
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300", colorMap[color as keyof typeof colorMap])}>
                <Icon className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors text-left w-full">
                {label}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium text-left line-clamp-1">
                {desc}
            </p>
        </button>
    );
}