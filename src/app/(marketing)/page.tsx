import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Briefcase
} from "lucide-react";

import PricingSection from "@/components/features/marketing/pricing-section";
import TestimonialsCarouselSection from "@/components/features/marketing/testimonials-carousel-section";
import FAQSection from "@/components/features/marketing/faq-section";
import FeatureShowcase from '@/components/features/marketing/feature-showcase';
import PartnershipSection from "@/components/features/marketing/partnership-section";
import SupportSection from "@/components/features/marketing/support-section";
import HeroSection from "@/components/features/marketing/hero-section";
import ValuePropositionSection from "@/components/features/marketing/value-proposition-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50 relative overflow-hidden">

      {/* GLOBAL AMBIENT BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/20 blur-[120px] mix-blend-multiply" />
        <div className="absolute top-[30%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-300/20 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-indigo-400/20 blur-[120px] mix-blend-multiply" />
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-2xl shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col items-start justify-center">
            <div className="relative w-32 h-10">
              <Image
                src="/images/logokeuanganku.png"
                alt="Logo KeuanganKu"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-[10px] text-blue-600 font-bold tracking-widest uppercase mt-0.5">
              Financial Conversation Tool
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Harga
            </Link>

            <Link href="/login">
              <Button
                variant="default"
                className="rounded-full px-6 shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 border-none transition-all hover:scale-105 font-bold"
              >
                Login Pro-Agent
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col pt-0">

        {/* HERO SECTION */}
        <HeroSection />

        {/* TESTIMONIAL SECTION */}
        <TestimonialsCarouselSection />

        {/* PRICING SECTION */}
        <PricingSection />

        {/* FEATURES SECTION */}
        <FeatureShowcase />

        {/* PARTNERSHIP SECTION */}
        <PartnershipSection />

        {/* FAQ SECTION */}
        <FAQSection />

        {/* SUPPORT SECTION */}
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