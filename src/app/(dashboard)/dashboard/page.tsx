"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Target, Lightbulb,
  Users, FileText,
  Quote, User, Pencil,
  Loader2
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { User as UserType } from "@/lib/types";

// --- 1. DATA STATIC & QUOTES SYSTEM ---
const AGENT_QUOTES = [
  "Perlindungan hari ini adalah ketenangan masa depan bagi klien Anda.",
  "Setiap penolakan mendekatkan Anda pada satu persetujuan besar.",
  "Anda tidak hanya menjual kertas, Anda menjual kepastian hidup.",
  "Jadilah pendengar yang baik sebelum menjadi pembicara yang hebat.",
  "Trust adalah mata uang paling berharga dalam bisnis ini.",
  "Bantu orang lain mencapai impian mereka, dan Anda akan mencapai impian Anda.",
  "Edukasi, bukan intimidasi. Beri solusi, bukan sekadar janji.",
  "Klien membeli karena mereka percaya pada Anda, bukan hanya produknya.",
  "Kesuksesan agen diukur dari berapa banyak keluarga yang berhasil diamankan.",
  "Konsistensi adalah kunci. Teruslah bergerak, teruslah melayani."
];

export default function DashboardPage() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // State untuk Quote
  const [quote, setQuote] = useState("");

  const currentDate = new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // --- MENU KONFIGURASI (AGENT WORKSTATION) ---
  const AGENT_MENUS = [
    {
      title: "Alat Simulasi Klien",
      items: [
        {
          label: "Analisa Keuangan Pribadi",
          emoji: "📝",
          href: "/finance/checkup",
          desc: "Financial Checkup Lengkap",
          style: "bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600"
        },
        {
          label: "Rancang Anggaran",
          emoji: "🧮",
          href: "/calculator/budget",
          desc: "Cek kesehatan arus kas",
          style: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
        },
        {
          label: "Rencana dana Pendidikan",
          emoji: "🎓",
          href: "/calculator/education",
          desc: "Hitung biaya kuliah anak",
          style: "bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600"
        },
        {
          label: "Rencana Dana Hari Tua",
          emoji: "🛡️",
          href: "/calculator/insurance",
          desc: "Kebutuhan proteksi income",
          style: "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600"
        },
        {
          label: "Rancang Proteksi",
          emoji: "☂️",
          href: "/calculator/pension",
          desc: "Ilustrasi dana hari tua",
          style: "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600"
        },
        {
          label: "Rencana Khusus",
          emoji: "🎯",
          href: "/calculator/goals",
          desc: "Ibadah, Mobil, Rumah",
          style: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600"
        },
      ]
    },
  ];

  useEffect(() => {
    // 1. Set Random Quote on Mount (Always Quotes)
    const randomQuote = AGENT_QUOTES[Math.floor(Math.random() * AGENT_QUOTES.length)];
    setQuote(randomQuote);

    // 2. Fetch User Profile
    const fetchUser = async () => {
      try {
        // Optimistic Load dari LocalStorage
        const storedUser = authService.getCurrentUser();
        if (storedUser) setUserData(storedUser);

        // Fresh Load dari API
        const user = await authService.getMe();
        if (user) setUserData(user);
      } catch (error) {
        console.error("Gagal memuat profil user:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  // [INTEGRATION] Safe Display Name & Profile Logic
  const displayName = userData?.fullName || "Partner Agen";
  const agentLevel = userData?.agentLevel || "Financial Consultant";
  const agencyName = userData?.agencyName || "Agency Partner";
  const companyName = userData?.companyName || "Mitra Perusahaan";

  return (
    <div className="relative min-h-full w-full pb-32 md:pb-12 bg-slate-50/30">

      <div className="relative z-10 max-w-7xl mx-auto px-5 pt-6 md:px-8 md:pt-10">

        {/* =========================================
            HEADER SECTION
            ========================================= */}

        {/* [MOBILE HEADER] */}
        <div className="flex flex-col items-center mb-6 md:hidden">
          <div className="relative w-32 h-12 mb-4">
            <Image src="/images/logokeuanganku.png" alt="Logo" fill className="object-contain" priority />
          </div>
          {/* Mobile Profile Compact View */}
          <div className="w-full glass-panel p-4 rounded-2xl flex items-center justify-between bg-white border border-slate-200 shadow-sm">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">{agencyName}</p>
              <p className="text-base font-bold text-brand-900 truncate max-w-50">{displayName}</p>
            </div>
            <div className="h-10 w-10 bg-brand-50 rounded-full overflow-hidden border border-brand-100">
              {userData?.avatar ? (
                <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* [DESKTOP HEADER] */}
        <div className="hidden md:flex justify-between items-end mb-10">
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-200">
                <Calendar className="w-4 h-4 text-brand-600" />
              </div>
              <span className="text-sm font-medium uppercase tracking-wide">{currentDate}</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Agent Workspace
            </h1>
            <p className="text-lg text-slate-600">
              Selamat bekerja, <span className="font-bold text-brand-600">{displayName}</span>. Mari kita dampingi nasabah mencapai tujuan hidupnya
            </p>
          </div>

          <Button
            className="hidden lg:flex bg-slate-900 hover:bg-slate-800 text-white gap-2 rounded-full px-6 h-12 shadow-lg shadow-slate-900/20 transition-all hover:scale-105"
            onClick={() => router.push('/finance/checkup')}
          >
            <Users className="w-4 h-4" />
            <span>Tambah Klien Baru</span>
          </Button>
        </div>

        {/* =========================================
            MAIN CONTENT GRID
            ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

          {/* --- LEFT COLUMN (Hero & Menu) --- */}
          <div className="md:col-span-8 space-y-8">

            {/* 1. IDENTITY HERO CARD (LEFT SIDE ALWAYS QUOTES) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col md:flex-row min-h-85">

              {/* Background Accent Gradient */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/80 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

              {/* Left Side: Quotes & Motivation */}
              <div className="flex-1 p-6 md:p-10 flex flex-col justify-center relative z-10 order-2 md:order-1">
                <div className="flex items-center gap-2 mb-6">
                  {/* Badge Nama Agency */}
                  <span className="px-3 py-1 bg-yellow-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200">
                    {agencyName}
                  </span>
                </div>

                {/* Random Quotes Always Here */}
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 leading-tight italic">
                  "{quote}"
                </h2>

                <div className="flex items-center gap-3 mt-auto">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Quote className="w-5 h-5 fill-slate-300 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Daily Motivation</p>
                    <p className="text-[10px] text-slate-400">Boost your closing rate</p>
                  </div>
                </div>
              </div>

              {/* Right Side: STRUCTURAL PORTRAIT FRAME MODULE */}
              <div className="w-full md:w-70 bg-slate-50 flex items-center justify-center p-6 border-l border-slate-100 relative overflow-hidden order-1 md:order-2">

                {/* Background Pattern Effects */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute right-0 top-0 w-full h-full bg-linear-to-bl from-slate-400 via-transparent to-transparent" />
                  <div className="absolute top-10 -right-12.5 w-50 h-px bg-slate-800 rotate-45" />
                  <div className="absolute top-20 -right-12.5 w-50 h-px bg-slate-800 rotate-45" />
                </div>

                {/* Main Card Container (The Frame) */}
                <div className="relative w-56 h-72 bg-white shadow-2xl overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 rounded-sm border border-slate-200">

                  {/* --- LAYER 1: FRAME SISI KIRI (JABATAN / LEVEL) --- */}
                  <div className="absolute top-0 bottom-0 left-0 w-10 bg-slate-900 z-20
                flex flex-col items-center border-r border-slate-700">
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-white font-black tracking-[0.25em]
                      text-[10px] -rotate-90 whitespace-nowrap
                      uppercase opacity-90">
                        {agentLevel}
                      </span>
                    </div>
                    {/* Hiasan fleksibel */}
                    <div className="mb-4 w-1 flex-[0.2] bg-blue-500 rounded-full" />
                  </div>

                  {/* --- LAYER 2: IMAGE (UNDERLAY) --- */}
                  <div className="absolute inset-0 z-0 bg-linear-to-br from-slate-200 to-white flex items-end justify-center pl-10">
                    {loadingUser ? (
                      <div className="flex flex-col items-center justify-center h-full w-full pb-10">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-900 mb-2" />
                        <span className="text-[10px] text-slate-400 font-mono">Loading...</span>
                      </div>
                    ) : userData?.avatar ? (
                      <img
                        src={userData.avatar}
                        alt="Agen Profile"
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-end justify-center bg-slate-100 text-slate-300 pb-8">
                        <User className="w-24 h-24 opacity-20" />
                      </div>
                    )}
                  </div>

                  {/* --- LAYER 3: FRAME SISI BAWAH/KANAN (NAMA & PERUSAHAAN) --- */}
                  <div className="absolute bottom-0 right-0 z-30 flex justify-end w-full pl-10">
                    {/* Container Nama melayang dari kanan */}
                    <div className="bg-white/95 backdrop-blur-md py-3 px-5 shadow-lg border-l-4 border-blue-600 rounded-l-sm min-w-37.5 relative animate-in slide-in-from-right-4 duration-700">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none mb-1 truncate max-w-35">
                        {companyName}
                      </p>
                      <h3 className="text-slate-900 font-black text-sm uppercase tracking-wider truncate max-w-35">
                        {displayName}
                      </h3>
                      {/* Aksen sudut kanan bawah */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-slate-900 clip-triangle-corner" />
                    </div>
                  </div>

                  {/* --- LAYER 4: DEKORASI SUDUT (FRAME EFFECT) --- */}
                  <div className="absolute top-0 right-0 w-8 h-8 z-30 pointer-events-none">
                    <div className="absolute top-0 right-0 w-full h-full border-t-[6px] border-r-[6px] border-slate-900/10" />
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm z-30" title="Active" />
                </div>
              </div>
            </div>

            {/* 2. MENU WORKSTATION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-1 h-5 bg-brand-500 rounded-full"></div>
                  {AGENT_MENUS[0].title}
                </h3>
              </div>

              <div className="grid grid-cols-6 gap-3 px-1">
                {AGENT_MENUS[0].items.map((item, index) => (
                  <MenuCard
                    key={index}
                    title={item.label}
                    emoji={item.emoji}
                    desc={item.desc}
                    styleClass={item.style}
                    onClick={() => router.push(item.href)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN (Activity Stats) --- */}
          <div className="md:col-span-4 space-y-6">

            {/* 1. AGENT PERFORMANCE CARD */}
            <div className="bg-white rounded-2xl p-5 md:p-6 space-y-5 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex justify-between items-center">
                <span>Aktivitas Bulan Ini</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">Live Update</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <StatBox
                  label="Total Klien"
                  value="12"
                  icon={<Users className="w-4 h-4 text-blue-500" />}
                  bg="bg-blue-50"
                />
                <StatBox
                  label="Total Report"
                  value="45"
                  icon={<FileText className="w-4 h-4 text-orange-500" />}
                  bg="bg-orange-50"
                />
              </div>

              {/* [REPLACED] CLOSING RATE -> MY PRIORITY GOAL */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-blue-100 shadow-xs">
                    My Main Goal
                  </span>
                  <Target className="w-5 h-5 text-blue-600" />
                </div>

                <div className="relative z-10">
                  {userData?.goals ? (
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic line-clamp-3">
                      "{userData.goals}"
                    </p>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-xs text-slate-500 mb-2 font-medium">Belum ada goals yang diset.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs bg-white hover:bg-blue-100 text-blue-600 border-blue-200"
                        onClick={() => router.push('/profile')}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Tulis Goals
                      </Button>
                    </div>
                  )}
                </div>

                {/* Decoration */}
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transition-transform duration-500 group-hover:scale-110">
                  <Target className="w-24 h-24 -mr-6 -mb-6 text-blue-800" />
                </div>
              </div>
            </div>

            {/* 2. SALES TIPS WIDGET */}
            <div className="hidden md:block bg-linear-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
                    <Lightbulb className="w-4 h-4 text-yellow-300" />
                  </div>
                  <h4 className="font-bold text-base">Tips Penjualan</h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-yellow-400/50 pl-3">
                  "Fokuslah pada masalah yang dihadapi klien, bukan produk yang Anda jual. Solusi adalah kunci closing."
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function StatBox({ label, value, icon, bg }: any) {
  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-all group">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors", bg)}>
        {icon}
      </div>
      <p className="text-xs text-slate-500 font-medium mb-0.5">{label}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

interface MenuCardProps {
  title: string;
  emoji: string;
  desc?: string;
  styleClass: string;
  onClick: () => void;
}

function MenuCard({ title, emoji, onClick }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="
        relative
        flex flex-col items-center justify-center
        py-3
        rounded-2xl
        active:scale-95
        transition-all duration-200
        group
      "
    >
      {/* Background soft layer */}
      <div className="
        absolute inset-0 rounded-2xl
        bg-linear-to-br from-white via-slate-50 to-slate-100
        opacity-80
        shadow-sm
        group-active:shadow-inner
      " />

      {/* Glow bubble */}
      <div className="
        absolute -top-2 -right-2 w-8 h-8
        bg-brand-400/20
        rounded-full blur-xl
        pointer-events-none
      " />

      {/* ICON BUBBLE */}
      <div className="
        relative z-10
        w-16 h-16 rounded-full
        bg-white
        flex items-center justify-center
        text-xl
        shadow-md
        border border-slate-100
        transition-all duration-200
        group-hover:scale-105
      ">
        {emoji}
      </div>

      {/* TITLE */}
      <span className="
        relative z-10
        mt-1.5
        text-[10px]
        font-semibold
        text-slate-700
        text-center
        leading-tight
      ">
        {title}
      </span>
    </button>
  );
}