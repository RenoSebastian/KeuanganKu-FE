"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare, Mail, ArrowRight,
    Copy, Check, ShieldCheck, Headset, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactSupportModal = ({ isOpen, onClose }: ContactSupportModalProps) => {
    const [copied, setCopied] = useState<boolean>(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6">

                    {/* BACKDROP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* MODAL CENTER PANEL - Blueprint persis seperti MonthlyHelperModal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full md:max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* HEADER */}
                        <div className="relative pt-6 pb-5 px-6 bg-linear-to-b from-indigo-50/50 to-white flex items-start justify-between border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 shrink-0">
                                    <Headset className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-lg md:text-xl tracking-tight">Hubungi Support</h3>
                                    <p className="text-[11px] md:text-xs text-slate-500 font-medium mt-0.5">
                                        Bantuan teknis dari tim spesialis KeuanganKu.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all active:scale-95 shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* BODY CONTENT - Compact Grid */}
                        <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* CARD 1: WHATSAPP */}
                                <button
                                    onClick={() => window.open('https://wa.me/628122377761', '_blank')}
                                    className="group text-left flex flex-col items-start p-5 rounded-2xl bg-slate-50/50 border border-slate-200 hover:border-green-400 hover:bg-green-50/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 active:scale-[0.98] h-full"
                                >
                                    <div className="flex justify-between w-full items-center mb-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <div className="bg-green-100/50 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-green-700 border border-green-200 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full mb-4">
                                        <h4 className="text-base font-black text-slate-800 mb-1">WhatsApp Tech</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                            Konsultasi teknis instan via pesan singkat.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-wider group-hover:gap-3 transition-all mt-auto pt-4 w-full border-t border-slate-200/60">
                                        Mulai Chat <ArrowRight className="w-4 h-4" />
                                    </div>
                                </button>

                                {/* CARD 2: EMAIL */}
                                <div className="group flex flex-col items-start p-5 rounded-2xl bg-slate-50/50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 h-full">
                                    <div className="flex justify-between w-full items-center mb-4">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard('hello@keuanganku.id')}
                                            className="h-7 px-2.5 rounded-lg text-[10px] font-bold border-slate-200 bg-white"
                                        >
                                            {copied ? <Check className="w-3 h-3 text-green-500 mr-1" /> : <Copy className="w-3 h-3 text-slate-400 mr-1" />}
                                            {copied ? "Tersalin" : "Salin"}
                                        </Button>
                                    </div>

                                    <div className="flex-1 w-full mb-4">
                                        <h4 className="text-base font-black text-slate-800 mb-1">Email Ticketing</h4>
                                        <p className="text-xs text-slate-500 font-medium font-mono mb-1 truncate">hello@keuanganku.id</p>
                                        <p className="text-[10px] text-slate-400 font-bold">Estimasi: &lt; 2 Jam Kerja</p>
                                    </div>

                                    <Button
                                        onClick={() => window.location.href = 'mailto:hello@keuanganku.id'}
                                        className="w-full h-10 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-bold shadow-md active:scale-95 transition-all text-xs mt-auto"
                                    >
                                        Kirim Email
                                    </Button>
                                </div>

                            </div>
                        </div>

                        {/* FOOTER ACTIONS */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center shrink-0">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Komunikasi Aman Tersandi
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ContactSupportModal;