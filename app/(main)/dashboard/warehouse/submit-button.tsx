"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

import { Check, Loader2 } from "lucide-react";

interface SubmitButtonProps {
    label: string;
    pendingLabel?: string;
    className?: string;
    form?: string;
}

export function SubmitButton({ label, pendingLabel = "Сохранение...", className, form }: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            form={form}
            type="submit"
            disabled={pending}
            className={cn(
                "h-11 px-4 rounded-[var(--radius-inner)] font-bold text-sm inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50",
                className
            )}
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {pendingLabel}
                </>
            ) : (
                <>
                    {label === "Сохранить" && <Check className="w-4 h-4 stroke-[3]" />}
                    {label}
                </>
            )}
        </button>
    );
}
