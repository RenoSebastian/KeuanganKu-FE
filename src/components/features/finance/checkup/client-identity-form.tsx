"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Users, Briefcase, MapPin, Phone, Heart, Calendar, ArrowRight, ShieldCheck, Mail, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
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
import { SimulationClientProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

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
    childrenCount: z.number().min(0),
    dependentParents: z.number().min(0),
    spouseName: z.string().optional(),
    spouseDob: z.string().optional(),
    spouseOccupation: z.string().optional(),
});

type IdentityFormValues = z.infer<typeof identitySchema>;

interface ClientIdentityFormProps {
    initialData?: SimulationClientProfile & { spouse?: { name: string; dob?: string; occupation?: string } };
    onComplete: (data: any) => void;
}

// Komponen Mikro untuk Header Bagian (Section Header)
function SectionTitle({ icon: Icon, title, desc, colorClass }: { icon: any, title: string, desc: string, colorClass: string }) {
    return (
        <div className="flex items-start gap-4 mb-6">
            <div className={cn("p-3 rounded-2xl border shadow-sm shrink-0", colorClass)}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="pt-0.5">
                <h3 className="font-black text-slate-800 text-lg tracking-tight">{title}</h3>
                <p className="text-xs font-medium text-slate-500">{desc}</p>
            </div>
        </div>
    );
}

export function ClientIdentityForm({ initialData, onComplete }: ClientIdentityFormProps) {

    const form = useForm<IdentityFormValues>({
        resolver: zodResolver(identitySchema),
        defaultValues: {
            name: "",
            dob: "",
            gender: "L",
            city: "",
            address: "",
            phone: "",
            email: "",
            occupation: "",
            religion: "Islam",
            maritalStatus: "MARRIED",
            childrenCount: 0,
            dependentParents: 0,
            spouseName: "",
            spouseDob: "",
            spouseOccupation: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name || "",
                dob: initialData.dob || "",
                gender: initialData.gender || "L",
                city: initialData.city || "",
                address: initialData.address || "",
                phone: initialData.phone || "",
                email: initialData.email || "",
                occupation: initialData.occupation || "",
                religion: initialData.religion || "Islam",
                maritalStatus: initialData.maritalStatus || "SINGLE",
                childrenCount: initialData.childrenCount ?? 0,
                dependentParents: initialData.dependentParents ?? 0,
                spouseName: initialData.spouse?.name || "",
                spouseDob: initialData.spouse?.dob || "",
                spouseOccupation: initialData.spouse?.occupation || "",
            });
        }
    }, [initialData, form]);

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
        <div className="w-full relative pb-6 md:pb-2">

            {/* Header / Intro */}
            <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 mb-8 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Tahap 1: Data Dasar</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">Profil Klien</h2>
                        <p className="text-xs md:text-sm text-slate-400 font-medium">Informasi ini dijaga kerahasiaannya dan digunakan murni untuk kalkulasi rasio.</p>
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">

                    {/* =========================================
                        SECTION 1: DATA PRIBADI (BENTO CARD)
                        ========================================= */}
                    <div className="bg-white rounded-[2rem] p-5 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <SectionTitle
                            icon={User}
                            title="Identitas Utama"
                            desc="Informasi pribadi klien yang akan dianalisa."
                            colorClass="text-indigo-600 bg-indigo-50 border-indigo-100"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mt-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="group">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-indigo-600 transition-colors">Nama Lengkap</FormLabel>
                                        <FormControl>
                                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                                <Input className="pl-11 h-12 md:h-14 rounded-xl bg-slate-50 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white font-bold text-slate-800 transition-all shadow-sm" placeholder="Sesuai KTP" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dob"
                                    render={({ field }) => (
                                        <FormItem className="group">
                                            <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-indigo-600 transition-colors">Tanggal Lahir</FormLabel>
                                            <FormControl>
                                                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                    <Input type="date" className="h-12 md:h-14 rounded-xl bg-slate-50 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white font-bold text-slate-800 transition-all shadow-sm block w-full" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem className="group">
                                            <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-indigo-600 transition-colors">Gender</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <div className="transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                        <SelectTrigger className="h-12 md:h-14 rounded-xl bg-slate-50 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white font-bold text-slate-800 transition-all shadow-sm">
                                                            <SelectValue placeholder="Pilih" />
                                                        </SelectTrigger>
                                                    </div>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                    <SelectItem value="L" className="font-bold cursor-pointer">Laki-laki</SelectItem>
                                                    <SelectItem value="P" className="font-bold cursor-pointer">Perempuan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                    <FormItem className="group">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-indigo-600 transition-colors">Profesi / Pekerjaan</FormLabel>
                                        <FormControl>
                                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                                <Input className="pl-11 h-12 md:h-14 rounded-xl bg-slate-50 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white font-bold text-slate-800 transition-all shadow-sm" placeholder="Karyawan Swasta / Wiraswasta" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="religion"
                                render={({ field }) => (
                                    <FormItem className="group">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-indigo-600 transition-colors">Agama</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <div className="transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                    <SelectTrigger className="h-12 md:h-14 rounded-xl bg-slate-50 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white font-bold text-slate-800 transition-all shadow-sm">
                                                        <SelectValue placeholder="Pilih Agama" />
                                                    </SelectTrigger>
                                                </div>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                {["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya"].map(rel => (
                                                    <SelectItem key={rel} value={rel} className="font-bold cursor-pointer">{rel}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* =========================================
                        SECTION 2: KONTAK & DOMISILI
                        ========================================= */}
                    <div className="bg-white rounded-[2rem] p-5 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <SectionTitle
                            icon={MapPin}
                            title="Kontak & Domisili"
                            desc="Alamat dan nomor yang bisa dihubungi."
                            colorClass="text-emerald-600 bg-emerald-50 border-emerald-100"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mt-6">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem className="group">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-emerald-600 transition-colors">Nomor Telepon (WhatsApp)</FormLabel>
                                        <FormControl>
                                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                                <Input type="tel" inputMode="numeric" className="pl-11 h-12 md:h-14 rounded-xl bg-slate-50 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white font-bold text-slate-800 transition-all shadow-sm" placeholder="0812..." {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="group">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-emerald-600 transition-colors">Alamat Email <span className="text-[10px] font-normal lowercase tracking-normal">(Opsional)</span></FormLabel>
                                        <FormControl>
                                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                                <Input type="email" className="pl-11 h-12 md:h-14 rounded-xl bg-slate-50 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white font-bold text-slate-800 transition-all shadow-sm" placeholder="email@contoh.com" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem className="group">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-emerald-600 transition-colors">Kota Domisili</FormLabel>
                                        <FormControl>
                                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                                <Input className="pl-11 h-12 md:h-14 rounded-xl bg-slate-50 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white font-bold text-slate-800 transition-all shadow-sm" placeholder="Jakarta Selatan" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="group md:col-span-2">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-emerald-600 transition-colors">Alamat Lengkap</FormLabel>
                                        <FormControl>
                                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
                                                <MapPin className="absolute left-4 top-4.5 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                                <Input className="pl-11 h-12 md:h-14 rounded-xl bg-slate-50 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white font-bold text-slate-800 transition-all shadow-sm" placeholder="Jl. Nama Jalan No. Rumah, RT/RW, Kecamatan" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* =========================================
                        SECTION 3: KELUARGA & TANGGUNGAN
                        ========================================= */}
                    <div className="bg-white rounded-[2rem] p-5 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">

                        {/* Decorative Background Icon */}
                        <Users className="absolute -bottom-6 -right-6 w-48 h-48 text-slate-50/50 pointer-events-none" />

                        <div className="relative z-10">
                            <SectionTitle
                                icon={Users}
                                title="Tanggungan Keluarga"
                                desc="Jumlah orang yang menjadi tanggungan finansial klien."
                                colorClass="text-brand-600 bg-brand-50 border-brand-100"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-6">
                                <FormField
                                    control={form.control}
                                    name="childrenCount"
                                    render={({ field }) => (
                                        <FormItem className="group">
                                            <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-brand-600 transition-colors">Jumlah Anak</FormLabel>
                                            <FormControl>
                                                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        className="h-12 md:h-14 rounded-xl bg-slate-50 border-slate-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 focus:bg-white font-black text-xl text-slate-800 transition-all shadow-sm text-center md:text-left md:pl-6"
                                                        placeholder="0"
                                                        {...field}
                                                        value={field.value === 0 ? "" : field.value}
                                                        onChange={(e) => {
                                                            // 1. Sanitasi: Hapus SEMUA karakter yang bukan angka 0-9 (termasuk minus)
                                                            let rawValue = e.target.value.replace(/\D/g, "");

                                                            // 2. Cegah "02" menjadi "2" (hapus leading zeros jika ada lebih dari 1 digit)
                                                            if (rawValue.length > 1 && rawValue.startsWith("0")) {
                                                                rawValue = rawValue.replace(/^0+/, "");
                                                            }

                                                            // 3. Konversi kembali ke number, jika kosong kembalikan ke 0
                                                            const parsedValue = parseInt(rawValue, 10);
                                                            field.onChange(isNaN(parsedValue) ? 0 : parsedValue);
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dependentParents"
                                    render={({ field }) => (
                                        <FormItem className="group">
                                            <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-brand-600 transition-colors">Tanggungan Lain / Ortu</FormLabel>
                                            <FormControl>
                                                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        className="h-12 md:h-14 rounded-xl bg-slate-50 border-slate-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 focus:bg-white font-black text-xl text-slate-800 transition-all shadow-sm text-center md:text-left md:pl-6"
                                                        placeholder="0"
                                                        {...field}
                                                        value={field.value === 0 ? "" : field.value}
                                                        onChange={(e) => {
                                                            // 1. Sanitasi: Hapus SEMUA karakter yang bukan angka 0-9 (termasuk minus)
                                                            let rawValue = e.target.value.replace(/\D/g, "");

                                                            // 2. Cegah "02" menjadi "2" (hapus leading zeros jika ada lebih dari 1 digit)
                                                            if (rawValue.length > 1 && rawValue.startsWith("0")) {
                                                                rawValue = rawValue.replace(/^0+/, "");
                                                            }

                                                            // 3. Konversi kembali ke number, jika kosong kembalikan ke 0
                                                            const parsedValue = parseInt(rawValue, 10);
                                                            field.onChange(isNaN(parsedValue) ? 0 : parsedValue);
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* ANIMATED SPOUSE SECTION */}
                            <AnimatePresence>
                                {maritalStatus === "MARRIED" && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                        animate={{ height: "auto", opacity: 1, marginTop: "2rem" }}
                                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-6 border-t-2 border-dashed border-rose-100">
                                            <div className="flex items-center gap-2 mb-5">
                                                <div className="p-1.5 bg-rose-100 rounded-lg shadow-inner"><Heart className="w-4 h-4 text-rose-500" /></div>
                                                <h4 className="font-black text-rose-900 text-sm md:text-base uppercase tracking-widest">Profil Pasangan</h4>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50">
                                                <FormField
                                                    control={form.control}
                                                    name="spouseName"
                                                    render={({ field }) => (
                                                        <FormItem className="group">
                                                            <FormLabel className="text-[11px] font-bold text-rose-600/80 uppercase tracking-wider group-focus-within:text-rose-700 transition-colors">Nama Lengkap</FormLabel>
                                                            <FormControl>
                                                                <div className="transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                                    <Input className="h-12 rounded-xl bg-white border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 font-bold text-slate-800 transition-all shadow-sm" placeholder="Nama Suami/Istri" {...field} />
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="spouseDob"
                                                    render={({ field }) => (
                                                        <FormItem className="group">
                                                            <FormLabel className="text-[11px] font-bold text-rose-600/80 uppercase tracking-wider group-focus-within:text-rose-700 transition-colors">Tanggal Lahir</FormLabel>
                                                            <FormControl>
                                                                <div className="transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                                    <Input type="date" className="h-12 rounded-xl bg-white border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 font-bold text-slate-800 transition-all shadow-sm block w-full" {...field} />
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="spouseOccupation"
                                                    render={({ field }) => (
                                                        <FormItem className="group">
                                                            <FormLabel className="text-[11px] font-bold text-rose-600/80 uppercase tracking-wider group-focus-within:text-rose-700 transition-colors">Pekerjaan</FormLabel>
                                                            <FormControl>
                                                                <div className="transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                                    <Input className="h-12 rounded-xl bg-white border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 font-bold text-slate-800 transition-all shadow-sm" placeholder="Ibu Rumah Tangga / Karyawan" {...field} />
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* =========================================
                        SUBMIT ACTION (Fixed di layar bawah untuk PWA, atau inline di Desktop)
                        ========================================= */}
                    <div className="pt-4 pb-2 md:pb-0 z-50 bg-transparent">
                        <Button
                            type="submit"
                            className="w-full h-14 md:h-16 text-base md:text-lg bg-indigo-600 hover:bg-indigo-700 font-black tracking-wide rounded-2xl shadow-[0_8px_30px_-4px_rgba(79,70,229,0.3)] hover:-translate-y-1 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Lanjut ke Data Finansial <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    );
}