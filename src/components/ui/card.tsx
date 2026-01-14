import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean // Opsi untuk kartu dashboard yang ada gradasi birunya [cite: 313]
}

export function Card({ className, gradient = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm", // Rounded 2xl biar smooth
        gradient 
          ? "bg-gradient-to-br from-blue-50 to-white border-blue-100" 
          : "bg-white border-slate-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}