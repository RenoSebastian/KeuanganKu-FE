'use client';

import { useState, useEffect } from 'react';
import { Loader2, Timer, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
// [FIX] Hanya mengimpor InputOTP karena Group dan Slot sudah ditangani di dalamnya secara internal
import { InputOTP } from '@/components/ui/input-otp';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

type VerifyResetOtpFormProps = {
    email: string;
    onSuccess: (token: string) => void;
    onBack: () => void;
};

export default function VerifyResetOtpForm({
    email,
    onSuccess,
    onBack,
}: VerifyResetOtpFormProps) {
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // Timer state (300 detik = 5 menit sesuai TTL di Backend)
    const [timeLeft, setTimeLeft] = useState(300);

    // Logika Hitung Mundur
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVerify = async (otpValue: string) => {
        // Komponen InputOTP Anda default-nya 6 digit
        if (otpValue.length !== 6) return;

        setIsVerifying(true);
        try {
            const response = await authService.verifyPasswordResetOtp({
                email,
                otp: otpValue,
            });

            toast.success('Verifikasi Berhasil', {
                description: 'Identitas Anda telah tervalidasi.',
            });

            onSuccess(response.reset_token);
        } catch (error: any) {
            toast.error('Verifikasi Gagal', {
                description: error.response?.data?.message || 'Kode OTP salah atau kedaluwarsa.',
            });
            setOtp(''); // Reset input jika salah
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await authService.requestPasswordReset({ email });
            toast.success('OTP Baru Dikirim', {
                description: 'Silakan periksa kotak masuk email Anda kembali.',
            });
            setTimeLeft(300); // Reset timer
            setOtp('');      // Clear input lama
        } catch (error: any) {
            toast.error('Gagal mengirim ulang', {
                description: 'Terlalu banyak permintaan. Harap tunggu sebentar.',
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2 text-center md:text-left">
                <h2 className="text-xl font-semibold text-slate-900">Verifikasi OTP</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Kami telah mengirimkan kode 6-digit ke <span className="font-semibold text-slate-900">{email}</span>.
                </p>
            </div>

            <div className="flex flex-col items-center justify-center space-y-6 py-4">
                {/* [FIX] Penggunaan Komponen Sesuai Implementasi UI Anda:
            Komponen ini sudah menangani mapping slot dan separator secara otomatis.
        */}
                <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(val) => {
                        setOtp(val);
                        if (val.length === 6) handleVerify(val);
                    }}
                    disabled={isVerifying}
                    autoFocus
                />

                <div className="flex flex-col items-center gap-2">
                    {timeLeft > 0 ? (
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <Timer className="w-4 h-4 text-blue-500" />
                            Kode berlaku hingga <span className="text-blue-600 font-bold">{formatTime(timeLeft)}</span>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50"
                            onClick={handleResend}
                            disabled={isResending}
                        >
                            {isResending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <RotateCcw className="w-4 h-4 mr-2" />
                            )}
                            Kirim Ulang Kode
                        </Button>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
                <Button
                    variant="ghost"
                    className="w-full text-slate-500 hover:text-slate-800"
                    onClick={onBack}
                    disabled={isVerifying}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Ganti Email
                </Button>
            </div>
        </div>
    );
}