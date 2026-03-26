import { Suspense } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import SecureResetForm from "@/components/features/auth/secure-reset-form";

export const metadata = {
    title: "Atur Ulang Kata Sandi - KeuanganKu",
    description: "Portal keamanan untuk mengatur ulang kata sandi agen",
};

export default function ResetPasswordPage() {
    return (
        <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-[#F8FAFC] relative overflow-hidden p-4 sm:p-6">
            {/* Immersive Background Decorations */}
            <div className="absolute -top-[10%] -right-[10%] w-[70%] h-[70%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-[5%] -left-[5%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md flex flex-col gap-8">

                {/* Header (Distraction-Free) */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative flex items-center justify-center p-2">
                        <Image
                            src="/images/logokeuanganku.png"
                            alt="Logo KeuanganKu"
                            width={80}
                            height={60}
                            className="object-contain w-auto h-20 sm:h-16"
                            priority
                        />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Pemulihan Akses
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Silakan buat kata sandi baru Anda.
                        </p>
                    </div>
                </div>

                {/* Form Component wrapped in Suspense.
          Wajib untuk penggunaan useSearchParams() di Next.js App Router.
        */}
                <Suspense fallback={
                    <div className="h-100 w-full flex flex-col gap-4 items-center justify-center bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-xl shadow-blue-900/5 border-none">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">
                            Menyiapkan Portal Aman...
                        </p>
                    </div>
                }>
                    <SecureResetForm />
                </Suspense>

                {/* Footer */}
                <footer className="text-center">
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.3em]">
                        &copy; {new Date().getFullYear()} KeuanganKu &bull; V2.0
                    </p>
                </footer>
            </div>
        </div>
    );
}