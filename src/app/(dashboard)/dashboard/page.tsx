"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { User as UserType } from "@/lib/types";

// Import komponen modular
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { AgentHeroCard } from "@/components/features/dashboard/agent-hero-card";
import { AgentWorkstation } from "@/components/features/dashboard/agent-workstation";
import { AgentPerformanceCard } from "@/components/features/dashboard/agent-performance-card";
import { SalesTipsWidget } from "@/components/features/dashboard/sales-tips-widget";

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

  const [userData, setUserData] = useState<UserType | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [quote, setQuote] = useState("");

  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  useEffect(() => {
    setQuote(AGENT_QUOTES[Math.floor(Math.random() * AGENT_QUOTES.length)]);

    const fetchUser = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        if (storedUser) setUserData(storedUser);

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

  return (
    <div className="relative w-full min-h-screen selection:bg-indigo-100 selection:text-indigo-900 font-sans pb-10">

      {/* BACKGROUND (AMBIENT) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.4] mix-blend-multiply"
          style={{
            backgroundImage: 'radial-gradient(circle at center, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="absolute -top-[15%] -left-[10%] w-[60%] h-[50%] bg-linear-to-br from-indigo-300/30 via-blue-200/20 to-transparent rounded-full blur-[100px]" />
        <div className="absolute top-[30%] -right-[15%] w-[50%] h-[60%] bg-linear-to-tl from-emerald-200/20 via-cyan-100/10 to-transparent rounded-full blur-[100px]" />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 flex flex-col gap-6">

        {/* 1. HEADER SECTION */}
        <DashboardHeader
          userData={userData}
          currentDate={currentDate}
          onAddClient={() => router.push('/finance')}
        />

        {/* 2. MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* --- KOLOM KIRI (Dominan) --- */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* 1. Profile / Hero Card */}
            <AgentHeroCard
              userData={userData}
              loadingUser={loadingUser}
              quote={quote}
            />

            {/* 2. Workstation (Sejajar dengan Tips di Kanan) */}
            <AgentWorkstation />

          </div>

          {/* --- KOLOM KANAN (Sidebar) --- */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* 1. Performance Card */}
            <AgentPerformanceCard userData={userData} />

            {/* 2. Sales Tips */}
            <SalesTipsWidget />

          </div>

        </div>
      </div>
    </div>
  );
}