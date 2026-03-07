"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputOTPProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    maxLength?: number;
}

const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
    ({ className, value, onChange, maxLength = 6, ...props }, ref) => {
        // Array of refs untuk mengontrol fokus setiap kotak input
        const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
            const val = e.target.value;

            // Validasi Regex: Hanya izinkan angka
            if (!/^[0-9]*$/.test(val)) return;

            const newValue = value.split("");
            // Ambil karakter terakhir untuk menangani kasus ketikan cepat
            newValue[index] = val.slice(-1);
            const combined = newValue.join("");
            onChange(combined);

            // Pindahkan fokus ke kotak berikutnya jika tidak kosong
            if (val !== "" && index < maxLength - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
            if (e.key === "Backspace") {
                if (!value[index] && index > 0) {
                    // Jika kotak saat ini kosong dan user tekan backspace, 
                    // pindah ke kotak sebelumnya dan hapus isinya.
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
            // Ekstrak hanya angka dari data yang di-paste, batasi sesuai maxLength
            const pastedData = e.clipboardData.getData("text/plain").replace(/[^0-9]/g, "").slice(0, maxLength);

            if (pastedData) {
                onChange(pastedData);
                // Otomatis pindahkan fokus ke kotak kosong berikutnya, atau kotak terakhir
                const nextFocusIndex = Math.min(pastedData.length, maxLength - 1);
                inputRefs.current[nextFocusIndex]?.focus();
            }
        };

        return (
            <div className={cn("flex items-center justify-center gap-2 sm:gap-3", className)}>
                {Array.from({ length: maxLength }).map((_, index) => (
                    <input
                        key={index}
                        ref={(el) => {
                            inputRefs.current[index] = el;
                            // Forward the ref for the first input if needed by React Hook Form
                            if (index === 0 && typeof ref === 'function') ref(el);
                            else if (index === 0 && ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        value={value[index] || ""}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        className={cn(
                            "w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold bg-background",
                            "border border-input rounded-md ring-offset-background transition-all",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            value[index] ? "border-primary/50 text-primary" : ""
                        )}
                        {...props}
                    />
                ))}
            </div>
        );
    }
);
InputOTP.displayName = "InputOTP";

export { InputOTP };