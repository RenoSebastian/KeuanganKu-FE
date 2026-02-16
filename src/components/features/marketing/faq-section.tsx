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
        <section className="py-32 bg-slate-50 relative overflow-hidden">
            {/* Background Ornaments - Glassmorphism Blobs */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-125 h-125 bg-blue-200/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-125 h-125 bg-indigo-200/20 rounded-full blur-[120px] animation-delay-2000" />
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/5 border border-blue-600/10 mb-6 shadow-sm">
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Common Queries</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-[1000] text-slate-900 tracking-tighter mb-6 leading-tight">
                        Ada yang Masih <br />
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                            Mengganjal di Pikiran?
                        </span>
                    </h2>
                    <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
                        Kami merangkum segala hal yang sering ditanyakan para agen profesional sebelum memutuskan untuk upgrade ke ekosistem Pro.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-5">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="group border-none bg-white rounded-[2rem] px-8 py-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-500 data-[state=open]:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.15)] data-[state=open]:ring-1 data-[state=open]:ring-blue-500/20"
                        >
                            <AccordionTrigger className="flex gap-4 text-left font-black text-slate-900 hover:no-underline text-xl py-6 group-data-[state=open]:text-blue-600 transition-all duration-300">
                                <span className="flex-1 leading-tight">{faq.question}</span>
                                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-data-[state=open]:bg-blue-600 group-data-[state=open]:text-white group-data-[state=open]:rotate-360 transition-all duration-500">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-500 leading-relaxed text-lg pb-8 font-medium border-t border-slate-50 pt-6 mt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {/* Modern CTA Card - Nyentrik & Interactive */}
                <div className="mt-24 group relative">
                    {/* Glowing effect background */}
                    <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 rounded-[3.5rem] blur-3xl opacity-10 group-hover:opacity-25 transition-opacity duration-500" />

                    <div className="relative bg-slate-900 rounded-[3.5rem] p-10 md:p-16 overflow-hidden border border-white/5 shadow-2xl">
                        {/* Decorative circles */}
                        <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-blue-600/20 rounded-full blur-[80px] animate-pulse" />
                        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-indigo-600/10 rounded-full blur-[80px]" />

                        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                            <div className="text-center md:text-left">
                                <h3 className="text-white text-3xl md:text-4xl font-black tracking-tight mb-4">
                                    Belum Nemu Jawabannya?
                                </h3>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                    Obrolkan langsung dengan tim support kami. <br className="hidden md:block" />
                                    Kami siap membantu kendala teknis maupun pertanyaan fitur.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsContactOpen(true)}
                                className="group/btn relative inline-flex items-center gap-4 px-10 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-900/40 hover:bg-blue-700 transition-all hover:-translate-y-1.5 active:translate-y-0"
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