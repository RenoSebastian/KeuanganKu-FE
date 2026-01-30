import { formatBytes } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface StorageBarProps {
    label: string;
    rowCount: number;
    valueBytes: number;
    totalDatabaseBytes: number;
    className?: string;
}

/**
 * Komponen visualisasi baris tunggal untuk penggunaan storage.
 * Menampilkan nama tabel, jumlah baris, dan bar persentase penggunaan relatif terhadap total DB.
 */
export function StorageBar({
    label,
    rowCount,
    valueBytes,
    totalDatabaseBytes,
    className,
}: StorageBarProps) {
    // Menghindari division by zero
    const percentage = totalDatabaseBytes > 0
        ? (valueBytes / totalDatabaseBytes) * 100
        : 0;

    // Logic Warna: Memberikan visual feedback jika ada tabel yang mendominasi storage secara tidak wajar.
    // > 50% = Amber (Warning), < 50% = Blue (Normal)
    const isDominant = percentage > 50;
    const barColorClass = isDominant ? "bg-amber-500" : "bg-blue-600";

    return (
        <div className={cn("space-y-1.5", className)}>
            {/* Header Label: Nama Tabel & Ukuran */}
            <div className="flex justify-between text-sm">
                <div className="flex flex-col">
                    <span className="font-medium text-slate-700">{label}</span>
                    <span className="text-xs text-slate-400">
                        {new Intl.NumberFormat('id-ID').format(rowCount)} rows
                    </span>
                </div>
                <div className="text-right">
                    <span className="font-semibold text-slate-900">{formatBytes(valueBytes)}</span>
                    <div className="text-xs text-slate-400">
                        {percentage.toFixed(1)}% of DB
                    </div>
                </div>
            </div>

            {/* The Visual Bar */}
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-500 ease-out rounded-full", barColorClass)}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    );
}