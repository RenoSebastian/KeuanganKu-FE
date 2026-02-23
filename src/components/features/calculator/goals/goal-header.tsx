import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalHeaderProps {
    backgroundImages: string[];
    currentImageIndex: number;
    isImporting: boolean;
    onImportClick: () => void;
}

export function GoalHeader({ backgroundImages, currentImageIndex, isImporting, onImportClick }: GoalHeaderProps) {
    return (
        <div className="relative pt-12 pb-36 px-5 overflow-hidden bg-slate-900 shadow-2xl">
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                {backgroundImages.map((image, index) => (
                    <div key={image}
                        className={cn("absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-2000 ease-in-out", index === currentImageIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100')}
                        style={{ backgroundImage: `url(${image})` }}
                    />
                ))}
                <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />
            </div>

            <div className="relative z-20 max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mt-4">
                <div className="text-left animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-indigo-500/30 mb-4 shadow-lg">
                        <Sparkles className="w-4 h-4 text-indigo-300" />
                        <span className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em]">Goal Simulator</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-md">
                        Rencana <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-cyan-300">Masa Depan</span>
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base max-w-lg font-medium leading-relaxed drop-shadow-sm">
                        Kalkulasi strategis berbasis inflasi untuk mewujudkan impian klien Anda secara pasti.
                    </p>
                </div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/10 p-5 rounded-[1.5rem] flex items-center gap-5 max-w-sm w-full cursor-pointer group shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700 delay-150"
                    onClick={onImportClick}
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/80 border border-indigo-400/50 flex items-center justify-center text-white shadow-inner group-hover:rotate-12 transition-all duration-300 shrink-0">
                        {isImporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                    </div>
                    <div className="text-left flex-1">
                        <h4 className="text-base font-black text-white tracking-tight">Restore Sesi (.mgc)</h4>
                        <p className="text-[11px] text-slate-300 font-medium">Muat ulang data kalkulasi klien.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}