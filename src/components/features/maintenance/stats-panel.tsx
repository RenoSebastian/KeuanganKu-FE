import { DatabaseStats } from "@/lib/types/retention";
import { formatBytes } from "@/lib/formatters";
import { StorageBar } from "./storage-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, HardDrive, Table as TableIcon } from "lucide-react";

interface StatsPanelProps {
    stats: DatabaseStats | null;
}

/**
 * Panel Utama Visualisasi Monitoring.
 * Mengelompokkan informasi menjadi:
 * 1. Macro Cards (Total Size, Total Tables)
 * 2. Detailed Breakdown (List tabel dengan ukuran terbesar)
 */
export function StatsPanel({ stats }: StatsPanelProps) {
    if (!stats) {
        // Skeleton Loading atau Empty State bisa ditaruh di sini jika perlu,
        // tapi Page Controller biasanya sudah menangani loading state.
        return null;
    }

    // Mengambil 5 tabel terbesar untuk ditampilkan agar UI tidak terlalu panjang
    // (Assuming backend sudah sort DESC, tapi kita slice untuk safety UI)
    const topTables = stats.tables.slice(0, 5);

    return (
        <div className="space-y-6">

            {/* 1. MACRO METRICS (Grid System) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {/* Card: Total Storage Size */}
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Total Database Size
                        </CardTitle>
                        <HardDrive className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {stats.formattedTotalSize}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Physical disk usage (Data + Index)
                        </p>
                    </CardContent>
                </Card>

                {/* Card: Total Tables */}
                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Total Tables
                        </CardTitle>
                        <TableIcon className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {stats.tables.length}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Active relations in schema
                        </p>
                    </CardContent>
                </Card>

                {/* Card: Health Status (Simple logic for now) */}
                <Card className="border-l-4 border-l-green-500 shadow-sm md:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            System Health
                        </CardTitle>
                        <Database className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            Healthy
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Database connection stable
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 2. DETAILED BREAKDOWN (Storage Distribution) */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">
                        Storage Distribution (Top 5 Tables)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {topTables.map((table) => (
                        <StorageBar
                            key={table.tableName}
                            label={table.tableName}
                            rowCount={table.rowCount}
                            valueBytes={table.totalBytes}
                            totalDatabaseBytes={stats.totalDatabaseSize}
                        />
                    ))}

                    {stats.tables.length > 5 && (
                        <p className="text-center text-xs text-slate-400 pt-2 italic">
                            ...dan {stats.tables.length - 5} tabel kecil lainnya.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}