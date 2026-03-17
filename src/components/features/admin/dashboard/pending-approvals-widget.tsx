"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Inbox, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

import { formatCurrency } from "@/lib/formatters";
import { subscriptionService } from "@/services/subscription.service";
import { PendingOrder } from "@/lib/types/subscription";
import { VerifyOrderModal } from "../verification/verify-order-modal";

interface PendingApprovalsWidgetProps {
    onActionComplete: () => void;
}

export const PendingApprovalsWidget: React.FC<PendingApprovalsWidgetProps> = ({ onActionComplete }) => {
    const router = useRouter();
    const [orders, setOrders] = useState<PendingOrder[]>([]);
    const [totalPendingAmount, setTotalPendingAmount] = useState(0);
    const [totalQueueCount, setTotalQueueCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);

    const fetchPendingOrders = async () => {
        try {
            setIsLoading(true);
            const response = await subscriptionService.getPendingOrders(1, 5);
            setOrders(response.data);
            setTotalQueueCount(response.meta.total);

            // Kalkulasi ulang Gross Pending menggunakan durasi tier (Information Expert)
            const aggregateAmount = response.data.reduce((sum, order) => {
                const basePrice = Number(order.plan.price);
                const duration = order.plan.durationMonths && order.plan.durationMonths > 0 ? order.plan.durationMonths : 1;
                return sum + (basePrice * duration);
            }, 0);

            setTotalPendingAmount(aggregateAmount);

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
        };
        window.addEventListener('REFRESH_ADMIN_DASHBOARD', handleRefresh);
        return () => { window.removeEventListener('REFRESH_ADMIN_DASHBOARD', handleRefresh); };
    }, [onActionComplete]);

    const formatLocalTime = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleRowClick = (order: PendingOrder) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    return (
        <>
            <Card className="border-amber-200 bg-white shadow-sm flex flex-col h-full rounded-2xl overflow-hidden">
                <div className="bg-amber-50/50 p-4 border-b border-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            Antrean Verifikasi
                        </CardTitle>
                        <CardDescription className="text-xs mt-1 text-amber-700/70">
                            Konfirmasi pembayaran yang menunggu tindakan.
                        </CardDescription>
                    </div>
                    {totalQueueCount > 0 && (
                        <div className="text-right">
                            <div className="text-lg font-black text-amber-600">
                                {formatCurrency(totalPendingAmount)}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                                {totalQueueCount} Transaksi Tertunda
                            </div>
                        </div>
                    )}
                </div>

                <CardContent className="p-0 flex-1 relative flex flex-col">
                    <ScrollArea className="flex-1 min-h-[280px]">
                        {isLoading ? (
                            <div className="p-5 flex justify-center items-center h-full text-slate-400 min-h-[200px]">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memuat antrean...
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
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
                                {orders.map((order) => {
                                    // Dinamis Kalkulasi
                                    const basePrice = Number(order.plan.price);
                                    const duration = order.plan.durationMonths && order.plan.durationMonths > 0 ? order.plan.durationMonths : 1;
                                    const trueTotal = basePrice * duration;

                                    return (
                                        <div
                                            key={order.id}
                                            className="p-4 hover:bg-amber-50/50 transition-colors flex flex-col gap-3 cursor-pointer group"
                                            onClick={() => handleRowClick(order)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-amber-700 transition-colors">
                                                        {order.user.fullName}
                                                    </h4>
                                                    <span className="text-[10px] font-medium text-slate-400">{formatLocalTime(order.createdAt)}</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-700">
                                                    {formatCurrency(trueTotal + Number(order.uniqueCode || 0))}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                                                    {order.plan.name} ({duration} bln)
                                                </Badge>
                                                <span className="text-xs font-semibold text-amber-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Verifikasi <ArrowRight className="w-3 h-3 ml-1" />
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>

                    {totalQueueCount > 5 && (
                        <div className="p-3 border-t bg-slate-50/50 text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-slate-500 hover:text-amber-700"
                                onClick={() => router.push('/admin/verification')}
                            >
                                Lihat Semua Antrean ({totalQueueCount})
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <VerifyOrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
                onSuccess={() => { fetchPendingOrders(); onActionComplete(); }}
            />
        </>
    );
};