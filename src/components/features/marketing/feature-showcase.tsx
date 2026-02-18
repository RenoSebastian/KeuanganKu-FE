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
        image: "/images/pendidikan.gif", // Ganti ke file lokal
        color: "text-blue-600",
        bgColor: "bg-blue-50"
    },
    {
        id: 2,
        title: "Dana Hari Tua",
        icon: Umbrella,
        heading: "Pensiun dengan Martabat & Kebebasan Finansial",
        desc: "Buka mata klien tentang gap dana pensiun mereka sebelum terlambat. Tunjukkan grafik proyeksi kekayaan yang membuat mereka sadar bahwa menunda proteksi hari ini adalah kerugian besar di masa depan.",
        image: "/images/hari_tua.gif", // Ganti ke file lokal
        color: "text-indigo-600",
        bgColor: "bg-indigo-50"
    },
    {
        id: 3,
        title: "Simulasi Proteksi",
        icon: ShieldCheck,
        heading: "Nilai Uang Pertanggungan yang Tidak Terbantahkan",
        desc: "Gunakan metode 'Human Life Value' untuk menghitung kebutuhan proteksi secara akurat. Klien tidak akan lagi berargumen tentang premi, karena angka yang Anda sajikan didasarkan pada data pengeluaran riil mereka.",
        image: "/images/asuransi.jpeg", // Ganti ke file lokal
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
        image: "/images/multiklien.jpeg", // Ganti ke file lokal
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
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                        7 Senjata Utama <span className="text-blue-600">Agen Pro</span>
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* NAVIGATION TABS */}
                    <div className="w-full lg:w-1/3 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
                        {features.map((f, index) => {
                            const IconComponent = f.icon;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => setActiveTab(index)}
                                    className={cn(
                                        "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 text-left min-w-50 lg:min-w-full border-2",
                                        activeTab === index
                                            ? "bg-white border-blue-600 shadow-lg translate-x-2"
                                            : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        activeTab === index ? f.bgColor + " " + f.color : "bg-slate-200 text-slate-500"
                                    )}>
                                        <IconComponent size={20} />
                                    </div>
                                    <span className={cn(
                                        "font-bold tracking-tight",
                                        activeTab === index ? "text-slate-900" : "text-slate-500"
                                    )}>
                                        {f.title}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* DISPLAY CONTENT */}
                    <div className="flex-1 w-full min-h-125 relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-2xl border border-slate-100 flex flex-col gap-8 h-full"
                            >
                                <div>
                                    <h3 className={cn("text-lg font-black uppercase tracking-widest mb-2", features[activeTab].color)}>
                                        Feature 0{features[activeTab].id}
                                    </h3>
                                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                                        {features[activeTab].heading}
                                    </h2>
                                    <p className="text-lg text-slate-600 leading-relaxed">
                                        {features[activeTab].desc}
                                    </p>
                                </div>

                                <div className="relative mt-auto">
                                    <img
                                        src={features[activeTab].image}
                                        alt={features[activeTab].title}
                                        className="w-full h-75 lg:h-100 object-cover rounded-2xl shadow-inner border border-slate-100"
                                    />
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