"use client";

import React, { ClipboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, AlertTriangle, Lock } from "lucide-react";
import { toast } from "sonner";

interface SafetyInputProps {
    expectedPhrase: string;
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
    className?: string;
    label?: string; // Opsional: Custom label
}

/**
 * SAFETY INPUT COMPONENT (UPDATED UX)
 * Input field "Cognitive Friction" untuk konfirmasi tindakan destruktif.
 * * Features:
 * 1. Anti-Paste dengan Toast Notification (bukan alert browser kasar).
 * 2. Real-time validation visualizer.
 * 3. Monospace alignment untuk akurasi pengetikan.
 */
export function SafetyInput({
    expectedPhrase,
    value,
    onChange,
    disabled,
    className,
    label = "Konfirmasi Manual"
}: SafetyInputProps) {

    // Logic Validasi Real-time
    const isMatch = value === expectedPhrase;
    const isStarted = value.length > 0;

    // Error logic: Jika value yang diketik TIDAK cocok dengan awal expectedPhrase
    const isError = isStarted && !expectedPhrase.startsWith(value);

    // Mencegah Copy-Paste (Hard Barrier) dengan UX yang lebih baik
    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        toast.warning("Aksi Dibatalkan", {
            description: "Demi keamanan, fitur Copy-Paste dimatikan. Mohon ketik secara manual.",
            icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        });
    };

    return (
        <div className={cn("space-y-3", className)}>
            {/* Header Section */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                        <Lock className="w-3 h-3" /> {label}
                    </Label>
                    {isMatch && (
                        <span className="text-xs font-bold text-green-600 animate-in fade-in slide-in-from-left-2">
                            Sesuai!
                        </span>
                    )}
                </div>

                {/* Target Phrase Box */}
                <div className={cn(
                    "p-3 rounded-md text-sm font-mono font-bold select-none border transition-colors flex items-center justify-between",
                    isMatch
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-muted/50 text-foreground border-border"
                )}>
                    <span>{expectedPhrase}</span>
                </div>
            </div>

            {/* Input Section */}
            <div className="relative group">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    placeholder="Ketik kalimat di atas..."
                    className={cn(
                        "pr-10 font-mono transition-all duration-200 shadow-sm",
                        // State: Match (Green)
                        isMatch && "border-green-500 focus-visible:ring-green-500 bg-green-50/50 text-green-800",
                        // State: Error (Red)
                        isError && "border-destructive focus-visible:ring-destructive bg-red-50 text-destructive",
                        // State: Normal
                        !isMatch && !isError && "focus-visible:ring-primary/20"
                    )}
                />

                {/* Status Icons */}
                <div className="absolute right-3 top-2.5 pointer-events-none transition-all duration-300">
                    {isMatch ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 animate-in zoom-in spin-in-90 duration-300" />
                    ) : isError ? (
                        <XCircle className="h-5 w-5 text-destructive animate-in zoom-in shake" />
                    ) : (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30 mt-1.5" /> // Dot indicator saat kosong
                    )}
                </div>
            </div>

            {/* Helper / Error Message */}
            <div className="h-4"> {/* Fixed height to prevent layout jump */}
                {isError && (
                    <p className="text-[10px] font-medium text-destructive animate-in slide-in-from-top-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Teks tidak cocok. Perhatikan huruf besar/kecil.
                    </p>
                )}
            </div>
        </div>
    );
}