"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {
    ChevronLeft,
    ChevronRight,
    Quote,
    Hand,
    Lightbulb,
    GraduationCap,
    HeartHandshake,
    ShieldCheck,
    Zap,
    Target,
    TrendingUp,
    PieChart
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Total ada 8 Card (Best Practice maksimal untuk Carousel edukasi)
const insights = [
    {
        category: "INTEGRITAS",
        icon: ShieldCheck,
        title: "Agen sebagai Financial Consultant",
        content: "Sebagai financial konsultan, agen mengubah data menjadi kebutuhan. Keputusan financial yang terjadi, akan meningkatkan kualitas polis menjadi Big Case yang sesuai",
        footerTip: "⭐ Kepercayaan nasabah adalah aset jangka panjang Anda.",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop",
    },
    {
        category: "MINDSET",
        icon: Lightbulb,
        title: "Kompetensi vs Penampilan",
        content: "Penampilan (appearance) yang diikuti dengan kompetensi akan meningkatkan kredibilitas. Akurasi perhitungan dan validitas data akan memenangkan emosi dan logis dari klien Anda",
        footerTip: "💡 Profesionalisme sejati diukur dari ketepatan solusi.",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop",
    },
    {
        category: "EDUKASI",
        icon: GraduationCap,
        title: "Needs Approach",
        content: "Sesuai standar CFP, pendekatan kebutuhan merupakan metode yang paling sesuai untuk melindungi pengeluaran keluarga yang berkelanjutan setelah kepastian tiba.",
        footerTip: "📚 Edukasi nasabah dengan perhitungan yang transparan.",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
    },
    {
        category: "PROSPEKTING",
        icon: Target,
        title: "Life's Goal",
        content: "Setiap orang memiliki tujuan hidup / life's goal . Berbicara mengenai hal ini akan membuka percakapan sekaligus fact finding mengenai skala prioritas nasabah",
        footerTip: "🎯 Jadikan kalkulator sebagai alat ice breaking yang elegan.",
        image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=800&auto=format&fit=crop",
    },
    {
        category: "STRATEGI",
        icon: HeartHandshake,
        title: "Menjual Kepastian Likuiditas",
        content: "UP 1 M adalah sebuah angka yang menjamin keluarga nasabah Anda memiliki likuiditas untuk melanjutkan hidup dan mencapai tujuan walaupun terjadi risiko",
        footerTip: "🗣️ Ubah bahasa nominal menjadi bahasa perlindungan keluarga.",
        image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop",
    },
    {
        category: "OBJECTION",
        icon: TrendingUp,
        title: "Patahkan Mitos dengan Fakta",
        content: "'Asuransi itu rugi' adalah mitos dari ketidaktahuan. Saat Anda menyajikan proyeksi inflasi medis dan pendidikan yang presisi, keraguan itu akan gugur dengan sendirinya.",
        footerTip: "🛡️ Data yang valid adalah perisai dari penolakan (objection).",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    },
    {
        category: "VISUALISASI",
        icon: PieChart,
        title: "Melihat Berarti Percaya",
        content: "Otak manusia memproses visual jauh lebih cepat daripada deretan angka. Tampilkan grafik proteksi secara langsung di depan nasabah untuk efek 'Aha!' yang instan.",
        footerTip: "👁️ Visualisasi yang baik mempercepat keputusan pembelian.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    },
    {
        category: "EFISIENSI",
        icon: Zap,
        title: "Biarkan Sistem Bekerja",
        content: "Menghitung rumus finansial secara manual sangat menyita waktu. Gunakan energi Anda untuk berempati pada nasabah, biarkan aplikasi yang menyelesaikan angkanya.",
        footerTip: "⚡ Waktu Anda terlalu berharga untuk sekadar menghitung manual.",
        image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800&auto=format&fit=crop",
    }
];

const ProInsightsCarouselSection = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'center',
        breakpoints: {
            '(min-width: 768px)': { align: 'center' }
        }
    });

    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback((emblaApi: any) => {
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        emblaApi.on('reInit', onSelect);
        emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    return (
        <section id="pro-insights-carousel" className="py-20 relative z-10 overflow-hidden">

            {/* HEADER SECTION */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12 lg:mb-16">
                <div className="flex flex-col items-center justify-center text-center gap-4">
                    <Badge
                        variant="outline"
                        className="mb-2 border-blue-400/30 text-blue-600 bg-blue-500/10 px-4 py-1.5 uppercase tracking-[0.3em] text-[10px] font-black backdrop-blur-md shadow-sm"
                    >
                        Pro Insights
                    </Badge>

                    <h2 className="text-4xl lg:text-5xl font-[1000] text-slate-900 tracking-tighter leading-[1.1]">
                        Inspirasi Agen <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 to-indigo-600">
                            Profesional
                        </span>
                    </h2>

                    <div className="md:hidden flex items-center justify-center gap-2 text-slate-500 mt-2 bg-slate-200/50 px-4 py-2 rounded-full border border-slate-300 shadow-sm">
                        <Hand size={14} className="animate-bounce text-blue-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Geser untuk melihat</span>
                    </div>
                </div>
            </div>

            {/* CAROUSEL WRAPPER */}
            <div
                className="relative w-full max-w-[100vw]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* NAV LEFT */}
                <button
                    onClick={scrollPrev}
                    disabled={!prevBtnEnabled}
                    className={cn(
                        "absolute left-4 md:left-8 lg:left-[calc((100vw-1280px)/2+2rem)] top-1/2 -translate-y-1/2 z-20",
                        "flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full",
                        "bg-white/80 backdrop-blur-xl border-2 border-white shadow-[0_10px_30px_rgba(0,0,0,0.15)]",
                        "text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:scale-110",
                        "disabled:opacity-30 disabled:scale-100",
                        "transition-all duration-300",
                        "md:opacity-0 md:-translate-x-4",
                        isHovered && "md:opacity-100 md:translate-x-0"
                    )}
                >
                    <ChevronLeft size={28} strokeWidth={3} className="ml-0.5 md:ml-1" />
                </button>

                <div className="embla overflow-hidden" ref={emblaRef}>
                    <div className="embla__container flex touch-pan-y py-4">
                        {insights.map((insight, i) => {
                            const IconComponent = insight.icon;
                            return (
                                <div key={i} className="embla__slide pl-4 md:pl-6 flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 relative">

                                    {/* MAIN CARD */}
                                    <div className="relative h-104 md:h-128 w-full rounded-3xl overflow-hidden group/card cursor-grab active:cursor-grabbing shadow-[0_15px_40px_rgb(0,0,0,0.1)] hover:shadow-[0_20px_50px_rgb(37,99,235,0.2)] border border-white/60 transition-all duration-500 hover:-translate-y-2 bg-slate-900">

                                        {/* Background Image */}
                                        <div className="absolute inset-0 w-full h-full bg-slate-800">
                                            <img
                                                src={insight.image}
                                                alt={insight.category}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105 pointer-events-none"
                                            />
                                        </div>

                                        {/* 1. Gradient Atas */}
                                        <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-slate-950/70 to-transparent opacity-90 pointer-events-none" />

                                        {/* 2. Gradient Bawah */}
                                        <div className="absolute bottom-0 inset-x-0 h-[60%] bg-linear-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

                                        {/* Content Area */}
                                        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between pointer-events-none">

                                            {/* Top: Category Badge & Quote */}
                                            <div className="flex justify-between items-start w-full">
                                                <div className="flex items-center gap-2 bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-400/50 shadow-sm">
                                                    <IconComponent size={14} className="text-white" />
                                                    <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest">
                                                        {insight.category}
                                                    </span>
                                                </div>
                                                <div className="text-white/30 group-hover/card:text-blue-400/50 transition-colors duration-500 transform group-hover/card:rotate-12 drop-shadow-md">
                                                    <Quote size={48} fill="currentColor" />
                                                </div>
                                            </div>

                                            {/* Bottom: Text Content */}
                                            <div className="relative z-10 translate-y-2 transition-transform duration-500 group-hover/card:translate-y-0">

                                                <div className="mb-5 md:mb-6">
                                                    <h4 className="text-xl md:text-2xl font-black text-white leading-tight mb-3 drop-shadow-lg">
                                                        {insight.title}
                                                    </h4>
                                                    <div className="border-l-[3px] border-blue-500 pl-4">
                                                        <p className="text-sm md:text-[15px] text-slate-200 font-medium leading-relaxed drop-shadow-md line-clamp-4">
                                                            "{insight.content}"
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="h-px w-full bg-linear-to-r from-blue-500/50 to-transparent mb-4" />

                                                <div>
                                                    <p className="text-[11px] md:text-xs font-semibold text-blue-300 leading-snug drop-shadow-sm">
                                                        {insight.footerTip}
                                                    </p>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* NAV RIGHT */}
                <button
                    onClick={scrollNext}
                    disabled={!nextBtnEnabled}
                    className={cn(
                        "absolute right-4 md:right-8 lg:right-[calc((100vw-1280px)/2+2rem)] top-1/2 -translate-y-1/2 z-20",
                        "flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full",
                        "bg-white/80 backdrop-blur-xl border-2 border-white shadow-[0_10px_30px_rgba(0,0,0,0.15)]",
                        "text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:scale-110",
                        "disabled:opacity-30 disabled:scale-100",
                        "transition-all duration-300",
                        "md:opacity-0 md:translate-x-4",
                        isHovered && "md:opacity-100 md:translate-x-0"
                    )}
                >
                    <ChevronRight size={28} strokeWidth={3} className="-mr-0.5 md:mr-1" />
                </button>
            </div>

            {/* Mobile Progress Bar */}
            <div className="flex md:hidden items-center justify-center gap-2 mt-6">
                {/* Agar tidak terlalu panjang di mobile, kita batasi indikator dot-nya jadi 5 saja meskipun card ada 8 */}
                {[...Array(Math.min(insights.length, 5))].map((_, i) => (
                    <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === 0 ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300")} />
                ))}
            </div>

        </section>
    );
};

export default ProInsightsCarouselSection;