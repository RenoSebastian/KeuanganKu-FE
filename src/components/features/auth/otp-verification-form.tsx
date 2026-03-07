"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InputOTP } from "@/components/ui/input-otp";
import { OtpTimer } from "@/components/ui/otp-timer";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

interface OtpVerificationFormProps {
    email: string;
    onBack: () => void; // Memungkinkan user kembali jika salah ketik email
}

export function OtpVerificationForm({ email, onBack }: OtpVerificationFormProps) {
    const router = useRouter();

    // State Management
    const [otpCode, setOtpCode] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [isResending, setIsResending] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    // Timer State (Untuk logic Cooldown Resend)
    const [canResend, setCanResend] = React.useState(false);
    const [timerResetKey, setTimerResetKey] = React.useState(0);

    // ============================================================================
    // LOGIC: VERIFIKASI OTP
    // ============================================================================
    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        // Guard: Pastikan input persis 6 digit sebelum memanggil jaringan (Efisiensi I/O)
        if (otpCode.length !== 6) {
            setErrorMsg("Kode OTP harus terdiri dari 6 angka.");
            return;
        }

        setIsLoading(true);
        try {
            // Pendelegasian ke layer Service
            await authService.verifyOtp({ email, otpCode });

            toast.success("Verifikasi Berhasil", {
                description: "Akun Anda telah aktif. Mengalihkan ke dashboard...",
            });

            // UX Transition: Langsung arahkan ke Dashboard (Auto-Login sukses)
            router.push("/dashboard");
            router.refresh(); // Memastikan state server/layout ter-update

        } catch (error: any) {
            // Ekstraksi pesan galat (Error Parsing)
            const message = error.response?.data?.message || "Terjadi kesalahan sistem. Silakan coba lagi.";
            setErrorMsg(message);

            // Kosongkan input agar user bisa langsung mengetik ulang
            setOtpCode("");
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================================================
    // LOGIC: KIRIM ULANG OTP (RESEND)
    // ============================================================================
    const handleResend = async () => {
        if (!canResend) return;

        setIsResending(true);
        setErrorMsg(null);

        try {
            await authService.resendOtp({ email });

            toast.success("OTP Terkirim", {
                description: "Kode verifikasi telah dikirim ulang ke email Anda.",
            });

            // Reset State & Visual Timer
            setCanResend(false);
            setTimerResetKey((prev) => prev + 1);
            setOtpCode(""); // Bersihkan input lama

        } catch (error: any) {
            const message = error.response?.data?.message || "Gagal mengirim ulang OTP.";
            toast.error("Gagal", { description: message });
            // Jika Backend melempar error Hard Limit (Max Resend), kita tampilkan pesannya.
            setErrorMsg(message);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex flex-col space-y-6 w-full max-w-sm mx-auto">
            {/* Header Visual & UX Indicator */}
            <div className="flex flex-col items-center text-center space-y-2">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <Mail className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Cek Email Anda</h2>
                <p className="text-sm text-muted-foreground">
                    Kami telah mengirimkan 6 digit kode verifikasi ke <br />
                    <span className="font-semibold text-foreground">{email}</span>
                </p>
            </div>

            {/* Form Verifikasi Utama */}
            <form onSubmit={handleVerify} className="flex flex-col space-y-4 pt-4">
                <div className="flex justify-center">
                    <InputOTP
                        value={otpCode}
                        onChange={setOtpCode}
                        disabled={isLoading}
                        maxLength={6}
                        autoFocus
                    />
                </div>

                {/* Notifikasi Galat Tingkat Form */}
                {errorMsg && (
                    <p className="text-sm font-medium text-destructive text-center animate-in fade-in slide-in-from-top-1">
                        {errorMsg}
                    </p>
                )}

                <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={isLoading || otpCode.length !== 6}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memverifikasi...
                        </>
                    ) : (
                        "Verifikasi & Lanjutkan"
                    )}
                </Button>
            </form>

            {/* Controller Navigasi & Kirim Ulang (Resend) */}
            <div className="flex flex-col items-center space-y-4 pt-2">
                <div className="text-sm text-center">
                    {canResend ? (
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Tidak menerima kode?</span>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isResending}
                                className="font-medium text-primary hover:underline focus:outline-none disabled:opacity-50"
                            >
                                {isResending ? "Mengirim..." : "Kirim Ulang"}
                            </button>
                        </div>
                    ) : (
                        <div className="text-muted-foreground flex items-center gap-1">
                            Mohon tunggu <OtpTimer initialSeconds={60} onExpire={() => setCanResend(true)} resetKey={timerResetKey} className="text-foreground" /> detik untuk kirim ulang.
                        </div>
                    )}
                </div>

                {/* Opsi kembali untuk membatalkan/mengganti email */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    disabled={isLoading}
                    className="text-muted-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ganti email
                </Button>
            </div>
        </div>
    );
}