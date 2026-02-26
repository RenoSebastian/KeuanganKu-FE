"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Calendar, Clock, GraduationCap, X, Wallet } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SmartMoneyInput } from "@/components/ui/smart-money-input"; // [NEW] Import Komponen Pintar

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
    childIndex: number;
    stageIndex: number;
    level: SchoolLevelType;
    onRemove?: () => void;
}

export function StageInputCard({
    childIndex,
    stageIndex,
    level,
    onRemove,
}: StageInputCardProps) {
    const { control } = useFormContext();

    // Path prefix untuk akses ke field form yang spesifik
    const fieldPrefix = `childrenPlans.${childIndex}.stages.${stageIndex}`;

    return (
        <Card className="border-l-4 border-l-primary/70 shadow-md bg-card/50 backdrop-blur-sm relative overflow-hidden group hover:border-l-primary transition-all duration-300">
            <CardHeader className="bg-secondary/5 pb-3 border-b border-border/50">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl text-primary ring-1 ring-primary/20">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-foreground">
                                {LEVEL_LABELS[level]}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[10px] font-mono tracking-wider uppercase bg-background border-border">
                                    Jenjang {level}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Tombol Hapus */}
                    {onRemove && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onRemove}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 transition-colors rounded-full"
                            title="Hapus Jenjang Ini"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-6 grid gap-6">

                {/* --- BARIS 1: WAKTU (TAHUN & DURASI) --- */}
                <div className="grid grid-cols-2 gap-5">
                    <FormField
                        control={control}
                        name={`${fieldPrefix}.startYear`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs flex items-center gap-1.5 text-muted-foreground font-semibold uppercase tracking-wide">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Tahun Masuk
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Contoh: 2030"
                                        {...field}
                                        className="font-mono text-sm h-10 bg-background/50 focus:bg-background transition-all"
                                        min={new Date().getFullYear()} // Validasi HTML dasar
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
                                <FormLabel className="text-xs flex items-center gap-1.5 text-muted-foreground font-semibold uppercase tracking-wide">
                                    <Clock className="w-3.5 h-3.5" />
                                    Durasi (Tahun)
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        className="font-mono text-sm h-10 bg-background/50 focus:bg-background transition-all"
                                        min={1}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Separator Visual */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-dashed border-border" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-card px-2 text-muted-foreground flex items-center gap-1">
                            <Wallet className="w-3 h-3" /> Input Biaya
                        </span>
                    </div>
                </div>

                {/* --- BARIS 2: BIAYA (MENGGUNAKAN SMART MONEY INPUT) --- */}
                <div className="space-y-4">
                    <p className="text-sm text-foreground/80 font-medium">
                        Berapa biaya sekolah <span className="font-bold underline decoration-primary/50 decoration-2 underline-offset-2">saat ini</span>?
                    </p>

                    <div className={cn(
                        "grid gap-5",
                        level === "S2" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                    )}>

                        {/* 1. UANG PANGKAL (All except S2) */}
                        {level !== "S2" && (
                            <FormField
                                control={control}
                                name={`${fieldPrefix}.costEntry`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">Uang Pangkal / Gedung</FormLabel>
                                        <FormControl>
                                            <SmartMoneyInput
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                placeholder="0"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* 2. SPP BULANAN (TK, SD, SMP, SMA) */}
                        {["TK", "SD", "SMP", "SMA"].includes(level) && (
                            <FormField
                                control={control}
                                name={`${fieldPrefix}.costMonthly`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">SPP per Bulan</FormLabel>
                                        <FormControl>
                                            <SmartMoneyInput
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                placeholder="0"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* 3. UKT SEMESTER (S1) */}
                        {level === "S1" && (
                            <FormField
                                control={control}
                                name={`${fieldPrefix}.costSemester`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">UKT per Semester</FormLabel>
                                        <FormControl>
                                            <SmartMoneyInput
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                placeholder="0"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* 4. BIAYA FULL (S2) */}
                        {level === "S2" && (
                            <FormField
                                control={control}
                                name={`${fieldPrefix}.costFull`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground">Total Biaya Paket (Lumpsum)</FormLabel>
                                        <FormControl>
                                            <SmartMoneyInput
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                placeholder="Contoh: 45.000.000"
                                                className="bg-primary/5 border-primary/20 focus-visible:ring-primary/40"
                                            />
                                        </FormControl>
                                        <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                            *Masukkan total biaya kuliah S2 sampai lulus.
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