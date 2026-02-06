"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HealthGauge } from "@/components/features/dashboard/health-gauge";
import {
  Sparkles, TrendingUp, Calendar, ArrowRight, Info, AlertCircle,
  Calculator, GraduationCap, ShieldCheck, Landmark, Target, ClipboardList, Lightbulb,
  Wallet, Loader2, Activity
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { financialService } from "@/services/financial.service";
import { authService } from "@/services/auth.service"; // Import Auth Service
import { HealthAnalysisResult, User } from "@/lib/types";

// Helper format uang
const formatMoney = (val: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

export default function DashboardPage() {

  const FINANCE_MENUS = [
    {
      title: "Perencanaan & Kalkulator",
      items: [
        {
          label: "Rancang Anggaran",
          emoji: "🧮",
          href: "/calculator/budget",
          desc: "Kelola cashflow",
          style: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
        },
        {
          label: "Rencana Dana Pendidikan",
          emoji: "🎓",
          href: "/calculator/education",
          desc: "Biaya sekolah",
          style: "bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600"
        },
        {
          label: "Rancang Tujuan Khusus",
          emoji: "🎯",
          href: "/calculator/goals",
          desc: "Cicilan kendaraan, biaya ibadah, dll",
          style: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600"
        },
        {
          label: "Rencana Dana Hari Tua",
          emoji: "☂️",
          href: "/calculator/pension",
          desc: "Siapkan hari tua",
          style: "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600"
        },
        {
          label: "Rancang Proteksi",
          emoji: "🛡️",
          href: "/calculator/insurance",
          desc: "Asuransi jiwa",
          style: "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600"
        },
        {
          label: "Analisa Keuangan Pribadi",
          emoji: "📝",
          href: "/finance/checkup",
          desc: "Financial checkup",
          style: "bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600"
        },
      ]
    },
  ];

  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null); // Type safe
  const [checkupData, setCheckupData] = useState<HealthAnalysisResult | null>(null);

  const [loadingCheckup, setLoadingCheckup] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  const currentDate = new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    // 1. Fetch User Profile Terbaru
    const fetchUser = async () => {
      try {
        // Ambil dari localStorage dulu untuk instant render (optimistic UI)
        const storedUser = authService.getCurrentUser();
        if (storedUser) setUserData(storedUser);

        // Fetch fresh data dari API
        const user = await authService.getMe();
        if (user) {
          setUserData(user);
        }
      } catch (error) {
        console.error("Gagal memuat profil user:", error);
        // Jika token expired/invalid, authService/axios interceptor biasanya akan redirect
      } finally {
        setLoadingUser(false);
      }
    };

    // 2. Fetch Financial Data
    const fetchFinancial = async () => {
      try {
        const latestCheckup = await financialService.getLatestCheckup();

        if (latestCheckup && (latestCheckup.score !== undefined || (latestCheckup as any).healthScore !== undefined)) {
          setCheckupData(latestCheckup);
        } else {
          setCheckupData(null);
        }
      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setLoadingCheckup(false);
      }
    };

    fetchUser();
    fetchFinancial();
  }, []);

  // --- LOGIKA TAMPILAN DATA (ADAPTER) ---
  const hasData = !!checkupData;
  const rawData: any = checkupData || {};

  const score = rawData.score ?? rawData.healthScore ?? 0;
  const status = rawData.globalStatus ?? rawData.status ?? "BELUM DATA";

  let recommendation = "Halo! Silakan lakukan Financial Checkup pertama Anda untuk melihat analisa kesehatan finansial.";
  if (hasData) {
    if (score >= 80) recommendation = "Kondisi keuangan Anda sangat prima! Pertahankan dan mulai fokus investasi.";
    else if (score >= 50) recommendation = "Kondisi cukup baik, namun ada beberapa rasio yang perlu diperbaiki. Cek detailnya.";
    else recommendation = "Perhatian! Keuangan Anda sedang tidak sehat. Segera lakukan perbaikan arus kas dan utang.";
  }

  const incomeFixed = Number(rawData.incomeFixed || 0);
  const incomeVariable = Number(rawData.incomeVariable || 0);
  const totalIncome = incomeFixed + incomeVariable;

  const surplusDeficit = Number(rawData.surplusDeficit || 0);
  const totalExpense = hasData ? (totalIncome - surplusDeficit) : 0;
  const netWorth = Number(rawData.netWorth ?? rawData.totalNetWorth ?? 0);

  // Ambil nama user (Prioritas: API -> LocalStorage -> Default)
  const displayName = userData?.fullName || userData?.name || "Karyawan MAXIPRO";

  return (
    <div className="relative min-h-full w-full pb-32 md:pb-12">

      {/* Container Utama */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 pt-6 md:px-8 md:pt-10">

        {/* =========================================
            HEADER SECTION 
            ========================================= */}

        {/* [MOBILE HEADER]: Glass Panel Elegant */}
        <div className="flex flex-col items-center mb-6 md:hidden">
          <div className="relative w-32 h-12 mb-4">
            <Image
              src="/images/logokeuanganku.png"
              alt="Logo KeuanganKu"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="w-full glass-panel p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Selamat Datang</p>
              <p className="text-base font-bold text-brand-900 truncate max-w-50">
                {loadingUser && !userData ? "Memuat..." : displayName}
              </p>
            </div>
            <div className="h-10 w-10 bg-brand-50 rounded-full flex items-center justify-center border border-brand-100">
              <span className="text-lg">👋</span>
            </div>
          </div>
        </div>

        {/* [DESKTOP HEADER]: Clean & Professional */}
        <div className="hidden md:flex justify-between items-end mb-10">
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-200">
                <Calendar className="w-4 h-4 text-brand-600" />
              </div>
              <span className="text-sm font-medium uppercase tracking-wide">{currentDate}</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Dashboard Keuangan
            </h1>
            <p className="text-lg text-slate-600">
              Halo, <span className="font-bold text-brand-600">{loadingUser && !userData ? "..." : displayName}</span>. Mari cek kesehatan finansialmu hari ini.
            </p>
          </div>

          <Button className="hidden lg:flex bg-brand-900 hover:bg-brand-800 text-white gap-2 rounded-full px-6 h-12 shadow-lg shadow-brand-900/20" onClick={() => router.push('/finance/checkup')}>
            <Wallet className="w-4 h-4" />
            <span>Update Data</span>
          </Button>
        </div>


        {/* =========================================
            MAIN CONTENT GRID
            ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

          {/* --- LEFT COLUMN (Utama) --- */}
          <div className="md:col-span-8 space-y-8">

            {/* 1. HEALTH ANALYSIS CARD (The Hero) */}
            <div className="card-clean p-0 overflow-hidden relative group min-h-75">
              {/* Decorative Gradient Line Top */}
              <div className="h-1.5 w-full bg-linear-to-r from-brand-500 via-brand-400 to-brand-300"></div>

              {loadingCheckup ? (
                <div className="flex flex-col items-center justify-center h-75 w-full gap-4">
                  <Loader2 className="w-10 h-10 text-brand-300 animate-spin" />
                  <p className="text-sm text-slate-400 font-medium">Memuat data kesehatan...</p>
                </div>
              ) : (
                <div className="p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 h-full">
                  {/* Left Content */}
                  <div className="flex-1 space-y-5 relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-brand-50 rounded-lg text-brand-600 border border-brand-100">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Financial Health Check</span>
                    </div>

                    <div>
                      {hasData ? (
                        <>
                          <div className="flex items-baseline gap-3">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
                              {status}
                            </h2>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border flex items-center gap-1",
                              (status === "SEHAT" || status === "AMAN" || status === "SANGAT SEHAT") ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                (status === "WASPADA" || status === "HATI-HATI") ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  "bg-rose-50 text-rose-700 border-rose-200"
                            )}>
                              {(status === "SEHAT" || status === "AMAN") ? <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> : <AlertCircle className="w-3 h-3" />}
                              {(status === "SEHAT" || status === "AMAN") ? "Stabil" : "Perlu Perbaikan"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            {recommendation}
                          </p>
                        </>
                      ) : (
                        <>
                          <h2 className="text-2xl font-black text-slate-400 tracking-tight">Belum Ada Data</h2>
                          <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-sm">
                            Anda belum melakukan Financial Checkup. Yuk, diagnosa kondisi keuanganmu sekarang agar perencanaannya lebih akurat!
                          </p>
                        </>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={() => router.push("/finance/checkup")}
                        className={cn(
                          "w-full md:w-auto h-11 rounded-xl text-white font-bold shadow-lg shadow-brand-500/20 hover:-translate-y-0.5 transition-all",
                          hasData ? "bg-brand-600 hover:bg-brand-700" : "bg-emerald-600 hover:bg-emerald-700"
                        )}
                      >
                        {hasData ? "Update Data Keuangan" : "Mulai Diagnosa Sekarang"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Right Content (Gauge) */}
                  <div className="shrink-0 flex justify-center py-4 md:py-0">
                    <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                      {/* Ambient Glow */}
                      <div className={cn(
                        "absolute inset-0 rounded-full blur-[50px] opacity-20",
                        !hasData ? "bg-slate-200" : score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-amber-400" : "bg-rose-500"
                      )}></div>

                      {/* The Gauge Component */}
                      <div className={cn("relative z-10 transform transition-transform hover:scale-105 duration-500", !hasData && "opacity-50 grayscale")}>
                        {/* HANYA GAUGE SAJA, TANPA BADGE ANGKA DI BAWAHNYA */}
                        <HealthGauge score={score} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. MENU CEPAT */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-1 h-5 bg-brand-500 rounded-full"></div>
                  Akses Cepat
                </h3>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                {FINANCE_MENUS[0].items.map((item, index) => (
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

          {/* --- RIGHT COLUMN --- */}
          <div className="md:col-span-4 space-y-6">

            {/* 1. STATISTIK KEUANGAN */}
            <div className="card-clean p-5 md:p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Ringkasan Arus Kas
              </h3>

              {loadingCheckup ? (
                <div className="space-y-4">
                  <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
                  <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
                  <div className="h-20 bg-slate-100 animate-pulse rounded-lg" />
                </div>
              ) : hasData ? (
                <>
                  <StatRow
                    label="Pemasukan"
                    value={totalIncome}
                    trend="up"
                    colorClass="text-emerald-600"
                  />
                  <StatRow
                    label="Pengeluaran"
                    value={totalExpense}
                    trend="down"
                    colorClass="text-rose-600"
                  />

                  {/* Total Balance Block */}
                  <div className="bg-brand-50 rounded-xl p-4 border border-brand-100 mt-4">
                    <p className="text-xs text-brand-600 font-semibold mb-1">Surplus / Defisit Bulanan</p>
                    <p className={cn("text-2xl font-black", surplusDeficit >= 0 ? "text-brand-700" : "text-rose-600")}>
                      {surplusDeficit >= 0 ? "+" : ""} {formatMoney(surplusDeficit).replace("Rp", "Rp ")}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-brand-500">
                      <Info className="w-3 h-3" />
                      <span>{surplusDeficit >= 0 ? "Bagus! Arus kas Anda positif." : "Waspada! Arus kas negatif."}</span>
                    </div>
                  </div>

                  {/* Net Worth Block */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                    <span className="text-xs font-bold text-slate-500">Total Kekayaan Bersih</span>
                    <span className="text-sm font-bold text-slate-800">{formatMoney(netWorth)}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Data belum tersedia.</p>
                </div>
              )}
            </div>

            {/* 2. TIPS WIDGET */}
            <div className="hidden md:block bg-pam-gradient rounded-3xl p-6 text-white shadow-xl shadow-brand-900/10 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-yellow-300" />
                  </div>
                  <h4 className="font-bold text-base">Tips Keuangan</h4>
                </div>
                <p className="text-sm text-blue-50 leading-relaxed opacity-90">
                  "Pastikan dana darurat Anda mencukupi minimal 6 kali pengeluaran bulanan sebelum memulai investasi agresif."
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

function StatRow({ label, value, trend, colorClass }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all")}>
          {trend === 'up' ?
            <TrendingUp className="w-4 h-4 text-emerald-500" /> :
            <TrendingUp className="w-4 h-4 text-rose-500 rotate-180" />
          }
        </div>
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <span className={cn("text-base font-bold tracking-tight", colorClass)}>
        {formatMoney(value).replace("Rp", "Rp ")}
      </span>
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

function MenuCard({ title, emoji, desc, styleClass, onClick }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-slate-100"
    >
      <div className={cn(
        "w-12 h-12 flex items-center justify-center rounded-xl text-2xl mb-3 transition-all duration-300",
        styleClass
      )}>
        {emoji}
      </div>
      <span className="text-xs font-bold text-slate-700 leading-tight group-hover:text-brand-600">
        {title}
      </span>
      {desc && (
        <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
          {desc}
        </span>
      )}
    </button>
  );
}