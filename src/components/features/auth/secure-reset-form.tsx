"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Loader2, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2,
    XCircle, KeyRound, ArrowRight
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TokenState = "validating" | "valid" | "invalid";

export default function SecureResetForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    // State Management
    const [tokenState, setTokenState] = useState<TokenState>("validating");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Success Auto-Redirect State
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);

    // Derived Validation (Relaksasi Kebijakan)
    const isLengthValid = password.length >= 8;
    const isMatch = password === confirmPassword && password.length > 0;
    const isFormValid = isLengthValid && isMatch;

    // [TAHAP 2] Pre-flight Check: Validasi Token URL ke Backend on Mount
    useEffect(() => {
        if (!token) {
            setTokenState("invalid");
            return;
        }

        const validateToken = async () => {
            try {
                await authService.verifyResetLink(token);
                setTokenState("valid");
            } catch (error) {
                setTokenState("invalid");
            }
        };

        validateToken();
    }, [token]);

    // [TAHAP 5] Auto-Redirect Countdown Effect
    useEffect(() => {
        if (isSuccess && countdown > 0) {
            const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isSuccess && countdown === 0) {
            router.push("/login");
        }
    }, [isSuccess, countdown, router]);

    // Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || !token) return;

        setIsSubmitting(true);
        try {
            await authService.executePasswordReset(token, { newPassword: password });
            setIsSuccess(true);
        } catch (error: any) {
            toast.error("Gagal Memperbarui Sandi", {
                description: error.response?.data?.message || "Terjadi kesalahan sistem. Silakan coba lagi.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // UI STATE 1: Sedang Memvalidasi
    if (tokenState === "validating") {
        return (
            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 flex flex-col items-center justify-center space-y-4 min-h-95">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl animate-pulse"></div>
                        <ShieldCheck className="w-20 h-20 text-blue-600 relative z-10 animate-bounce" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mt-4">Memeriksa Keamanan</h3>
                    <p className="text-sm font-medium text-slate-500 text-center">Sedang memvalidasi tautan rahasia Anda...</p>
                </CardContent>
            </Card>
        );
    }

    // UI STATE 2: Tautan Kedaluwarsa/Dimodifikasi
    if (tokenState === "invalid") {
        return (
            <Card className="border-none shadow-2xl shadow-rose-900/5 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden border-t-[6px] border-rose-500">
                <CardContent className="p-10 flex flex-col items-center justify-center space-y-6 min-h-95">
                    <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-2">
                        <XCircle className="w-12 h-12 text-rose-500" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Tautan Tidak Berlaku</h3>
                        <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-70">
                            Tautan ini sudah kedaluwarsa atau pernah digunakan sebelumnya demi alasan keamanan.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push("/login")}
                        className="w-full h-14 mt-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold tracking-widest uppercase text-xs shadow-xl active:scale-95 transition-all"
                    >
                        Kembali ke Halaman Masuk
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // UI STATE 3: Sukses Mengganti Sandi
    if (isSuccess) {
        return (
            <Card className="border-none shadow-2xl shadow-emerald-900/5 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden border-t-[6px] border-emerald-500">
                <CardContent className="p-10 flex flex-col items-center justify-center space-y-6 min-h-95 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center mb-2"
                    >
                        <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                    </motion.div>
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">Sandi Diperbarui!</h3>
                        <p className="text-sm font-medium text-slate-500">
                            Sistem akan membawa Anda ke layar masuk dalam <strong className="text-emerald-600 text-xl font-black mx-1">{countdown}</strong> detik.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // UI STATE 4: Form Input Sandi (Valid State)
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
        >
            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 sm:p-10 relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">

                            {/* Kolom 1: Kata Sandi Baru */}
                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-slate-600 font-bold text-[13px] ml-1 uppercase tracking-wider">
                                    Ketik Kata Sandi Baru
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-focus-within:bg-blue-600 group-focus-within:text-white transition-all duration-300">
                                        <Lock size={18} />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Minimal 8 karakter"
                                        className="pl-16 pr-12 h-16 bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all rounded-2xl text-base font-bold text-slate-800"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {/* Real-time Feedback Minimum Length */}
                                <div className="flex items-center gap-2 ml-2 mt-2">
                                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-500", password.length > 0 ? (isLengthValid ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400") : "bg-slate-100 text-slate-300")}>
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <span className={cn("text-xs font-bold tracking-wide transition-colors duration-500", isLengthValid ? "text-emerald-600" : "text-slate-400")}>
                                        Minimal 8 karakter (Bebas)
                                    </span>
                                </div>
                            </div>

                            {/* Kolom 2: Konfirmasi Kata Sandi */}
                            <div className="space-y-3">
                                <Label htmlFor="confirmPassword" className="text-slate-600 font-bold text-[13px] ml-1 uppercase tracking-wider">
                                    Ulangi Kata Sandi
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-focus-within:bg-blue-600 group-focus-within:text-white transition-all duration-300">
                                        <KeyRound size={18} />
                                    </div>
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Ketik ulang sandi di atas"
                                        className="pl-16 h-16 bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all rounded-2xl text-base font-bold text-slate-800"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {/* Real-time Feedback Match */}
                                <div className="flex items-center gap-2 ml-2 mt-2">
                                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-500", confirmPassword.length > 0 ? (isMatch ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500") : "bg-slate-100 text-slate-300")}>
                                        {confirmPassword.length > 0 && !isMatch ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                                    </div>
                                    <span className={cn("text-xs font-bold tracking-wide transition-colors duration-500", confirmPassword.length > 0 ? (isMatch ? "text-emerald-600" : "text-rose-500") : "text-slate-400")}>
                                        {confirmPassword.length > 0 && !isMatch ? "Sandi belum cocok" : "Sandi cocok"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting || !isFormValid}
                            className={cn(
                                "w-full h-16 mt-6 text-[15px] font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all duration-300 active:scale-[0.97]",
                                isFormValid
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                                    : "bg-slate-100 text-slate-400 shadow-none"
                            )}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin" /> Menyimpan...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3">
                                    Simpan Sandi Baru <ArrowRight size={20} />
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}