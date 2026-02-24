"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CreditCard, XCircle, Building2, Copy, Upload,
    ShieldCheck, Zap, Image as ImageIcon,
    Loader2, ArrowRight, Wallet, Check, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { subscriptionService, SubscriptionPlan } from "@/services/subscription.service";

interface PaymentModalProps {
    plan: SubscriptionPlan;
    onClose: () => void;
    onSuccess: () => void;
}

export function PaymentModal({ plan, onClose, onSuccess }: PaymentModalProps) {
    const [image, setImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return toast.error("Ukuran file maksimal 2MB");
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Nomor rekening berhasil disalin");
    };

    const handleSubmit = async () => {
        if (!image) return toast.error("Mohon lampirkan bukti transfer");
        setIsSubmitting(true);
        try {
            await subscriptionService.createOrder(plan.id, image);
            toast.success("Bukti transfer terkirim. Mohon tunggu verifikasi.");
            onSuccess();
        } catch (error) {
            toast.error("Terjadi kendala saat mengirim data");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">

            {/* BACKDROP - Efek blur konsisten dengan modul helper lainnya */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={!isSubmitting ? onClose : undefined}
            />

            {/* MODAL PANEL - Centered Floating Layout */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full md:max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >

                {/* HEADER SECTION - DNA: Sticky & Glassmorphism Header */}
                <div className="relative pt-7 pb-5 px-8 bg-linear-to-b from-indigo-50/50 to-white flex items-start justify-between border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 shrink-0">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 text-lg md:text-xl tracking-tight leading-tight">Konfirmasi Upgrade</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 px-2 py-0 font-black text-[9px] uppercase tracking-widest">
                                    Step 2: Payment
                                </Badge>
                                <span className="flex items-center gap-1 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
                                    <ShieldCheck size={10} strokeWidth={3} /> Secure SSL
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all active:scale-95 shrink-0"
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                {/* SCROLLABLE BODY CONTENT */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-6">

                    {/* INVOICE MINI CARD */}
                    <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-5 flex items-center justify-between shadow-inner">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Paket</p>
                                <h4 className="text-sm font-black text-slate-800 tracking-tight">{plan.name}</h4>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5 tracking-widest leading-none">Total Bayar</p>
                            <p className="text-lg font-black text-indigo-600 tracking-tighter">Rp {plan.price.toLocaleString('id-ID')}</p>
                        </div>
                    </div>

                    {/* BANK DETAILS CARD */}
                    <div className="bg-slate-900 p-6 rounded-[2.2rem] text-white relative overflow-hidden group shadow-xl">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                            <Building2 size={80} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" /> Rekening Tujuan
                            </p>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-3xl font-black tracking-[0.1em] font-mono">1234567890</p>
                                <button
                                    onClick={() => handleCopy("1234567890")}
                                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95 border border-white/5"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-4">Bank BCA • A/N KeuanganKu Digital</p>
                            <div className="h-px bg-white/10 w-full mb-4" />
                            <p className="text-[10px] text-slate-500 italic leading-relaxed">
                                *Gunakan berita acara: <span className="font-bold text-slate-300">UPGRADE_{plan.name.replace(/\s+/g, '_').toUpperCase()}</span>
                            </p>
                        </div>
                    </div>

                    {/* UPLOAD ZONE */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unggah Bukti Transfer</label>
                        <div
                            onClick={() => document.getElementById('proof-upload')?.click()}
                            className={cn(
                                "group relative border-2 border-dashed rounded-[2.2rem] p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden",
                                image ? "border-emerald-500 bg-emerald-50/10" : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-400 shadow-sm"
                            )}
                        >
                            {image ? (
                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white">
                                    <img src={image} className="w-full h-full object-cover" alt="Proof" />
                                    <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <RefreshCw className="text-white mb-2" size={24} />
                                        <p className="text-white text-[10px] font-black uppercase tracking-widest">Ganti Bukti</p>
                                    </div>
                                    <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                                        <Check size={14} strokeWidth={4} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-4 text-center">
                                    <div className="w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform border border-slate-50">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm font-black text-slate-700">Lampirkan Bukti Bayar</p>
                                    <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-tighter">Tap untuk pilih file (Maks. 2MB)</p>
                                </div>
                            )}
                            <input id="proof-upload" type="file" hidden accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>
                </div>

                {/* ACTIONS SECTION - DNA: Persistent Bottom Actions */}
                <div className="p-6 md:p-8 bg-white border-t border-slate-50 shrink-0">
                    <Button
                        disabled={isSubmitting || !image}
                        onClick={handleSubmit}
                        className={cn(
                            "w-full h-16 rounded-2xl text-white font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3",
                            !image ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                        )}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin" size={20} /> Mengirim Data...</>
                        ) : (
                            <>Kirim Konfirmasi <ArrowRight size={20} strokeWidth={3} /></>
                        )}
                    </Button>
                    <div className="mt-4 flex items-center justify-center gap-6 opacity-40">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                            <ShieldCheck size={12} className="text-emerald-600" /> Manual Verify
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                            <Wallet size={12} className="text-blue-600" /> Safe Transfer
                        </div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
}