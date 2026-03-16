"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureUsage } from '@/lib/types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FeatureUsageChartProps {
    data: FeatureUsage[];
}

export const FeatureUsageChart: React.FC<FeatureUsageChartProps> = ({ data }) => {
    // Jika tidak ada data, tampilkan empty state yang rapi
    if (!data || data.length === 0) {
        return (
            <Card className="h-100 flex flex-col">
                <CardHeader>
                    <CardTitle>Utilitas Fitur Kalkulator</CardTitle>
                    <CardDescription>Distribusi penggunaan modul finansial</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Belum ada data simulasi yang tercatat.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Utilitas Fitur Kalkulator</CardTitle>
                <CardDescription>Distribusi penggunaan modul finansial berdasarkan log simulasi</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-75 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="featureName"
                                type="category"
                                width={100}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                // FIX FINAL: Menyesuaikan union type untuk 'value' dan 'name' sesuai definisi Recharts
                                formatter={(
                                    value: number | undefined,
                                    name: string | undefined,
                                    props: any
                                ) => [
                                        `${value || 0} kali (${props.payload?.percentage || 0}%)`,
                                        'Penggunaan'
                                    ]}
                            />
                            <Bar
                                dataKey="usageCount"
                                fill="currentColor"
                                className="fill-primary"
                                radius={[0, 4, 4, 0]}
                                barSize={32}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};