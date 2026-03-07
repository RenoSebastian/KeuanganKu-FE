"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { InputOTP } from "@/components/ui/input-otp"; // Hanya import InputOTP
import { OtpTimer } from "@/components/ui/otp-timer";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail, ShieldCheck, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface OtpVerificationFormProps {
    email: string;
    onBack: () => void;
}

export function OtpVerificationForm({ email, onBack }: OtpVerificationFormProps) {
    const router = useRouter();

    const [otpCode, setOtpCode] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [isResending, setIsResending] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    const [canResend, setCanResend] = React.useState(false);
    const [timerResetKey, setTimerResetKey] = React.useState(0);

    const handleVerify = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setErrorMsg(null);

        if (otpCode.length !== 6) {
            setErrorMsg("Masukkan 6 digit kode lengkap.");
            return;
        }

        setIsLoading(true);
        try {
            await authService.verifyOtp({ email, otpCode });
            toast.success("Verifikasi Berhasil", {
                description: "Akun Anda telah aktif. Mengalihkan ke dashboard...",
            });
            router.push("/dashboard");
            router.refresh();
        } catch (error: any) {
            const message = error.response?.data?.message || "Kode OTP tidak valid.";
            setErrorMsg(Array.isArray(message) ? message[0] : message);
            setOtpCode("");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setIsResending(true);
        setErrorMsg(null);

        try {
            await authService.resendOtp({ email });
            toast.success("OTP Dikirim Ulang", {
                description: "Silakan cek inbox atau folder spam email Anda.",
            });
            setCanResend(false);
            setTimerResetKey((prev) => prev + 1);
            setOtpCode("");
        } catch (error: any) {
            const message = error.response?.data?.message || "Gagal mengirim ulang OTP.";
            setErrorMsg(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsResending(false);
        }
    };

    // Auto-submit saat 6 digit terpenuhi
    React.useEffect(() => {
        if (otpCode.length === 6) {
            handleVerify();
        }
    }, [otpCode]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col space-y-8 w-full max-w-sm mx-auto"
        >
            {/* Header Narrative */}
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                    <div className="h-20 w-20 bg-blue-50 rounded-[2rem] flex items-center justify-center border border-blue-100 shadow-inner">
                        <Mail className="h-10 w-10 text-blue-600" strokeWidth={1.5} />
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center"
                    >
                        <div className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />
                    </motion.div>
                </div>

                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Verifikasi Email</h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Kode 6 digit telah dikirim ke <br />
                        <span className="font-bold text-slate-900 break-all">{email}</span>
                    </p>
                </div>
            </div>

            {/* OTP Input Section */}
            <div className="flex flex-col space-y-6">
                <div className="flex justify-center">
                    {/* [FIX]: Menggunakan InputOTP secara langsung tanpa prop 'render' 
                        karena styling sudah ditangani di dalam ui/input-otp.tsx
                    */}
                    <InputOTP
                        value={otpCode}
                        onChange={setOtpCode}
                        disabled={isLoading}
                        maxLength={6}
                        autoFocus
                    />
                </div>

                <AnimatePresence>
                    {errorMsg && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-[13px] font-bold text-red-600 text-center bg-red-50 py-2 px-4 rounded-xl border border-red-100"
                        >
                            {errorMsg}
                        </motion.p>
                    )}
                </AnimatePresence>

                <Button
                    onClick={() => handleVerify()}
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full h-15 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[13px] rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.97]"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <span className="flex items-center gap-2">
                            Verifikasi Akun <ShieldCheck size={18} strokeWidth={2.5} />
                        </span>
                    )}
                </Button>
            </div>

            {/* Resend Logic & Navigation */}
            <div className="flex flex-col items-center space-y-6 pt-4 border-t border-slate-50">
                <div className="text-center">
                    {canResend ? (
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">Tidak menerima kode?</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResend}
                                disabled={isResending}
                                className="rounded-xl h-10 border-blue-100 text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-50"
                            >
                                {isResending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                )}
                                Kirim Ulang OTP
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kirim ulang dalam</span>
                            <div className="text-sm font-black text-blue-600">
                                <OtpTimer
                                    initialSeconds={60}
                                    onExpire={() => setCanResend(true)}
                                    resetKey={timerResetKey}
                                />s
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-2 group"
                >
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                        <ArrowLeft size={14} strokeWidth={3} />
                    </div>
                    Ganti Alamat Email
                </button>
            </div>
        </motion.div>
    );
}