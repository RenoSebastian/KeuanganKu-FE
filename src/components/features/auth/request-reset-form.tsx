'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

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
            // Panggilan ke API Backend (Fase 4: Request OTP)
            await authService.requestPasswordReset({ email: values.email });

            // INDISTINGUISHABLE UX: Apapun hasilnya (selama HTTP 200 OK dari BE), 
            // kita tetap arahkan user ke layar OTP.
            onSuccess(values.email);
        } catch (error: any) {
            // Fallback error (misal koneksi terputus/Rate Limit 429)
            toast.error('Gagal memproses permintaan', {
                description: error.response?.data?.message || 'Terjadi kesalahan jaringan.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2 text-center md:text-left">
                <h2 className="text-xl font-semibold text-slate-900">Masukkan Email</h2>
                <p className="text-sm text-slate-500">
                    Kode OTP 6-digit akan dikirimkan ke alamat email Anda.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Terdaftar</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Input
                                            placeholder="nama@perusahaan.com"
                                            className="pl-10"
                                            type="email"
                                            inputMode="email"
                                            autoComplete="email"
                                            autoFocus
                                            disabled={isSubmitting}
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <ArrowRight className="mr-2 h-4 w-4" />
                        )}
                        {isSubmitting ? 'Memproses...' : 'Kirim Kode OTP'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}  