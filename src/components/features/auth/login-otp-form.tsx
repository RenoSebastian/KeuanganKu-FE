"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InputOTP } from "@/components/ui/input-otp";
import { OtpTimer } from "@/components/ui/otp-timer";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";

interface LoginOtpFormProps {
    email: string;
    onBack: () => void;
}

export function LoginOtpForm({ email, onBack }: LoginOtpFormProps) {
    const router = useRouter();

    const [otpCode, setOtpCode] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [isResending, setIsResending] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    const [canResend, setCanResend] = React.useState(false);
    const [timerResetKey, setTimerResetKey] = React.useState(0);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (otpCode.length !== 6) {
            setErrorMsg("Kode keamanan harus terdiri dari 6 angka.");
            return;
        }

        setIsLoading(true);
        try {
            // [API CALL] Menggunakan endpoint Verify spesifik Login (Phase 3)
            await authService.verifyLoginOtp({ email, otpCode });

            toast.success("Otentikasi Berhasil", {
                description: "Sesi aman terbentuk. Mengalihkan ke portal...",
            });

            // Redirect ke dashboard setelah cookies & local storage tersimpan di Service
            router.push("/dashboard");
            router.refresh();

        } catch (error: any) {
            const message = error.response?.data?.message || "Kode keamanan tidak valid atau telah kedaluwarsa.";
            setErrorMsg(message);
            setOtpCode(""); // Kosongkan input agar pengguna bisa langsung mengetik ulang
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setIsResending(true);
        setErrorMsg(null);

        try {
            // [API CALL] Menggunakan endpoint Resend spesifik Login
            await authService.resendLoginOtp({ email });

            toast.success("Kode Baru Terkirim", {
                description: "Silakan periksa kembali kotak masuk email Anda.",
            });

            setCanResend(false);
            setTimerResetKey((prev) => prev + 1); // Me-reset komponen OtpTimer
            setOtpCode("");

        } catch (error: any) {
            const message = error.response?.data?.message || "Gagal mengirim ulang kode keamanan.";
            toast.error("Gagal", { description: message });
            setErrorMsg(message);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-500">

            {/* Header Visual: Menggunakan Shield untuk penekanan Keamanan (2FA) */}
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-xl animate-pulse" />
                    <div className="h-16 w-16 bg-white border-2 border-blue-100 rounded-full flex items-center justify-center relative shadow-sm">
                        <ShieldCheck className="h-7 w-7 text-blue-600" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verifikasi 2 Langkah</h2>
                    <p className="text-[14px] text-slate-500 leading-relaxed px-4">
                        Kami telah mengirimkan 6 digit kode keamanan ke <br />
                        <span className="font-bold text-slate-900">{email}</span>
                    </p>
                </div>
            </div>

            {/* Form Area */}
            <form onSubmit={handleVerify} className="flex flex-col flex-1 space-y-6">
                <div className="flex flex-col items-center space-y-2">
                    <InputOTP
                        value={otpCode}
                        onChange={setOtpCode}
                        disabled={isLoading}
                        maxLength={6}
                        autoFocus
                    />
                    {errorMsg && (
                        <p className="text-[13px] font-bold text-red-500 mt-2 animate-in slide-in-from-top-1 text-center">
                            {errorMsg}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                    disabled={isLoading || otpCode.length !== 6}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Memverifikasi Sesi...
                        </span>
                    ) : (
                        "Verifikasi & Masuk"
                    )}
                </Button>
            </form>

            {/* Footer / Navigasi Action */}
            <div className="flex flex-col items-center space-y-5 pt-8 mt-auto border-t border-slate-100">
                <div className="text-[13px] text-center font-medium">
                    {canResend ? (
                        <div className="flex items-center gap-1.5 justify-center">
                            <span className="text-slate-500">Tidak menerima kode?</span>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isResending}
                                className="font-bold text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                            >
                                {isResending ? "Mengirim..." : "Kirim Ulang"}
                            </button>
                        </div>
                    ) : (
                        <div className="text-slate-500 flex items-center justify-center gap-1.5">
                            Kirim ulang kode dalam <OtpTimer initialSeconds={60} onExpire={() => setCanResend(true)} resetKey={timerResetKey} className="font-bold text-slate-800" /> detik
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke form sandi
                </button>
            </div>
        </div>
    );
}