import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const crmButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96] select-none",
  {
    variants: {
      variant: {
        action:
          "bg-[#1A2233] text-white shadow-sm hover:bg-[#252E44] border border-white/5",
        actionOutline:
          "bg-[#1A2233]/5 text-[#1A2233] border border-[#1A2233]/20 hover:bg-[#1A2233]/10 shadow-none",
        actionGhost:
          "bg-transparent text-[#1A2233] border-transparent hover:bg-[#1A2233]/10 shadow-none",
        danger:
          "bg-[#E11D48] text-white shadow-sm hover:bg-[#F43F5E] border border-white/5",
        dangerOutline:
          "bg-[#E11D48]/5 text-[#E11D48] border border-[#E11D48]/20 hover:bg-[#E11D48]/10 shadow-none",
        dangerGhost:
          "bg-transparent text-rose-500 hover:bg-rose-500/10 border-transparent shadow-none",
        neutral:
          "bg-[#F4F4F5] text-[#1A2233] border border-black/5 hover:bg-[#E4E4E7] shadow-sm",
        neutralOutline:
          "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-none",
        neutralGhost:
          "bg-transparent text-slate-600 hover:bg-slate-500/10 border-transparent shadow-none",
        success:
          "bg-[#10B981] text-white shadow-sm hover:bg-[#059669] border border-white/5",
        successOutline:
          "bg-[#10B981]/5 text-[#10B981] border border-[#10B981]/20 hover:bg-[#10B981]/10 shadow-none",
        successGhost:
          "bg-transparent text-[#10B981] border-transparent hover:bg-[#10B981]/10 shadow-none",
        warning:
          "bg-[#F59E0B] text-white shadow-sm hover:bg-[#D97706] border border-white/5",
        warningOutline:
          "bg-[#F59E0B]/5 text-[#F59E0B] border border-[#F59E0B]/20 hover:bg-[#F59E0B]/10 shadow-none",
        warningGhost:
          "bg-transparent text-[#F59E0B] border-transparent hover:bg-[#F59E0B]/10 shadow-none",
        brand:
          "bg-[#4F46E5] text-white shadow-sm hover:bg-[#4338CA] border border-white/5",
        brandOutline:
          "bg-[#4F46E5]/5 text-[#4F46E5] border border-[#4F46E5]/20 hover:bg-[#4F46E5]/10 shadow-none",
        brandGhost:
          "bg-transparent text-[#4F46E5] border-transparent hover:bg-[#4F46E5]/10 shadow-none",
      },
      size: {
        default: "h-[46px] px-8 rounded-[16px]",
        sm: "h-9 px-6 rounded-[14px] text-xs",
        lg: "h-14 px-10 rounded-[18px] text-base",
        icon: "size-[46px] rounded-[16px]",
      },
    },
    defaultVariants: {
      variant: "action",
      size: "default",
    },
  }
)

export interface CrmButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof crmButtonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
}

const CrmButton = React.forwardRef<HTMLButtonElement, CrmButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, loadingText, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(
          crmButtonVariants({ variant, size, className }),
          isLoading && (
            variant?.startsWith("danger") ? "bg-[#E11D48] text-white border-transparent cursor-wait hover:bg-[#E11D48]" :
            variant?.startsWith("success") ? "bg-[#10B981] text-white border-transparent cursor-wait hover:bg-[#10B981]" :
            variant?.startsWith("warning") ? "bg-[#F59E0B] text-white border-transparent cursor-wait hover:bg-[#F59E0B]" :
            variant?.startsWith("brand") ? "bg-[#4F46E5] text-white border-transparent cursor-wait hover:bg-[#4F46E5]" :
            "bg-[#949BAB] text-white border-transparent cursor-wait hover:bg-[#949BAB]"
          )
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
CrmButton.displayName = "CrmButton"

export { CrmButton, crmButtonVariants }
