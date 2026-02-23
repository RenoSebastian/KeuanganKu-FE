"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    MessageSquare, Mail, ArrowRight,
    Copy, Check, Sparkles, Headset, ShieldCheck
} from "lucide-react";
import { motion, Variants } from "framer-motion";

interface ContactSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactSupportModal = ({ isOpen, onClose }: ContactSupportModalProps) => {
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 15, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 260,
                damping: 28
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl lg:max-w-180 rounded-[1.5rem] md:rounded-[2rem] border-none p-0 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] bg-white">

                {/* Compact Immersive Header */}
                <div className="bg-linear-to-br from-indigo-700 via-blue-600 to-indigo-900 p-5 md:p-8 text-white relative overflow-hidden shrink-0">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-[60px]"
                    />

                    <DialogHeader className="relative z-10 text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                                <Headset size={16} className="text-cyan-300" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200">
                                Support Priority
                            </span>
                        </div>

                        <DialogTitle className="text-xl md:text-3xl font-black tracking-tight leading-tight">
                            Layanan <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-200 to-white">Bantuan Eksklusif</span>
                        </DialogTitle>
                        <DialogDescription className="text-blue-100/70 text-xs md:text-sm font-medium max-w-md">
                            Respon cepat dari tim spesialis KeuanganKu untuk optimasi sistem Anda.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Content Area - Tanpa Scroll, Fit to Content */}
                <div className="bg-slate-50/50 p-5 md:p-8">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {/* WhatsApp Card */}
                        <motion.div variants={itemVariants} className="flex flex-col">
                            <button
                                onClick={() => window.open('https://wa.me/628122377761', '_blank')}
                                className="flex-1 flex flex-col items-start p-5 md:p-6 rounded-[1.2rem] md:rounded-[1.5rem] bg-white border border-slate-100 hover:border-green-400 hover:shadow-lg transition-all duration-300 group active:scale-[0.98] relative overflow-hidden"
                            >
                                <div className="flex justify-between w-full items-start mb-4 relative z-10">
                                    <div className="p-3 bg-green-500 rounded-xl text-white shadow-md shadow-green-200 group-hover:scale-105 transition-transform">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div className="bg-green-50 px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest text-green-600 border border-green-100">
                                        Live Now
                                    </div>
                                </div>

                                <h4 className="text-base md:text-lg font-black text-slate-900 mb-1">WhatsApp Tech</h4>
                                <p className="text-[11px] md:text-xs text-slate-500 font-medium leading-relaxed mb-4">
                                    Konsultasi teknis instan via pesan singkat prioritas.
                                </p>
                                <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] md:text-xs uppercase tracking-wider mt-auto">
                                    Hubungi <ArrowRight size={14} />
                                </div>
                            </button>
                        </motion.div>

                        {/* Email Card */}
                        <motion.div variants={itemVariants} className="flex flex-col">
                            <div className="flex-1 flex flex-col items-start p-5 md:p-6 rounded-[1.2rem] md:rounded-[1.5rem] bg-white border border-slate-100 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                                <div className="flex justify-between w-full items-start mb-4 relative z-10">
                                    <div className="p-3 bg-slate-900 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform">
                                        <Mail size={20} />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => copyToClipboard('geocitra.office@gmail.com', 'email')}
                                        className="h-7 w-7 rounded-full bg-slate-50 hover:bg-indigo-50"
                                    >
                                        {copied === 'email' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-400" />}
                                    </Button>
                                </div>

                                <h4 className="text-base md:text-lg font-black text-slate-900 mb-1">Email Support</h4>
                                <p className="text-[11px] md:text-xs text-slate-500 font-medium mb-0.5 font-mono">geocitra.office@gmail.com</p>
                                <p className="text-[9px] md:text-[10px] text-slate-400 font-bold italic mb-4">Respon: &lt; 2 Jam Kerja</p>

                                <Button
                                    onClick={() => window.location.href = 'mailto:geocitra.office@gmail.com'}
                                    className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-100 active:scale-95 transition-all text-[11px]"
                                >
                                    Kirim Email
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Footer - Compact & Minimalist */}
                <div className="px-8 pb-6 md:pb-8 flex flex-col items-center gap-3 bg-slate-50/50 shrink-0">
                    <div className="h-px w-24 bg-slate-200" />
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <ShieldCheck size={12} className="text-indigo-500" /> Secure
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <Sparkles size={12} className="text-amber-500" /> Priority
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ContactSupportModal;