"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap, Umbrella, ShieldCheck,
    Smartphone, CheckCircle2, LucideIcon,
    LineChart,
    TrendingUp,
    Activity
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
        // Dihapus bg-slate-50 agar transparan dan membaur dengan ambient background dari page.tsx
        <section className="py-12 relative z-10" id="features">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 relative z-10">
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                        7 Senjata Utama <span className="text-blue-600">Agen Pro</span>
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start relative z-20">
                    {/* NAVIGATION TABS */}
                    <div className="w-full lg:w-1/3 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
                        {features.map((f, index) => {
                            const IconComponent = f.icon;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => setActiveTab(index)}
                                    className={cn(
                                        "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 text-left min-w-50 lg:min-w-full border",
                                        activeTab === index
                                            // Glassmorphism untuk tab yang aktif
                                            ? "bg-white/80 backdrop-blur-md border-blue-400 shadow-[0_8px_30px_rgb(0,0,0,0.06)] translate-x-2"
                                            // Glassmorphism halus untuk tab yang tidak aktif
                                            : "bg-white/30 backdrop-blur-sm border-transparent text-slate-500 hover:bg-white/50"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg transition-colors duration-300",
                                        activeTab === index
                                            ? f.bgColor + " " + f.color
                                            : "bg-white/60 text-slate-500 shadow-sm" // Diperhalus agar tidak terlalu pekat
                                    )}>
                                        <IconComponent size={20} />
                                    </div>
                                    <span className={cn(
                                        "font-bold tracking-tight transition-colors duration-300",
                                        activeTab === index ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"
                                    )}>
                                        {f.title}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* DISPLAY CONTENT */}
                    <div className="flex-1 w-full min-h-125 relative perspective-1000">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                // Animasi Y (Atas-Bawah) lebih elegan untuk tema Glassmorphism daripada X (Kiri-Kanan)
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                // Terapkan efek Kaca (Glass) pada card utama
                                className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 lg:p-12 shadow-[0_20px_50px_rgb(0,0,0,0.04)] border border-white/60 flex flex-col gap-8 h-full"
                            >
                                <div>
                                    <h3 className={cn("text-lg font-black uppercase tracking-widest mb-2", features[activeTab].color)}>
                                        Feature 0{features[activeTab].id}
                                    </h3>
                                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                                        {features[activeTab].heading}
                                    </h2>
                                    <p className="text-lg text-slate-700 leading-relaxed font-medium">
                                        {features[activeTab].desc}
                                    </p>
                                </div>

                                <div className="relative mt-auto">
                                    <img
                                        src={features[activeTab].image}
                                        alt={features[activeTab].title}
                                        // Ganti border pekat dengan border yang lebih soft/glassy
                                        className="w-full h-75 lg:h-100 object-cover rounded-2xl shadow-lg shadow-slate-900/5 border-2 border-white/70"
                                    />
                                    {/* Efek overlay gradient pada gambar agar menyatu dengan card glass */}
                                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 pointer-events-none" />
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