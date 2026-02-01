"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

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
                "h-11 px-12 rounded-[var(--radius-inner)] font-bold text-sm inline-flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50",
                className
            )}
        >
            {pending ? pendingLabel : label}
        </button>
    );
}
