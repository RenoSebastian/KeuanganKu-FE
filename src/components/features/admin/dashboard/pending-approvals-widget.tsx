"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, Inbox, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatters";
import { subscriptionService } from "@/services/subscription.service";

interface PendingApprovalsWidgetProps {
    onActionComplete: () => void;
}

interface PendingOrder {
    id: string;
    proofImageUrl: string;
    snapshotPrice: number;
    createdAt: string;
    user: { fullName: string; email: string; };
    plan: { name: string; };
}

export const PendingApprovalsWidget: React.FC<PendingApprovalsWidgetProps> = ({ onActionComplete }) => {
    const [orders, setOrders] = useState<PendingOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
    const [actionType, setActionType] = useState<'VIEW' | 'APPROVE' | 'REJECT' | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPendingOrders = async () => {
        try {
            setIsLoading(true);
            const data = await subscriptionService.getPendingOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat antrean verifikasi");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingOrders();
        const handleRefresh = () => {
            fetchPendingOrders();
            onActionComplete();
        }
        window.addEventListener('REFRESH_ADMIN_DASHBOARD', handleRefresh);
        return () => { window.removeEventListener('REFRESH_ADMIN_DASHBOARD', handleRefresh); }
    }, [onActionComplete]);

    const formatLocalTime = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleVerifyOrder = async () => {
        if (!selectedOrder || !actionType || actionType === 'VIEW') return;
        if (actionType === 'REJECT' && !adminNotes.trim()) {
            toast.error("Alasan penolakan wajib diisi");
            return;
        }

        try {
            setIsSubmitting(true);
            await subscriptionService.verifyOrder({
                orderId: selectedOrder.id,
                status: actionType === 'APPROVE' ? 'VALID' : 'INVALID',
                adminNotes: actionType === 'REJECT' ? adminNotes : 'Verified via Dashboard',
            });

            toast.success(`Berhasil memproses pembayaran ${selectedOrder.user.fullName}`);
            handleCloseModal();
            await fetchPendingOrders();
            onActionComplete();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Gagal memverifikasi transaksi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenModal = (order: PendingOrder, type: 'VIEW' | 'APPROVE' | 'REJECT') => {
        setSelectedOrder(order);
        setActionType(type);
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setActionType(null);
        setAdminNotes('');
    };

    // [PHASE 2 FIX] Agregasi data yang sebelumnya ada di KPI Card
    const totalPendingValue = orders.reduce((sum, order) => sum + Number(order.snapshotPrice), 0);

    return (
        <>
            <Card className="border-amber-200 bg-white shadow-sm flex flex-col h-full rounded-2xl overflow-hidden">
                {/* Visual Treatment yang lebih menonjol (Menggantikan KPI Orange) */}
                <div className="bg-amber-50/50 p-4 border-b border-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            Antrean Verifikasi
                        </CardTitle>
                        <CardDescription className="text-xs mt-1 text-amber-700/70">
                            Konfirmasi pembayaran SaaS yang menunggu tindakan.
                        </CardDescription>
                    </div>
                    {orders.length > 0 && (
                        <div className="text-right">
                            <div className="text-lg font-black text-amber-600">
                                {formatCurrency(totalPendingValue)}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                                {orders.length} Transaksi Pending
                            </div>
                        </div>
                    )}
                </div>

                <CardContent className="p-0 flex-1 relative">
                    <ScrollArea className="h-[350px]">
                        {isLoading ? (
                            <div className="p-5 flex justify-center items-center h-full text-slate-400">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memuat antrean...
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                    <Inbox className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-800">Clear!</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                                    Semua antrean pembayaran telah diverifikasi.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {orders.map((order) => (
                                    <div key={order.id} className="p-4 hover:bg-amber-50/30 transition-colors flex flex-col gap-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{order.user.fullName}</h4>
                                                <span className="text-[10px] font-medium text-slate-400">{formatLocalTime(order.createdAt)}</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-700">{formatCurrency(order.snapshotPrice)}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                                                {order.plan.name}
                                            </Badge>
                                            <div className="flex gap-1.5">
                                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs text-slate-600" onClick={() => handleOpenModal(order, 'VIEW')}><Eye className="h-3 w-3 mr-1" /> Cek</Button>
                                                <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleOpenModal(order, 'APPROVE')}><CheckCircle className="h-4 w-4" /></Button>
                                                <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleOpenModal(order, 'REJECT')}><XCircle className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            <Dialog open={!!actionType} onOpenChange={(open) => !open && handleCloseModal()}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'VIEW' && 'Bukti Bayar'}
                            {actionType === 'APPROVE' && 'Konfirmasi Setuju'}
                            {actionType === 'REJECT' && 'Konfirmasi Tolak'}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="my-4 p-1 border border-slate-200 rounded-lg bg-slate-50 flex justify-center min-h-[200px] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={selectedOrder.proofImageUrl}
                                alt="Receipt"
                                className="max-h-[300px] object-contain rounded"
                                onError={(e) => (e.currentTarget.src = '/images/placeholder-receipt.png')}
                            />
                        </div>
                    )}

                    {actionType === 'REJECT' && (
                        <Textarea
                            placeholder="Alasan penolakan wajib diisi..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="mt-2 resize-none"
                        />
                    )}

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>Batal</Button>
                        {actionType !== 'VIEW' && (
                            <Button
                                variant={actionType === 'APPROVE' ? 'default' : 'destructive'}
                                onClick={handleVerifyOrder}
                                disabled={isSubmitting || (actionType === 'REJECT' && !adminNotes)}
                                className={actionType === 'APPROVE' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Konfirmasi
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};