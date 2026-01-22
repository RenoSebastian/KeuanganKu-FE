import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode 
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
            {label}
          </label>
        )}
        
        <div className="relative group">
          {icon && (
            <div className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none",
              error ? "text-rose-400" : "text-slate-400 group-focus-within:text-brand-500"
            )}>
              {icon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              "flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400",
              
              // Focus State (Brand Identity)
              "focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
              
              // Disabled State
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-100",
              
              // Padding for Icon
              icon ? "pl-10" : "",
              
              // Error State (Rose Red)
              error ? "border-rose-300 bg-rose-50/20 text-rose-900 placeholder:text-rose-300 focus:border-rose-500 focus:ring-rose-500/10" : "",
              
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        
        {error && (
          <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }