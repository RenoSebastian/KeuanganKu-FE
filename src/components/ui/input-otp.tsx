"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface InputOTPProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    maxLength?: number;
}

const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
    ({ className, value, onChange, maxLength = 6, disabled, ...props }, ref) => {
        const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

        // Sinkronisasi fokus saat komponen di-mount
        React.useEffect(() => {
            if (props.autoFocus) {
                inputRefs.current[0]?.focus();
            }
        }, [props.autoFocus]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
            const val = e.target.value.replace(/[^0-9]/g, ""); // Pastikan hanya angka
            if (!val && e.target.value !== "") return; // Blokir jika input bukan angka

            const newValue = value.split("");
            // Menangani kasus jika user mengetik di kotak yang sudah ada isinya
            newValue[index] = val.slice(-1);
            const combined = newValue.join("");
            onChange(combined);

            // Auto-focus ke kanan
            if (val !== "" && index < maxLength - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
            if (e.key === "Backspace") {
                if (!value[index] && index > 0) {
                    // Backspace di kotak kosong -> lari ke kiri dan hapus
                    const newValue = value.split("");
                    newValue[index - 1] = "";
                    onChange(newValue.join(""));
                    inputRefs.current[index - 1]?.focus();
                }
            } else if (e.key === "ArrowLeft" && index > 0) {
                inputRefs.current[index - 1]?.focus();
            } else if (e.key === "ArrowRight" && index < maxLength - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        };

        const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            const pastedData = e.clipboardData
                .getData("text/plain")
                .replace(/[^0-9]/g, "")
                .slice(0, maxLength);

            if (pastedData) {
                onChange(pastedData);
                const nextFocusIndex = Math.min(pastedData.length, maxLength - 1);
                inputRefs.current[nextFocusIndex]?.focus();
            }
        };

        return (
            <div className={cn("flex items-center justify-center gap-2 sm:gap-3", className)}>
                {Array.from({ length: maxLength }).map((_, index) => {
                    const isFocused = !disabled && (
                        // Fokus jika index ini aktif, ATAU jika kotak sebelumnya terisi dan ini kotak kosong pertama
                        (value.length === index) ||
                        (value.length === maxLength && index === maxLength - 1)
                    );

                    const char = value[index] || "";

                    return (
                        <React.Fragment key={index}>
                            <div className="relative group">
                                <input
                                    ref={(el) => {
                                        inputRefs.current[index] = el;
                                        if (index === 0 && ref) {
                                            if (typeof ref === "function") ref(el);
                                            else (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
                                        }
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    pattern="\d*"
                                    maxLength={1}
                                    value={char}
                                    disabled={disabled}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    className={cn(
                                        // Layout Utama Kotak
                                        "w-12 h-16 sm:w-14 sm:h-20 text-center text-2xl font-black rounded-2xl transition-all duration-300",
                                        "bg-slate-50 border-2 border-slate-100 text-slate-900 outline-none",
                                        // State: Terisi
                                        char && "border-slate-200 bg-white shadow-sm",
                                        // State: Fokus / Aktif
                                        "focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-500/10",
                                        // State: Disabled
                                        "disabled:opacity-50 disabled:cursor-not-allowed",
                                        // Mencegah font default browser yang jelek
                                        "appearance-none"
                                    )}
                                    {...props}
                                />

                                {/* Animasi Cursor Buatan (Hanya muncul jika kotak kosong dan aktif) */}
                                {!char && !disabled && (
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <div className="w-0.5 h-8 bg-blue-600 opacity-0 group-focus-within:animate-caret-blink" />
                                    </div>
                                )}
                            </div>

                            {/* Separator di tengah digit (Contoh: 123 - 456) */}
                            {index === 2 && (
                                <div className="w-1 sm:w-2 flex justify-center">
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    }
);

InputOTP.displayName = "InputOTP";

export { InputOTP };