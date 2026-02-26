"use client";

import { motion } from "framer-motion";
import { RefreshCcw, Home, Hammer, AlertCircle, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CONFIG = {
    SERVER_ERROR: {
        headline: "Akses Sedang Terganggu",
        subtext: "Sepertinya ada kendala teknis pada server kami. Jangan khawatir, data Anda tetap aman. Tim kami sedang memperbaikinya agar segera normal kembali.",
        icon: AlertCircle,
        color: "from-slate-500/20 via-slate-400/10 to-transparent",
        primaryAction: "Coba Muat Ulang",
    },
    MAINTENANCE: {
        headline: "Fitur Sedang Diperbarui",
        subtext: "Halaman ini sedang dalam tahap perbaikan rutin atau pengembangan fitur baru. Kami sedang bekerja untuk memberikan pengalaman yang lebih baik untuk Anda.",
        icon: Hammer,
        color: "from-indigo-500/20 via-blue-400/10 to-transparent",
        primaryAction: "Refresh Halaman",
    },
    OFFLINE: {
        headline: "Koneksi Anda Terputus",
        subtext: "Sinyal internet Anda sepertinya sedang tidak stabil. KeuanganKu akan otomatis terhubung kembali saat koneksi Anda sudah membaik.",
        icon: WifiOff,
        color: "from-cyan-500/20 via-blue-400/10 to-transparent",
        primaryAction: "Cek Koneksi",
    }
};

export function SystemStateDisplay({ type }: { type: keyof typeof CONFIG }) {
    const active = CONFIG[type];
    const Icon = active.icon;

    return (
        // Menggunakan absolute agar sidebar tetap terlihat (Navigation Safety)
        <div className="absolute inset-0 z-50 bg-[#F8FAFC]/95 backdrop-blur-sm flex items-center justify-center p-6 overflow-hidden">

            {/* Immersive Breathing Background */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className={cn("absolute w-[150%] h-[150%] rounded-full bg-linear-to-br blur-[100px] -z-10", active.color)}
            />

            <div className="max-w-md w-full text-center">
                {/* Icon Shell */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-center">
                    <div className="w-28 h-28 bg-white rounded-[2.2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center relative">
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                            <Icon size={48} className="text-slate-800" strokeWidth={1.5} />
                        </motion.div>
                        {/* Decorative circles */}
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-50 rounded-full animate-pulse" />
                    </div>
                </motion.div>

                {/* Typography */}
                <div className="space-y-4 mb-10">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                        {active.headline}
                    </h1>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-[320px] mx-auto opacity-80">
                        {active.subtext}
                    </p>
                </div>

                {/* Actions: Refresh & Dashboard */}
                <div className="flex flex-col gap-3 max-w-70 mx-auto">
                    <Button
                        onClick={() => window.location.reload()}
                        className="h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 gap-3"
                    >
                        <RefreshCcw size={16} strokeWidth={3} /> {active.primaryAction}
                    </Button>

                    <Button
                        variant="outline"
                        asChild
                        className="h-14 rounded-2xl border-slate-200 bg-white text-slate-600 font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 gap-3"
                    >
                        <Link href="/dashboard">
                            <Home size={16} strokeWidth={3} /> Kembali ke Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Footer simple info */}
                <p className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                    Sistem Monitoring KeuanganKu
                </p>
            </div>
        </div>
    );
}