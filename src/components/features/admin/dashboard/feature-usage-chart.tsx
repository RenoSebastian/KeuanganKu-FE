"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureUsage } from '@/lib/types/dashboard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { PieChart as ChartIcon, Sparkles, MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureUsageChartProps {
    data: FeatureUsage[];
}

// --- Custom Tooltip Component ---
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    {data.featureName}
                </p>
                <div className="flex items-center gap-3">
                    <p className="text-white font-bold text-lg">
                        {data.usageCount} <span className="text-xs font-medium text-slate-400">Hits</span>
                    </p>
                    <div className="h-4 w-px bg-slate-700" />
                    <p className="text-blue-400 font-black text-sm">
                        {data.percentage}%
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export const FeatureUsageChart: React.FC<FeatureUsageChartProps> = ({ data }) => {

    // Palet warna gradasi premium
    const colors = ['#3b82f6', '#2dd4bf', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

    if (!data || data.length === 0) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="h-95 flex flex-col border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-black tracking-tight text-slate-800">Utilitas Fitur</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-10">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 border border-slate-100">
                            <ChartIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Data Belum Tersedia</p>
                        <p className="text-sm text-slate-400 mt-1">Belum ada aktivitas simulasi yang tercatat hari ini.</p>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white/95 backdrop-blur-xl border border-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Usage Analytics</span>
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-800 tracking-tighter">Popularitas Modul</CardTitle>
                        <CardDescription className="font-medium text-slate-500">Distribusi penggunaan kalkulator finansial.</CardDescription>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <MousePointer2 className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hover for details</span>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="h-85 w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
                                barGap={12}
                            >
                                <defs>
                                    {colors.map((color, index) => (
                                        <linearGradient key={`grad-${index}`} id={`barGrad-${index}`} x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                                            <stop offset="100%" stopColor={color} stopOpacity={1} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="featureName"
                                    type="category"
                                    width={120}
                                    tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: '#f8fafc', radius: 12 }}
                                />
                                <Bar
                                    dataKey="usageCount"
                                    radius={[0, 12, 12, 0]}
                                    barSize={28}
                                    animationDuration={1500}
                                    animationBegin={300}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`url(#barGrad-${index % colors.length})`}
                                            className="hover:opacity-80 transition-opacity cursor-pointer"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legenda Bawah Mini */}
                    <div className="mt-8 pt-6 border-t border-slate-50 flex flex-wrap gap-4 justify-center">
                        {data.slice(0, 4).map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.featureName}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};