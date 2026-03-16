import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

    // Local helper untuk format tanggal agar tidak bergantung pada file eksternal yang belum siap
    const formatLocalTime = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Fungsi bantuan untuk rendering badge warna berdasarkan status transaksi
    const renderStatusBadge = (status: CashflowStatus) => {
        switch (status) {
            case 'VERIFIED':
                return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Verified</Badge>;
            case 'PENDING':
                return <Badge variant="outline" className="text-orange-600 border-orange-600">Pending</Badge>;
            case 'REJECTED':
                return <Badge variant="danger">Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Buku Besar Arus Kas (Ledger)</CardTitle>
                <CardDescription>Riwayat mutasi masuk transaksi paket berlangganan</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>User / Pelanggan</TableHead>
                                <TableHead>Paket (Plan)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>PIC Admin</TableHead>
                                <TableHead className="text-right">Nominal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Memuat data mutasi...
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Belum ada riwayat transaksi yang tercatat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => (
                                    <TableRow key={item.transactionId}>
                                        <TableCell className="whitespace-nowrap">
                                            {formatLocalTime(item.transactionDate)}
                                        </TableCell>
                                        <TableCell className="font-medium">{item.userName}</TableCell>
                                        <TableCell>{item.planName}</TableCell>
                                        <TableCell>{renderStatusBadge(item.status)}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {item.verifiedBy || '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(item.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Kontrol Paginasi */}
                {meta.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Menampilkan halaman {meta.page} dari {meta.totalPages} ({meta.total} transaksi)
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(meta.page - 1)}
                                disabled={meta.page <= 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
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