// File: src/components/features/admin/dashboard/user-analytics-chart.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { format, subDays, subMonths } from 'date-fns';
import { id as dateFnsId } from 'date-fns/locale';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { Users, Activity, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { adminService } from '@/services/admin.service';
import { AnalyticsResolution, TimeSeriesDataPoint } from '@/lib/types/dashboard';

export function UserAnalyticsChart() {
    const [resolution, setResolution] = useState<AnalyticsResolution>('daily');
    const [growthData, setGrowthData] = useState<TimeSeriesDataPoint[]>([]);
    const [engagementData, setEngagementData] = useState<TimeSeriesDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            const endDate = new Date();
            let startDate = new Date();

            // Atur rentang waktu mundur secara otomatis berdasarkan resolusi
            if (resolution === 'daily') startDate = subDays(endDate, 30); // 30 Hari Terakhir
            if (resolution === 'weekly') startDate = subDays(endDate, 90); // 3 Bulan Terakhir
            if (resolution === 'monthly') startDate = subMonths(endDate, 12); // 1 Tahun Terakhir

            // Format menjadi ISO YYYY-MM-DD
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];

            // Panggil API secara paralel untuk performa maksimal
            const [growth, engagement] = await Promise.all([
                adminService.getGrowthAnalytics(startStr, endStr, resolution),
                adminService.getEngagementAnalytics(startStr, endStr, resolution)
            ]);

            setGrowthData(growth);
            setEngagementData(engagement);
        } catch (error) {
            console.error(error);
            toast.error('Gagal memuat grafik analitik pengguna.');
        } finally {
            setIsLoading(false);
        }
    }, [resolution]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Helper untuk memformat label sumbu X agar mudah dibaca
    const formatXAxis = (isoString: string) => {
        const date = new Date(isoString);
        if (resolution === 'daily') return format(date, 'dd MMM', { locale: dateFnsId });
        if (resolution === 'weekly') return `Minggu ${format(date, 'I', { locale: dateFnsId })}`;
        if (resolution === 'monthly') return format(date, 'MMM yy', { locale: dateFnsId });
        return isoString;
    };

    // Komponen kustom untuk Tooltip saat grafik di-hover
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-xl">
                    <p className="text-slate-300 text-xs font-semibold mb-1">
                        {format(new Date(label), 'dd MMMM yyyy', { locale: dateFnsId })}
                    </p>
                    <p className="text-white font-black text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
                        {payload[0].value} <span className="text-slate-400 font-normal text-xs uppercase ml-1">Data Poin</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="bg-white/95 backdrop-blur-xl rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <CardHeader className="border-b border-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6">
                <div>
                    <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Analitik Audiens & Engagement
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-500 mt-1">
                        Laporan time-series pertumbuhan dan tingkat keaktifan pengguna.
                    </CardDescription>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 w-full md:w-auto">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <Select
                            value={resolution}
                            onValueChange={(val: AnalyticsResolution) => setResolution(val)}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 p-0 h-auto text-xs font-bold w-[110px]">
                                <SelectValue placeholder="Pilih Resolusi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">30 Hari Terakhir</SelectItem>
                                <SelectItem value="weekly">12 Minggu Terakhir</SelectItem>
                                <SelectItem value="monthly">12 Bulan Terakhir</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <Tabs defaultValue="growth" className="w-full">
                    <div className="flex justify-center mb-6">
                        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100/80 p-1 rounded-full h-11">
                            <TabsTrigger value="growth" className="rounded-full text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">
                                <Users className="w-3.5 h-3.5 mr-2" /> Akuisisi (Pendaftar)
                            </TabsTrigger>
                            <TabsTrigger value="engagement" className="rounded-full text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
                                <Activity className="w-3.5 h-3.5 mr-2" /> Engagement (Login)
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="h-[300px] w-full relative">
                        {isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10 rounded-xl">
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memproses Kalkulasi...</span>
                            </div>
                        ) : null}

                        {/* TAB 1: ACQUISITION / GROWTH */}
                        <TabsContent value="growth" className="h-full w-full m-0 data-[state=inactive]:hidden">
                            {growthData.length === 0 && !isLoading ? (
                                <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">Tidak ada data untuk dirender.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="period"
                                            tickFormatter={formatXAxis}
                                            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                                            axisLine={false}
                                            tickLine={false}
                                            dx={-10}
                                            allowDecimals={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#4f46e5"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorGrowth)"
                                            activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </TabsContent>

                        {/* TAB 2: ENGAGEMENT / LOGIN */}
                        <TabsContent value="engagement" className="h-full w-full m-0 data-[state=inactive]:hidden">
                            {engagementData.length === 0 && !isLoading ? (
                                <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">Tidak ada data untuk dirender.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="period"
                                            tickFormatter={formatXAxis}
                                            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                                            axisLine={false}
                                            tickLine={false}
                                            dx={-10}
                                            allowDecimals={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorEngage)"
                                            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}