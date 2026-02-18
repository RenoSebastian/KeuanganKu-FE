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
            <div className={cn("relative group", className)}>
                {/* Visual Prefix "Rp" */}
                <div className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm transition-colors",
                    isFocused ? "text-primary" : "",
                    error ? "text-destructive" : ""
                )}>
                    {currencyPrefix}
                </div>

                {/* The Actual Input */}
                <Input
                    ref={ref}
                    type="text"
                    inputMode="numeric" // Membuka keyboard angka di HP
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder || "0"}
                    className={cn(
                        "pl-10 text-right font-mono text-base tracking-wide transition-all shadow-sm", // Padding kiri untuk Rp, text rata kanan
                        "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary", // Custom focus ring
                        error && "border-destructive focus-visible:ring-destructive/20",
                        displayValue === "" && "text-muted-foreground" // Placeholder look jika kosong
                    )}
                    {...props}
                />
            </div>
        );
    }
);

SmartMoneyInput.displayName = "SmartMoneyInput";

export { SmartMoneyInput };