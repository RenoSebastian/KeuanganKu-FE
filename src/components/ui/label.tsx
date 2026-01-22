"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors",
  {
    variants: {
      variant: {
        // Label standar
        default: "text-sm font-bold text-slate-700",
        
        // Label untuk Field Form (Style PAM JAYA yang sering kita pakai)
        field: "text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider",
        
        // Label dengan warna Brand
        brand: "text-sm font-bold text-brand-600",
        
        // Label Error
        error: "text-xs font-bold text-rose-500 flex items-center gap-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, variant, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant }), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }