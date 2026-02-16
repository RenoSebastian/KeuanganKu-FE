"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, MapPin, Briefcase, Wallet, Calendar } from "lucide-react";

const clientFormSchema = z.object({
    clientName: z.string().min(3, "Nama klien minimal 3 karakter"),
    clientDob: z.string().min(1, "Tanggal lahir wajib diisi"),
    clientCity: z.string().min(2, "Kota domisili wajib diisi"),
    clientJob: z.string().min(2, "Pekerjaan wajib diisi"),
    clientPhone: z.string().optional().default(""),
    currentSaving: z.coerce.number().min(0, "Tabungan tidak boleh negatif").default(0),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormStepProps {
    initialData?: Partial<ClientFormValues>;
    onNext: (data: ClientFormValues) => void;
}

export const ClientFormStep: React.FC<ClientFormStepProps> = ({ initialData, onNext }) => {
    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            clientName: initialData?.clientName || "",
            clientDob: initialData?.clientDob || "",
            clientCity: initialData?.clientCity || "",
            clientJob: initialData?.clientJob || "",
            clientPhone: initialData?.clientPhone || "",
            currentSaving: initialData?.currentSaving || 0,
        },
    });

    const onSubmit = (values: ClientFormValues) => {
        onNext(values);
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Informasi Klien
                </CardTitle>
                <CardDescription>
                    Masukkan data orang tua (Klien) untuk memulai simulasi perencanaan pendidikan.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                                <Input placeholder="Contoh: Bpk. Dharma" className="pl-9" {...field} />
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
                                                <Input placeholder="Contoh: Jakarta Selatan" className="pl-9" {...field} />
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
                                                <Input placeholder="Contoh: Karyawan Swasta" className="pl-9" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currentSaving"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Dana Pendidikan Tersedia Saat Ini (Opsional)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <span className="absolute left-9 top-2.5 text-sm font-medium">Rp</span>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    className="pl-16"
                                                    // Gunakan value dan onChange manual untuk sinkronisasi tipe number
                                                    name={field.name}
                                                    ref={field.ref}
                                                    onBlur={field.onBlur}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="w-full md:w-auto px-8">
                                Lanjut ke Data Anak
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};