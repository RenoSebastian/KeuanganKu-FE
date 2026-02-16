"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, MapPin, Briefcase, Calendar, Phone, ArrowRight } from "lucide-react";

// Schema definisi sesuai standar perbaikan (currentSaving dihapus)
const clientFormSchema = z.object({
    clientName: z.string().min(3, "Nama klien minimal 3 karakter"),
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
    const form = useForm<ClientFormValues>({
        // [FIX] Bypass strict type mismatch antara z.coerce/optional dengan form values
        resolver: zodResolver(clientFormSchema) as any,
        // KUNCI PERBAIKAN: Default values eksplisit tanpa currentSaving
        defaultValues: {
            clientName: initialData?.clientName ?? "",
            clientDob: initialData?.clientDob ?? "",
            clientCity: initialData?.clientCity ?? "",
            clientJob: initialData?.clientJob ?? "",
            clientPhone: initialData?.clientPhone ?? "",
        },
    });

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Informasi Klien
                </CardTitle>
                <CardDescription>
                    Masukkan data orang tua (Klien) untuk memulai simulasi Dana Pendidikan.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="clientName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Lengkap Klien</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" placeholder="Contoh: Bpk. Dharma" {...field} />
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
                                        <FormLabel>Tanggal Lahir</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input type="date" className="pl-9" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="clientCity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kota Domisili</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" placeholder="Jakarta" {...field} />
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
                                        <FormLabel>Pekerjaan</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" placeholder="Wiraswasta" {...field} />
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
                                        <FormLabel>No. Telepon (Opsional)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" placeholder="08123456789" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="w-full md:w-auto px-8" disabled={form.formState.isSubmitting}>
                                Lanjut ke Data Anak <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};