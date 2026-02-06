import { Metadata } from "next";
import { RiskProfileWizard } from "@/components/features/finance/risk-profile/risk-profile-wizard";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
    title: "Analisis Profil Risiko | KeuanganKu",
    description: "Ketahui profil risiko investasi Anda untuk strategi keuangan yang lebih tepat.",
};

export default function RiskProfilePage() {
    return (
        <div className="container mx-auto py-8 max-w-5xl space-y-8">
            {/* --- Page Header --- */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Analisis Profil Risiko
                </h1>
                <p className="text-slate-500">
                    Kenali gaya investasi dan toleransi risiko Anda melalui kuesioner singkat ini.
                    Hasil analisis akan membantu menentukan alokasi aset yang paling sesuai untuk tujuan keuangan Anda.
                </p>
            </div>

            <Separator />

            {/* --- Main Feature Container --- */}
            {/* Container ini memberikan ruang yang cukup agar Wizard tidak terlalu lebar 
        pada layar besar, menjaga fokus visual user (UX).
      */}
            <div className="mt-6">
                <RiskProfileWizard />
            </div>
        </div>
    );
}