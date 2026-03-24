import React, { useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useScrollLock } from '@/hooks/use-scroll-lock';
// [NEW] Mengimpor library profesional untuk PWA Gestures
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

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

    // Kunci Keyboard Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-110 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300"
            aria-modal="true"
            role="dialog"
        >
            {/* TransformWrapper menangani SEMUA event: 
              - Mouse Wheel (Desktop)
              - Pinch to Zoom (Mobile/Tablet)
              - Drag & Pan (Mouse & Touch)
            */}
            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit={true}
                wheel={{ step: 0.1 }} // Sensitivitas scroll mouse desktop
                pinch={{ step: 5 }}   // Sensitivitas cubit layar HP
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <React.Fragment>

                        {/* 1. Container Gambar Interaktif */}
                        <div className="absolute inset-0 z-111 flex items-center justify-center cursor-move">
                            <TransformComponent
                                wrapperClass="!w-full !h-full"
                                contentClass="!w-full !h-full flex items-center justify-center"
                            >
                                <img
                                    src={imageUrl}
                                    alt={altText}
                                    className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl select-none pointer-events-auto"
                                    draggable={false}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/placeholder-image.png';
                                    }}
                                />
                            </TransformComponent>
                        </div>

                        {/* 2. Contextual HUD (Floating Bar Bawah) */}
                        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-112 w-[90%] md:w-fit pointer-events-none">
                            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8 px-6 py-4 rounded-2xl bg-slate-900/90 backdrop-blur-lg border border-slate-700/50 shadow-xl pointer-events-auto">
                                <div className="flex flex-col items-center md:items-start">
                                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pengirim Struk</span>
                                    <span className="text-lg font-bold text-white">{context.userName}</span>
                                </div>

                                <div className="hidden md:block h-10 w-px bg-slate-700/70" />

                                <div className="flex flex-col items-center md:items-start p-3 md:p-0 rounded-xl bg-emerald-950/50 md:bg-transparent border border-emerald-800 md:border-none w-full md:w-fit">
                                    <span className="text-xs text-emerald-300 uppercase tracking-wider font-semibold">Harus Ditransfer</span>
                                    <span className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">
                                        {context.amountToTransfer}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Tombol Aksi Pojok Kanan Atas */}
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 z-120 pointer-events-none">

                            {/* Kontrol Zoom UI yang Terhubung dengan Library */}
                            <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 shadow-lg text-slate-300 pointer-events-auto">
                                <button
                                    type="button"
                                    onClick={() => zoomOut()}
                                    className="p-1.5 rounded-full hover:bg-slate-700 hover:text-white transition-colors"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-5 h-5" />
                                </button>

                                {/* Tombol Reset Posisi */}
                                <button
                                    type="button"
                                    onClick={() => resetTransform()}
                                    className="p-1.5 rounded-full hover:bg-slate-700 hover:text-white transition-colors"
                                    title="Reset Posisi"
                                >
                                    <Maximize className="w-4 h-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => zoomIn()}
                                    className="p-1.5 rounded-full hover:bg-slate-700 hover:text-white transition-colors"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Tombol Tutup Utama */}
                            <button
                                type="button"
                                onClick={() => {
                                    resetTransform(); // Reset zoom sebelum ditutup agar animasi rapi
                                    onClose();
                                }}
                                className="p-2.5 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-all shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 pointer-events-auto"
                                aria-label="Tutup"
                            >
                                <X className="w-6 h-6 md:w-7 md:h-7" />
                            </button>
                        </div>

                    </React.Fragment>
                )}
            </TransformWrapper>
        </div>
    );
}