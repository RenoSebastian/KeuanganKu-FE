"use client";

import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, ShieldAlert, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { SystemLog } from "@/services/admin.service";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LogDataTableProps {
    logs: SystemLog[];
    isLoading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
}

export const LogDataTable: React.FC<LogDataTableProps> = ({ logs, isLoading, hasMore, onLoadMore }) => {
    const observerTarget = useRef<HTMLDivElement>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Intersection Observer untuk Infinite Scrolling
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    onLoadMore();
                }
            },
            { threshold: 1.0, rootMargin: "100px" } // Trigger 100px sebelum mentok bawah
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, isLoading, onLoadMore]);

    const toggleRow = (id: string) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedRows(newSet);
    };

    const getActionColor = (action: string) => {
        if (action.includes("DELETE") || action.includes("REVOKE") || action.includes("REJECT")) return "bg-red-50 text-red-600 border-red-200";
        if (action.includes("UPDATE") || action.includes("EDIT")) return "bg-amber-50 text-amber-600 border-amber-200";
        if (action.includes("CREATE") || action.includes("APPROVE")) return "bg-emerald-50 text-emerald-600 border-emerald-200";
        return "bg-blue-50 text-blue-600 border-blue-200";
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100 font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 w-[20%]">Timestamp & IP</th>
                            <th className="px-6 py-4 w-[25%]">Administrator</th>
                            <th className="px-6 py-4 w-[25%]">Action & Target</th>
                            <th className="px-6 py-4 text-right w-[30%]">Payload Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {logs.length === 0 && !isLoading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                        <ShieldAlert className="w-8 h-8 opacity-20" />
                                        <p className="text-sm font-medium">Belum ada log aktivitas yang terekam.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <React.Fragment key={log.id}>
                                    <tr className="hover:bg-slate-50/50 transition-colors group">
                                        {/* WAKTU & IP */}
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-slate-800 text-xs">
                                                    {format(new Date(log.createdAt), "dd MMM yyyy", { locale: localeId })}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-500">
                                                    {format(new Date(log.createdAt), "HH:mm:ss", { locale: localeId })}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-mono mt-1 px-1.5 py-0.5 bg-slate-100 rounded w-fit">
                                                    {log.ipAddress || 'Unknown IP'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* ADMINISTRATOR */}
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-sm line-clamp-1">{log.admin?.fullName || 'SYSTEM'}</span>
                                                <span className="text-xs text-slate-500 truncate max-w-[180px]">{log.admin?.email || 'N/A'}</span>
                                                <span className="text-[10px] text-slate-400 font-mono mt-1 truncate">ID: {log.admin?.id}</span>
                                            </div>
                                        </td>

                                        {/* ACTION & TARGET */}
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-2 items-start">
                                                <Badge variant="outline" className={cn("text-[10px] uppercase font-black", getActionColor(log.actionType))}>
                                                    {log.actionType}
                                                </Badge>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-bold text-slate-700">Entity: {log.entityName}</span>
                                                    {log.entityId && (
                                                        <span className="text-[10px] text-slate-500 font-mono">Target ID: {log.entityId}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* DETAILS TOGGLE */}
                                        <td className="px-6 py-4 align-top text-right">
                                            <button
                                                onClick={() => toggleRow(log.id)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg"
                                            >
                                                {expandedRows.has(log.id) ? "Tutup JSON" : "Lihat JSON"}
                                                {expandedRows.has(log.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* EXPANDABLE JSON VIEWER */}
                                    {expandedRows.has(log.id) && (
                                        <tr>
                                            <td colSpan={4} className="p-0 border-b-0">
                                                <div className="bg-slate-900 px-6 py-4 text-emerald-400 font-mono text-[11px] overflow-x-auto shadow-inner">
                                                    <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* SENTINEL UNTUK INFINITE SCROLL */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center py-8">
                {isLoading && (
                    <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs font-medium">Memuat data log...</span>
                    </div>
                )}
                {!hasMore && logs.length > 0 && !isLoading && (
                    <div className="flex items-center gap-2 text-slate-400">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-medium">Semua log telah dimuat.</span>
                    </div>
                )}
            </div>
        </div>
    );
};