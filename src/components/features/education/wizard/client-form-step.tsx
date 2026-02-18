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
    HeartHandshake
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
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm rotate-3 hover:rotate-0 transition-transform duration-300">
                    <HeartHandshake className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    {greeting}, mari berkenalan!
                </h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                    Sebelum merencanakan masa depan buah hati, kami perlu mengenal siapa "Nahkoda" perjalanan ini.
                </p>
            </div>

            {/* 2. Form Section: Clean & Focused */}
            <Card className="border-none shadow-xl bg-card/80 backdrop-blur-sm ring-1 ring-border/50">
                <CardContent className="p-6 md:p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">

                            {/* Group: Identitas Personal */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField
                                        control={form.control}
                                        name="clientName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground/80 font-medium">Siapa nama lengkap Anda?</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                        <Input
                                                            className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
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
                                                <FormLabel className="text-foreground/80 font-medium">Kapan tanggal lahir Anda?</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                        <Input
                                                            type="date"
                                                            className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
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
                            <div className="space-y-4 pt-2">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b pb-2">
                                    Domisili & Profesi
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField
                                        control={form.control}
                                        name="clientCity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground/80 font-medium">Kota Domisili</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                        <Input
                                                            className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
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
                                                <FormLabel className="text-foreground/80 font-medium">Pekerjaan Saat Ini</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                        <Input
                                                            className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
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
                                                <FormLabel className="text-foreground/80 font-medium">
                                                    Nomor WhatsApp <span className="text-muted-foreground font-normal text-xs ml-1">(Opsional)</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                        <Input
                                                            className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
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
                            <div className="pt-6">
                                <Button
                                    type="submit"
                                    className={cn(
                                        "w-full h-12 text-base font-bold shadow-lg transition-all duration-300",
                                        isValid
                                            ? "shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                                            : "opacity-80"
                                    )}
                                    disabled={form.formState.isSubmitting}
                                >
                                    Lanjut ke Data Anak <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                                <p className="text-center text-xs text-muted-foreground mt-4">
                                    Data Anda aman dan hanya digunakan untuk keperluan simulasi ini.
                                </p>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};