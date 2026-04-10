import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        solid: "border-transparent",
        outline: "bg-background",
        ghost: "border-transparent bg-transparent",
      },
      color: {
        primary: "bg-blue-50 text-blue-700 border-blue-200 [&>svg]:text-blue-600",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200 [&>svg]:text-emerald-600",
        warning: "bg-amber-50 text-amber-700 border-amber-200 [&>svg]:text-amber-600",
        danger: "bg-red-50 text-red-700 border-red-200 [&>svg]:text-red-600",
        neutral: "bg-slate-50 text-slate-700 border-slate-200 [&>svg]:text-slate-600",
      }
    },
    compoundVariants: [
      { variant: "solid", color: "primary", className: "bg-blue-600 text-white border-blue-600 [&>svg]:text-white" },
      { variant: "solid", color: "success", className: "bg-emerald-600 text-white border-emerald-600 [&>svg]:text-white" },
      { variant: "solid", color: "warning", className: "bg-amber-500 text-white border-amber-500 [&>svg]:text-white" },
      { variant: "solid", color: "danger", className: "bg-red-600 text-white border-red-600 [&>svg]:text-white" },
      { variant: "solid", color: "neutral", className: "bg-slate-700 text-white border-slate-700 [&>svg]:text-white" },
    ],
    defaultVariants: {
      variant: "outline",
      color: "neutral",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, color, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant, color }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none ", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
