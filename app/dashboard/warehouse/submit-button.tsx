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
                "h-14 px-12 btn-primary rounded-[var(--radius)] font-bold text-xs inline-flex items-center justify-center",
                className
            )}
        >
            {pending ? pendingLabel : label}
        </button>
    );
}
