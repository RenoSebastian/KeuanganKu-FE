import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "success" | "warning" | "danger" | "neutral" | "outline" | "secondary"
  className?: string
}

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  const variants = {
    success: "bg-green-100 text-green-700 border-green-200", // SEHAT
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200", // WASPADA
    danger: "bg-red-100 text-red-700 border-red-200", // RISIKO
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
    outline: "border border-slate-300 text-slate-600 bg-transparent",
    secondary: "bg-blue-50 text-blue-700 border-blue-200",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}