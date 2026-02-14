"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const switchVariants = cva(
    "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 group relative overflow-hidden",
    {
        variants: {
            variant: {
                primary: "data-[state=checked]:bg-primary data-[state=checked]:shadow-lg data-[state=checked]:shadow-primary/25 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-zinc-800",
                success: "data-[state=checked]:bg-emerald-500 data-[state=checked]:shadow-lg data-[state=checked]:shadow-emerald-500/25 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-zinc-800",
            },
        },
        defaultVariants: {
            variant: "primary",
        },
    }
)

const Switch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & VariantProps<typeof switchVariants>
>(({ className, variant, ...props }, ref) => (
    <SwitchPrimitives.Root
        className={cn(switchVariants({ variant, className }))}
        {...props}
        ref={ref}
    >
        <SwitchPrimitives.Thumb
            className={cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] ring-0 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 group-active:scale-90 group-active:w-6 group-active:data-[state=checked]:translate-x-4"
            )}
        />
    </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
