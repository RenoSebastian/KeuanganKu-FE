"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export default function ForgotPasswordFlow() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        try {
            // Memanggil layanan pembuat Magic Link di Backend
            await authService.requestPasswordReset({ email });

            // Mengubah UI state ke layar sukses
            setIsSuccess(true);
        } catch (error: any) {
            toast.error("Gagal Meminta Tautan", {
                description: error.response?.data?.message || "Terjadi kesalahan pada sistem. Silakan coba lagi.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 sm:p-10 relative overflow-hidden">
                <AnimatePresence mode="wait">

                    {/* ================================================================= */}
                    {/* STATE 1: FORM INPUT EMAIL                                         */}
                    {/* ================================================================= */}
                    {!isSuccess && (
                        <motion.div
                            key="request-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-center mb-8 space-y-2">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck className="w-8 h-8 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Lupa Kata Sandi?</h2>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">
                                    Masukkan email terdaftar Anda. Kami akan mengirimkan tautan aman untuk membuat sandi baru.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-slate-600 font-bold text-[13px] ml-1 uppercase tracking-wider">
                                        Alamat Email
                                    </Label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-focus-within:bg-blue-600 group-focus-within:text-white transition-all duration-300">
                                            <Mail size={18} />
                                        </div>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="nama@email.com"
                                            className="pl-16 h-16 bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all rounded-2xl text-base font-bold text-slate-800"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !email}
                                    className="w-full h-16 mt-2 text-[15px] font-black uppercase tracking-widest rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 transition-all duration-300 active:scale-[0.97]"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-3">
                                            <Loader2 className="w-6 h-6 animate-spin" /> Memproses...
                                        </span>
                                    ) : (
                                        "Kirim Tautan Pemulihan"
                                    )}
                                </Button>

                                <div className="pt-6 border-t border-slate-100 text-center">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                    >
                                        <ArrowLeft size={16} /> Kembali ke halaman masuk
                                    </Link>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* ================================================================= */}
                    {/* STATE 2: SUCCESS INSTRUCTION (Distraction-Free UX)                */}
                    {/* ================================================================= */}
                    {isSuccess && (
                        <motion.div
                            key="success-state"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl animate-pulse opacity-50"></div>
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 relative z-10" />
                            </div>

                            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Tautan Terkirim!</h2>
                            <p className="text-[15px] font-medium text-slate-500 leading-relaxed mb-8 max-w-70 mx-auto">
                                Silakan periksa kotak masuk email <strong className="text-slate-800">{email}</strong> dan klik tombol di dalamnya untuk membuat kata sandi baru.
                            </p>

                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8">
                                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                                    Tautan tersebut hanya berlaku selama 15 menit. Jika email tidak masuk, periksa folder Spam atau Promosi Anda.
                                </p>
                            </div>

                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center w-full h-14 text-sm font-black uppercase tracking-widest rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl transition-all active:scale-[0.97]"
                            >
                                Kembali ke Beranda
                            </Link>
                        </motion.div>
                    )}

                </AnimatePresence>
            </CardContent>
        </Card>
    );
}