import * as React from"react"

import { cn } from"@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn("flex min-h-[80px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold tracking-normal ring-offset-white placeholder:text-slate-400 placeholder:font-medium focus-visible:outline-none focus-visible:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName ="Textarea"

export { Textarea }
