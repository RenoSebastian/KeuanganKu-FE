"use client";

import * as React from "react";
import { Check, School, GraduationCap, BookOpen, Backpack, Shapes, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SchoolLevelType } from "@/lib/schemas/education-simulation.schema";

interface StageSelectorProps {
    value: SchoolLevelType[];
    onChange: (value: SchoolLevelType[]) => void;
    disabled?: boolean;
}

// Metadata untuk tampilan setiap jenjang
const STAGES: { id: SchoolLevelType; label: string; icon: React.ElementType }[] = [
    { id: "TK", label: "TK / PAUD", icon: Shapes },
    { id: "SD", label: "Sekolah Dasar", icon: Backpack },
    { id: "SMP", label: "SMP", icon: BookOpen },
    { id: "SMA", label: "SMA / SMK", icon: School },
    { id: "S1", label: "Sarjana (S1)", icon: Building2 },
    { id: "S2", label: "Magister (S2)", icon: GraduationCap },
];

// Urutan logis untuk sorting otomatis saat data disimpan
const STAGE_ORDER: SchoolLevelType[] = ["TK", "SD", "SMP", "SMA", "S1", "S2"];

export function StageSelector({ value = [], onChange, disabled }: StageSelectorProps) {

    const toggleStage = (stageId: SchoolLevelType) => {
        if (disabled) return;

        let newValue: SchoolLevelType[];

        if (value.includes(stageId)) {
            // Hapus jika sudah ada (Toggle Off)
            newValue = value.filter((id) => id !== stageId);
        } else {
            // Tambah jika belum ada (Toggle On)
            newValue = [...value, stageId];
        }

        // Sort agar urutan di array selalu rapi (TK dulu, baru SD, dst)
        // Ini penting agar saat di-render di tabel rekap nanti urutannya logis
        newValue.sort((a, b) => STAGE_ORDER.indexOf(a) - STAGE_ORDER.indexOf(b));

        onChange(newValue);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">
                    Pilih Jenjang yang Ingin Dihitung:
                </label>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    {value.length} Jenjang Dipilih
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {STAGES.map((stage) => {
                    const isSelected = value.includes(stage.id);
                    const Icon = stage.icon;

                    return (
                        <div
                            key={stage.id}
                            onClick={() => toggleStage(stage.id)}
                            className={cn(
                                "group relative flex flex-col items-center justify-center gap-3 p-4 h-32 text-center rounded-xl border-2 cursor-pointer transition-all duration-200 select-none",
                                // State Styles
                                isSelected
                                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                                    : "border-muted bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground hover:shadow-md",
                                // Disabled State
                                disabled && "opacity-50 cursor-not-allowed grayscale"
                            )}
                        >
                            {/* Checkbox Indicator di pojok kanan atas */}
                            <div
                                className={cn(
                                    "absolute top-2 right-2 w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                    isSelected
                                        ? "bg-primary border-primary text-primary-foreground scale-100"
                                        : "border-muted-foreground/30 bg-transparent scale-90 opacity-0 group-hover:opacity-100"
                                )}
                            >
                                {isSelected && <Check className="w-3 h-3 stroke-3" />}
                            </div>

                            {/* Icon Jenjang */}
                            <Icon
                                className={cn(
                                    "w-8 h-8 transition-colors duration-200",
                                    isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"
                                )}
                            />

                            {/* Label */}
                            <span className="text-xs font-bold leading-tight">
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {value.length === 0 && (
                <p className="text-[10px] text-destructive font-medium mt-1">
                    * Minimal pilih satu jenjang pendidikan.
                </p>
            )}
        </div>
    );
}