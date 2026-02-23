"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, User, Plus } from "lucide-react";
import Image from "next/image";
import { User as UserType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
    userData: UserType | null;
    currentDate: string;
    onAddClient: () => void;
}

export function DashboardHeader({ userData, currentDate, onAddClient }: DashboardHeaderProps) {
    const displayName = userData?.fullName || "Partner Agen";
    const agencyName = userData?.agencyName || "Agency Partner";

    // State untuk Dinamik Sapaan Waktu
    const [greeting, setGreeting] = useState("Selamat datang");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting("Selamat Pagi");
        else if (hour >= 12 && hour < 15) setGreeting("Selamat Siang");
        else if (hour >= 15 && hour < 18) setGreeting("Selamat Sore");
        else setGreeting("Selamat Malam");
    }, []);

    return (
        <>
            {/* =========================================
                [MOBILE PWA HEADER] - Native App Feel
                ========================================= */}
            <div className="flex flex-col mb-8 md:hidden relative z-20">
                {/* Top App Bar: Logo (Kiri) & Profile (Kanan) */}
                <div className="flex items-center justify-between mb-5">
                    <div className="relative w-28 h-10">
                        <Image
                            src="/images/logokeuanganku.png"
                            alt="Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>

                    {/* Avatar Ringkas dengan Status Online */}
                    <div className="relative group">
                        <div className="h-10 w-10 bg-linear-to-tr from-blue-100 to-indigo-50 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                            {userData?.avatar ? (
                                <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-indigo-500" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
                    </div>
                </div>

                {/* Welcome Text Section (Typography Hierarchy) */}
                <div className="flex flex-col">
                    <p className="text-xs font-bold text-indigo-600 tracking-wide uppercase mb-1 flex items-center gap-1.5">
                        {greeting} <span className="text-lg leading-none">👋</span>
                    </p>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight truncate w-full">
                        {displayName}
                    </h2>
                    <p className="text-[11px] font-medium text-slate-500 mt-1">
                        Siap mendampingi nasabah mencapai tujuannya hari ini?
                    </p>
                </div>

                {/* Floating Action Button (FAB) Style untuk Mobile (Opsional/Tambahan UX) */}
                <Button
                    onClick={onAddClient}
                    className="mt-5 w-full bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-xl h-12 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-bold">Klien Baru</span>
                </Button>
            </div>


            {/* =========================================
                [DESKTOP & TABLET HEADER] - Premium Dashboard
                ========================================= */}
            <div className="hidden md:flex justify-between items-end mb-10 relative z-20">
                <div>
                    {/* Date Badge */}
                    <div className="flex items-center gap-2.5 text-slate-500 mb-3">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-indigo-600">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            {currentDate}
                        </span>
                    </div>

                    {/* Gradient Headline */}
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-linear-to-br from-slate-900 via-slate-800 to-slate-500">
                        Agent Workspace
                    </h1>

                    <p className="text-base lg:text-lg text-slate-500 font-medium">
                        {greeting}, <span className="font-bold text-indigo-600">{displayName}</span>. Mari dampingi nasabah hari ini.
                    </p>
                </div>

                {/* Premium Glow Button */}
                <Button
                    onClick={onAddClient}
                    className="group relative bg-slate-900 hover:bg-slate-800 text-white gap-2.5 rounded-2xl px-6 h-14 shadow-xl shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                    {/* Hover Light Effect */}
                    <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

                    <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
                        <Users className="w-4 h-4" />
                    </div>
                    <span className="font-bold tracking-wide">Tambah Klien Baru</span>
                </Button>
            </div>
        </>
    );
}