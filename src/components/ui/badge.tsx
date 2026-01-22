import { cn } from "@/lib/utils"

export type BadgeVariant = 
  | "default" 
  | "brand" 
  | "success" 
  | "warning" 
  | "danger" 
  | "outline" 
  | "secondary" 
  // Legacy support agar tidak error di file lama yang pakai "neutral"
  | "neutral" 

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants: Record<string, string> = {
    // Default / Neutral (Slate - Modern Grey)
    default: "bg-slate-100 text-slate-600 border-slate-200",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",

    // Brand Identity (PAM Deep Blue)
    brand: "bg-brand-50 text-brand-700 border-brand-200",

    // Functional States (Soft Pastel Backgrounds + Strong Text)
    success: "bg-emerald-50 text-emerald-700 border-emerald-200", // SEHAT (Growth)
    warning: "bg-amber-50 text-amber-700 border-amber-200",     // WASPADA (Caution)
    danger:  "bg-rose-50 text-rose-700 border-rose-200",         // BAHAYA (Critical)

    // Secondary (Water Cyan - Elemen Air)
    secondary: "bg-cyan-50 text-cyan-700 border-cyan-200",

    // Outline (Clean Border)
    outline: "border border-slate-300 text-slate-600 bg-transparent hover:bg-slate-50",
  }

  // Fallback ke default jika varian tidak ditemukan
  const selectedVariant = variants[variant] || variants.default

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
        selectedVariant,
        className
      )}
    >
      {children}
    </span>
  )
}