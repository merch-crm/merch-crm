import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StepFooterProps {
    onBack: () => void;
    onNext?: () => void;
    nextLabel?: string;
    isNextDisabled?: boolean;
    isSubmitting?: boolean;
    validationError?: string;
    nextIcon?: ReactNode;
    className?: string; // in case we need mt-auto or not
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
    nextIcon,
    className
}: StepFooterProps) {
    return (
        <div className={cn("h-[72px] shrink-0 bg-white border-t border-slate-100 z-30 px-10 flex items-center", className)}>
            <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
                <button
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="group px-6 h-11 rounded-[18px] text-slate-400 font-bold text-[10px] hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Назад
                </button>

                <div className="flex items-center gap-6">
                    {validationError && (
                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 animate-in fade-in slide-in-from-right-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[10px] font-bold leading-none">{validationError}</span>
                        </div>
                    )}

                    {onNext && (
                        <button
                            onClick={onNext}
                            disabled={isNextDisabled || isSubmitting}
                            className="pl-8 pr-7 h-11 bg-slate-900 text-white rounded-[18px] font-bold text-[10px] hover:bg-black hover:pr-5 shadow-md transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center group relative overflow-hidden"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Загрузка...</span>
                                </div>
                            ) : (
                                <>
                                    <span className="relative z-10">{nextLabel}</span>
                                    <div className="w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:w-4 group-hover:opacity-100 group-hover:ml-3 flex items-center justify-center">
                                        {nextIcon || <ChevronRight className="w-4 h-4 text-white" strokeWidth={3} />}
                                    </div>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
