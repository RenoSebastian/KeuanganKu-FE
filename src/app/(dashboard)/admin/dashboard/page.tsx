// File: src/app/(dashboard)/admin/dashboard/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Settings, ShieldCheck, CreditCard, Users, Activity, Bell,
    TrendingUp, RefreshCw, Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Import Service, Types, & Providers
import { adminService } from "@/services/admin.service";
import { DashboardMetricsResponse, CashflowLedgerResponse } from "@/lib/types/dashboard";
import { useSocket } from "@/providers/socket-provider";

// Import Components
import { DashboardKpiCards } from "@/components/features/admin/dashboard/kpi-cards";
import { FeatureUsageChart } from "@/components/features/admin/dashboard/feature-usage-chart";
import { CashflowLedgerTable } from "@/components/features/admin/dashboard/cashflow-ledger-table";
import { DashboardSkeleton } from "@/components/features/admin/dashboard/dashboard-skeleton";
import { PendingApprovalsWidget } from "@/components/features/admin/dashboard/pending-approvals-widget";
import { UserAnalyticsChart } from "@/components/features/admin/dashboard/user-analytics-chart"; // [NEW] Task 4 Chart

interface AuditLogEvent {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

// --- Framer Motion Variants ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 24
        }
    }
};

export default function AdminDashboardPage() {
    const router = useRouter();
    const { socket, isConnected } = useSocket();

    // State Management
    const [loadingMetrics, setLoadingMetrics] = useState(true);
    const [loadingLedger, setLoadingLedger] = useState(true);
    const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
    const [ledger, setLedger] = useState<CashflowLedgerResponse | null>(null);
    const [liveActivities, setLiveActivities] = useState<AuditLogEvent[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const limitPerPage = 5;

    // Pull-to-Refresh State
    const [touchStart, setTouchStart] = useState(0);
    const [touchMove, setTouchMove] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // --- LOGIKA RE-FETCH ---
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

    useEffect(() => { fetchMetrics(); }, [fetchMetrics]);
    useEffect(() => { fetchLedger(currentPage); }, [currentPage, fetchLedger]);

    useEffect(() => {
        if (!socket) return;
        socket.on("admin_activity_stream", (newEvent: AuditLogEvent) => {
            setLiveActivities((prev) => [newEvent, ...prev].slice(0, 20));
        });
        return () => { socket.off("admin_activity_stream"); };
    }, [socket]);

    const handleActionCompleted = () => {
        fetchMetrics(true);
        fetchLedger(1, true);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => setCurrentPage(newPage);

    // --- PULL TO REFRESH LOGIC ---
    const handleTouchStart = (e: React.TouchEvent) => { if (window.scrollY === 0) setTouchStart(e.touches[0].clientY); };
    const handleTouchMove = (e: React.TouchEvent) => { if (touchStart > 0) setTouchMove(e.touches[0].clientY); };
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

    const handleLogClick = (log: AuditLogEvent) => {
        if (log.description.includes("subscription")) router.push('/admin/verification');
        if (log.description.includes("parameter")) router.push('/admin/settings');
        if (log.title.includes("User")) router.push(`/admin/users?search=${log.id}`);
    };

    return (
        <div
            className="min-h-dvh bg-[#F8FAFC] relative overflow-hidden pb-24 md:pb-12"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* PULL TO REFRESH INDICATORS */}
            <AnimatePresence>
                {touchStart > 0 && touchMove - touchStart > 0 && !isRefreshing && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: Math.min((touchMove - touchStart) * 0.4, 60) }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-md shadow-xl border border-slate-100 rounded-full w-12 h-12"
                    >
                        <RefreshCw className="w-5 h-5 text-blue-600 opacity-70" style={{ transform: `rotate(${touchMove - touchStart}deg)` }} />
                    </motion.div>
                )}
                {isRefreshing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1, y: 50 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-center bg-white shadow-2xl shadow-blue-900/20 border border-slate-100 rounded-full w-12 h-12"
                    >
                        <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER BACKGROUND UNDERLAY (Immersive 3D Space) */}
            <div className="absolute top-0 left-0 right-0 h-95 md:h-105 bg-slate-900 rounded-b-[3rem] md:rounded-b-[4rem] shadow-2xl shadow-blue-900/10 z-0 overflow-hidden">
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -right-[10%] w-125 h-125 bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" />
                <motion.div animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[30%] -left-[10%] w-100 h-100 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            {/* MAIN CONTENT FLOW */}
            <div className="relative z-10 px-4 sm:px-6 pt-8 md:pt-12 max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">

                {/* 1. HERO HEADER AREA */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-2">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="bg-white/10 text-cyan-50 border-white/20 backdrop-blur-md px-3 py-1 font-black uppercase tracking-widest text-[10px]">
                                <ShieldCheck className="w-3 h-3 mr-1.5 text-cyan-400" />
                                Admin Console
                            </Badge>
                            <span className="text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                                {metrics?.lastUpdatedAt ? `Sync: ${new Date(metrics.lastUpdatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'Syncing...'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-sm">
                            Revenue Command Center
                        </h1>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex-1 md:flex-none bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between md:justify-center gap-3 shadow-lg">
                            <div className="flex items-center gap-2">
                                <div className="relative flex items-center justify-center w-3 h-3">
                                    <div className={cn("w-2.5 h-2.5 rounded-full absolute", isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400")} />
                                    <div className={cn("w-2.5 h-2.5 rounded-full absolute opacity-50", isConnected ? "bg-emerald-400 animate-ping" : "bg-amber-400")} />
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    {isConnected ? "WS Active" : "Connecting..."}
                                </span>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-12 w-12 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-2xl relative shadow-lg active:scale-95 transition-all">
                            <Bell className="w-5 h-5" />
                            {liveActivities.length > 0 && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
                            )}
                        </Button>
                    </motion.div>
                </div>

                {/* 2. DYNAMIC CONTENT AREA */}
                {loadingMetrics || !metrics ? (
                    <DashboardSkeleton />
                ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6 md:gap-8">

                        {/* KPI Metrics */}
                        <motion.div variants={itemVariants}>
                            <DashboardKpiCards revenue={metrics.revenue} users={metrics.users} />
                        </motion.div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                            {/* LEFT COLUMN: Controls & Chart */}
                            <div className="xl:col-span-2 space-y-6">
                                <motion.div variants={itemVariants}>
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                                            <div className="p-1.5 bg-white/20 rounded-lg text-white">
                                                <Settings className="w-4 h-4" />
                                            </div>
                                            Operational Controls
                                        </h3>
                                    </div>

                                    {/* Action Cards Bento Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                                        <ActionCard icon={TrendingUp} label="Parameter" desc="Inflasi & Bunga" onClick={() => router.push('/admin/settings')} color="blue" />
                                        <ActionCard icon={CreditCard} label="Verifikasi" desc="Bukti Bayar" onClick={() => router.push('/admin/verification')} color="emerald" badge={metrics.revenue.pendingValue > 0 ? "!" : null} />
                                        <ActionCard icon={Users} label="Data User" desc="Kelola Akses" onClick={() => router.push('/admin/users')} color="indigo" />
                                        <ActionCard icon={Activity} label="Sys Logs" desc="Audit & Error" onClick={() => router.push('/admin/maintenance/logs')} color="amber" />
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <FeatureUsageChart data={metrics.systemUsage.featureDistribution} />
                                </motion.div>
                            </div>

                            {/* RIGHT COLUMN: Approvals & Live Feed */}
                            <div className="space-y-6">
                                <motion.div variants={itemVariants}>
                                    <PendingApprovalsWidget onActionComplete={handleActionCompleted} />
                                </motion.div>

                                <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-xl rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col overflow-hidden max-h-[450px]">
                                    <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                        <div className="flex flex-col">
                                            <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2 text-sm uppercase">
                                                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                                                Security Audit Trail
                                            </h3>
                                            <span className="text-[10px] text-slate-400 font-bold">MONITORING SYSTEM ACTIVITY</span>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase bg-rose-50 text-rose-600 border-rose-200 shadow-sm">
                                            {isConnected ? 'LIVE' : 'OFFLINE'}
                                        </Badge>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
                                        {liveActivities.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-10 opacity-50">
                                                <Activity className="w-8 h-8 text-slate-200 animate-bounce" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listening for system events...</p>
                                            </div>
                                        ) : (
                                            <AnimatePresence initial={false}>
                                                {liveActivities.map((log) => (
                                                    <motion.div
                                                        key={log.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        onClick={() => handleLogClick(log)}
                                                        className="flex gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all border border-transparent hover:border-slate-100"
                                                    >
                                                        <div className="relative mt-1 flex flex-col items-center">
                                                            <div className={cn(
                                                                "w-3 h-3 rounded-full ring-4 z-10 transition-transform group-hover:scale-125",
                                                                log.type === 'success' ? "bg-emerald-500 ring-emerald-50 shadow-emerald-200" :
                                                                    log.type === 'error' ? "bg-rose-500 ring-rose-50 shadow-rose-200" :
                                                                        log.type === 'warning' ? "bg-amber-500 ring-amber-50 shadow-amber-200" :
                                                                            "bg-blue-500 ring-blue-50 shadow-blue-200"
                                                            )} />
                                                            <div className="w-px h-full bg-slate-100 absolute top-3 -bottom-4 group-last:hidden" />
                                                        </div>
                                                        <div className="flex-1 pb-2 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-[12px] font-black text-slate-800 leading-tight truncate pr-2 uppercase tracking-tighter">
                                                                    {log.title}
                                                                </p>
                                                                <span className="text-[9px] font-black text-slate-400 whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">
                                                                    {log.timestamp}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium italic line-clamp-2">
                                                                "{log.description}"
                                                            </p>
                                                            <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="w-1 h-1 bg-blue-600 rounded-full" />
                                                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Klik untuk Investigasi</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* [NEW] Task 4 - User Analytics Chart (Full Width) */}
                        <motion.div variants={itemVariants}>
                            <UserAnalyticsChart />
                        </motion.div>

                        {/* Full Width Ledger */}
                        <motion.div variants={itemVariants}>
                            {ledger && (
                                <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden p-1">
                                    <CashflowLedgerTable
                                        data={ledger.data}
                                        meta={ledger.meta}
                                        isLoading={loadingLedger}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </motion.div>

                    </motion.div>
                )}
            </div>
        </div>
    );
}

// --- Premium Action Card Component ---
function ActionCard({ icon: Icon, label, desc, onClick, color, badge }: any) {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white shadow-blue-100/50",
        emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white shadow-emerald-100/50",
        slate: "bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white shadow-slate-200/50",
        amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white shadow-amber-100/50",
        indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white shadow-indigo-100/50",
    };

    return (
        <button
            onClick={onClick}
            className="group flex flex-col items-start p-4 md:p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 relative active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
            {badge && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-md ring-2 ring-white animate-pulse">
                    {badge}
                </span>
            )}
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-500 shadow-inner",
                colorMap[color as keyof typeof colorMap]
            )}>
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h4 className="font-black text-slate-800 text-[13px] md:text-sm tracking-tight group-hover:text-blue-600 transition-colors text-left w-full">{label}</h4>
            <p className="text-[10px] md:text-[11px] text-slate-500 font-medium text-left line-clamp-1 mt-0.5">{desc}</p>
        </button>
    );
}