"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, Inbox, Loader2 } from "lucide-react";
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
    user: {
        fullName: string;
        email: string;
    };
    plan: {
        name: string;
    };
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
    }, []);

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

    return (
        <>
            <Card className="border-slate-100 shadow-sm flex flex-col h-full">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            Antrean Verifikasi
                            {orders.length > 0 && (
                                <Badge variant="danger" className="animate-pulse px-1.5 h-5 flex justify-center items-center">
                                    {orders.length}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="text-xs">Konfirmasi pembayaran SaaS</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative">
                    {/* FIX: h-87.5 is 350px */}
                    <ScrollArea className="h-87.5">
                        {isLoading ? (
                            <div className="p-5 flex justify-center items-center h-full text-slate-400">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memuat...
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                    <Inbox className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-800">Clear!</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-50">
                                    Semua pembayaran telah diverifikasi.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {orders.map((order) => (
                                    <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-slate-800 truncate pr-2">{order.user.fullName}</h4>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatLocalTime(order.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2 items-center">
                                                <Badge variant="outline" className="text-[10px] bg-blue-50/50">{order.plan.name}</Badge>
                                                <span className="text-xs font-semibold">{formatCurrency(order.snapshotPrice)}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenModal(order, 'VIEW')}><Eye className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" onClick={() => handleOpenModal(order, 'APPROVE')}><CheckCircle className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => handleOpenModal(order, 'REJECT')}><XCircle className="h-4 w-4" /></Button>
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
                {/* FIX: sm:max-w-106.25 is 425px */}
                <DialogContent className="sm:max-w-106.25">
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'VIEW' && 'Bukti Bayar'}
                            {actionType === 'APPROVE' && 'Konfirmasi Setuju'}
                            {actionType === 'REJECT' && 'Konfirmasi Tolak'}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="my-4 p-1 border rounded bg-slate-50 flex justify-center min-h-50">
                            <img
                                src={selectedOrder.proofImageUrl}
                                alt="Receipt"
                                className="max-h-75 object-contain rounded"
                                onError={(e) => (e.currentTarget.src = '/images/placeholder-receipt.png')}
                            />
                        </div>
                    )}

                    {actionType === 'REJECT' && (
                        <Textarea
                            placeholder="Alasan penolakan..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="mt-2"
                        />
                    )}

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>Batal</Button>
                        {actionType !== 'VIEW' && (
                            <Button
                                variant={actionType === 'APPROVE' ? 'default' : 'destructive'}
                                onClick={handleVerifyOrder}
                                disabled={isSubmitting || (actionType === 'REJECT' && !adminNotes)}
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