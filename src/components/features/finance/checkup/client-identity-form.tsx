"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Users, Briefcase, MapPin, Phone, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SimulationClientProfile } from "@/lib/types";

// --- VALIDATION SCHEMA ---
const identitySchema = z.object({
    name: z.string().min(2, "Nama wajib diisi"),
    dob: z.string().min(1, "Tanggal lahir wajib diisi"),
    gender: z.enum(["L", "P"]),
    city: z.string().min(2, "Kota wajib diisi"),
    address: z.string().min(5, "Alamat lengkap wajib diisi"),
    phone: z.string().min(10, "Nomor HP minimal 10 digit"),
    email: z.union([z.literal(""), z.string().email("Email tidak valid")]),
    occupation: z.string().min(2, "Pekerjaan wajib diisi"),
    religion: z.string().optional(),
    maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED"]),

    // PERBAIKAN DISINI: Hapus objek { invalid_type_error }
    // Gunakan z.number() murni untuk sinkronisasi tipe strict number
    childrenCount: z.number().min(0),
    dependentParents: z.number().min(0),

    spouseName: z.string().optional(),
    spouseDob: z.string().optional(),
    spouseOccupation: z.string().optional(),
});


// Infer Type dari Schema
type IdentityFormValues = z.infer<typeof identitySchema>;

interface ClientIdentityFormProps {
    initialData?: SimulationClientProfile & { spouse?: { name: string; dob?: string; occupation?: string } };
    onComplete: (data: any) => void;
}

export function ClientIdentityForm({ initialData, onComplete }: ClientIdentityFormProps) {

    const form = useForm<IdentityFormValues>({
        resolver: zodResolver(identitySchema),
        defaultValues: {
            name: initialData?.name || "",
            dob: initialData?.dob || "",
            gender: initialData?.gender || "L",
            city: initialData?.city || "",
            address: initialData?.address || "",
            phone: initialData?.phone || "",
            email: initialData?.email || "",
            occupation: initialData?.occupation || "",
            religion: initialData?.religion || "Islam",
            maritalStatus: initialData?.maritalStatus || "MARRIED",
            // Default value number (bukan string)
            childrenCount: initialData?.childrenCount ?? 0,
            dependentParents: initialData?.dependentParents ?? 0,
            // Spouse mapping with safe fallbacks
            spouseName: initialData?.spouse?.name || "",
            spouseDob: initialData?.spouse?.dob || "",
            spouseOccupation: initialData?.spouse?.occupation || "",
        },
    });

    const maritalStatus = form.watch("maritalStatus");

    const onSubmit = (values: IdentityFormValues) => {
        const structuredData = {
            client: {
                name: values.name,
                dob: values.dob,
                gender: values.gender,
                city: values.city,
                address: values.address,
                phone: values.phone,
                email: values.email || undefined,
                occupation: values.occupation,
                religion: values.religion,
                maritalStatus: values.maritalStatus,
                childrenCount: values.childrenCount,
                dependentParents: values.dependentParents,
            },
            spouse: values.maritalStatus === "MARRIED" ? {
                name: values.spouseName || "Pasangan",
                dob: values.spouseDob,
                occupation: values.spouseOccupation
            } : undefined
        };

        onComplete(structuredData);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Profil Klien</h2>
                <p className="text-slate-500 text-sm">Lengkapi data diri nasabah untuk keperluan laporan analisa.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* SECTION 1: DATA PRIBADI */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-brand-600">
                                <User className="w-5 h-5" />
                                <CardTitle className="text-base">Identitas Utama</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Lengkap</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Sesuai KTP" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dob"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tanggal Lahir</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jenis Kelamin</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="L">Laki-laki</SelectItem>
                                                    <SelectItem value="P">Perempuan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pekerjaan</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                                <Input className="pl-9" placeholder="Karyawan Swasta / Wiraswasta" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="religion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Agama</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Agama" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Islam">Islam</SelectItem>
                                                <SelectItem value="Kristen">Kristen</SelectItem>
                                                <SelectItem value="Katolik">Katolik</SelectItem>
                                                <SelectItem value="Hindu">Hindu</SelectItem>
                                                <SelectItem value="Buddha">Buddha</SelectItem>
                                                <SelectItem value="Konghucu">Konghucu</SelectItem>
                                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </CardContent>
                    </Card>

                    {/* SECTION 2: KONTAK & DOMISILI */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-brand-600">
                                <MapPin className="w-5 h-5" />
                                <CardTitle className="text-base">Kontak & Domisili</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kota Domisili</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Jakarta Selatan" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>No. Handphone (WhatsApp)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                                <Input className="pl-9" type="tel" placeholder="0812..." {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Email (Opsional)</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="email@contoh.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Alamat Lengkap</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Jl. Nama Jalan No. Rumah, RT/RW, Kelurahan, Kecamatan" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </CardContent>
                    </Card>

                    {/* SECTION 3: KELUARGA & TANGGUNGAN */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-brand-600">
                                <Users className="w-5 h-5" />
                                <CardTitle className="text-base">Status Keluarga</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="maritalStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status Pernikahan</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="SINGLE">Lajang</SelectItem>
                                                    <SelectItem value="MARRIED">Menikah</SelectItem>
                                                    <SelectItem value="DIVORCED">Cerai (Hidup/Mati)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* FIX: KONVERSI MANUAL ONCHANGE AGAR TIPE STATE SELALU NUMBER */}
                                <FormField
                                    control={form.control}
                                    name="childrenCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jumlah Anak</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    {...field}
                                                    onChange={(e) => {
                                                        const val = e.target.valueAsNumber;
                                                        // Jika kosong/NaN, set 0. Jika ada nilai, set number.
                                                        field.onChange(isNaN(val) ? 0 : val);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* FIX: KONVERSI MANUAL ONCHANGE */}
                                <FormField
                                    control={form.control}
                                    name="dependentParents"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tanggungan Orang Tua</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    {...field}
                                                    onChange={(e) => {
                                                        const val = e.target.valueAsNumber;
                                                        field.onChange(isNaN(val) ? 0 : val);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* DATA PASANGAN (Hanya jika Menikah) */}
                            {maritalStatus === "MARRIED" && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <Separator className="my-4" />
                                    <div className="flex items-center gap-2 mb-4 text-slate-700">
                                        <Heart className="w-4 h-4 text-rose-500" />
                                        <h4 className="font-bold text-sm uppercase tracking-wider">Data Pasangan</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="spouseName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Pasangan</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nama Suami/Istri" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="spouseDob"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tgl Lahir Pasangan</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="spouseOccupation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Pekerjaan Pasangan</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Pekerjaan" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                        </CardContent>
                    </Card>

                    <Button type="submit" className="w-full h-12 text-base bg-brand-600 hover:bg-brand-700 font-bold rounded-xl shadow-lg shadow-brand-600/20">
                        Lanjut ke Data Keuangan
                    </Button>

                </form>
            </Form>
        </div>
    );
}