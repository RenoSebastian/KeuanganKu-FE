"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Pastikan ini ada
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  GraduationCap,
  Umbrella,
  Activity,
  CheckCircle2,
  LineChart,
  Mail,
  Building2,
  BarChart3,
  Users2,
  Briefcase,
  Menu, // [NEW] Icon untuk Mobile Menu
  X      // [NEW] Icon untuk Close Mobile Menu
} from "lucide-react";

import PricingSection from "@/components/features/marketing/pricing-section";
import TestimonialsCarouselSection from "@/components/features/marketing/testimonials-carousel-section";
import FAQSection from "@/components/features/marketing/faq-section";
import FeatureShowcase from '@/components/features/marketing/feature-showcase';
import PartnershipSection from "@/components/features/marketing/partnership-section";
import SupportSection from "@/components/features/marketing/support-section";
import HeroSection from "@/components/features/marketing/hero-section";

export default function LandingPage() {
  // --- STATE UNTUK NAVBAR DINAMIS ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Deteksi Scroll untuk merubah style Navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50 relative overflow-hidden">

      {/* GLOBAL AMBIENT BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-blue-500/20 blur-[150px]" />
        <div className="absolute top-[5%] right-[5%] w-[25vw] h-[25vw] rounded-full bg-orange-400/20 blur-[100px]" />
        <div className="absolute top-[35%] left-[15%] w-[20vw] h-[20vw] rounded-full bg-orange-500/15 blur-[80px]" />
        <div className="absolute top-[45%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute top-[50%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-indigo-400/10 blur-[100px]" />
        <div className="absolute bottom-[15%] left-[5%] w-[25vw] h-[25vw] rounded-full bg-blue-400/20 blur-[90px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-orange-500/20 blur-[150px]" />
        <div className="absolute bottom-[5%] left-[50%] w-[20vw] h-[20vw] rounded-full bg-cyan-400/15 blur-[80px]" />
      </div>

      {/* =========================================
          DYNAMIC NAVBAR (IMMERSIVE & RESPONSIVE)
          ========================================= */}
      <nav
        className={cn(
          "fixed inset-x-0 z-50 w-full transition-all duration-500 ease-in-out",
          isScrolled
            ? "bg-white/70 backdrop-blur-2xl border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.05)] py-3"
            : "bg-transparent border-transparent py-5 md:py-6"
        )}
      >
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">

          {/* LOGO AREA */}
          <Link href="/" className="flex flex-col items-start justify-center group cursor-pointer">
            <div className="relative w-32 h-10 transition-transform duration-300 group-hover:scale-105 origin-left">
              <Image
                src="/images/logokeuanganku.png"
                alt="Logo KeuanganKu"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className={cn(
              "text-[9px] font-black tracking-[0.2em] uppercase mt-0.5 transition-all duration-300",
              isScrolled ? "text-slate-500" : "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
            )}>
              
            </span>
          </Link>

          {/* DESKTOP MENU - THE TWIN PREMIUM PILLS */}
          <div className="hidden md:flex items-center bg-white/40 border border-white/60 p-1.5 rounded-full shadow-sm backdrop-blur-md">

            {/* 1. SECONDARY ACTION (Harga) - The Elegant Sibling */}
            <Link
              href="/pricing"
              className="relative flex items-center justify-center px-6 py-2.5 text-sm font-bold text-slate-700 transition-all duration-300 rounded-full hover:bg-white hover:text-blue-700 hover:shadow-sm"
            >
              Harga & Paket
            </Link>

            {/* 2. PRIMARY ACTION (Login) - The Bold Sibling */}
            <Link href="/login">
              <button className="group flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 bg-slate-900 rounded-full hover:bg-blue-600 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:-translate-y-0.5">
                Login Pro-Agent
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>

          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/50 border border-white/60 text-slate-700 hover:bg-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        <div
          className={cn(
            "md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden origin-top",
            isMobileMenuOpen ? "max-h-[300px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
          )}
        >
          <div className="container mx-auto px-6 flex flex-col gap-6">
            <Link
              href="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-bold text-slate-700 flex items-center justify-between border-b border-slate-100 pb-4"
            >
              Harga & Paket <ArrowRight className="w-5 h-5 text-slate-300" />
            </Link>

            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="default"
                className="w-full rounded-2xl h-14 shadow-lg shadow-blue-600/25 bg-blue-600 hover:bg-blue-700 border-none font-black text-lg flex items-center justify-center gap-2"
              >
                Login Pro-Agent
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* KONTEN HALAMAN */}
      {/* (Memberikan padding top agar hero section tidak tertutup navbar absolute saat awal load) */}
      <div className="relative z-10 flex flex-col">
        <HeroSection />
        <TestimonialsCarouselSection />
        <PricingSection />
        <FeatureShowcase />
        <PartnershipSection />
        <FAQSection />
        <SupportSection />
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 bg-white/40 backdrop-blur-xl border-t border-white/50 py-8 mt-0">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/images/logogeocitra.png" alt="Logo Geocitra" width={100} height={100} className="object-contain grayscale opacity-60 hover:opacity-100 transition-opacity" />
            <span className="font-semibold text-slate-400 text-sm italic">"Financial Conversation Tools"</span>
          </div>
          <p className="text-xs text-slate-400 text-center md:text-right">
            © {new Date().getFullYear()} Geocitra x Maxipro. All Rights Reserved. <br />
            Powered by Larman Analysis Methodology.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode, color: string, title: string, desc: string }) {
  return (
    <Card className="group border border-white/50 shadow-sm hover:shadow-[0_20px_50px_rgb(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 bg-white/60 backdrop-blur-lg p-6 rounded-2xl h-full flex flex-col">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-md mb-5 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm grow">
        {desc}
      </p>
    </Card>
  );
}