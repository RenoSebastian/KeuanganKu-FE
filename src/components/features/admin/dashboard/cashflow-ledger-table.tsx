import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileText, User as UserIcon, Inbox, Loader2, DownloadCloud } from 'lucide-react';
import { CashflowLedgerItem, PaginationMeta, CashflowStatus } from '@/lib/types/dashboard';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { adminService } from '@/services/admin.service';

interface CashflowLedgerTableProps {
    data: CashflowLedgerItem[];
    meta: PaginationMeta;
    isLoading?: boolean;
    onPageChange: (newPage: number) => void;
}

export const CashflowLedgerTable: React.FC<CashflowLedgerTableProps> = ({
    data,
    meta,
    isLoading = false,
    onPageChange
}) => {
    // [TASK 1] State untuk memantau status generasi dokumen PDF
    const [isDownloading, setIsDownloading] = useState(false);

    // --- Helper Format Waktu ---
    const formatLocalTime = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // --- Ekspor Dokumen Fisik (PDF) ---
    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        const toastId = toast.loading('Sedang menyiapkan dokumen PDF...');

        try {
            const blob = await adminService.downloadCashflowReport('Keseluruhan');

            // Rekayasa Blob to Download Link
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Laporan_Arus_Kas_${new Date().getTime()}.pdf`);

            // Simulasikan klik untuk memicu unduhan di browser
            document.body.appendChild(link);
            link.click();

            // Bersihkan sisa DOM
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Dokumen berhasil diunduh.', { id: toastId });
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Gagal mengunduh dokumen. Coba beberapa saat lagi.', { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };

    // --- Premium Status Badge Component ---
    const renderStatusBadge = (status: CashflowStatus) => {
        const config = {
            VERIFIED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "Terverifikasi" },
            PENDING: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500 animate-pulse", label: "Menunggu" },
            REJECTED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500", label: "Ditolak" }
        }[status] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", dot: "bg-slate-400", label: status };

        return (
            <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                config.bg, config.text, config.border
            )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
                {config.label}
            </span>
        );
    };

    return (
        <Card className="border-none shadow-none bg-transparent sm:bg-white sm:border-slate-100 sm:shadow-sm rounded-none sm:rounded-[2rem] overflow-hidden flex flex-col h-full">

            {/* Header Area with Download Button */}
            <CardHeader className="bg-transparent sm:bg-white border-b border-slate-100 px-2 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-800 tracking-tight">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-inner">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        Buku Besar Transaksi
                    </CardTitle>
                    <CardDescription className="font-medium text-slate-500 mt-1 pl-13 sm:pl-0">
                        Riwayat mutasi masuk dan verifikasi langganan.
                    </CardDescription>
                </div>

                {/* [NEW] Tombol Aksi Unduh */}
                {data.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto self-start sm:self-center font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                        onClick={handleDownloadPdf}
                        disabled={isDownloading || isLoading}
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <DownloadCloud className="w-4 h-4 mr-2" />}
                        Unduh Laporan PDF
                    </Button>
                )}
            </CardHeader>

            <CardContent className="p-0 sm:p-6 flex-1 flex flex-col">

                {/* =========================================
                    [DESKTOP VIEW] PREMIUM DATA TABLE
                ========================================= */}
                <div className="hidden md:block rounded-[1.5rem] border border-slate-100 overflow-hidden shadow-sm flex-1">
                    <Table>
                        <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Transaksi</TableHead>
                                <TableHead className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pelanggan</TableHead>
                                <TableHead className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paket</TableHead>
                                <TableHead className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</TableHead>
                                <TableHead className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">PIC Admin</TableHead>
                                <TableHead className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Nominal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                // Desktop Skeleton Loading
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell colSpan={6} className="py-4">
                                            <div className="h-6 w-full bg-slate-100 animate-pulse rounded-md" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : data.length === 0 ? (
                                // Desktop Empty State
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64">
                                        <div className="flex flex-col items-center justify-center text-center opacity-60">
                                            <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                                            <p className="text-sm font-bold text-slate-400">Belum Ada Transaksi</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => (
                                    <TableRow key={item.transactionId} className="hover:bg-blue-50/30 transition-colors duration-200 cursor-default">
                                        <TableCell className="whitespace-nowrap text-xs text-slate-500 font-medium py-4">
                                            {formatLocalTime(item.transactionDate)}
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-800 text-[13px]">
                                            {item.userName}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-md uppercase tracking-wider">
                                                {item.planName}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">{renderStatusBadge(item.status)}</TableCell>
                                        <TableCell className="text-xs text-center text-slate-400 font-medium">
                                            {item.verifiedBy || '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold text-slate-900 text-sm">
                                            {formatCurrency(item.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* =========================================
                    [MOBILE VIEW] PWA BENTO LIST
                ========================================= */}
                <div className="md:hidden flex flex-col gap-4 mt-2 px-2">
                    {isLoading ? (
                        // Mobile Skeleton Loading
                        Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                                        <div className="space-y-2">
                                            <div className="w-24 h-4 bg-slate-100 animate-pulse rounded" />
                                            <div className="w-16 h-3 bg-slate-100 animate-pulse rounded" />
                                        </div>
                                    </div>
                                    <div className="w-20 h-6 bg-slate-100 animate-pulse rounded-full" />
                                </div>
                                <div className="w-full h-px bg-slate-50" />
                                <div className="flex justify-between items-end">
                                    <div className="w-16 h-4 bg-slate-100 animate-pulse rounded" />
                                    <div className="w-24 h-5 bg-slate-100 animate-pulse rounded" />
                                </div>
                            </div>
                        ))
                    ) : data.length === 0 ? (
                        // Mobile Empty State
                        <div className="p-12 text-center flex flex-col items-center justify-center opacity-60 bg-white rounded-[2rem] border border-slate-100">
                            <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-sm font-bold text-slate-400">Riwayat Kosong</p>
                        </div>
                    ) : (
                        data.map((item, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={item.transactionId}
                                className="p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex flex-col gap-4"
                            >
                                {/* Top Section: User & Status */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                                            <UserIcon className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-black text-slate-800 line-clamp-1 tracking-tight">{item.userName}</span>
                                            <span className="text-[10px] font-medium text-slate-500 mt-0.5">{formatLocalTime(item.transactionDate)}</span>
                                        </div>
                                    </div>
                                    {renderStatusBadge(item.status)}
                                </div>

                                {/* Divider */}
                                <div className="w-full border-t border-dashed border-slate-200" />

                                {/* Bottom Section: Plan & Amount */}
                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Plan Paket</span>
                                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md uppercase tracking-wider w-fit">
                                            {item.planName}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Total Tagihan</span>
                                        <span className="font-mono font-black text-slate-900 text-base tracking-tight">
                                            {formatCurrency(item.amount)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* =========================================
                    MODERN PAGINATION CONTROLS
                ========================================= */}
                {meta && meta.totalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4 px-2 sm:px-0">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest order-2 sm:order-1">
                            Page <span className="text-slate-800">{meta.page}</span> of {meta.totalPages} <span className="lowercase text-slate-400 font-medium ml-1">({meta.total} records)</span>
                        </div>
                        <div className="flex space-x-2 w-full sm:w-auto order-1 sm:order-2">
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-none border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl h-11 sm:h-10 font-bold shadow-sm transition-all active:scale-95"
                                onClick={() => onPageChange(meta.page - 1)}
                                disabled={meta.page <= 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-none border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl h-11 sm:h-10 font-bold shadow-sm transition-all active:scale-95"
                                onClick={() => onPageChange(meta.page + 1)}
                                disabled={meta.page >= meta.totalPages || isLoading}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};