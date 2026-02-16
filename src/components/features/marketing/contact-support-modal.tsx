"use client";

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, Phone, ArrowRight, Copy, Check } from "lucide-react";
import { useState } from 'react';

interface ContactSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactSupportModal = ({ isOpen, onClose }: ContactSupportModalProps) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-112.5 rounded-[2.5rem] border-none p-0 overflow-hidden shadow-2xl">
                {/* Header dengan Gradient */}
                <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <MessageSquare size={120} />
                    </div>
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black tracking-tight">Hubungi Support</DialogTitle>
                        <DialogDescription className="text-blue-100 text-base font-medium">
                            Tim kami siap membantu optimasi workflow keagenan Anda.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-4 bg-white">
                    {/* Option 1: WhatsApp */}
                    <button
                        onClick={() => window.open('https://wa.me/628123456789', '_blank')}
                        className="w-full group flex items-center justify-between p-4 rounded-2xl bg-green-50 border border-green-100 hover:border-green-300 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500 rounded-xl text-white shadow-lg shadow-green-200">
                                <MessageSquare size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900">WhatsApp Admin</p>
                                <p className="text-xs text-green-700 font-medium italic">Respon cepat (24/7)</p>
                            </div>
                        </div>
                        <ArrowRight size={18} className="text-green-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Option 2: Email */}
                    <div className="relative group">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-200">
                                    <Mail size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-900">Email Support</p>
                                    <p className="text-xs text-slate-500">support@keuanganku.id</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard('support@keuanganku.id')}
                                className="rounded-full hover:bg-white"
                            >
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-slate-400" />}
                            </Button>
                        </div>
                    </div>

                    <p className="text-center text-[10px] text-slate-400 font-medium px-4">
                        Dengan menghubungi kami, Anda menyetujui syarat & ketentuan layanan bantuan pelanggan KeuanganKu.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ContactSupportModal;