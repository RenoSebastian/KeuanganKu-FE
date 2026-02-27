"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    ShieldAlert,
    LogIn,
    MonitorSmartphone,
    ArrowRightLeft
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
 * Muncul secara otomatis saat Circuit Breaker Axios atau WSS mendeteksi sesi ganda.
 */
export function SessionTerminatedModal() {
    const router = useRouter();

    // Memantau saklar Circuit Breaker dari Fase 1
    const { isSessionTerminated, reset } = useSystemStore();

    const handleReLogin = () => {
        // 1. Bersihkan sisa state sistem
        reset();

        // 2. Jalankan prosedur logout bersih (hapus token/cookie)
        authService.logout();

        // 3. Arahkan ke login dengan parameter alasan untuk UI feedback di login page
        router.push("/login?reason=kicked");
    };

    return (
        <AlertDialog open={isSessionTerminated}>
            <AlertDialogContent
                className="max-w-[90vw] sm:max-w-105 rounded-[2rem] border-none bg-white/95 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] p-8"
                // Mencegah interaksi keyboard ESC
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <AlertDialogHeader className="flex flex-col items-center text-center space-y-6">

                    {/* Ikon Animasi Visual Sesi Ganda */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl animate-pulse" />
                        <div className="relative bg-red-50 p-5 rounded-3xl border border-red-100">
                            <div className="flex items-center justify-center">
                                <MonitorSmartphone className="w-8 h-8 text-red-600 animate-bounce" />
                                <ArrowRightLeft className="w-4 h-4 text-red-400 absolute opacity-50" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-sm">
                            <ShieldAlert className="w-5 h-5 text-red-600" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <AlertDialogTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Sesi Dihentikan
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 text-[15px] leading-relaxed">
                            Akun Anda baru saja digunakan untuk masuk pada perangkat lain.
                            <span className="block mt-2 font-medium text-slate-800">
                                Untuk menjaga keamanan data finansial Anda, sesi di perangkat ini telah diakhiri secara otomatis.
                            </span>
                        </AlertDialogDescription>
                    </div>
                </AlertDialogHeader>

                <AlertDialogFooter className="mt-8">
                    <AlertDialogAction
                        onClick={handleReLogin}
                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 border-none transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                    >
                        <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        Masuk Kembali
                    </AlertDialogAction>
                </AlertDialogFooter>

                {/* Footer Informasi Identitas Perangkat (Fingerprint) */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        KeuanganKu Security Shield
                    </p>
                    <div className="flex items-center gap-2 opacity-50">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-slate-500 font-medium">Enkripsi 256-bit Aktif</span>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}