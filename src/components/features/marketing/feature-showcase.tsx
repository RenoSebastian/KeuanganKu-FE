"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap, Umbrella, ShieldCheck,
    Smartphone, CheckCircle2, LucideIcon,
    LineChart,
    TrendingUp,
    Activity,
    Sparkles
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface FeatureItem {
    id: number;
    title: string;
    icon: LucideIcon;
    heading: string;
    desc: string;
    image: string;
    color: string;
    bgColor: string;
}

const features: FeatureItem[] = [
    {
        id: 1,
        title: "Dana Pendidikan",
        icon: GraduationCap,
        heading: "Ubah Kekhawatiran Orang Tua Menjadi Kepastian",
        desc: "Bukan sekadar hitung-hitungan sekolah. Bantu klien memvisualisasikan masa depan anak mereka dengan data inflasi pendidikan yang riil. Jadikan proteksi Anda sebagai satu-satunya solusi logis untuk masa depan buah hati mereka.",
        image: "/images/pendidikan.gif",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
    },
    {
        id: 2,
        title: "Dana Hari Tua",
        icon: Umbrella,
        heading: "Pensiun dengan Martabat & Kebebasan Finansial",
        desc: "Buka mata klien tentang gap dana pensiun mereka sebelum terlambat. Tunjukkan grafik proyeksi kekayaan yang membuat mereka sadar bahwa menunda proteksi hari ini adalah kerugian besar di masa depan.",
        image: "/images/hari_tua.gif",
        color: "text-indigo-600",
        bgColor: "bg-indigo-50"
    },
    {
        id: 3,
        title: "Simulasi Proteksi",
        icon: ShieldCheck,
        heading: "Nilai Uang Pertanggungan yang Tidak Terbantahkan",
        desc: "Gunakan metode 'Human Life Value' untuk menghitung kebutuhan proteksi secara akurat. Klien tidak akan lagi berargumen tentang premi, karena angka yang Anda sajikan didasarkan pada data pengeluaran riil mereka.",
        image: "/images/asuransi.jpeg",
        color: "text-sky-600",
        bgColor: "bg-sky-50"
    },
    {
        id: 4,
        title: "Analisa Arus Kas",
        icon: LineChart,
        heading: "Temukan 'Kebocoran' Halus di Dompet Klien",
        desc: "Visualisasikan arus kas klien secara transparan. Bantu mereka mengalokasikan pengeluaran yang kurang penting menjadi premi asuransi yang berharga. Ubah 'Saya tidak punya uang' menjadi 'Mari kita atur kembali'.",
        image: "https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=1000",
        color: "text-slate-700",
        bgColor: "bg-slate-50"
    },
    {
        id: 5,
        title: "Roadmap Aset",
        icon: TrendingUp,
        heading: "Rancang Mimpi, Lindungi Pencapaian",
        desc: "Bantu klien merencanakan pembelian rumah atau kendaraan dengan pendampingan asuransi sebagai pengaman aset. Jadikan asuransi sebagai jaring pengaman agar mimpi mereka tidak hancur saat risiko datang.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000",
        color: "text-cyan-600",
        bgColor: "bg-cyan-50"
    },
    {
        id: 6,
        title: "Dashboard Multi-Agent",
        icon: Activity,
        heading: "Manajemen Klien Dalam Satu Genggaman",
        desc: "Pantau semua prospek dan diskusi keuangan tanpa tercecer. Tingkatkan profesionalisme Anda di depan klien dengan menunjukkan ringkasan data yang rapi dan terorganisir lewat tablet atau smartphone.",
        image: "/images/multiklien.jpeg",
        color: "text-teal-600",
        bgColor: "bg-teal-50"
    },
    {
        id: 7,
        title: "PWA & Offline Mode",
        icon: Smartphone,
        heading: "Siap Closing Dimana Saja, Kapan Saja",
        desc: "Akses kalkulator dan data klien meskipun tanpa koneksi internet yang stabil. Kecepatan adalah kunci. Jangan biarkan momentum closing hilang hanya karena masalah sinyal saat sedang meeting di coffee shop.",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000",
        color: "text-rose-600",
        bgColor: "bg-rose-50"
    }
];

const FeatureShowcase = () => {
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % features.length);
        }, 15000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-20 relative z-10 overflow-hidden" id="features">
            <div className="container mx-auto px-4 relative z-10">

                {/* THE SECRET SAUCE: Siluet warna di belakang agar efek Frosted Glass merespon */}
                <div className="absolute top-[20%] left-[5%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
                <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] bg-orange-400/10 rounded-full blur-[100px] pointer-events-none -z-10" />

                {/* HEADER */}
                <div className="text-center mb-16 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-300/40 backdrop-blur-3xl border-2 border-slate-400/50 mb-6 shadow-sm">
                        <Sparkles className="w-4 h-4 text-blue-700 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-900">Core Features</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-[1000] text-slate-900 mb-4 tracking-tighter leading-[1.1]">
                        7 Senjata Utama <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 to-indigo-600 drop-shadow-sm">
                            Agen Pro
                        </span>
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative z-20">

                    {/* NAVIGATION TABS: Tab Kiri juga dibuat lebih tebal dan gelap bordernya */}
                    <div className="w-full lg:w-1/3 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-6 lg:pb-0 no-scrollbar snap-x">
                        {features.map((f, index) => {
                            const IconComponent = f.icon;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => setActiveTab(index)}
                                    className={cn(
                                        "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 text-left min-w-65 lg:min-w-full border-2 snap-center group overflow-hidden relative",
                                        activeTab === index
                                            // ACTIVE STATE: Kaca Tebal dengan border gelap slate-400/60
                                            ? "bg-white/20 backdrop-blur-3xl border-slate-400/60 shadow-[0_15px_30px_rgba(0,0,0,0.1)] lg:translate-x-3 scale-105 lg:scale-100"
                                            // INACTIVE STATE: Smoked Glass
                                            : "bg-slate-300/20 backdrop-blur-md border-slate-300/40 text-slate-500 hover:bg-slate-200/40 hover:border-slate-400/50"
                                    )}
                                >
                                    {/* Grainy Noise khusus tab aktif */}
                                    {activeTab === index && (
                                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                                    )}

                                    <div className={cn(
                                        "p-2.5 rounded-xl transition-all duration-500 shadow-sm relative z-10",
                                        activeTab === index
                                            ? f.bgColor + " " + f.color + " scale-110 shadow-md border border-white/60"
                                            : "bg-white/50 text-slate-400 group-hover:bg-white/80 group-hover:text-slate-600"
                                    )}>
                                        <IconComponent size={22} strokeWidth={activeTab === index ? 2.5 : 2} />
                                    </div>
                                    <span className={cn(
                                        "font-bold tracking-tight transition-colors duration-300 relative z-10",
                                        activeTab === index ? "text-slate-900 text-lg drop-shadow-sm" : "text-slate-600 group-hover:text-slate-800"
                                    )}>
                                        {f.title}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* DISPLAY CONTENT: KARTU UTAMA (Heavy Frosted Glass with Dark Border) */}
                    <div className="flex-1 w-full min-h-128 lg:min-h-144 relative perspective-1000">

                        {/* Blob cahaya spesifik di belakang kartu konten agar blur-nya bereaksi kuat */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-400/20 rounded-full blur-[80px] pointer-events-none -z-10" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                // PERBAIKAN MATERIAL CARD UTAMA:
                                // 1. bg-white/20 (Kurangi putih susu, biarkan bening)
                                // 2. backdrop-blur-3xl (Buram ekstrem / Sandblast)
                                // 3. border-2 border-slate-400/60 (Bingkai abu-abu gelap agar garis card terlihat di HP)
                                // 4. shadow-[inset_0_2px_10px...] (Pantulan tebal dalam kaca)
                                className="bg-white/20 backdrop-blur-3xl rounded-[3rem] p-8 lg:p-12 border-2 border-slate-400/60 shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col gap-8 h-full relative overflow-hidden group"
                            >
                                {/* Pendar Cahaya Internal Kaca */}
                                <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-white/40 blur-[70px] rounded-full pointer-events-none" />

                                {/* Tekstur Kaca Film */}
                                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                            features[activeTab].bgColor,
                                            features[activeTab].color,
                                            "border-slate-300/80 backdrop-blur-md"
                                        )}>
                                            Modul 0{features[activeTab].id}
                                        </div>
                                    </div>

                                    <h2 className="text-3xl lg:text-4xl font-[1000] text-slate-900 mb-5 tracking-tight leading-[1.15] drop-shadow-sm">
                                        {features[activeTab].heading}
                                    </h2>
                                    <p className="text-lg text-slate-800 leading-relaxed font-bold max-w-2xl drop-shadow-sm">
                                        {features[activeTab].desc}
                                    </p>
                                </div>

                                <div className="relative mt-auto pt-6 z-10">
                                    {/* Frame gambar dibuat lebih tebal seakan-akan layar tertanam di dalam kaca */}
                                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)] border-4 border-slate-200/80 bg-slate-100 group/img">
                                        <img
                                            src={features[activeTab].image}
                                            alt={features[activeTab].title}
                                            className="w-full h-64 lg:h-80 object-cover transform transition-transform duration-700 group-hover/img:scale-105"
                                        />
                                        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none rounded-[2.5rem]" />
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeatureShowcase;