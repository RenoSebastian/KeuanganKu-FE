"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    TrendingUp,
    Users,
    CreditCard,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Settings,
    ShieldCheck,
    Wallet,
    MoreHorizontal,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types for SaaS Metrics ---
interface SaaSMetrics {
    mrr: number; // Monthly Recurring Revenue
    totalUsers: number;
    activeSubs: number;
    pendingVerifications: number;
    churnRate: number;
    growth: {
        mrr: number;
        users: number;
    };
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<SaaSMetrics | null>(null);

    // Simulasi Data Fetching
    useEffect(() => {
        const fetchMetrics = async () => {
            // Di real app, ini fetch ke API Backend
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMetrics({
                mrr: 45000000, // Rp 45.000.000
                totalUsers: 1240,
                activeSubs: 856,
                pendingVerifications: 12, // Butuh tindakan segera
                churnRate: 2.4,
                growth: {
                    mrr: 15.5, // +15.5%
                    users: 8.2 // +8.2%
                }
            });
            setLoading(false);
        };

        fetchMetrics();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24 md:pb-12">

            {/* --- HERO SECTION (The Central Bank Vibe) --- */}
            {/* Gradient background yang dalam untuk kesan premium & tech */}
            <div className="relative bg-slate-900 pt-8 pb-20 md:pt-12 md:pb-32 overflow-hidden rounded-b-[2.5rem] md:rounded-b-[3.5rem] shadow-xl">

                {/* Abstract Tech Patterns */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
                <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10 mix-blend-overlay"></div>

                <div className="relative z-10 px-6 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-200 border-blue-500/20 backdrop-blur-md">
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    Admin Operator
                                </Badge>
                                <span className="text-slate-400 text-xs font-medium">v2.4.0 SaaS Engine</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                                Revenue Command Center
                            </h1>
                            <p className="text-slate-400 text-sm md:text-base mt-1 max-w-md">
                                Pantau performa bisnis, verifikasi pembayaran, dan kelola parameter ekonomi global.
                            </p>
                        </div>

                        {/* Quick Notification Widget */}
                        <div className="flex items-center gap-3">
                            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 rounded-full">
                                <Bell className="w-5 h-5" />
                            </Button>
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-medium text-white">System Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT (Overlap Hero) --- */}
            <div className="px-5 max-w-7xl mx-auto -mt-16 md:-mt-24 relative z-20 space-y-6">

                {/* 1. KEY METRICS ROW (The Money Machines) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* MRR Card - The Most Important Metric */}
                    <MetricCard
                        title="Monthly Recurring Revenue"
                        value={loading ? undefined : formatCurrency(metrics?.mrr || 0)}
                        trend={metrics?.growth.mrr}
                        icon={Wallet}
                        variant="primary"
                        loading={loading}
                    />

                    {/* Active Subs */}
                    <MetricCard
                        title="Active Subscribers"
                        value={loading ? undefined : metrics?.activeSubs.toString()}
                        subValue={`Total: ${metrics?.totalUsers} Users`}
                        trend={metrics?.growth.users}
                        icon={Users}
                        variant="default"
                        loading={loading}
                    />

                    {/* Pending Verifications (Actionable) */}
                    <MetricCard
                        title="Pending Verification"
                        value={loading ? undefined : metrics?.pendingVerifications.toString()}
                        icon={AlertCircle}
                        variant="warning"
                        loading={loading}
                        footerAction={() => router.push('/admin/verification')}
                        footerText="Process Queue →"
                    />

                    {/* Churn Rate */}
                    <MetricCard
                        title="Churn Rate"
                        value={loading ? undefined : `${metrics?.churnRate}%`}
                        trend={-0.5} // Negative churn trend is good
                        trendInversed // Red is bad, Green is good (for churn, down is green)
                        icon={Activity}
                        variant="default"
                        loading={loading}
                    />
                </div>

                {/* 2. OPERATIONAL GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: Quick Actions (PWA Optimized) */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-slate-500" />
                            Operational Controls
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <ActionCard
                                icon={TrendingUp}
                                label="Parameter Ekonomi"
                                desc="Atur Inflasi & Bunga"
                                onClick={() => router.push('/admin/settings')}
                                color="blue"
                            />
                            <ActionCard
                                icon={CreditCard}
                                label="Verifikasi Manual"
                                desc="Cek Bukti Bayar"
                                onClick={() => router.push('/admin/verification')}
                                color="emerald"
                                badge={metrics?.pendingVerifications}
                            />
                            <ActionCard
                                icon={Users}
                                label="User Management"
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

                        {/* Simulated Chart Area */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h4 className="font-bold text-slate-800">Revenue Growth</h4>
                                    <p className="text-xs text-slate-500">Performansi 6 bulan terakhir</p>
                                </div>
                                <Button variant="outline" size="sm" className="h-8 text-xs">Download Report</Button>
                            </div>

                            {/* CSS-Only Simple Bar Chart (Lightweight for PWA) */}
                            <div className="h-48 flex items-end justify-between gap-2 md:gap-4 px-2">
                                {[40, 55, 45, 70, 65, 85].map((h, i) => (
                                    <div key={i} className="w-full flex flex-col items-center group cursor-pointer">
                                        <div className="relative w-full max-w-[40px] bg-slate-100 rounded-t-lg overflow-hidden h-full">
                                            <div
                                                className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg transition-all duration-500 group-hover:bg-blue-500"
                                                style={{ height: `${h}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-2 font-medium">
                                            {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'][i]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Recent Activity Feed */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Live Activity</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </div>
                        <div className="p-0 flex-1 overflow-y-auto max-h-[400px]">
                            {loading ? (
                                <div className="p-5 space-y-4">
                                    <Skeleton className="h-12 w-full rounded-xl" />
                                    <Skeleton className="h-12 w-full rounded-xl" />
                                    <Skeleton className="h-12 w-full rounded-xl" />
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    <ActivityItem
                                        title="Subscription Verified"
                                        desc="User Reno Sebastian upgraded to Pro Plan"
                                        time="2m ago"
                                        type="success"
                                    />
                                    <ActivityItem
                                        title="Inflation Updated"
                                        desc="Admin changed Education Inflation to 7%"
                                        time="1h ago"
                                        type="neutral"
                                    />
                                    <ActivityItem
                                        title="Payment Rejected"
                                        desc="Invalid proof for Transaction #9921"
                                        time="3h ago"
                                        type="danger"
                                    />
                                    <ActivityItem
                                        title="New User Register"
                                        desc="User Budi Santoso joined"
                                        time="5h ago"
                                        type="neutral"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                            <Button variant="ghost" className="w-full text-xs text-slate-500 h-8">View All Logs</Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS FOR CLEANER CODE ---

function MetricCard({
    title, value, subValue, trend, icon: Icon, variant = "default", loading, trendInversed, footerAction, footerText
}: any) {
    const isPositive = trend > 0;
    const trendColor = trendInversed
        ? (isPositive ? "text-red-500" : "text-emerald-500")
        : (isPositive ? "text-emerald-500" : "text-red-500");
    const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

    const bgStyles = {
        default: "bg-white border-slate-100",
        primary: "bg-gradient-to-br from-blue-600 to-blue-700 border-transparent text-white",
        warning: "bg-amber-50 border-amber-100"
    };

    const textStyles = {
        default: "text-slate-800",
        primary: "text-white",
        warning: "text-amber-900"
    };

    const labelStyles = {
        default: "text-slate-500",
        primary: "text-blue-100",
        warning: "text-amber-700/70"
    };

    if (loading) return <Skeleton className="h-[140px] w-full rounded-2xl" />;

    return (
        <div className={cn("rounded-2xl p-5 shadow-sm border flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:shadow-md", bgStyles[variant as keyof typeof bgStyles])}>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                <Icon className="w-24 h-24" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <p className={cn("text-xs font-bold uppercase tracking-wider", labelStyles[variant as keyof typeof labelStyles])}>
                        {title}
                    </p>
                    <div className={cn("p-2 rounded-lg bg-white/10 backdrop-blur-sm")}>
                        <Icon className={cn("w-4 h-4", variant === 'primary' ? 'text-white' : 'text-slate-400')} />
                    </div>
                </div>

                <div className="flex items-baseline gap-2">
                    <h3 className={cn("text-2xl lg:text-3xl font-black tracking-tight", textStyles[variant as keyof typeof textStyles])}>
                        {value}
                    </h3>
                </div>

                {subValue && (
                    <p className={cn("text-xs mt-1 font-medium", labelStyles[variant as keyof typeof labelStyles])}>{subValue}</p>
                )}
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between">
                {trend !== undefined && (
                    <div className={cn("flex items-center text-xs font-bold bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm", variant === 'primary' ? 'text-white' : trendColor)}>
                        <TrendIcon className="w-3 h-3 mr-1" />
                        {Math.abs(trend)}%
                        <span className={cn("ml-1 font-normal opacity-70", variant === 'primary' ? 'text-blue-100' : 'text-slate-400')}>
                            vs last month
                        </span>
                    </div>
                )}

                {footerAction && (
                    <button
                        onClick={footerAction}
                        className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all text-amber-700"
                    >
                        {footerText} <ArrowUpRight className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
}

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
            className="group flex flex-col items-start p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 relative"
        >
            {badge > 0 && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                    {badge}
                </span>
            )}
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300", colorMap[color as keyof typeof colorMap])}>
                <Icon className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors text-left w-full">
                {label}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium text-left">
                {desc}
            </p>
        </button>
    );
}

function ActivityItem({ title, desc, time, type }: any) {
    const iconMap = {
        success: { icon: ShieldCheck, color: "text-emerald-500 bg-emerald-50" },
        danger: { icon: AlertCircle, color: "text-red-500 bg-red-50" },
        neutral: { icon: Activity, color: "text-blue-500 bg-blue-50" }
    };

    const style = iconMap[type as keyof typeof iconMap];
    const Icon = style.icon;

    return (
        <div className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors cursor-default">
            <div className={cn("p-2 rounded-full shrink-0", style.color)}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{time}</span>
        </div>
    );
}