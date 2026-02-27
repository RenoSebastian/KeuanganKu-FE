"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Calculator, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PensionHeaderProps {
    isImporting: boolean;
    onImportClick: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PensionHeader({ isImporting, onImportClick, fileInputRef, onFileUpload }: PensionHeaderProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const backgroundImages = [
        '/images/pensiun/rancangdanaharitua1.webp',
        '/images/pensiun/rancangdanaharitua2.webp'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev === backgroundImages.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    return (
        <div className="relative pt-10 pb-32 px-5 overflow-hidden shadow-2xl bg-brand-900">
            <div className="absolute inset-0 w-full h-full z-0">
                {backgroundImages.map((image, index) => (
                    <div key={image}
                        className={cn(
                            "absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000",
                            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                        )}
                        style={{ backgroundImage: `url(${image})` }}
                    />
                ))}
                <div className="absolute inset-0 bg-brand-900/85 mix-blend-multiply" />
                <div className="absolute inset-0 bg-linear-to-t from-brand-800 via-transparent to-transparent" />
            </div>

            <div className="relative z-20 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4 shadow-lg">
                        <Calculator className="w-4 h-4 text-cyan-300" />
                        <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Pension Planner</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 drop-shadow-xl">
                        Dana Pensiun
                    </h1>
                    <p className="text-brand-100 text-sm md:text-base max-w-lg leading-relaxed opacity-90 drop-shadow-md">
                        Rencanakan masa depan sejahtera dengan kekuatan dana Anda saat ini bersama kami.
                    </p>
                </div>

                <Card
                    className="bg-white/10 backdrop-blur-md border-white/20 p-4 rounded-xl flex items-center gap-4 max-w-sm w-full hover:bg-white/15 transition-colors cursor-pointer group"
                    onClick={onImportClick}
                >
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {isImporting ? <Loader2 className="w-5 h-5 text-cyan-300 animate-spin" /> : <Upload className="w-5 h-5 text-cyan-300" />}
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-bold text-white">Import File .mgc</h4>
                        <p className="text-xs text-brand-200">Load data simulasi sebelumnya</p>
                    </div>
                    <input type="file" ref={fileInputRef} accept=".mgc" className="hidden" onChange={onFileUpload} />
                </Card>
            </div>
        </div>
    );
}