import * as React from "react"
import { cn } from "@/lib/utils"

// Variasi style tombol
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg" | "icon"
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth = false, ...props }, ref) => {
    
    // Base styles: Flexbox, Rounded, Font, Transition
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:pointer-events-none disabled:opacity-50"
    
    // Variants: Warna background & text
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200", // Sesuai tombol 'Masuk' & 'Simpan'
      secondary: "bg-blue-50 text-blue-700 hover:bg-blue-100", // Untuk tombol sekunder
      outline: "border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
      ghost: "hover:bg-slate-100 text-slate-600",
      danger: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-200",
    }

    // Sizes: Padding & Text Size
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-11 px-5 text-sm", // Default yang pas di jari jempol
      lg: "h-14 px-8 text-base", // Tombol Call to Action besar
      icon: "h-10 w-10",
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
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