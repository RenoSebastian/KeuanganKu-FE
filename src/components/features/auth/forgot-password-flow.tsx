'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

// [PLACEHOLDER] Komponen-komponen form ini akan kita buat di tahap selanjutnya
import RequestResetForm from './request-reset-form';
import VerifyResetOtpForm from './verify-reset-otp-form';
import ResetPasswordForm from './reset-password-form';

// Definisi State Machine yang ketat untuk menjamin transisi alur searah
type FlowState = 'IDLE' | 'OTP_SENT' | 'VERIFIED' | 'SUCCESS';

export default function ForgotPasswordFlow() {
    const router = useRouter();

    // Centralized State: Menahan konteks memori selama alur PWA berjalan
    const [step, setStep] = useState<FlowState>('IDLE');

    // Menahan email untuk dikirimkan pada payload verifikasi OTP
    const [emailContext, setEmailContext] = useState<string>('');

    // Menahan Scoped JWT untuk otorisasi endpoint penggantian password
    const [scopedToken, setScopedToken] = useState<string>('');

    // =================================================================
    // FSM TRANSITION HANDLERS
    // =================================================================

    const handleEmailSubmitted = (submittedEmail: string) => {
        setEmailContext(submittedEmail);
        setStep('OTP_SENT');
    };

    const handleOtpVerified = (token: string) => {
        setScopedToken(token);
        setStep('VERIFIED');
    };

    const handlePasswordResetSuccess = () => {
        setStep('SUCCESS');
        // Auto-redirect ke login setelah 3 detik untuk memberikan feedback psikologis UX
        setTimeout(() => {
            router.push('/login');
        }, 3000);
    };

    // =================================================================
    // FSM RENDERER (Render Props Pattern)
    // =================================================================
    const renderStep = () => {
        switch (step) {
            case 'IDLE':
                return (
                    <RequestResetForm onSuccess={handleEmailSubmitted} />
                );
            case 'OTP_SENT':
                return (
                    <VerifyResetOtpForm
                        email={emailContext}
                        onSuccess={handleOtpVerified}
                        // Memberikan opsi fallback jika user salah ketik email
                        onBack={() => setStep('IDLE')}
                    />
                );
            case 'VERIFIED':
                return (
                    <ResetPasswordForm
                        resetToken={scopedToken}
                        onSuccess={handlePasswordResetSuccess}
                    />
                );
            case 'SUCCESS':
                return (
                    <div className="text-center py-8 space-y-4 animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">Sandi Berhasil Diubah</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Sandi Anda telah diperbarui dan sesi di perangkat lain telah diterminasi demi keamanan. Anda akan diarahkan ke halaman login...
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="pt-6">
                {renderStep()}
            </CardContent>
        </Card>
    );
}