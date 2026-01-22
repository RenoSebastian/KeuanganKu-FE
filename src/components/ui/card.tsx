import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient" | "outline" | "flat"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    
    const variants = {
      // Default: Clean White (Standar Dashboard)
      default: "bg-white border border-slate-200 shadow-sm hover:shadow-md",
      
      // Glass: Transparan Elegan (Untuk elemen di atas background warna/pola)
      glass: "bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg shadow-brand-900/5",
      
      // Gradient: Highlight Brand (Untuk Hero/Stats Card)
      gradient: "bg-gradient-to-br from-brand-50/80 to-white border border-brand-100 shadow-sm",
      
      // Flat: Background Abu (Untuk secondary content)
      flat: "bg-slate-50 border border-slate-100 text-slate-600",

      // Outline: Dashed/Border Only (Untuk placeholder/empty state)
      outline: "bg-transparent border-2 border-dashed border-slate-200 text-slate-400",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 transition-all duration-300", // Base: Rounded 2xl & Padding Lega (Fluidity)
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export { Card }