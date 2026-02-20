import React, { forwardRef } from "react";
import { Input, InputProps } from "./input";
import { cn } from "@/lib/utils";

interface FormInputProps extends InputProps {
    label: string;
    required?: boolean;
    error?: string;
    containerClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, required, error, containerClassName, className, id, ...props }, ref) => {
        const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

        return (
            <div className={cn("space-y-2", containerClassName)}>
                <label
                    htmlFor={inputId}
                    className="text-sm font-bold text-slate-700 ml-1"
                >
                    {label} {required && "*"}
                </label>
                <Input
                    id={inputId}
                    ref={ref}
                    className={cn(
                        "w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all shadow-none",
                        error && "border-rose-500 focus:border-rose-500",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs font-bold text-rose-500 ml-1">{error}</p>
                )}
            </div>
        );
    }
);
FormInput.displayName = "FormInput";
