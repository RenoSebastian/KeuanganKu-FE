"use client";

import { useState } from "react";
import { User, Calendar, ArrowRight, UserPlus, ClipboardEdit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface IdentityFormProps {
    onSubmit: (data: { name: string; age: number }) => void;
}

export function IdentityForm({ onSubmit }: IdentityFormProps) {
    const [name, setName] = useState("");
    const [age, setAge] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Nama klien wajib diisi untuk pendataan.");
            return;
        }

        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 17 || ageNum > 100) {
            setError("Usia klien harus berada di rentang valid (17 - 100 tahun).");
            return;
        }

        setError(null);
        onSubmit({ name, age: ageNum });
    };

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500">
            <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white rounded-[2rem] overflow-hidden">
                {/* Header diubah menjadi aksen biru muda (Slate-50) */}
                <CardHeader className="text-center pb-4 pt-8 bg-slate-50 border-b border-slate-100">
                    {/* Icon container diubah menjadi Blue-100 & Blue-600 */}
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-inner">
                        <UserPlus className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                        Registrasi Prospek
                    </CardTitle>
                    <CardDescription className="px-6 text-slate-500 font-medium leading-relaxed">
                        Input identitas dasar klien untuk mempersonalisasi laporan analisis risiko.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-8 pb-10 px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Input Nama */}
                        <div className="space-y-2">
                            <Label htmlFor="clientName" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                Nama Lengkap Klien
                            </Label>
                            <div className="relative group">
                                {/* Icon focus-within diubah menjadi Blue-600 */}
                                <User className="absolute left-3 top-3 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
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

                        {/* Input Usia */}
                        <div className="space-y-2">
                            <Label htmlFor="clientAge" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                Usia Saat Ini (Tahun)
                            </Label>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                <Input
                                    id="clientAge"
                                    type="number"
                                    placeholder="Contoh: 35"
                                    className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    min={17}
                                    max={100}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="text-[11px] text-red-600 font-bold bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                                <div className="w-1 h-4 bg-red-500 rounded-full" />
                                {error}
                            </div>
                        )}

                        {/* Button utama diubah menjadi Blue-600 */}
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                            disabled={!name || !age}
                        >
                            Konfirmasi & Lanjut <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>

                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter flex items-center justify-center gap-1">
                                <ClipboardEdit className="w-3 h-3" /> Pendataan Awal Sesi Konsultasi
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}