import * as React from "react"
import { cn } from "@/lib/utils"

// 1. DEFINISI STYLE CONFIG
// Kita keluarkan konfigurasi style dari dalam component agar bisa diakses oleh 'buttonVariants'
const buttonConfig = {
  base: "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  variants: {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/25 border border-transparent",
    secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100",
    outline: "border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-slate-300",
    ghost: "hover:bg-slate-100 text-slate-500 hover:text-slate-900",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/25 border border-transparent",
    link: "text-brand-600 underline-offset-4 hover:underline p-0 h-auto font-medium",
  },
  sizes: {
    sm: "h-9 px-4 text-xs",
    md: "h-12 px-6 text-sm",
    lg: "h-14 px-8 text-base",
    icon: "h-12 w-12",
  }
}

// 2. INTERFACE
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonConfig.variants
  size?: keyof typeof buttonConfig.sizes
  fullWidth?: boolean
}

// 3. EXPORT HELPER (SOLUSI ERROR 2305)
// Fungsi ini sekarang bisa dipanggil oleh 'alert-dialog.tsx' atau komponen lain
export const buttonVariants = ({
  variant = "primary",
  size = "md",
  className = ""
}: {
  variant?: ButtonProps["variant"],
  size?: ButtonProps["size"],
  className?: string
} = {}) => {
  // Logic: Jika variant 'link', abaikan size class agar text flow natural
  const sizeClass = variant === 'link' ? '' : buttonConfig.sizes[size] || buttonConfig.sizes.md

  return cn(
    buttonConfig.base,
    buttonConfig.variants[variant] || buttonConfig.variants.primary,
    sizeClass,
    className
  )
}

// 4. COMPONENT IMPLEMENTATION
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Menggunakan helper yang baru dibuat
          buttonVariants({ variant, size, className }),
          fullWidth ? "w-full" : ""
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }