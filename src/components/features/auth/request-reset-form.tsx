'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowRight, Loader2, ShieldCheck, Lock, ChevronLeft } from 'lucide-react';

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
import Link from 'next/link';

// Validasi skema input
const formSchema = z.object({
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
});

type RequestResetFormProps = {
    onSuccess: (email: string) => void;
};

export default function RequestResetForm({ onSuccess }: RequestResetFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            await authService.requestPasswordReset({ email: values.email });
            toast.success('Permintaan Terkirim', {
                description: 'Sistem sedang memproses pengiriman kode ke email Anda.',
            });
            onSuccess(values.email);
        } catch (error: any) {
            toast.error('Gagal memproses permintaan', {
                description: error.response?.data?.message || 'Terjadi kesalahan jaringan.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Section dengan Icon Shield */}
            <div className="relative space-y-3 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-2 rounded-2xl bg-blue-50 text-blue-600 ring-4 ring-blue-50/50 animate-bounce-slow">
                    <ShieldCheck className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        Verifikasi Identitas
                    </h2>
                    <p className="text-sm text-slate-500 px-8">
                        Langkah pertama untuk memulihkan akses akun profesional KeuanganKu Anda.
                    </p>
                </div>

                {/* Dekorasi Aksen */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100/30 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-indigo-100/30 rounded-full blur-3xl -z-10" />
            </div>

            {/* Form Card */}
            <div className="p-1 rounded-3xl bg-linear-to-b from-slate-200/50 to-transparent shadow-2xl shadow-blue-500/10">
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[22px] border border-white/20">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                                Email Terdaftar
                                            </FormLabel>
                                            <Lock className="w-3 h-3 text-slate-300" />
                                        </div>
                                        <FormControl>
                                            <div className="group relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                <Input
                                                    placeholder="contoh: agen@keuanganku.id"
                                                    className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all rounded-xl shadow-sm"
                                                    type="email"
                                                    disabled={isSubmitting}
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs italic" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full h-12 text-md font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Memvalidasi...
                                    </>
                                ) : (
                                    <>
                                        Kirim Kode OTP
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>

            {/* Footer / Helper Text */}
            <div className="text-center space-y-4">
                <p className="text-[13px] text-slate-400 flex items-center justify-center gap-2 px-6">
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    Kami akan mengirimkan 6 digit kode rahasia untuk memverifikasi kepemilikan akun.
                </p>

                <Link
                    href="/login"
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Kembali ke halaman Login
                </Link>
            </div>
        </div>
    );
}