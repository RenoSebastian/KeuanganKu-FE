import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { RevenueMetrics, UserMetrics } from '@/lib/types/dashboard';
import { formatCurrency } from '@/lib/formatters';

interface KpiCardsProps {
    revenue: RevenueMetrics;
    users: UserMetrics;
}

export const DashboardKpiCards: React.FC<KpiCardsProps> = ({ revenue, users }) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pendapatan Kotor</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(revenue.grossVolume)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Bulan ini (Verified)
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Proyeksi MRR</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(revenue.mrr)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Monthly Recurring Revenue
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {users.totalUsers.toLocaleString('id-ID')}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {users.dau} DAU / {users.mau} MAU
                    </p>
                </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-400">
                        Menunggu Verifikasi
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-500">
                        {formatCurrency(revenue.pendingValue)}
                    </div>
                    <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-1">
                        Butuh tindakan segera (Pending)
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};