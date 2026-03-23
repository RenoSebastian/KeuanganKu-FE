import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { useScrollLock } from '@/hooks/use-scroll-lock';

interface ImageLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    context: {
        userName: string;
        amountToTransfer: string;
    };
    altText?: string;
}

export function ImageLightbox({
    isOpen,
    onClose,
    imageUrl,
    context,
    altText = 'Tampilan layar penuh bukti bayar'
}: ImageLightboxProps) {
    useScrollLock(isOpen);

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);

    const handleZoom = useCallback((delta: number) => {
        setScale(prev => {
            const newScale = prev + delta;
            if (newScale <= 1) {
                setPosition({ x: 0, y: 0 });
                return 1;
            }
            if (newScale >= 3) return 3;
            return newScale;
        });
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            } else if (e.key === '+' || e.key === '=') {
                handleZoom(0.25);
            } else if (e.key === '-') {
                handleZoom(-0.25);
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isOpen, onClose, handleZoom]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || scale <= 1) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.25 : 0.25;
            handleZoom(delta);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={onClose}
            onWheel={handleWheel}
            aria-modal="true"
            role="dialog"
        >
            {/* 1. Container Gambar Interaktif (Dirender Pertama, berada di bawah kontrol) */}
            <div
                className={`relative flex items-center justify-center w-full h-full p-4 md:p-16 animate-in zoom-in-95 duration-300 ${scale > 1 ? 'cursor-grab' : 'cursor-default'} ${isDragging ? 'cursor-grabbing' : ''}`}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img
                    ref={imageRef}
                    src={imageUrl}
                    alt={altText}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                        transformOrigin: 'center center'
                    }}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
                    draggable={false}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-image.png';
                    }}
                />

                {scale > 1 && !isDragging && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/60 backdrop-blur-sm text-white pointer-events-none opacity-80 animate-pulse">
                        <Move className="w-8 h-8" />
                    </div>
                )}
            </div>

            {/* 2. Contextual HUD (Floating Bar Bawah) */}
            <div
                className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-111 w-[90%] md:w-fit"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8 px-6 py-4 rounded-2xl bg-slate-900/90 backdrop-blur-lg border border-slate-700/50 shadow-xl animate-in slide-in-from-bottom duration-500">
                    <div className="flex flex-col items-center md:items-start">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pengirim Struk</span>
                        <span className="text-lg font-bold text-white">{context.userName}</span>
                    </div>

                    <div className="hidden md:block h-10 w-px bg-slate-700/70" />

                    <div className="flex flex-col items-center md:items-start p-3 md:p-0 rounded-xl bg-emerald-950/50 md:bg-transparent border border-emerald-800 md:border-none w-full md:w-fit">
                        <span className="text-xs text-emerald-300 uppercase tracking-wider font-semibold">Harus Ditransfer (Sistem)</span>
                        <span className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">
                            {context.amountToTransfer}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. [FIXED] Tombol Aksi Pojok Kanan Atas 
              Sekarang dirender PALING AKHIR (paling atas dalam urutan DOM) dan Z-index dinaikkan.
            */}
            <div
                className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 z-120"
                onClick={e => e.stopPropagation()} // Pastikan klik pada area kontrol tidak menutup lightbox via parent
            >
                {/* Kontrol Zoom (Hanya Desktop) */}
                <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 shadow-lg text-slate-300">
                    {/* [FIXED] Menambahkan type="button" */}
                    <button
                        type="button"
                        onClick={() => handleZoom(-0.25)}
                        className="p-1.5 rounded-full hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                        title="Zoom Out (-)"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-mono w-10 text-center select-none">{(scale * 100).toFixed(0)}%</span>
                    {/* [FIXED] Menambahkan type="button" */}
                    <button
                        type="button"
                        onClick={() => handleZoom(0.25)}
                        className="p-1.5 rounded-full hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                        title="Zoom In (+)"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                </div>

                {/* Tombol Tutup Utama */}
                {/* [FIXED] Menambahkan type="button" */}
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2.5 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-all shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                    aria-label="Tutup tampilan penuh (Esc)"
                >
                    <X className="w-6 h-6 md:w-7 md:h-7" />
                </button>
            </div>
        </div>
    );
}