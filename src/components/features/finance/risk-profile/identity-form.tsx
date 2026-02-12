"use client";

import { useState, useEffect } from "react";
import { User, Calendar, ArrowRight, UserPlus, ClipboardEdit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Interface Data Identitas
interface ClientIdentity {
    name: string;
    dob: string; // YYYY-MM-DD
    phone?: string;
    job?: string;
    city?: string;
}

interface IdentityFormProps {
    initialData?: ClientIdentity; // Untuk mode Edit/Restore
    onSubmit: (data: ClientIdentity) => void;
}

export function IdentityForm({ initialData, onSubmit }: IdentityFormProps) {
    // State Form
    const [name, setName] = useState(initialData?.name || "");
    const [dob, setDob] = useState(initialData?.dob || "");
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [job, setJob] = useState(initialData?.job || "");
    const [city, setCity] = useState(initialData?.city || "");

    const [error, setError] = useState<string | null>(null);

    // Sync state jika initialData berubah (misal saat restore session)
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDob(initialData.dob);
            setPhone(initialData.phone || "");
            setJob(initialData.job || "");
            setCity(initialData.city || "");
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Nama klien wajib diisi untuk pendataan.");
            return;
        }

        if (!dob) {
            setError("Tanggal lahir wajib diisi.");
            return;
        }

        // Validasi Tanggal Lahir (Minimal 17 tahun - Opsional)
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 17) {
            setError("Klien minimal berusia 17 tahun.");
            return;
        }

        if (age > 100) {
            setError("Tanggal lahir tidak valid.");
            return;
        }

        setError(null);
        onSubmit({
            name,
            dob,
            phone: phone.trim() || undefined,
            job: job.trim() || undefined,
            city: city.trim() || undefined
        });
    };

    return (
        <div className="w-full max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-500">
            <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white rounded-[2rem] overflow-hidden">
                {/* Header */}
                <CardHeader className="text-center pb-6 pt-8 bg-slate-50 border-b border-slate-100">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-inner">
                        <UserPlus className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                        Identitas Klien
                    </CardTitle>
                    <CardDescription className="px-6 text-slate-500 font-medium leading-relaxed">
                        Lengkapi data klien untuk memulai analisis profil risiko.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-8 pb-10 px-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Input Nama */}
                        <div className="space-y-2">
                            <Label htmlFor="clientName" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                <Input
                                    id="clientName"
                                    placeholder="Contoh: Budi Santoso"
                                    className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Input Tanggal Lahir (DOB) */}
                        <div className="space-y-2">
                            <Label htmlFor="clientDob" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                Tanggal Lahir <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                <Input
                                    id="clientDob"
                                    type="date"
                                    className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-slate-600"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    max={new Date().toISOString().split("T")[0]} // Tidak boleh masa depan
                                />
                            </div>
                        </div>

                        {/* Opsional: Pekerjaan & Kota (Grid 2 Kolom) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="job" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                    Pekerjaan (Opsional)
                                </Label>
                                <Input
                                    id="job"
                                    placeholder="Karyawan Swasta"
                                    className="h-11 bg-slate-50 border-slate-100 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-600"
                                    value={job}
                                    onChange={(e) => setJob(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                    Kota Domisili (Opsional)
                                </Label>
                                <Input
                                    id="city"
                                    placeholder="Jakarta Selatan"
                                    className="h-11 bg-slate-50 border-slate-100 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-600"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="text-[11px] text-red-600 font-bold bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-1">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] mt-4"
                            disabled={!name || !dob}
                        >
                            Mulai Analisis <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>

                        <div className="text-center pt-2">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter flex items-center justify-center gap-1">
                                <ClipboardEdit className="w-3 h-3" /> Data Rahasia & Aman
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}