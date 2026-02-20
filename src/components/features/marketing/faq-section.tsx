"use client";

import React, { useState } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Sparkles, MessageCircle, ArrowUpRight } from "lucide-react";
import ContactSupportModal from "@/components/features/marketing/contact-support-modal";

const faqs = [
    {
        question: "Apa perbedaan utama antara paket Free Trial dan Pro?",
        answer: "Paket Free Trial dirancang untuk eksplorasi dasar. Perbedaan utamanya terletak pada akses download file (PDF/Excel) yang hanya tersedia di paket Pro, serta batasan jumlah analisis yang bisa dilakukan setiap bulannya."
    },
    {
        question: "Bagaimana sistem pembayaran untuk paket 6 bulan dan 1 tahun?",
        answer: "Pembayaran dilakukan sekali di depan (upfront) untuk total durasi yang dipilih. Dengan mengambil paket jangka panjang, Anda mendapatkan harga per bulan yang jauh lebih murah (hingga hemat 38%) dibandingkan paket bulanan."
    },
    {
        question: "Apakah saya bisa membatalkan langganan kapan saja?",
        answer: "Tentu saja. Anda dapat membatalkan perpanjangan otomatis kapan saja melalui pengaturan profil. Akses Pro Anda akan tetap aktif hingga masa langganan yang sudah dibayar berakhir."
    },
    {
        question: "Format file apa saja yang bisa didownload di paket Pro?",
        answer: "Pengguna Pro dapat mengunduh laporan lengkap analisis keuangan dalam format PDF yang siap cetak, serta data mentah dalam format Excel (.xlsx) atau CSV untuk keperluan pengolahan data mandiri."
    },
    {
        question: "Apakah data keuangan saya aman di aplikasi ini?",
        answer: "Keamanan adalah prioritas kami. Semua data dienkripsi menggunakan standar industri (AES-256) dan kami tidak pernah membagikan data personal Anda kepada pihak ketiga manapun sesuai dengan kebijakan privasi kami."
    }
];

const FAQSection = () => {
    const [isContactOpen, setIsContactOpen] = useState(false);

    return (
        // 1. Dihapus 'bg-slate-50' agar transparan menyatu dengan ambient blobs dari page.tsx
        <section className="py-12 lg:py-24 relative z-10 overflow-hidden" id="faq">

            {/* 2. Background Ornaments lokal dihapus agar tidak bentrok (overlap kotor) dengan global blobs */}

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 backdrop-blur-md border border-blue-400/30 mb-6 shadow-sm">
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Common Queries</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-[1000] text-slate-900 tracking-tighter mb-6 leading-tight">
                        Ada yang Masih <br />
                        {/* 3. Perbaiki bg-linear-to-* menjadi bg-gradient-to-* standar Tailwind */}
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-700 to-indigo-600">
                            Mengganjal di Pikiran?
                        </span>
                    </h2>
                    <p className="text-lg text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
                        Kami merangkum segala hal yang sering ditanyakan para agen profesional sebelum memutuskan untuk upgrade ke ekosistem Pro.
                    </p>
                </div>

                {/* 4. Accordion List diubah menggunakan Glassmorphism Effect */}
                <Accordion type="single" collapsible className="w-full space-y-5">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            // bg-white solid diubah ke bg-white/60 backdrop-blur-xl dengan border putih soft
                            className="group bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] px-8 py-3 shadow-[0_10px_30px_rgb(0,0,0,0.03)] transition-all duration-500 data-[state=open]:shadow-[0_20px_40px_rgb(37,99,235,0.08)] data-[state=open]:bg-white/80 data-[state=open]:border-blue-200/50"
                        >
                            <AccordionTrigger className="flex gap-4 text-left font-black text-slate-900 hover:no-underline text-xl py-6 group-data-[state=open]:text-blue-700 transition-all duration-300">
                                <span className="flex-1 leading-tight">{faq.question}</span>
                                {/* Icon container dibikin lebih "glassy" saat normal, dan solid saat open */}
                                <div className="h-10 w-10 rounded-full bg-white/50 border border-slate-200/50 flex items-center justify-center shrink-0 group-data-[state=open]:bg-blue-600 group-data-[state=open]:border-blue-600 group-data-[state=open]:text-white group-data-[state=open]:rotate-180 transition-all duration-500">
                                    <Sparkles className="w-5 h-5 group-data-[state=closed]:text-slate-400" />
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 leading-relaxed text-lg pb-8 font-medium border-t border-slate-200/50 pt-6 mt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {/* Modern CTA Card - Dark Glassmorphism */}
                <div className="mt-24 group relative">
                    {/* Glowing effect background, perbaiki bg-linear-to-* */}
                    <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 rounded-[3.5rem] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />

                    {/* Ubah bg-slate-900 menjadi Dark Glass (bg-slate-900/90 + backdrop-blur) */}
                    <div className="relative bg-slate-900/90 backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-16 overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.15)]">
                        {/* Decorative circles - dikurangi intensitasnya agar tidak menutupi teks */}
                        <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-blue-500/15 rounded-full blur-[80px] animate-pulse" />
                        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-indigo-500/15 rounded-full blur-[80px]" />

                        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                            <div className="text-center md:text-left">
                                <h3 className="text-white text-3xl md:text-4xl font-black tracking-tight mb-4">
                                    Belum Nemu Jawabannya?
                                </h3>
                                <p className="text-slate-300 text-lg font-medium leading-relaxed">
                                    Obrolkan langsung dengan tim support kami. <br className="hidden md:block" />
                                    Kami siap membantu kendala teknis maupun pertanyaan fitur.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsContactOpen(true)}
                                className="group/btn relative inline-flex items-center gap-4 px-10 py-6 bg-blue-600/90 backdrop-blur-md border border-blue-400/50 text-white rounded-[2rem] font-black text-xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:shadow-[0_20px_40px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-1.5 active:translate-y-0"
                            >
                                <MessageCircle className="w-7 h-7" />
                                <span>Hubungi Support</span>
                                <ArrowUpRight className="w-6 h-6 group-hover/btn:translate-x-1.5 group-hover/btn:-translate-y-1.5 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Pop-up Contact */}
            <ContactSupportModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
            />
        </section>
    );
};

export default FAQSection;