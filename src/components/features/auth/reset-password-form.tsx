'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

// Validasi DTO Frontend disinkronkan 1:1 dengan ResetPasswordDto Backend
const passwordSchema = z.string()
    .min(8, 'Minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus mengandung huruf besar')
    .regex(/[a-z]/, 'Harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Harus mengandung angka')
    .regex(/[@$!%*?&#]/, 'Harus mengandung karakter spesial');

const formSchema = z.object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Kata sandi tidak cocok",
    path: ["confirmPassword"],
});

type ResetPasswordFormProps = {
    resetToken: string; // Scoped JWT dari tahap verifikasi OTP
    onSuccess: () => void;
};

export default function ResetPasswordForm({ resetToken, onSuccess }: ResetPasswordFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    });

    const watchPassword = form.watch('newPassword');

    // Real-time Password Strength Evaluator (O(1) complexity)
    const strengthProps = useMemo(() => {
        const p = watchPassword;
        let score = 0;
        const checks = {
            length: p.length >= 8,
            upper: /[A-Z]/.test(p),
            lower: /[a-z]/.test(p),
            number: /[0-9]/.test(p),
            special: /[@$!%*?&#]/.test(p),
        };
        if (checks.length) score += 20;
        if (checks.upper) score += 20;
        if (checks.lower) score += 20;
        if (checks.number) score += 20;
        if (checks.special) score += 20;

        return { score, checks };
    }, [watchPassword]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            // Injeksi Scoped Token ke API Call secara spesifik
            await authService.executePasswordReset(resetToken, { newPassword: values.newPassword });
            onSuccess();
        } catch (error: any) {
            toast.error('Gagal memperbarui kata sandi', {
                description: error.response?.data?.message || 'Token tidak valid atau telah kedaluwarsa.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2 text-center md:text-left">
                <h2 className="text-xl font-semibold text-slate-900">Buat Kata Sandi Baru</h2>
                <p className="text-sm text-slate-500">
                    Amankan akun Anda dengan kata sandi yang kuat dan unik.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kata Sandi Baru</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            className="pr-10"
                                            disabled={isSubmitting}
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </FormControl>

                                {/* Visual Feedback: Strength Meter */}
                                {watchPassword.length > 0 && (
                                    <div className="mt-3 space-y-2 animate-in fade-in">
                                        <Progress value={strengthProps.score} className="h-2" />
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {Object.entries({
                                                'Minimal 8 karakter': strengthProps.checks.length,
                                                'Huruf besar': strengthProps.checks.upper,
                                                'Huruf kecil': strengthProps.checks.lower,
                                                'Angka': strengthProps.checks.number,
                                                'Karakter Spesial': strengthProps.checks.special,
                                            }).map(([label, isValid]) => (
                                                <div key={label} className="flex items-center gap-1.5">
                                                    {isValid ? (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                    ) : (
                                                        <XCircle className="w-3.5 h-3.5 text-slate-300" />
                                                    )}
                                                    <span className={isValid ? 'text-slate-700' : 'text-slate-400'}>
                                                        {label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Konfirmasi Kata Sandi</FormLabel>
                                <FormControl>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting || strengthProps.score < 100}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Kata Sandi'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}