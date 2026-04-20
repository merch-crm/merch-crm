import * as React from"react"
import { cn } from"@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn("flex h-[60px] w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 text-base font-bold tracking-normal ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-bold placeholder:text-slate-400 placeholder:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName ="Input"

const InputRoot = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("w-full", className)} {...props} />
))
InputRoot.displayName = "InputRoot"

const InputWrapper = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative flex items-center w-full",
            className
        )}
        {...props}
    />
))
InputWrapper.displayName = "InputWrapper"

export { 
    InputRoot as Root, 
    InputWrapper as Wrapper, 
    Input
}
