import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // [UPDATE] Menambahkan "link" ke dalam tipe variant
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link"
  size?: "sm" | "md" | "lg" | "icon"
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth = false, ...props }, ref) => {
    
    // Base styles: Flexbox, Rounded, Font, Transition, Focus Ring
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
    
    // Variants: Mapping ke Palet Warna PAM Blue Ecosystem
    const variants = {
      // Primary: Brand Blue (Action Utama)
      primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/25 border border-transparent", 
      
      // Secondary: Light Brand (Action Pendukung)
      secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100", 
      
      // Outline: Neutral Border (Action Netral)
      outline: "border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-slate-300",
      
      // Ghost: Text Only (Navigasi/Icon)
      ghost: "hover:bg-slate-100 text-slate-500 hover:text-slate-900",
      
      // Danger: Rose Red (Hapus/Batal)
      danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/25 border border-transparent",

      // [UPDATE] Link: Tampilan seperti hyperlink teks biasa
      link: "text-brand-600 underline-offset-4 hover:underline p-0 h-auto font-medium",
    }

    // Sizes: Dimensi yang ergonomis
    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-12 px-6 text-sm", // Standar tinggi 48px (Touch Friendly)
      lg: "h-14 px-8 text-base", // Call to Action Besar
      icon: "h-12 w-12",
    }

    // Logic khusus: Jika variant 'link', abaikan padding/height dari size standard agar flow teks natural
    const sizeClasses = variant === 'link' ? '' : sizes[size];

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizeClasses,
          fullWidth ? "w-full" : "",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }