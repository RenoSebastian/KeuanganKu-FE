"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode

  /**
   * Jika true, value number akan otomatis:
   * - tidak boleh < min
   * - tidak boleh > max
   * - dibulatkan ke integer
   */
  clampNumber?: boolean

  /**
   * Disable scroll mouse untuk input number
   * (default: true)
   */
  disableWheel?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      icon,
      clampNumber = false,
      disableWheel = true,
      onChange,
      onWheel,
      min,
      max,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "number" && clampNumber) {
        let value = Number(e.target.value)

        if (Number.isNaN(value)) {
          e.target.value = ""
        } else {
          value = Math.floor(value)

          if (min !== undefined) value = Math.max(Number(min), value)
          if (max !== undefined) value = Math.min(Number(max), value)

          e.target.value = String(value)
        }
      }

      onChange?.(e)
    }

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      if (type === "number" && disableWheel) {
        e.currentTarget.blur()
      }
      onWheel?.(e)
    }

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
            {label}
          </label>
        )}

        <div className="relative group">
          {icon && (
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none",
                error
                  ? "text-rose-400"
                  : "text-slate-400 group-focus-within:text-brand-500"
              )}
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            min={min}
            max={max}
            onChange={handleChange}
            onWheel={handleWheel}
            className={cn(
              "flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400",

              // Focus
              "focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",

              // Disabled
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-100",

              // Icon padding
              icon ? "pl-10" : "",

              // Error state
              error
                ? "border-rose-300 bg-rose-50/20 text-rose-900 placeholder:text-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                : "",

              className
            )}
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
