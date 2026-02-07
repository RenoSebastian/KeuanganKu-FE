"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import { motion, Variants } from "framer-motion";

// --- DATA MENU ---
const FINANCE_MENUS = [
  {
    title: "Perencanaan & Kalkulator",
    items: [
      {
        label: "Rancang Anggaran",
        emoji: "🧮",
        href: "/calculator/budget",
        desc: "Kelola cashflow bulanan",
        color: "blue",
        gradient: "from-blue-500/20 to-blue-600/5",
        text: "text-blue-600",
        border: "group-hover:border-blue-500/50"
      },
      {
        label: "Dana Pendidikan",
        emoji: "🎓",
        href: "/calculator/education",
        desc: "Simulasi biaya sekolah anak",
        color: "orange",
        gradient: "from-orange-500/20 to-orange-600/5",
        text: "text-orange-600",
        border: "group-hover:border-orange-500/50"
      },
      {
        label: "Rencana Khusus",
        emoji: "🎯",
        href: "/calculator/goals",
        desc: "Ibadah, gadget, travel",
        color: "emerald",
        gradient: "from-emerald-500/20 to-emerald-600/5",
        text: "text-emerald-600",
        border: "group-hover:border-emerald-500/50"
      },
      {
        label: "Dana Hari Tua",
        emoji: "☂️",
        href: "/calculator/pension",
        desc: "Kemerdekaan finansial",
        color: "purple",
        gradient: "from-purple-500/20 to-purple-600/5",
        text: "text-purple-600",
        border: "group-hover:border-purple-500/50"
      },
      {
        label: "Proteksi Jiwa",
        emoji: "🛡️",
        href: "/calculator/insurance",
        desc: "Hitung uang pertanggungan",
        color: "rose",
        gradient: "from-rose-500/20 to-rose-600/5",
        text: "text-rose-600",
        border: "group-hover:border-rose-500/50"
      },
      {
        label: "Financial Checkup",
        emoji: "📝",
        href: "/finance/checkup",
        desc: "Diagnosa kesehatan dompet",
        color: "cyan",
        gradient: "from-cyan-500/20 to-cyan-600/5",
        text: "text-cyan-600",
        border: "group-hover:border-cyan-500/50"
      },
      // [NEW ITEM]: Risk Profile
      {
        label: "Cek Profil Risiko",
        emoji: "⚖️",
        href: "/risk-profile",
        desc: "Toleransi investasi Anda",
        color: "indigo",
        gradient: "from-indigo-500/20 to-indigo-600/5",
        text: "text-indigo-600",
        border: "group-hover:border-indigo-500/50",
        isNew: true // Flag untuk badge "NEW"
      },
    ]
  },
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Efek muncul berurutan (cascade)
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function FinancePage() {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 selection:bg-blue-100 selection:text-blue-900">

      {/* [BACKGROUND] Technical Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]"
        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* [BACKGROUND] Ambient Glows */}
      <div className="hidden md:block absolute top-[-10%] left-[-10%] w-125 h-125 bg-blue-400/30 rounded-full blur-[120px] mix-blend-multiply animate-pulse" />
      <div className="hidden md:block absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-purple-400/30 rounded-full blur-[120px] mix-blend-multiply" />

      {/* MAIN LAYOUT */}
      <div className="w-full max-w-7xl px-5 py-12 md:px-10 lg:px-16 relative z-10 flex flex-col lg:flex-row lg:items-start lg:gap-20">

        {/* === LEFT COLUMN: Sticky Header === */}
        <div className="lg:w-[35%] lg:sticky lg:top-24 mb-12 lg:mb-0 text-center lg:text-left">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                Financial Hub
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Kelola Uang <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600">
                Secara Cerdas
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed font-medium mb-8 max-w-md mx-auto lg:mx-0">
              Akses rangkaian alat bantu profesional untuk merencanakan masa depan, menganalisa kesehatan finansial, hingga memitigasi risiko.
            </p>

            {/* Quote / Stat Card Kecil */}
            <div className="hidden lg:flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-slate-200/60 shadow-sm w-fit">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Total Tools</p>
                <p className="text-xl font-bold text-slate-800">7 Modul Aktif</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* === RIGHT COLUMN: Bento Grid Menu === */}
        <motion.div
          className="lg:w-[65%]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {FINANCE_MENUS.map((group, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {group.items.map((item, idx) => (
                <FeatureCard key={idx} item={item} />
              ))}
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}

// --- CARD COMPONENT WITH PHYSICS ---
function FeatureCard({ item }: { item: any }) {
  return (
    <motion.div variants={itemVariants} className="h-full">
      <Link href={item.href} className="group block h-full focus:outline-none relative">

        {/* Card Body */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative h-full p-6 rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]",
            "transition-all duration-300",
            "hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)]",
            item.border // Dynamic Border Color on Hover
          )}
        >
          {/* Background Gradient Splash (Subtle) */}
          <div className={cn(
            "absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            `bg-${item.color}-400/20`
          )} />

          {/* New Badge */}
          {item.isNew && (
            <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold tracking-wider border border-indigo-200">
              NEW
            </span>
          )}

          <div className="flex flex-col h-full justify-between relative z-10">
            {/* Header: Icon */}
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner",
                "bg-linear-to-br", item.gradient // Dynamic Gradient Background for Icon
              )}>
                {item.emoji}
              </div>

              {/* Arrow appears on hover */}
              <ArrowRight className={cn(
                "w-5 h-5 text-slate-300 opacity-0 -translate-x-2 transition-all duration-300",
                "group-hover:opacity-100 group-hover:translate-x-0",
                `group-hover:text-${item.color}-500`
              )} />
            </div>

            {/* Content: Title & Desc */}
            <div>
              <h4 className={cn(
                "text-lg font-bold text-slate-800 mb-1 transition-colors",
                `group-hover:text-${item.color}-600`
              )}>
                {item.label}
              </h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}