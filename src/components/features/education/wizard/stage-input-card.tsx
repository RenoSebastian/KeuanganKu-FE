"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Calendar, Clock, DollarSign, Wallet, GraduationCap } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { SchoolLevelType } from "@/lib/schemas/education-simulation.schema";
import { cn } from "@/lib/utils";

// Mapping Judul Kartu agar lebih user friendly
const LEVEL_LABELS: Record<SchoolLevelType, string> = {
    TK: "Taman Kanak-Kanak (TK)",
    SD: "Sekolah Dasar (SD)",
    SMP: "Sekolah Menengah Pertama (SMP)",
    SMA: "Sekolah Menengah Atas (SMA)",
    S1: "Sarjana (S1)",
    S2: "Magister (S2)",
};

interface StageInputCardProps {
    childIndex: number; // Index Anak ke-berapa
    stageIndex: number; // Index Stage ke-berapa di dalam array anak tersebut
    level: SchoolLevelType;
    onRemove?: () => void;
}

export function StageInputCard({
    childIndex,
    stageIndex,
    level,
    onRemove,
}: StageInputCardProps) {
    const { control, watch } = useFormContext();

    // Path prefix untuk akses ke field form yang spesifik
    // format: childrenPlans[0].stages[0].fieldName
    const fieldPrefix = `childrenPlans.${childIndex}.stages.${stageIndex}`;

    return (
        <Card className="border-l-4 border-l-primary/70 shadow-sm relative overflow-hidden">
            <CardHeader className="bg-secondary/10 pb-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <GraduationCap className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-base font-bold text-primary">
                            {LEVEL_LABELS[level]}
                        </CardTitle>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase">
                            {level}
                        </Badge>
                        {/* Tombol hapus opsional jika user ingin membatalkan stage ini */}
                        {onRemove && (
                            <button
                                type="button"
                                onClick={onRemove}
                                className="text-muted-foreground hover:text-destructive text-xs transition-colors px-2 py-1 hover:bg-destructive/10 rounded"
                            >
                                Hapus
                            </button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4 grid gap-6">
                {/* --- BARIS 1: WAKTU (TAHUN & DURASI) --- */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name={`${fieldPrefix}.startYear`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs flex items-center gap-1.5 text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Tahun Masuk
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="20xx"
                                        {...field}
                                        className="font-mono text-sm h-9"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name={`${fieldPrefix}.duration`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs flex items-center gap-1.5 text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5" />
                                    Durasi (Tahun)
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        className="font-mono text-sm h-9"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* separator visual */}
                <div className="border-t border-dashed" />

                {/* --- BARIS 2: BIAYA (DINAMIS SESUAI LOGIKA) --- */}
                <div className="grid gap-4">
                    <Label className="text-xs font-semibold uppercase text-primary tracking-wider">
                        Estimasi Biaya Saat Ini (PV)
                    </Label>

                    <div className={cn(
                        "grid gap-4",
                        // Jika S2 (hanya 1 kolom), jika lainnya (2 kolom)
                        level === "S2" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                    )}>

                        {/* 1. UANG PANGKAL (Muncul di SEMUA jenjang KECUALI S2) */}
                        {level !== "S2" && (
                            <FormField
                                control={control}
                                name={`${fieldPrefix}.costEntry`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">Uang Pangkal / Gedung</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Rp</span>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    className="pl-9 font-mono h-10"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* 2. SPP BULANAN (Khusus TK, SD, SMP, SMA) */}
                        {["TK", "SD", "SMP", "SMA"].includes(level) && (
                            <FormField
                                control={control}
                                name={`${fieldPrefix}.costMonthly`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">SPP per Bulan</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Rp</span>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    className="pl-9 font-mono h-10"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* 3. UKT SEMESTER (Khusus S1) */}
                        {level === "S1" && (
                            <FormField
                                control={control}
                                name={`${fieldPrefix}.costSemester`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">UKT per Semester</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Rp</span>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    className="pl-9 font-mono h-10"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* 4. BIAYA FULL (Khusus S2) */}
                        {level === "S2" && (
                            <FormField
                                control={control}
                                name={`${fieldPrefix}.costFull`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">Total Biaya Paket (Lumpsum)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Rp</span>
                                                <Input
                                                    type="number"
                                                    placeholder="Contoh: 45.000.000"
                                                    {...field}
                                                    className="pl-9 font-mono h-10 bg-primary/5 border-primary/20"
                                                />
                                            </div>
                                        </FormControl>
                                        <p className="text-[10px] text-muted-foreground">
                                            *Masukkan total biaya kuliah S2 sampai lulus saat ini.
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}