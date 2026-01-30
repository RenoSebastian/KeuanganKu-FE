import React, { ClipboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";

interface SafetyInputProps {
    expectedPhrase: string;
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
    className?: string;
}

/**
 * SAFETY INPUT COMPONENT
 * Input field yang didesain untuk "Cognitive Friction".
 * * Security Features:
 * 1. Disable Paste: Mencegah user copy-paste kalimat konfirmasi.
 * 2. Visual Feedback: Memberikan sinyal visual instan (Merah/Hijau) saat mengetik.
 */
export function SafetyInput({
    expectedPhrase,
    value,
    onChange,
    disabled,
    className,
}: SafetyInputProps) {

    // Logic Validasi Real-time
    const isMatch = value === expectedPhrase;
    const isStarted = value.length > 0;
    const isError = isStarted && !expectedPhrase.startsWith(value);

    // Mencegah Copy-Paste (Hard Barrier)
    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        alert("Demi keamanan, fitur Copy-Paste dimatikan. Mohon ketik kalimat konfirmasi secara manual.");
    };

    return (
        <div className={cn("space-y-3", className)}>
            <div className="space-y-1">
                <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    Konfirmasi Manual
                </Label>
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-md text-sm font-mono font-medium text-slate-700 select-none">
                    {expectedPhrase}
                </div>
            </div>

            <div className="relative">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    placeholder="Ketik kalimat di atas..."
                    className={cn(
                        "pr-10 transition-colors font-mono",
                        isMatch ? "border-green-500 focus-visible:ring-green-500 bg-green-50" : "",
                        isError ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""
                    )}
                />

                {/* Status Icon Indicator */}
                <div className="absolute right-3 top-2.5">
                    {isMatch && <CheckCircle2 className="h-5 w-5 text-green-600 animate-in zoom-in" />}
                    {isError && <XCircle className="h-5 w-5 text-red-500 animate-in zoom-in" />}
                </div>
            </div>

            {isError && (
                <p className="text-xs text-red-500 animate-pulse">
                    Teks tidak cocok! Pastikan huruf besar/kecil sesuai.
                </p>
            )}
        </div>
    );
}