// File: src/components/features/admin/verification/verify-order-modal.tsx

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { PendingOrder, VerificationStatus } from '@/lib/types/subscription';
import { subscriptionService } from '@/services/subscription.service';

interface VerifyOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: PendingOrder | null;
    /** Callback yang dieksekusi ketika verifikasi sukses, agar Parent me-refetch data */
    onSuccess: () => void;
}

export function VerifyOrderModal({ isOpen, onClose, order, onSuccess }: VerifyOrderModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    // Reset catatan setiap kali modal dibuka untuk order yang berbeda
    useEffect(() => {
        if (isOpen) {
            setAdminNotes('');
        }
    }, [isOpen, order]);

    const handleVerify = async (status: VerificationStatus) => {
        if (!order) return;

        // Validasi keamanan: Menolak wajib menyertakan alasan
        if (status === 'INVALID' && !adminNotes.trim()) {
            toast.error('Catatan admin wajib diisi sebagai alasan penolakan.');
            return;
        }

        setIsLoading(true);
        try {
            await subscriptionService.verifyOrder({
                orderId: order.id,
                status,
                adminNotes
            });

            toast.success(`Pembayaran berhasil ${status === 'VALID' ? 'disetujui' : 'ditolak'}.`);
            onSuccess(); // Trigger parent (Widget / Table) untuk refresh data
            onClose();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Terjadi kesalahan sistem saat memproses verifikasi.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!order) return null;

    // Menghitung total mutasi yang harus dicek oleh admin di rekening
    const expectedTransferAmount = Number(order.snapshotPrice) + Number(order.uniqueCode);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Verifikasi Pembayaran</DialogTitle>
                    <DialogDescription>
                        Pastikan nominal pada bukti transfer sesuai dengan tagihan sistem.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Left Column: Tampilan Bukti Transfer */}
                    <div className="flex flex-col space-y-3">
                        <h4 className="text-sm font-semibold text-slate-700">Bukti Transfer</h4>
                        <div className="relative w-full h-64 bg-slate-100 rounded-md border flex items-center justify-center overflow-hidden">
                            <img
                                src={order.proofImageUrl}
                                alt="Bukti Transfer"
                                className="object-contain w-full h-full"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/placeholder-image.png';
                                }}
                            />
                        </div>
                        <a
                            href={order.proofImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline w-fit"
                        >
                            <ExternalLink className="w-4 h-4 mr-1.5" />
                            Buka di tab baru
                        </a>
                    </div>

                    {/* Right Column: Rincian Order & Keputusan */}
                    <div className="flex flex-col space-y-4">
                        <div className="bg-slate-50 p-4 rounded-md border text-sm space-y-3">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-slate-500">Pengguna</span>
                                <span className="font-medium text-right">{order.user.fullName}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-slate-500">Email</span>
                                <span className="font-medium text-right">{order.user.email}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-slate-500">Paket Akses</span>
                                <span className="font-medium text-right">
                                    {order.plan.name} <span className="text-slate-400">({order.plan.durationMonths} bln)</span>
                                </span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-slate-500">Harga Paket (Total)</span>
                                <span className="font-medium">Rp {Number(order.snapshotPrice).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-slate-500">Kode Unik</span>
                                <span className="font-medium text-orange-600">+{order.uniqueCode}</span>
                            </div>
                            <div className="flex justify-between pt-2 items-center">
                                <span className="text-slate-700 font-bold">Harus Ditransfer</span>
                                <span className="font-bold text-lg text-green-600">
                                    Rp {expectedTransferAmount.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 flex-grow">
                            <label htmlFor="adminNotes" className="text-sm font-semibold text-slate-700">
                                Catatan Admin <span className="text-slate-400 font-normal">(Opsional jika setuju)</span>
                            </label>
                            <Textarea
                                id="adminNotes"
                                placeholder="Tulis alasan jika menolak bukti transfer..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                disabled={isLoading}
                                className="resize-none h-24"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:justify-end border-t pt-4">
                    <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleVerify('INVALID')}
                        disabled={isLoading}
                    >
                        <XCircle className="w-4 h-4 mr-2" />
                        Tolak
                    </Button>
                    <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleVerify('VALID')}
                        disabled={isLoading}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Setujui
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}