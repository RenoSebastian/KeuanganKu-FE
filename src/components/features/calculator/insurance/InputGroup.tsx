import React from 'react';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/**
 * Komponen reusable untuk input field dengan prefix mata uang "Rp".
 * Mendukung semua atribut standar HTML Input.
 */
interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export const InputGroup = ({ value, onChange, className, ...props }: InputGroupProps) => {
    return (
        <div className={cn("relative group w-full", className)}>
            {/* Prefix Label "Rp" */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs transition-colors group-focus-within:bg-brand-600 group-focus-within:text-white pointer-events-none z-10">
                Rp
            </div>

            {/* Input Field */}
            <Input
                {...props}
                value={value}
                onChange={onChange}
                className={cn(
                    "pl-14 h-12 font-bold bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl transition-all",
                    className
                )}
            />
        </div>
    );
};