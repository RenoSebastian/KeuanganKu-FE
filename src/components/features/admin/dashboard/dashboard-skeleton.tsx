import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* 1. KPI CARDS SKELETON ROW */}
            {/* Mereplikasi 4 metrik utama (Revenue, MRR, Users, Pending) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((index) => (
                    <Card key={`kpi-skeleton-${index}`} className="border-slate-100/60 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 2. OPERATIONAL & CHART SKELETON GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT: Quick Actions & Feature Chart Skeleton (Kolom besar: 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Placeholder judul section */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-md" />
                        <Skeleton className="h-6 w-48" />
                    </div>

                    {/* Placeholder 4 Action Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((index) => (
                            <div key={`action-skeleton-${index}`} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm h-30 flex flex-col justify-between">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Placeholder Recharts Area */}
                    <Card className="border-slate-100/60 shadow-sm">
                        <CardHeader>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-75 w-full rounded-lg" />
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT: System Context Info Skeleton (Kolom kecil: 1/3) */}
                <div className="space-y-6">
                    <Card className="border-slate-100/60 shadow-sm h-full min-h-100">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded-md" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8 mt-4">
                            {/* Placeholder Conversion Rate */}
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>

                            {/* Placeholder Quota Consumption */}
                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <Skeleton className="h-4 w-48" />
                                <div className="flex items-end gap-2">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-10 w-full mt-2" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 3. CASHFLOW LEDGER TABLE SKELETON */}
            {/* Merender tabel bayangan dengan 5 baris */}
            <Card className="border-slate-100/60 shadow-sm mt-4">
                <CardHeader>
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-slate-100">
                        {/* Table Header */}
                        <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex gap-4">
                            <Skeleton className="h-4 w-[15%]" />
                            <Skeleton className="h-4 w-[25%]" />
                            <Skeleton className="h-4 w-[20%]" />
                            <Skeleton className="h-4 w-[15%]" />
                            <Skeleton className="h-4 w-[15%]" />
                            <Skeleton className="h-4 w-[10%]" />
                        </div>
                        {/* Table Rows */}
                        <div className="divide-y divide-slate-100">
                            {[1, 2, 3, 4, 5].map((index) => (
                                <div key={`table-row-skeleton-${index}`} className="p-4 flex items-center gap-4">
                                    <Skeleton className="h-4 w-[15%]" />
                                    <Skeleton className="h-4 w-[25%]" />
                                    <Skeleton className="h-4 w-[20%]" />
                                    <Skeleton className="h-6 w-[10%] rounded-full" /> {/* Status Badge */}
                                    <Skeleton className="h-4 w-[15%]" />
                                    <div className="w-[15%] flex justify-end">
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};