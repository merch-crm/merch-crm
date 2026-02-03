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
        <div className={cn("h-[109px] shrink-0 bg-white border-t border-slate-200 z-30 px-8 flex items-center", className)}>
            <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="h-11 px-10 rounded-[var(--radius)] text-slate-500 hover:text-slate-900 transition-all font-bold text-sm"
                >
                    <div className="flex items-center gap-3">
                        <ChevronLeft className="w-4 h-4 shrink-0" strokeWidth={3} />
                        <span className="leading-none">Назад</span>
                        <div className="w-4 h-4 shrink-0" /> {/* Spacer for symmetry */}
                    </div>
                </Button>

                <div className="flex items-center gap-6">
                    {validationError && (
                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 animate-in fade-in slide-in-from-right-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[10px] font-bold leading-none">{validationError}</span>
                        </div>
                    )}
                    {hint && !validationError && (
                        <div className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 animate-in fade-in slide-in-from-right-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[10px] font-bold leading-none">{hint}</span>
                        </div>
                    )}

                    {onNext && (
                        <Button
                            variant="default"
                            onClick={onNext}
                            disabled={isNextDisabled || isSubmitting}
                            className="h-11 px-10 rounded-[var(--radius)] font-bold text-sm shadow-md shadow-primary/10 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="leading-none">Загрузка...</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-4 h-4 shrink-0" /> {/* Spacer for symmetry */}
                                        <span className="leading-none">{nextLabel}</span>
                                        {nextIcon || <ChevronRight className="w-4 h-4 text-white shrink-0" strokeWidth={3} />}
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
