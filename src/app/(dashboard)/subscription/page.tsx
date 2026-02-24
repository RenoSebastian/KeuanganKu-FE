"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Sparkles, Info, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/axios";
import { subscriptionService, SubscriptionPlan, SubscriptionOrder } from "@/services/subscription.service";

// Import Modular Components
import { PaymentModal } from "@/components/features/subscription/payment-modal";
import { MembershipStatusCard } from "@/components/features/subscription/membership-status-card";
import { PlanCard } from "@/components/features/subscription/plan-card";
import { BillingHistory } from "@/components/features/subscription/billing-history";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring" as const,
            stiffness: 260,
            damping: 25
        }
    }
};

export default function SubscriptionPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // 1. HARDCODED FREE PLAN (FIX 2353: Menghapus properti metadata agar sesuai interface Frontend)
    const freePlan: SubscriptionPlan = {
        id: "FREE_VERSION_ID",
        code: "FREE",
        name: "Free Version",
        description: "Akses dasar untuk eksplorasi awal.",
        durationMonths: 0,
        price: 0,
    };

    const fetchData = async () => {
        try {
            const [plansData, ordersData, profileData] = await Promise.all([
                subscriptionService.getPlans(),
                subscriptionService.getMyOrders(),
                api.get("/users/me")
            ]);

            // Injeksi paket Free ke daftar yang didapat dari DB
            setPlans([freePlan, ...plansData]);
            setOrders(ordersData);
            setCurrentUser(profileData.data);
        } catch (error) {
            toast.error("Gagal sinkronisasi data billing");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Subscription State...</p>
        </div>
    );

    const isPro = currentUser?.subscription?.status === 'ACTIVE';

    // 2. LOGIKA IDENTIFIKASI STATUS
    // Jika user TIDAK PRO, paksa highlight ke kartu Free hardcoded.
    const activePlanId = isPro
        ? currentUser.subscription.planId
        : "FREE_VERSION_ID";

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans selection:bg-indigo-100">

            {/* HERO SECTION */}
            <div className="bg-slate-950 pt-28 pb-44 px-6 relative overflow-hidden text-center">
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

                {/* [FIX LINTER]: Canonical Class w-150 h-150 */}
                <div className="absolute top-0 right-0 w-150 h-150 bg-indigo-600/20 rounded-full blur-[120px] -mr-48 -mt-48" />

                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Badge className="bg-white/5 backdrop-blur-xl text-indigo-300 border-white/10 mb-8 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">
                            Subscription Center
                        </Badge>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-8">
                            Kendali Penuh <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-blue-500 to-cyan-400">Masa Depan.</span>
                        </h1>
                        <p className="text-slate-400 font-bold max-w-2xl mx-auto text-lg md:text-xl leading-relaxed opacity-80">
                            Buka potensi penuh alat perencanaan keuangan profesional dengan upgrade ke paket PRO.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-20">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-12"
                >

                    {/* MEMBERSHIP STATUS CARD */}
                    <div className="w-full">
                        <MembershipStatusCard
                            isPro={isPro}
                            planName={isPro ? currentUser.subscription.plan.name : "Free Version Account"}
                            avatar={currentUser?.avatar} // Injeksi data avatar di sini
                            endDate={currentUser?.subscription?.endDate}
                            variants={itemVariants}
                        />
                    </div>

                    {/* PILIHAN PAKET (GRID 2x2) */}
                    <div className="space-y-10">
                        <div className="flex flex-col items-center text-center space-y-2 mb-4">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Pilihan Membership</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Temukan paket terbaik untuk Anda</p>
                        </div>

                        {/* GRID 2x2: Tata letak simetris untuk 4 Paket */}
                        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 items-stretch">
                            {plans.map((plan, idx) => (
                                <PlanCard
                                    key={plan.id || idx}
                                    plan={plan}
                                    index={idx}
                                    currentPlanId={activePlanId}
                                    onSelect={setSelectedPlan}
                                    variants={itemVariants}
                                />
                            ))}
                        </div>
                    </div>

                    {/* BILLING & SUPPORT (BOTTOM STACK) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <BillingHistory orders={orders} variants={itemVariants} />

                        <motion.div variants={itemVariants} className="w-full h-full">
                            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-blue-900/20 h-full flex flex-col justify-center border border-white/5">
                                <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                                    <Sparkles size={200} />
                                </div>
                                <div className="relative z-10 text-center md:text-left">
                                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 mb-6 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                        Support Center
                                    </Badge>
                                    <h4 className="text-3xl font-black tracking-tight mb-4 leading-tight">
                                        Butuh <br /> Bantuan?
                                    </h4>
                                    <p className="text-sm font-bold text-slate-400 leading-relaxed mb-10 opacity-80">
                                        Hubungi tim kami jika Anda mengalami kendala pada proses pembayaran atau verifikasi akun.
                                    </p>
                                    <Button className="w-full h-14 rounded-2xl bg-white text-indigo-600 font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-50 shadow-xl transition-all active:scale-95">
                                        Hubungi WhatsApp Support
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div variants={itemVariants} className="text-center py-10 opacity-40">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                            Secured by KeuanganKu Enterprise Layer
                        </p>
                    </motion.div>

                </motion.div>
            </div>

            {/* MODAL HANDLER */}
            <AnimatePresence>
                {selectedPlan && (
                    <PaymentModal
                        plan={selectedPlan}
                        onClose={() => setSelectedPlan(null)}
                        onSuccess={() => { setSelectedPlan(null); fetchData(); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}