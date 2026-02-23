"use client";

import React, { useState, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// --- TIPE DATA ---
interface SmartMoneyInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value: number; // Kita memaksa value harus number agar type-safe
    onValueChange: (value: number) => void;
    currencyPrefix?: string;
    error?: boolean;
}

// --- KOMPONEN UTAMA ---
const SmartMoneyInput = forwardRef<HTMLInputElement, SmartMoneyInputProps>(
    ({ value, onValueChange, className, currencyPrefix = "Rp", error, onFocus, onBlur, placeholder, ...props }, ref) => {

        // State lokal untuk tampilan string (misal: "1.000.000")
        const [displayValue, setDisplayValue] = useState("");
        const [isFocused, setIsFocused] = useState(false);

        // --- LOGIC 1: FORMATTER (Number -> String) ---
        // Mengubah angka 1000000 menjadi "1.000.000"
        const formatCurrency = (val: number | string) => {
            if (val === "" || val === undefined || val === null) return "";

            // Pastikan input adalah string angka
            const stringVal = val.toString().replace(/\D/g, "");
            const numberVal = parseInt(stringVal, 10);

            // Jika NaN, kembalikan string kosong
            if (isNaN(numberVal)) return "";

            // Format ke locale Indonesia
            return new Intl.NumberFormat("id-ID").format(numberVal);
        };

        // --- LOGIC 2: SYNC VALUE ---
        // Saat props 'value' berubah dari luar (misal hasil kalkulasi), update tampilan
        useEffect(() => {
            // Jangan update jika sedang focus agar kursor tidak lompat, 
            // KECUALI jika value jadi 0 (reset)
            if (!isFocused || value === 0) {
                if (value === 0 && isFocused) {
                    setDisplayValue(""); // Jika 0 dan sedang focus, kosongkan visualnya
                } else {
                    setDisplayValue(value === 0 ? "0" : formatCurrency(value));
                }
            }
        }, [value, isFocused]);

        // --- LOGIC 3: INPUT HANDLER ---
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;

            // 1. Hapus semua karakter non-digit (termasuk huruf & minus)
            const numericString = inputValue.replace(/\D/g, "");

            // 2. Update tampilan lokal dengan format ribuan
            setDisplayValue(formatCurrency(numericString));

            // 3. Kirim angka murni (number) ke parent component
            const numberValue = parseInt(numericString, 10);
            onValueChange(isNaN(numberValue) ? 0 : numberValue);
        };

        // --- LOGIC 4: FOCUS HANDLER (The "Smart" Part) ---
        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);

            // Jika nilainya 0, kosongkan tampilan agar user enak ngetik
            if (value === 0) {
                setDisplayValue("");
            }

            if (onFocus) onFocus(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);

            // Jika kosong saat ditinggalkan, kembalikan ke "0"
            if (displayValue === "") {
                setDisplayValue("0");
                onValueChange(0);
            }

            if (onBlur) onBlur(e);
        };

        return (
            <div className={cn("relative w-full group", className)}>
                {/* Visual Prefix "Rp" dibuat lebih tebal dan solid letaknya */}
                <div className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold tracking-wide transition-colors pointer-events-none z-10",
                    isFocused ? "text-blue-600" : "",
                    error ? "text-rose-500" : ""
                )}>
                    {currencyPrefix}
                </div>

                {/* The Actual Input */}
                <Input
                    ref={ref}
                    // [FIX PWA] type="tel" adalah trik magis terbaik untuk memaksa iPhone dan Android 
                    // memunculkan keyboard Numpad besar
                    type="tel"
                    inputMode="numeric"

                    // [FIX NATIVE VALIDATION] 
                    // Ubah regex pattern agar mengizinkan titik (.) dan koma (,) dari hasil formatter.
                    // Jika tetap [0-9]*, browser akan menolak string "1.000.000" saat form di-submit.
                    pattern="[0-9.,]*"

                    value={displayValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder || "0"}
                    className={cn(
                        "pl-12 text-left font-sans text-base md:text-lg font-black tracking-tight transition-all shadow-sm bg-slate-50",
                        "focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:bg-white",
                        error && "border-rose-300 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10",
                        displayValue === "" && "text-slate-400"
                    )}
                    {...props}
                />
            </div>
        );
    }
);

SmartMoneyInput.displayName = "SmartMoneyInput";

export { SmartMoneyInput };