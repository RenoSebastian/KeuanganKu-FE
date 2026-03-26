'use client';

import { useState } from 'react';
import { ShieldAlert, Loader2, MailWarning } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

type TriggerResetModalProps = {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userEmail: string;
    userName: string;
};

export default function TriggerResetModal({
    isOpen,
    onClose,
    userId,
    userEmail,
    userName,
}: TriggerResetModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleTriggerReset = async () => {
        setIsProcessing(true);
        try {
            // Eksekusi API endpoint /admin/users/:id/trigger-reset
            await adminService.triggerPasswordResetAction(userId);

            toast.success('Instruksi berhasil dikirim', {
                description: `OTP pemulihan telah dikirimkan ke kotak masuk ${userEmail}.`,
            });
            onClose();
        } catch (error: any) {
            toast.error('Gagal mengirim instruksi', {
                description: error.response?.data?.message || 'Terjadi kesalahan sistem internal.',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && onClose()}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <DialogTitle>Reset Akses Pengguna</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-600 leading-relaxed pt-2">
                        Anda akan memicu siklus pengaturan ulang kata sandi untuk agen <strong>{userName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                {/* Edukasi Keamanan (Zero-Knowledge Context) */}
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex gap-3 text-sm text-slate-700">
                    <MailWarning className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <p>
                        Sesuai standar keamanan, administrator tidak dapat menentukan kata sandi secara manual.
                        Sistem akan mengirimkan email berisi <strong>kode OTP 6-digit</strong> ke <span className="font-semibold text-slate-900">{userEmail}</span> agar agen dapat membuat sandi baru secara mandiri.
                    </p>
                </div>

                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="default"
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={handleTriggerReset}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mengirim OTP...
                            </>
                        ) : (
                            'Kirim Instruksi Reset'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}