"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    ShieldAlert,
    LogIn,
    MonitorSmartphone,
    AlertTriangle,
    ShieldCheck,
    MailWarning // Icon baru untuk email peringatan
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useSystemStore } from "@/hooks/use-system-store";
import { authService } from "@/services/auth.service";

/**
 * Komponen Penyelamat Sesi (The Netflix/Spotify Kick-out Approach)
 */
export function SessionTerminatedModal() {
    const router = useRouter();
    const { isSessionTerminated, reset } = useSystemStore();

    const handleReLogin = () => {
        reset();
        authService.logout();
        router.push("/login?reason=kicked");
    };

    return (
        <AlertDialog open={isSessionTerminated}>
            <AlertDialogContent
                className="max-w-[90vw] sm:max-w-md md:max-w-lg overflow-hidden p-0 border border-slate-200/50 rounded-[2rem] bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]"
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                {/* Header Pattern Background */}
                <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-amber-50 to-white pointer-events-none" />

                <div className="px-6 pt-10 pb-6 sm:px-8 relative">
                    <AlertDialogHeader className="flex flex-col items-center text-center space-y-6">

                        {/* Ikon Animasi Visual (Warning / Device Transfer) */}
                        <div className="relative group">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl animate-pulse" />

                            {/* Main Icon Container */}
                            <div className="relative w-20 h-20 bg-white shadow-xl shadow-amber-900/5 border border-amber-100 rounded-full flex items-center justify-center transform transition-transform group-hover:scale-105 duration-500">
                                <MonitorSmartphone className="w-9 h-9 text-amber-500 relative z-10" />

                                {/* Orbiting Alert Badge */}
                                <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md border border-slate-100">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-100" />
                                </div>
                            </div>
                        </div>

                        {/* Tipografi yang lebih kuat */}
                        <div className="space-y-2">
                            <AlertDialogTitle className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
                                Sesi Anda Dialihkan
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500 text-[15px] font-medium">
                                Sistem mendeteksi akun ini baru saja digunakan untuk <span className="text-amber-600 font-bold">login di perangkat lain</span>.
                            </AlertDialogDescription>
                        </div>

                        {/* Information Box (Memberikan rasa aman) */}
                        <div className="w-full text-left bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 shadow-inner">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    Sebagai tindakan pengamanan standar, akses Anda di perangkat ini telah kami <strong>hentikan otomatis</strong> untuk mencegah sesi ganda.
                                </p>
                            </div>
                        </div>

                        {/* PERUBAHAN: Security Alert (Bantuan Admin) */}
                        <div className="w-full flex items-start sm:items-center justify-start gap-3 text-sm text-red-700 bg-red-50/80 py-3 px-4 rounded-xl border border-red-200/60 shadow-sm">
                            <MailWarning className="w-5 h-5 shrink-0 text-red-500 mt-0.5 sm:mt-0" />
                            <div className="text-left leading-snug">
                                <p className="font-semibold mb-0.5">
                                    Tidak mengenali aktivitas ini?
                                </p>
                                <p className="text-[13px] text-red-600/90 font-medium">
                                    Segera hubungi <a href="mailto:hello@keuanganku.id" className="font-bold underline underline-offset-2 hover:text-red-800 transition-colors">hello@keuanganku.id</a> untuk mengamankan dan mereset sandi Anda.
                                </p>
                            </div>
                        </div>

                    </AlertDialogHeader>

                    <AlertDialogFooter className="mt-8 sm:mt-10">
                        <AlertDialogAction
                            onClick={handleReLogin}
                            className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 border-none transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            Masuk Kembali Sekarang
                            <LogIn className="w-4 h-4 group-hover:translate-x-1 opacity-70 transition-transform" />
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </div>

                {/* Footer Identitas Perangkat (Kesan High-Tech) */}
                <div className="bg-slate-50/80 border-t border-slate-100 py-4 flex flex-col items-center justify-center gap-1.5 backdrop-blur-sm">
                    <p className="text-[10px] text-slate-400 font-black tracking-[0.2em] uppercase">
                        KeuanganKu Security
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                            Enkripsi End-to-End Aktif
                        </span>
                    </div>
                </div>

            </AlertDialogContent>
        </AlertDialog>
    );
}