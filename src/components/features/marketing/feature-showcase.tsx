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

// Definisikan Interface yang ketat untuk Data Fitur
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
            <div className="container mx-auto px-4">

                {/* HEADER DI-BOOST: Tipografi diselaraskan dengan identitas Landing Page */}
                <div className="text-center mb-16 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 backdrop-blur-md border border-blue-400/30 mb-6 shadow-sm">
                        <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Core Features</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-[1000] text-slate-900 mb-4 tracking-tighter leading-[1.1]">
                        7 Senjata Utama <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 to-indigo-600 drop-shadow-sm">
                            Agen Pro
                        </span>
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative z-20">

                    {/* NAVIGATION TABS: Disempurnakan dengan Material Glass */}
                    <div className="w-full lg:w-1/3 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-6 lg:pb-0 no-scrollbar snap-x">
                        {features.map((f, index) => {
                            const IconComponent = f.icon;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => setActiveTab(index)}
                                    className={cn(
                                        "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 text-left min-w-60 lg:min-w-full border-2 snap-center group",
                                        activeTab === index
                                            // ACTIVE STATE: Thick Frosted Glass yang menonjol
                                            ? "bg-white/80 backdrop-blur-2xl border-white shadow-[0_15px_30px_rgba(0,0,0,0.08)] lg:translate-x-3 scale-105 lg:scale-100"
                                            // INACTIVE STATE: Smoked/Dimmed Glass agar tenggelam ke belakang
                                            : "bg-slate-300/20 backdrop-blur-md border-slate-300/40 text-slate-500 hover:bg-white/40 hover:border-white/50"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2.5 rounded-xl transition-all duration-500 shadow-sm",
                                        activeTab === index
                                            ? f.bgColor + " " + f.color + " scale-110 shadow-md"
                                            : "bg-white/50 text-slate-400 group-hover:bg-white/80 group-hover:text-slate-600"
                                    )}>
                                        <IconComponent size={22} strokeWidth={activeTab === index ? 2.5 : 2} />
                                    </div>
                                    <span className={cn(
                                        "font-bold tracking-tight transition-colors duration-300",
                                        activeTab === index ? "text-slate-900 text-lg" : "text-slate-500 group-hover:text-slate-700"
                                    )}>
                                        {f.title}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* DISPLAY CONTENT: Kartu Kaca Tebal (Thick Glassmorphism) */}
                    <div className="flex-1 w-full min-h-128 relative perspective-1000">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} // Custom easing untuk feel lebih smooth
                                // CARD UTAMA: Diselaraskan dengan Pricing (Thick Frosted Glass)
                                className="bg-white/50 backdrop-blur-3xl rounded-[3rem] p-8 lg:p-12 border-2 border-white/70 shadow-[0_30px_60px_rgba(0,0,0,0.1)] flex flex-col gap-8 h-full relative overflow-hidden"
                            >
                                {/* Aksen kilauan cahaya halus di dalam card */}
                                <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/40 blur-[80px] rounded-full pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", features[activeTab].bgColor, features[activeTab].color)}>
                                            Modul 0{features[activeTab].id}
                                        </div>
                                    </div>

                                    <h2 className="text-3xl lg:text-4xl font-[1000] text-slate-900 mb-5 tracking-tight leading-[1.1]">
                                        {features[activeTab].heading}
                                    </h2>
                                    <p className="text-lg text-slate-600 leading-relaxed font-medium max-w-2xl">
                                        {features[activeTab].desc}
                                    </p>
                                </div>

                                <div className="relative mt-auto pt-4 z-10">
                                    {/* Frame gambar dibuat lebih tebal seakan-akan layar tertanam di dalam kaca */}
                                    <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.15)] border-4 border-white/80 group/img">
                                        <img
                                            src={features[activeTab].image}
                                            alt={features[activeTab].title}
                                            className="w-full h-64 lg:h-96 object-cover transform transition-transform duration-700 group-hover/img:scale-105"
                                        />
                                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none rounded-[2rem]" />
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