"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, FileJson, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { adminService, SystemLog } from "@/services/admin.service";
import { LogDataTable } from "@/components/features/admin/maintenance/log-data-table";
import { cn } from "@/lib/utils";

export default function SystemLogViewerPage() {
    // State Manager
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Filter State
    const [actionFilter, setActionFilter] = useState<string>("");
    const [debouncedAction, setDebouncedAction] = useState<string>("");

    // Debounce untuk filter input agar tidak spamming request
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedAction(actionFilter), 500);
        return () => clearTimeout(timer);
    }, [actionFilter]);

    // Fetch initial data (Reset state jika filter berubah)
    const fetchInitialLogs = useCallback(async () => {
        setIsLoading(true);
        setCursor(undefined);
        setHasMore(true);
        setLogs([]);

        try {
            const res = await adminService.getSystemLogs({
                take: 30,
                action: debouncedAction ? debouncedAction.toUpperCase() : undefined
            });
            setLogs(res.data);
            setCursor(res.meta.nextCursor);
            setHasMore(res.meta.hasMore);
        } catch (error) {
            toast.error("Gagal memuat riwayat log audit.");
        } finally {
            setIsLoading(false);
        }
    }, [debouncedAction]);

    // Trigger awal & saat filter berubah
    useEffect(() => {
        fetchInitialLogs();
    }, [fetchInitialLogs]);

    // Handler dipanggil oleh Infinite Scroller dari komponen Table
    const loadMoreLogs = async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);

        try {
            const res = await adminService.getSystemLogs({
                take: 30,
                cursor,
                action: debouncedAction ? debouncedAction.toUpperCase() : undefined
            });

            // Append data baru ke array yang sudah ada
            setLogs((prev) => [...prev, ...res.data]);
            setCursor(res.meta.nextCursor);
            setHasMore(res.meta.hasMore);
        } catch (error) {
            toast.error("Gagal memuat log tambahan.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">
            {/* --- HEADER --- */}
            <div className="bg-slate-900 pt-8 pb-24 px-5 relative overflow-hidden shadow-xl rounded-b-[2.5rem]">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />

                <div className="relative z-10 max-w-7xl mx-auto">
                    <Link href="/admin/maintenance">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white mb-6 -ml-4">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Maintenance
                        </Button>
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-rose-500/10 backdrop-blur-md px-3 py-1 rounded-full border border-rose-500/20 mb-3">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                                <span className="text-[10px] font-bold text-rose-100 tracking-widest uppercase">Security Audit Trail</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                System Log Viewer
                            </h1>
                            <p className="text-slate-400 text-sm mt-1 max-w-lg">
                                Pemantauan forensik untuk seluruh aktivitas mutasi data oleh Administrator tingkat tinggi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-5 -mt-10 space-y-6">

                {/* CONTROL BAR */}
                <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-[300px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Filter by ACTION (e.g., UPDATE, PRUNE)"
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="pl-9 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-slate-300 h-10 text-xs font-bold uppercase"
                        />
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchInitialLogs}
                        disabled={isLoading && !logs.length}
                        className="w-full sm:w-auto h-10 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        <RefreshCw className={cn("w-4 h-4 mr-2", isLoading ? "animate-spin" : "")} />
                        Refresh Logs
                    </Button>
                </div>

                {/* VIRTUALIZED / INFINITE SCROLL TABLE */}
                <LogDataTable
                    logs={logs}
                    isLoading={isLoading}
                    hasMore={hasMore}
                    onLoadMore={loadMoreLogs}
                />
            </div>
        </div>
    );
}