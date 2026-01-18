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
                "h-14 px-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[14px] font-black text-xs tracking-widest shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed",
                className
            )}
        >
            {pending ? pendingLabel : label}
        </button>
    );
}
