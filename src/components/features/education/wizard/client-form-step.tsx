"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    User,
    MapPin,
    Briefcase,
    Calendar,
    Phone,
    ArrowRight,
    HeartHandshake,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- SCHEMA DEFINITION ---
const clientFormSchema = z.object({
    clientName: z.string().min(3, "Nama panggilan minimal 3 karakter"),
    clientDob: z.string().min(1, "Tanggal lahir wajib diisi"),
    clientCity: z.string().min(2, "Kota domisili wajib diisi"),
    clientJob: z.string().min(2, "Pekerjaan wajib diisi"),
    clientPhone: z.string().optional().default(""),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormStepProps {
    initialData?: Partial<ClientFormValues>;
    onNext: (data: ClientFormValues) => void;
}

export const ClientFormStep: React.FC<ClientFormStepProps> = ({ initialData, onNext }) => {
    // State untuk sapaan waktu (Pagi/Siang/Sore)
    const [greeting, setGreeting] = useState("Halo");

    useEffect(() => {
        const hours = new Date().getHours();
        if (hours < 12) setGreeting("Selamat Pagi");
        else if (hours < 15) setGreeting("Selamat Siang");
        else if (hours < 18) setGreeting("Selamat Sore");
        else setGreeting("Selamat Malam");
    }, []);

    const form = useForm<ClientFormValues>({
        // [FIX] Menggunakan 'as any' untuk bypass strict mismatch type antara Zod Optional & RHF
        resolver: zodResolver(clientFormSchema) as any,
        defaultValues: {
            clientName: initialData?.clientName ?? "",
            clientDob: initialData?.clientDob ?? "",
            clientCity: initialData?.clientCity ?? "",
            clientJob: initialData?.clientJob ?? "",
            clientPhone: initialData?.clientPhone ?? "",
        },
        mode: "onChange", // Validasi real-time agar tombol bisa bereaksi
    });

    const { isValid } = form.formState;

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. Header Section: Humanis & Personal */}
            <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-linear-to-tr from-blue-100 to-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6 shadow-blue-100 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500 border border-blue-200">
                    <HeartHandshake className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-slate-800">
                    {greeting}, mari berkenalan!
                </h2>
                <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                    Sebelum merencanakan masa depan buah hati, kami perlu mengenal siapa <span className="font-semibold text-blue-600">"Nahkoda"</span> perjalanan ini.
                </p>
            </div>

            {/* 2. Form Section: Clean & Focused with Blue Theme */}
            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-linear-to-br from-white to-blue-50/30 backdrop-blur-sm ring-1 ring-blue-100 rounded-2xl overflow-hidden">
                <CardContent className="p-8 md:p-10">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onNext)} className="space-y-8">

                            {/* Group: Identitas Personal */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="clientName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold">Siapa nama lengkap Anda?</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-300 group-focus-within:text-blue-600 transition-colors" />
                                                        <Input
                                                            className="pl-11 h-12 bg-white border-blue-100 focus:border-blue-400 focus:ring-blue-100 rounded-xl shadow-xs transition-all"
                                                            placeholder="Nama Ayah / Ibu"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="clientDob"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold">Kapan tanggal lahir Anda?</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-300 group-focus-within:text-blue-600 transition-colors" />
                                                        <Input
                                                            type="date"
                                                            className="pl-11 h-12 bg-white border-blue-100 focus:border-blue-400 focus:ring-blue-100 rounded-xl shadow-xs transition-all"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Group: Konteks Lokasi & Profesi */}
                            <div className="pt-2">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-px bg-blue-100 flex-1"></div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" /> Domisili & Profesi
                                    </span>
                                    <div className="h-px bg-blue-100 flex-1"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="clientCity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold">Kota Domisili</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-300 group-focus-within:text-blue-600 transition-colors" />
                                                        <Input
                                                            className="pl-11 h-12 bg-white border-blue-100 focus:border-blue-400 focus:ring-blue-100 rounded-xl shadow-xs transition-all"
                                                            placeholder="Contoh: Bandung"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="clientJob"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold">Pekerjaan Saat Ini</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-300 group-focus-within:text-blue-600 transition-colors" />
                                                        <Input
                                                            className="pl-11 h-12 bg-white border-blue-100 focus:border-blue-400 focus:ring-blue-100 rounded-xl shadow-xs transition-all"
                                                            placeholder="Contoh: Karyawan Swasta"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="clientPhone"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-slate-700 font-semibold">
                                                    Nomor WhatsApp <span className="text-blue-400 font-normal text-xs ml-1">(Opsional)</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-300 group-focus-within:text-blue-600 transition-colors" />
                                                        <Input
                                                            className="pl-11 h-12 bg-white border-blue-100 focus:border-blue-400 focus:ring-blue-100 rounded-xl shadow-xs transition-all"
                                                            placeholder="0812..."
                                                            type="tel"
                                                            inputMode="numeric"
                                                            {...field}
                                                            // Simple filter: hanya angka
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '');
                                                                field.onChange(val);
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Action Button: Prominent & Reactive */}
                            <div className="pt-8">
                                <Button
                                    type="submit"
                                    className={cn(
                                        "w-full h-14 text-base font-bold shadow-xl shadow-blue-500/20 transition-all duration-300 rounded-xl",
                                        isValid
                                            ? "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30 hover:-translate-y-1"
                                            : "bg-slate-200 text-slate-400 hover:bg-slate-300"
                                    )}
                                    disabled={form.formState.isSubmitting}
                                >
                                    Lanjut ke Data Anak <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                                <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                                    🔒 Data Anda aman dan hanya digunakan untuk keperluan simulasi ini.
                                </p>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};