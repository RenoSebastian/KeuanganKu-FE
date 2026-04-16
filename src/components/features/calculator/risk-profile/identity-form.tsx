"use client";

import { useState, useEffect } from "react";
import { User, Calendar, ArrowRight, ShieldCheck, MapPin, Briefcase, Phone, LockKeyhole, Heart } from "lucide-react";
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
    gender: z.enum(["L", "P"]).optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.union([z.literal(""), z.string().email("Email tidak valid")]).optional(),
    occupation: z.string().optional(),
    religion: z.string().optional(),
    maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED"]).optional(),
    childrenCount: z.number().min(0).optional(),
    dependentParents: z.number().min(0).optional(),
    spouseName: z.string().optional(),
    spouseDob: z.string().optional(),
    spouseOccupation: z.string().optional(),
});

type IdentityFormValues = z.infer<typeof identitySchema>;

interface IdentityFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
}

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
                gender: "L",
                city: initialData.city || "",
                address: "",
                phone: initialData.phone || "",
                email: "",
                occupation: initialData.job || "",
                religion: "Islam",
                maritalStatus: "SINGLE",
                childrenCount: 0,
                dependentParents: 0,
                spouseName: "",
                spouseDob: "",
                spouseOccupation: "",
            });
        }
    }, [initialData, form]);

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

        const flatIdentityData = {
            name: values.name,
            dob: values.dob,
            phone: values.phone,
            job: values.occupation,
            city: values.city
        };

        onSubmit(flatIdentityData);
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { stiffness: 300, damping: 24 } }
    };

    return (
        // PERBAIKAN: max-w-5xl agar lebar di desktop mengikuti container utama
        <div className="w-full max-w-5xl mx-auto pb-6 md:pb-2 px-2 md:px-4">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* 1. EXECUTIVE HEADER (DITAMBAHKAN MARGIN TOP AGAR TIDAK MEPET) */}
                <motion.div
                    variants={itemVariants}
                    className="mt-6 md:mt-10 bg-slate-900 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl border border-slate-800"
                >
                    {/* Efek Cahaya Latar */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-indigo-500/20 p-1.5 rounded-lg border border-indigo-500/30">
                                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                                </div>
                                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Tahap 1: Identifikasi</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2">Profil Nasabah</h2>
                            <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed">Masukkan detail identitas klien untuk mengaktifkan mesin analisis profil risiko investasi.</p>
                        </div>
                    </div>
                </motion.div>

                {/* 2. THE MAIN FORM CONTAINER */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-6 md:p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 relative">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-10">

                            {/* Section: Identitas Utama */}
                            <div>
                                <SectionTitle
                                    icon={User}
                                    title="Identitas Utama"
                                    desc="Informasi primer yang digunakan untuk kalkulasi demografis."
                                    colorClass="text-indigo-600 bg-indigo-50 border-indigo-100"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="group md:col-span-12">
                                                <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap Sesuai Identitas <span className="text-rose-500">*</span></FormLabel>
                                                <FormControl>
                                                    <div className="relative transition-all duration-300 group-focus-within:-translate-y-0.5">
                                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                        <Input className="pl-14 h-16 rounded-4xl bg-slate-50 border-slate-200 focus:ring-[6px] focus:ring-indigo-500/5 focus:border-indigo-400 focus:bg-white font-black text-xl text-slate-800 transition-all shadow-inner" placeholder="Cth: Budi Santoso" {...field} autoFocus />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dob"
                                        render={({ field }) => (
                                            <FormItem className="group md:col-span-7">
                                                <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tanggal Lahir <span className="text-rose-500">*</span></FormLabel>
                                                <FormControl>
                                                    <div className="relative transition-all duration-300 group-focus-within:-translate-y-0.5">
                                                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                        <Input type="date" className="pl-14 h-16 rounded-4xl bg-slate-50 border-slate-200 focus:ring-[6px] focus:ring-indigo-500/5 focus:border-indigo-400 focus:bg-white font-black text-lg text-slate-700 transition-all shadow-inner block w-full" {...field} max={new Date().toISOString().split("T")[0]} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem className="group md:col-span-5">
                                                <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <div className="transition-all duration-300 group-focus-within:-translate-y-0.5">
                                                            <SelectTrigger className="h-16 rounded-4xl bg-slate-50 border-slate-200 focus:ring-[6px] focus:ring-indigo-500/5 focus:border-indigo-400 focus:bg-white font-black text-lg text-slate-800 transition-all shadow-inner">
                                                                <SelectValue placeholder="Pilih Gender" />
                                                            </SelectTrigger>
                                                        </div>
                                                    </FormControl>
                                                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                                                        <SelectItem value="L" className="font-bold cursor-pointer rounded-xl h-11">Laki-laki</SelectItem>
                                                        <SelectItem value="P" className="font-bold cursor-pointer rounded-xl h-11">Perempuan</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-dashed border-slate-200" />

                            {/* Section: Kontak & Lokasi */}
                            <div>
                                <SectionTitle
                                    icon={MapPin}
                                    title="Kontak & Domisili"
                                    desc="Opsional, untuk melengkapi dokumen laporan akhir."
                                    colorClass="text-emerald-600 bg-emerald-50 border-emerald-100"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    <FormField
                                        control={form.control}
                                        name="occupation"
                                        render={({ field }) => (
                                            <FormItem className="group">
                                                <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Profesi / Pekerjaan</FormLabel>
                                                <FormControl>
                                                    <div className="relative transition-all duration-300 group-focus-within:-translate-y-0.5">
                                                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-600 transition-colors z-10" />
                                                        <Input className="pl-14 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-[6px] focus:ring-emerald-500/5 focus:border-emerald-400 focus:bg-white font-bold text-base text-slate-800 transition-all shadow-inner" placeholder="Karyawan Swasta" {...field} />
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
                                                <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Kota Domisili</FormLabel>
                                                <FormControl>
                                                    <div className="relative transition-all duration-300 group-focus-within:-translate-y-0.5">
                                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-600 transition-colors z-10" />
                                                        <Input className="pl-14 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-[6px] focus:ring-emerald-500/5 focus:border-emerald-400 focus:bg-white font-bold text-base text-slate-800 transition-all shadow-inner" placeholder="Jakarta Pusat" {...field} />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem className="group md:col-span-2">
                                                <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nomor WhatsApp</FormLabel>
                                                <FormControl>
                                                    <div className="relative transition-all duration-300 group-focus-within:-translate-y-0.5">
                                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-600 transition-colors z-10" />
                                                        <Input type="tel" inputMode="numeric" className="pl-14 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-[6px] focus:ring-emerald-500/5 focus:border-emerald-400 focus:bg-white font-bold text-base text-slate-800 transition-all shadow-inner" placeholder="08123456789" {...field} />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Error Alert Box */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="text-sm text-rose-600 font-bold bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center gap-3 shadow-sm"
                                    >
                                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 3. SUBMIT SECTION */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className={cn(
                                        "w-full h-16 md:h-20 text-lg md:text-xl bg-slate-900 hover:bg-indigo-600 text-white font-black tracking-wide rounded-[1.5rem] shadow-2xl transition-all duration-500 flex items-center justify-center gap-3 group",
                                        (!nameWatch || !dobWatch) ? "opacity-50 grayscale cursor-not-allowed" : "hover:-translate-y-1 active:scale-[0.98]"
                                    )}
                                    disabled={!nameWatch || !dobWatch}
                                >
                                    Lanjut ke Kuesioner <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                </Button>

                                <div className="flex items-center justify-center gap-4 mt-8 opacity-40">
                                    <div className="flex items-center gap-1.5">
                                        <LockKeyhole className="w-3 h-3 text-emerald-600" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Privacy Secured</span>
                                    </div>
                                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                                    <div className="flex items-center gap-1.5">
                                        <Heart className="w-3 h-3 text-rose-500" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Financial Advisor Tool</span>
                                    </div>
                                </div>
                            </div>

                        </form>
                    </Form>
                </motion.div>
            </motion.div>
        </div>
    );
}