"use client";

import { useState, useEffect } from "react";
import { User, Calendar, ArrowRight, ShieldCheck, MapPin, Briefcase, Phone, LockKeyhole, Heart } from "lucide-react";
// FIX 1: Import Variants dari framer-motion
import { motion, AnimatePresence, Variants } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

// Interface Data Identitas
interface ClientIdentity {
    name: string;
    dob: string; // YYYY-MM-DD
    phone?: string;
    job?: string;
    city?: string;
}

interface IdentityFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
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

export function IdentityForm({ initialData, onSubmit }: IdentityFormProps) {
    const [error, setError] = useState<string | null>(null);

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
    const nameWatch = form.watch("name");
    const dobWatch = form.watch("dob");

    const onFormSubmit = (values: IdentityFormValues) => {
        const birthDate = new Date(values.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 17) {
            setError("Maaf, klien minimal harus berusia 17 tahun.");
            return;
        }
        if (age > 100) {
            setError("Tanggal lahir tidak valid.");
            return;
        }

        setError(null);

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

        onSubmit(structuredData);
    };

    // FIX 2: Terapkan antarmuka Variants dan buang tipe string eksplisit (type: "spring")
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { stiffness: 300, damping: 24 } }
    };

    return (
        <div className="w-full max-w-xl mx-auto pb-6 md:pb-2">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* =========================================
                    1. EXECUTIVE HEADER (PWA Style)
                    ========================================= */}
                <motion.div variants={itemVariants} className="bg-slate-900 rounded-[2rem] p-6 md:p-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Langkah 1: Identifikasi</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">Profil Nasabah</h2>
                            <p className="text-xs md:text-sm text-slate-400 font-medium">Lengkapi identitas klien untuk memulai penyusunan profil risiko investasi.</p>
                        </div>
                    </div>
                </motion.div>

                {/* =========================================
                    2. THE BENTO FORM
                    ========================================= */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-5 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6 md:space-y-8">

                            {/* Section: Identitas Utama */}
                            <div>
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
                                            <FormItem className="group md:col-span-2">
                                                <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Sesuai KTP <span className="text-rose-500">*</span></FormLabel>
                                                <FormControl>
                                                    <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                        <Input className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white font-black text-lg text-slate-800 transition-all shadow-sm" placeholder="Cth: Budi Santoso" {...field} autoFocus />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dob"
                                        render={({ field }) => (
                                            <FormItem className="group">
                                                <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tanggal Lahir <span className="text-rose-500">*</span></FormLabel>
                                                <FormControl>
                                                    <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                        <Input type="date" className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white font-black text-base md:text-lg text-slate-700 transition-all shadow-sm block w-full" {...field} max={new Date().toISOString().split("T")[0]} />
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
                                                <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <div className="transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white font-black text-base text-slate-800 transition-all shadow-sm">
                                                                <SelectValue placeholder="Pilih Gender" />
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
                            </div>

                            <div className="border-t border-dashed border-slate-200" />

                            {/* Section: Pekerjaan & Domisili */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                                <FormField
                                    control={form.control}
                                    name="occupation"
                                    render={({ field }) => (
                                        <FormItem className="group">
                                            <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Profesi <span className="text-[9px] font-normal lowercase">(Opsional)</span></FormLabel>
                                            <FormControl>
                                                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                    <Input className="pl-11 h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white font-bold text-sm text-slate-800 transition-all shadow-sm" placeholder="Karyawan / Wiraswasta" {...field} />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem className="group">
                                            <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Kota <span className="text-[9px] font-normal lowercase">(Opsional)</span></FormLabel>
                                            <FormControl>
                                                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                    <Input className="pl-11 h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white font-bold text-sm text-slate-800 transition-all shadow-sm" placeholder="Jakarta Selatan" {...field} />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="group sm:col-span-2">
                                            <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">No. Handphone <span className="text-[9px] font-normal lowercase">(Opsional)</span></FormLabel>
                                            <FormControl>
                                                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                    <Input type="tel" inputMode="numeric" className="pl-11 h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white font-bold text-sm text-slate-800 transition-all shadow-sm" placeholder="0812..." {...field} />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="text-[11px] md:text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 animate-pulse" />
                                            {error}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* =========================================
                                3. ACTION FOOTER 
                                ========================================= */}
                            <div className="pt-6 mt-6 border-t border-slate-100">
                                <Button
                                    type="submit"
                                    className={cn(
                                        "w-full h-14 md:h-16 text-base md:text-lg bg-indigo-600 hover:bg-indigo-700 font-black tracking-wide rounded-2xl shadow-[0_8px_30px_-4px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2",
                                        (!nameWatch || !dobWatch) ? "opacity-50 cursor-not-allowed scale-100" : "hover:-translate-y-1 active:scale-[0.98]"
                                    )}
                                    disabled={!nameWatch || !dobWatch}
                                >
                                    Mulai Kuesioner <ArrowRight className="w-5 h-5 ml-1" />
                                </Button>

                                <div className="text-center pt-4">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                                        <LockKeyhole className="w-3 h-3 text-emerald-500" /> Enkripsi End-to-End
                                    </p>
                                </div>
                            </div>

                        </form>
                    </Form>
                </motion.div>
            </motion.div>
        </div>
    );
}