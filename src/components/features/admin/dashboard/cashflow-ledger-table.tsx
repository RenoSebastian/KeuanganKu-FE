import React from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileText, User as UserIcon } from 'lucide-react';
import { CashflowLedgerItem, PaginationMeta, CashflowStatus } from '@/lib/types/dashboard';
import { formatCurrency } from '@/lib/formatters';

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

    // Helper Format Waktu
    const formatLocalTime = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Helper Visual Badge
    const renderStatusBadge = (status: CashflowStatus) => {
        switch (status) {
            case 'VERIFIED': return <Badge variant="default" className="bg-emerald-600 border-none shadow-sm hover:bg-emerald-700">Verified</Badge>;
            case 'PENDING': return <Badge variant="outline" className="text-amber-600 border-amber-600 bg-amber-50">Pending</Badge>;
            case 'REJECTED': return <Badge variant="danger" className="bg-red-500 shadow-sm border-none">Rejected</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 p-5">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-slate-500" />
                    Buku Besar Arus Kas (Ledger)
                </CardTitle>
                <CardDescription>Riwayat mutasi masuk transaksi paket berlangganan</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-5">

                {/* [PHASE 4] DESKTOP VIEW: STANDARD TABLE */}
                <div className="hidden md:block rounded-xl border border-slate-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow>
                                <TableHead className="font-bold text-slate-600">Waktu Transaksi</TableHead>
                                <TableHead className="font-bold text-slate-600">Pelanggan</TableHead>
                                <TableHead className="font-bold text-slate-600">Paket</TableHead>
                                <TableHead className="font-bold text-slate-600 text-center">Status</TableHead>
                                <TableHead className="font-bold text-slate-600 text-center">PIC Admin</TableHead>
                                <TableHead className="font-bold text-slate-600 text-right">Nominal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                                        Memuat data mutasi...
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                                        Belum ada riwayat transaksi yang tercatat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => (
                                    <TableRow key={item.transactionId} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="whitespace-nowrap text-xs text-slate-500 font-medium">
                                            {formatLocalTime(item.transactionDate)}
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-800">
                                            {item.userName}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200 uppercase">
                                                {item.planName}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">{renderStatusBadge(item.status)}</TableCell>
                                        <TableCell className="text-xs text-center text-slate-400 font-medium">
                                            {item.verifiedBy || '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold text-slate-800">
                                            {formatCurrency(item.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* [PHASE 4] MOBILE VIEW: PWA CARD LIST */}
                <div className="md:hidden flex flex-col divide-y divide-slate-100">
                    {isLoading ? (
                        <div className="p-8 text-center text-sm text-slate-400">Memuat data mutasi...</div>
                    ) : data.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400">Belum ada riwayat transaksi.</div>
                    ) : (
                        data.map((item) => (
                            <div key={item.transactionId} className="p-4 bg-white active:bg-slate-50 transition-colors flex flex-col gap-3">
                                {/* Top Row: Identity & Status */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                            <UserIcon className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800 line-clamp-1">{item.userName}</span>
                                            <span className="text-[10px] font-medium text-slate-500">{formatLocalTime(item.transactionDate)}</span>
                                        </div>
                                    </div>
                                    {renderStatusBadge(item.status)}
                                </div>

                                {/* Bottom Row: Plan & Price */}
                                <div className="flex items-end justify-between mt-1 border-t border-slate-50 pt-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Plan / Paket</span>
                                        <Badge variant="outline" className="w-fit text-[10px] bg-slate-50 text-slate-600 border-slate-200 uppercase">
                                            {item.planName}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nominal Tagihan</span>
                                        <span className="font-mono font-bold text-slate-800 text-sm">
                                            {formatCurrency(item.amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Kontrol Paginasi (Unified for both Desktop & Mobile) */}
                {meta && meta.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-0 sm:pt-4 border-t sm:border-t-0 border-slate-100 gap-4">
                        <div className="text-xs font-medium text-slate-500 order-2 sm:order-1">
                            Halaman <span className="font-bold text-slate-700">{meta.page}</span> dari {meta.totalPages} ({meta.total} transaksi)
                        </div>
                        <div className="flex space-x-2 w-full sm:w-auto order-1 sm:order-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg h-9"
                                onClick={() => onPageChange(meta.page - 1)}
                                disabled={meta.page <= 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg h-9"
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