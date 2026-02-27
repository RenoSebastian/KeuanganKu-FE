import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { ShieldCheck, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsurancePageHeaderProps {
    isImporting: boolean;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const backgroundImages = [
    '/images/asuransi/rancangproteksi1.webp',
    '/images/asuransi/rancangproteksi2.webp'
];

export const InsurancePageHeader = ({
    isImporting,
    onFileUpload,
    fileInputRef
}: InsurancePageHeaderProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Logika Slideshow dipindahkan ke sini (UI concern)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev === backgroundImages.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative pt-10 pb-32 px-5 overflow-hidden shadow-2xl bg-brand-900">
            {/* --- BACKGROUND SLIDESHOW --- */}
            <div className="absolute inset-0 w-full h-full z-0">
                {backgroundImages.map((image, index) => (
                    <div
                        key={image}
                        className={cn(
                            "absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000",
                            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                        )}
                        style={{ backgroundImage: `url(${image})` }}
                    />
                ))}
                {/* Overlays */}
                <div className="absolute inset-0 bg-brand-500/85 mix-blend-multiply" />
                <div className="absolute inset-0 bg-linear-to-t from-brand-600 via-brand-600/40 to-transparent" />
            </div>

            {/* --- CONTENT --- */}
            <div className="relative z-20 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4 shadow-lg">
                        <ShieldCheck className="w-4 h-4 text-cyan-300" />
                        <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Agent Tools</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 drop-shadow-xl">
                        Insurance Planner
                    </h1>
                    <p className="text-brand-100 text-sm md:text-base max-w-lg leading-relaxed opacity-90 drop-shadow-md">
                        Hitung kebutuhan Uang Pertanggungan (UP) ideal klien Anda secara profesional dan akurat.
                    </p>
                </div>

                {/* --- IMPORT CARD --- */}
                <Card
                    className="bg-white/10 backdrop-blur-md border-white/20 p-4 rounded-xl flex items-center gap-4 max-w-sm w-full hover:bg-white/15 transition-colors cursor-pointer group shadow-2xl"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {isImporting ? (
                            <Loader2 className="w-5 h-5 text-cyan-300 animate-spin" />
                        ) : (
                            <Upload className="w-5 h-5 text-cyan-300" />
                        )}
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-bold text-white">Import File .mgc</h4>
                        <p className="text-xs text-brand-200">Load data simulasi asuransi sebelumnya</p>
                    </div>
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".mgc"
                        className="hidden"
                        onChange={onFileUpload}
                    />
                </Card>
            </div>
        </div>
    );
};