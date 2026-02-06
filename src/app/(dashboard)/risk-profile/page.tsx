import { Metadata } from "next";
import { RiskProfileWizard } from "@/components/features/finance/risk-profile/risk-profile-wizard";
import { Separator } from "@/components/ui/separator";
import { Info, PenLine, Sparkles, UserCheck } from "lucide-react";

export const metadata: Metadata = {
    title: "Analisis Profil Risiko | KeuanganKu Pro",
    description: "Kenali gaya investasi klien untuk strategi proteksi yang logis.",
};

export default function RiskProfilePage() {
    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-8 font-sans">

            {/* --- HEADER: Deskripsi Alat Kerja --- */}
            <div className="space-y-4">
                {/* Mengubah text-orange-600 menjadi text-blue-600 */}
                <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">
                    <Sparkles className="w-3 h-3" />
                    Interactive Discovery Tool
                </div>

                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                    Analisis Profil Risiko
                </h1>

                {/* --- NARASI UNTUK KLIEN --- */}
                {/* Mengubah border-orange-500 menjadi border-blue-600 */}
                <div className="bg-white border-l-4 border-blue-600 p-6 shadow-sm rounded-r-2xl">
                    <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                        {/* Mengubah text-orange-500 menjadi text-blue-600 */}
                        <UserCheck className="w-5 h-5 text-blue-600" />
                        Halo! Mari Kenali Gaya Investasi Anda
                    </h2>
                    <p className="text-slate-600 leading-relaxed text-sm">
                        Kuesioner ini dirancang untuk membantu kami memahami tingkat kenyamanan Anda terhadap fluktuasi nilai investasi.
                        Tidak ada jawaban benar atau salah. Hasil analisis ini akan menjadi dasar bagi kami untuk menyusun
                        <span className="text-blue-700 font-bold"> strategi perencanaan keuangan yang paling sesuai </span>
                        dengan profil dan tujuan masa depan Anda.
                    </p>
                </div>
            </div>

            {/* --- INSTRUKSI UNTUK AGEN --- */}
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 rounded-xl text-[11px] text-slate-500 font-medium border border-blue-100/50">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <p>
                    <span className="font-bold text-blue-700">Instruksi Agen:</span> Berikan tablet kepada klien untuk pengisian mandiri, atau pandu pertanyaan demi pertanyaan untuk membangun engagement.
                </p>
            </div>

            <Separator className="opacity-50" />

            {/* --- WIZARD CONTAINER --- */}
            <div className="mt-4">
                <div className="flex items-center gap-2 mb-6 text-slate-400">
                    <PenLine className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Mulai Kuesioner</span>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <RiskProfileWizard />
                </div>
            </div>

            {/* --- FOOTER --- */}
            <div className="text-center space-y-2">
                <p className="text-xs text-slate-400">
                    Analisis ini menggunakan algoritma standar perencana keuangan profesional.
                </p>
                <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-tighter">
                    Powered by KeuanganKu Financial Health System
                </p>
            </div>
        </div>
    );
}