import { Metadata } from 'next';
import ForgotPasswordFlow from '@/components/features/auth/forgot-password-flow';

export const metadata: Metadata = {
    title: 'Lupa Kata Sandi | KeuanganKu',
    description: 'Pulihkan akses ke akun KeuanganKu Anda secara aman.',
};

export default function ForgotPasswordPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 md:p-8">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Pemulihan Akun
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Ikuti langkah-langkah di bawah untuk mengatur ulang kata sandi Anda secara aman tanpa meninggalkan aplikasi.
                    </p>
                </div>

                {/* View Container mendelegasikan state management ke Client Component */}
                <ForgotPasswordFlow />
            </div>
        </div>
    );
}