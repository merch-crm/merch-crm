import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepFooterProps {
    onBack: () => void;
    onNext?: () => void;
    nextLabel?: string;
    isNextDisabled?: boolean;
    isSubmitting?: boolean;
    validationError?: string;
    hint?: string;
    nextIcon?: ReactNode;
    className?: string;
}

/**
 * Common footer component for all steps in the New Item creation process.
 * Rule: Any visual change to the form footer MUST be done here 
 * to ensure consistency across all steps.
 */
export function StepFooter({
    onBack,
    onNext,
    nextLabel = "Далее",
    isNextDisabled = false,
    isSubmitting = false,
    validationError,
    hint,
    nextIcon,
    className
}: StepFooterProps) {
    return (
        <div className={cn("h-auto sm:h-[109px] py-4 sm:py-0 shrink-0 bg-white border-t border-slate-200 z-30 px-4 sm:px-8 flex items-center", className)}>
            <div className="max-w-6xl mx-auto flex items-center justify-between w-full gap-3 sm:gap-0">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="h-10 sm:h-11 px-3 sm:px-7 rounded-[var(--radius)] text-slate-500 hover:text-slate-900 transition-all font-bold text-xs sm:text-sm w-auto"
                >
                    <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-2">
                        <ChevronLeft className="w-4 h-4 shrink-0" strokeWidth={3} />
                        <span className="leading-none">Назад</span>
                    </div>
                </Button>

                <div className="flex items-center gap-2 sm:gap-6 justify-end">
                    {validationError && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 sm:static sm:translate-x-0 sm:translate-y-0 sm:mb-0 flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-right-4 whitespace-nowrap z-[60]">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[10px] font-bold leading-none">{validationError}</span>
                        </div>
                    )}
                    {!validationError && hint && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 sm:static sm:translate-x-0 sm:translate-y-0 sm:mb-0 flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-right-4 whitespace-nowrap z-[60]">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span className="text-[10px] font-bold leading-none">{hint}</span>
                        </div>
                    )}

                    {onNext && (
                        <Button
                            variant="default"
                            onClick={onNext}
                            disabled={isNextDisabled || isSubmitting}
                            className="h-10 sm:h-11 pl-4 pr-3 sm:pl-8 sm:pr-6 rounded-[var(--radius)] font-bold text-xs sm:text-sm shadow-md shadow-primary/10 transition-all w-auto"
                        >
                            <div className="flex items-center justify-end sm:justify-center gap-2 sm:gap-2.5">
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="leading-none">Ждите</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="leading-none">{nextLabel}</span>
                                        {nextIcon || <ChevronRight className="w-4 h-4 text-white shrink-0 translate-x-0.5" strokeWidth={3} />}
                                    </>
                                )}
                            </div>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
