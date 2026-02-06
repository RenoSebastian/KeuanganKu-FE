"use client";

import { useState } from "react";
import { User, Calendar, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface IdentityFormProps {
    onSubmit: (data: { name: string; age: number }) => void;
}

export function IdentityForm({ onSubmit }: IdentityFormProps) {
    const [name, setName] = useState("");
    const [age, setAge] = useState<string>(""); // String dulu untuk handling input kosong
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi Sederhana
        if (!name.trim()) {
            setError("Nama wajib diisi.");
            return;
        }

        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 17 || ageNum > 100) {
            setError("Usia harus valid (17 - 100 tahun).");
            return;
        }

        setError(null);
        onSubmit({ name, age: ageNum });
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="text-center pb-2">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-800">
                        Data Klien
                    </CardTitle>
                    <CardDescription>
                        Masukkan identitas untuk memulai analisis profil risiko.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Input Nama */}
                        <div className="space-y-2">
                            <Label htmlFor="clientName" className="text-slate-600 font-semibold">
                                Nama Lengkap
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="clientName"
                                    placeholder="Contoh: Budi Santoso"
                                    className="pl-9"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Input Usia */}
                        <div className="space-y-2">
                            <Label htmlFor="clientAge" className="text-slate-600 font-semibold">
                                Usia (Tahun)
                            </Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="clientAge"
                                    type="number"
                                    placeholder="Contoh: 35"
                                    className="pl-9"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    min={1}
                                    max={120}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded border border-red-100">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 mt-2"
                            disabled={!name || !age}
                        >
                            Mulai Kuis <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}