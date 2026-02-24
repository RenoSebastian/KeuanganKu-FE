"use client";

import { motion } from "framer-motion";
import {
    History, CreditCard, Clock, CheckCircle2,
    XCircle, ChevronRight, ReceiptText, Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SubscriptionOrder } from "@/services/subscription.service";

interface BillingHistoryProps {
    orders: SubscriptionOrder[];
    variants: any;
}

export function BillingHistory({ orders, variants }: BillingHistoryProps) {
    // Helper untuk konfigurasi status agar kode lebih bersih (Clean Code principle)
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'VALID':
                return {
                    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
                    dot: "bg-emerald-500",
                    icon: <CheckCircle2 size={12} />,
                    label: "Terverifikasi"
                };
            case 'PENDING':
                return {
                    color: "text-amber-600 bg-amber-50 border-amber-100",
                    dot: "bg-amber-500",
                    icon: <Clock size={12} />,
                    label: "Mengecek"
                };
            default:
                return {
                    color: "text-rose-600 bg-rose-50 border-rose-100",
                    dot: "bg-rose-500",
                    icon: <XCircle size={12} />,
                    label: "Ditolak"
                };
        }
    };

    return (
        <motion.div
            variants={variants}
            className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col h-full"
        >
            {/* GLASS HEADER AREA */}
            <div className="p-8 border-b border-slate-50 bg-slate-50/40 backdrop-blur-md relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <ReceiptText size={100} />
                </div>

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-100">
                            <History size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1.5">Riwayat Invoice</h3>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-widest px-2 py-0">
                                    {orders.length} Transaksi
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LIST AREA */}
            <div className="p-6 space-y-3 overflow-y-auto max-h-130 custom-scrollbar bg-slate-50/20">
                {orders.length === 0 ? (
                    <div className="text-center py-24 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4 border-4 border-white shadow-inner">
                            <CreditCard size={32} strokeWidth={1.5} />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Belum Ada Catatan Billing</p>
                    </div>
                ) : (
                    orders.map((order, idx) => {
                        const status = getStatusConfig(order.verificationStatus);
                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group flex items-center justify-between p-5 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {/* Iconic Indicator */}
                                    <div className={cn(
                                        "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-3",
                                        status.color
                                    )}>
                                        {status.icon}
                                    </div>

                                    {/* Data Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                <Calendar size={10} />
                                                {new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <div className={cn("w-1 h-1 rounded-full", status.dot)} />
                                            <span className={cn("text-[9px] font-black uppercase tracking-tighter", status.color.split(' ')[0])}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-black text-slate-800 truncate tracking-tight uppercase">
                                            {order.plan?.name || "Premium Plan"}
                                        </h4>
                                        <p className="text-xs font-bold text-indigo-600 font-mono mt-0.5">
                                            Rp {order.snapshotPrice.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>

                                {/* Interaction Hint for PWA */}
                                <div className="ml-4 p-2 bg-slate-50 rounded-xl text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                                    <ChevronRight size={18} />
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* SAFE AREA FOOTER (Optional/PWA Optimization) */}
            <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center shrink-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Auto-Refreshed Data</p>
                <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-slate-200" />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}