import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import { RevenueMetrics, UserMetrics } from '@/lib/types/dashboard';
import { formatCurrency } from '@/lib/formatters';

interface KpiCardsProps {
    revenue: RevenueMetrics;
    users: UserMetrics;
}

export const DashboardKpiCards: React.FC<KpiCardsProps> = ({ revenue, users }) => {
    return (
        // [PHASE 2 FIX] Grid diubah ke lg:grid-cols-3 karena kartu ke-4 dihapus
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-100 shadow-sm rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Total Pendapatan Kotor</CardTitle>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black text-slate-800">
                        {formatCurrency(revenue.grossVolume)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                        Bulan berjalan (Transaksi Tervalidasi)
                    </p>
                </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Proyeksi MRR</CardTitle>
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black text-blue-600">
                        {formatCurrency(revenue.mrr)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                        Monthly Recurring Revenue
                    </p>
                </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Total Pengguna</CardTitle>
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Users className="h-4 w-4 text-indigo-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black text-slate-800">
                        {users.totalUsers.toLocaleString('id-ID')}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                        {users.dau} Aktif Harian (DAU) / {users.mau} Bulanan (MAU)
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};