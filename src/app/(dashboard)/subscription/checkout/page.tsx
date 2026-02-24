"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Phone, Calendar, CreditCard,
    ArrowLeft, CheckCircle2, Building2,
    ShieldCheck, Upload, ChevronRight,
    Sparkles, Wallet, BadgeCheck, Loader2,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";
import { subscriptionService, SubscriptionPlan } from "@/services/subscription.service";
import { Badge } from "@/components/ui/badge";

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get("planId");

    const [step, setStep] = useState(1);
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        fullName: "",
        whatsapp: "",
        agency: "",
        paymentDate: new Date().toISOString().split('T')[0],
        proofImage: null as string | null,
    });

    useEffect(() => {
        if (!planId) {
            router.push("/subscription");
            return;
        }

        const fetchPlan = async () => {
            try {
                const data = await subscriptionService.getPlans();
                const selected = data.find(p => p.id === planId);
                if (selected) setPlan(selected);
                else router.push("/subscription");
            } catch (error) {
                toast.error("Gagal memuat detail paket");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlan();
    }, [planId, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData({ ...formData, proofImage: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const handleProcessOrder = async () => {
        if (!formData.proofImage) return toast.error("Mohon lampirkan bukti transfer");
        setIsSubmitting(true);
        try {
            await api.post("/subscription/orders", {
                planId: plan?.id,
                proofImageUrl: formData.proofImage,
                // Data tambahan dikirim ke backend untuk logging/CRM
                metaData: {
                    whatsapp: formData.whatsapp,
                    agency: formData.agency,
                    paymentDate: formData.paymentDate
                }
            });
            setStep(3); // Pindah ke tahap sukses
        } catch (error) {
            toast.error("Gagal memproses pesanan. Silakan hubungi admin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-blue-500"><Loader2 className="animate-spin" size={48} /></div>;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 pb-20 font-sans selection:bg-blue-500">

            {/* 1. TOP NAVIGATION */}
            <nav className="p-6 flex items-center justify-between sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Batal</span>
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-sm font-black tracking-tight uppercase italic">Secure Checkout</h1>
                    <div className="flex gap-1 mt-1">
                        <div className={cn("w-8 h-1 rounded-full transition-all", step >= 1 ? "bg-blue-600" : "bg-white/10")} />
                        <div className={cn("w-8 h-1 rounded-full transition-all", step >= 2 ? "bg-blue-600" : "bg-white/10")} />
                        <div className={cn("w-8 h-1 rounded-full transition-all", step >= 3 ? "bg-blue-600" : "bg-white/10")} />
                    </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                    <ShieldCheck size={18} className="text-blue-500" />
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">

                    {/* STEP 1: IDENTITY DATA */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="space-y-2">
                                <h2 className="text-4xl font-[1000] text-white tracking-tighter leading-none">Siapa Anda <br /><span className="text-blue-500">Hebat?</span></h2>
                                <p className="text-slate-400 font-bold text-sm">Lengkapi data untuk verifikasi sertifikat & laporan pro.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-2">
                                        <User size={12} className="text-blue-500" /> Nama Lengkap Sesuai ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Reno Sebastian, CFP"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-[1.8rem] h-16 px-8 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-2">
                                            <Phone size={12} className="text-blue-500" /> WhatsApp Aktif
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="62812xxxx"
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.8rem] h-16 px-8 font-bold focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-2">
                                            <Building2 size={12} className="text-blue-500" /> Kantor Agency / Perusahaan
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Nama Kantor Anda"
                                            value={formData.agency}
                                            onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.8rem] h-16 px-8 font-bold focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] font-black uppercase text-blue-400">Order Summary</span>
                                    <Badge className="bg-blue-600 text-white border-0 font-black px-4 py-1">{plan?.durationMonths} Bln</Badge>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="text-2xl font-black text-white">{plan?.name}</h4>
                                        <p className="text-xs font-bold text-slate-500 italic">Full Pro Features Enabled</p>
                                    </div>
                                    <p className="text-2xl font-[1000] text-blue-500">Rp {plan?.price.toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setStep(2)}
                                disabled={!formData.fullName || !formData.whatsapp}
                                className="w-full h-20 rounded-[2rem] bg-white text-slate-950 hover:bg-blue-500 hover:text-white font-black uppercase tracking-[0.2em] shadow-2xl transition-all"
                            >
                                Lanjut ke Pembayaran <ChevronRight className="ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {/* STEP 2: PAYMENT & UPLOAD */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="space-y-2">
                                <h2 className="text-4xl font-[1000] text-white tracking-tighter leading-none">Hampir <br /><span className="text-blue-500">Selesai.</span></h2>
                                <p className="text-slate-400 font-bold text-sm">Lakukan transfer dan lampirkan bukti pembayaran Anda.</p>
                            </div>

                            {/* BANK CARD */}
                            <div className="bg-linear-to-br from-blue-700 to-indigo-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-3xl">
                                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Wallet size={120} /></div>
                                <div className="relative z-10 space-y-8">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Penerima Transfer (BCA)</p>
                                        <h3 className="text-4xl font-black tracking-tightest">123-456-7890</h3>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-lg font-black tracking-tight">KeuanganKu Digital</p>
                                            <p className="text-[10px] font-bold uppercase opacity-60">Verified Business Account</p>
                                        </div>
                                        <BadgeCheck className="text-blue-400 mb-1" size={32} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Tanggal Transfer</label>
                                    <input
                                        type="date"
                                        value={formData.paymentDate}
                                        onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-[1.8rem] h-16 px-8 font-bold outline-none"
                                    />
                                </div>
                                <div
                                    onClick={() => document.getElementById('proof-upload')?.click()}
                                    className={cn(
                                        "border-2 border-dashed rounded-[1.8rem] flex items-center justify-center cursor-pointer transition-all duration-500 group",
                                        formData.proofImage ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 hover:border-blue-500"
                                    )}
                                >
                                    {formData.proofImage ? (
                                        <p className="text-xs font-black text-emerald-400 uppercase tracking-widest px-4"><CheckCircle2 className="inline mr-2" size={14} /> Bukti Terlampir</p>
                                    ) : (
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest px-4"><Upload className="inline mr-2" size={14} /> Upload Bukti</p>
                                    )}
                                    <input id="proof-upload" type="file" hidden accept="image/*" onChange={handleFileChange} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    onClick={handleProcessOrder}
                                    disabled={isSubmitting || !formData.proofImage}
                                    className="w-full h-20 rounded-[2rem] bg-blue-600 text-white hover:bg-blue-700 font-black uppercase tracking-[0.2em] shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)] transition-all"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Konfirmasi Pembayaran"}
                                </Button>
                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors"
                                >
                                    Edit Data Identitas
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: SUCCESS EXPERIENCE */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8 py-20"
                        >
                            <div className="relative inline-block">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="absolute inset-0 bg-blue-600 blur-[80px] rounded-full"
                                />
                                <div className="relative w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-3xl">
                                    <Sparkles size={64} className="text-white animate-pulse" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-5xl font-[1000] text-white tracking-tightest leading-none">ORDER <br /> <span className="text-blue-500">PROCESSED.</span></h2>
                                <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
                                    Terima kasih, <b>{formData.fullName.split(' ')[0]}!</b> Bukti pembayaran sedang diverifikasi oleh tim kurator kami secara real-time.
                                </p>
                            </div>

                            <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 max-w-sm mx-auto">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><Clock size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase">Estimated Activation</p>
                                        <p className="text-sm font-bold text-white tracking-tight">Kurang dari 15 Menit</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => router.push("/subscription")}
                                className="w-full h-16 rounded-[1.5rem] bg-white/5 border border-white/10 text-white hover:bg-white hover:text-slate-950 font-black uppercase tracking-[0.2em] transition-all"
                            >
                                Cek Status Membership
                            </Button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            <style jsx global>{`
        .tracking-tightest { letter-spacing: -0.07em; }
        .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8); }
      `}</style>
        </div>
    );
}