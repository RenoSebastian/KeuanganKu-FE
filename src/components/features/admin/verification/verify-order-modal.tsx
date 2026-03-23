import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';

import { PendingOrder, VerificationStatus } from '@/lib/types/subscription';
import { subscriptionService } from '@/services/subscription.service';
import { getImageUrl } from '@/utils/image-resolver';
import { parseDecimal } from '@/lib/formatters';

import { ImageLightbox } from '@/components/shared/image-lightbox';

interface VerifyOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: PendingOrder | null;
    onSuccess: () => void;
}

export function VerifyOrderModal({ isOpen, onClose, order, onSuccess }: VerifyOrderModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [showLightbox, setShowLightbox] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAdminNotes('');
            setShowLightbox(false);
        }
    }, [isOpen, order]);

    const handleVerify = async (status: VerificationStatus) => {
        if (!order) return;
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
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan sistem saat memproses verifikasi.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!order) return null;

    const trueCalculatedPrice = parseDecimal(order.snapshotPrice);
    const duration = order.plan?.durationMonths && order.plan.durationMonths > 0 ? order.plan.durationMonths : 1;
    const basePrice = order.plan?.price ? parseDecimal(order.plan.price) : (trueCalculatedPrice / duration);
    const expectedTransferAmount = trueCalculatedPrice + Number(order.uniqueCode || 0);
    const safeImageUrl = getImageUrl(order.proofImageUrl);

    // [NEW] Siapkan data konteks untuk dikirim ke Lightbox HUD
    const formattedAmount = `Rp ${expectedTransferAmount.toLocaleString('id-ID')}`;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
                {/* [MODIFIED] [CRITICAL] Penanganan Interaksi Latar Belakang & Escape Key
                  - onEscapeKeyDown: Jika lightbox terbuka, blokir agar Radix Dialog (Modal Utama) tidak ikut tertutup.
                  - onPointerDownOutside: Cegah penutupan modal utama jika klik di luar area modal utama (karena bisa jadi klik di luar Lightbox).
                */}
                <DialogContent
                    className="max-w-3xl"
                    onEscapeKeyDown={(e) => {
                        if (showLightbox) {
                            e.preventDefault(); // Mencegah Modal Utama tertutup
                        }
                    }}
                    onPointerDownOutside={(e) => {
                        if (showLightbox) {
                            e.preventDefault(); // Mencegah Modal Utama tertutup jika klik di backdrop Lightbox
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Verifikasi Pembayaran</DialogTitle>
                        <DialogDescription>
                            Pastikan nominal pada bukti transfer sesuai dengan tagihan sistem.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="flex flex-col space-y-3">
                            <h4 className="text-sm font-semibold text-slate-700">Bukti Transfer</h4>

                            <div
                                className="relative w-full h-64 bg-slate-100 rounded-md border flex items-center justify-center overflow-hidden cursor-pointer group"
                                onClick={() => setShowLightbox(true)}
                                role="button"
                                aria-label={`Perbesar bukti transfer dari ${order.user.fullName}`}
                            >
                                <img
                                    src={safeImageUrl}
                                    alt="Bukti Transfer"
                                    className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/placeholder-image.png';
                                    }}
                                />

                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-2 backdrop-blur-[2px]">
                                    <ZoomIn className="w-8 h-8 drop-shadow-md" />
                                    <span className="text-sm font-medium drop-shadow-md">Klik untuk Perbesar Interaktif</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 text-center">
                                Gunakan mouse wheel (Desktop) atau pinch (Mobile) untuk zoom. Drag untuk geser.
                            </p>
                        </div>

                        <div className="flex flex-col space-y-4">
                            <div className="bg-slate-50 p-4 rounded-md border text-sm space-y-3">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-slate-500">Pengguna</span>
                                    <span className="font-medium text-right">{order.user.fullName}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-slate-500">Paket Akses</span>
                                    <span className="font-medium text-right">
                                        {order.plan.name} <span className="text-slate-400">({duration} bln)</span>
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-slate-500">Harga Base (Per Bulan)</span>
                                    <span className="font-medium">Rp {basePrice.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-slate-500">Total Harga Tier ({duration} bln)</span>
                                    <span className="font-medium text-indigo-700">Rp {trueCalculatedPrice.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-slate-500">Kode Unik</span>
                                    <span className="font-medium text-orange-600">+{order.uniqueCode || 0}</span>
                                </div>
                                <div className="flex justify-between pt-2 items-center">
                                    <span className="text-slate-700 font-bold">Harus Ditransfer</span>
                                    <span className="font-bold text-lg text-emerald-600">
                                        Rp {expectedTransferAmount.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 grow">
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleVerify('VALID')}
                            disabled={isLoading}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Setujui
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ImageLightbox
                isOpen={showLightbox}
                onClose={() => setShowLightbox(false)}
                imageUrl={safeImageUrl}
                altText={`Bukti Transfer dari ${order.user.fullName}`}
                // [NEW] Pengiriman Konteks Data ke HUD Lightbox
                context={{
                    userName: order.user.fullName,
                    amountToTransfer: formattedAmount
                }}
            />
        </>
    );
}