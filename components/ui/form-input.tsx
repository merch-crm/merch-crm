import React, { forwardRef } from "react";
import { Input, InputProps } from "./input";
import { cn } from "@/lib/utils";

interface FormInputProps extends InputProps {
    label: string;
    required?: boolean;
    error?: string;
    containerClassName?: string;
    icon?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, required, error, containerClassName, className, id, icon, ...props }, ref) => {
        const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

        return (
            <div className={cn("space-y-2", containerClassName)}>
                <label
                    htmlFor={inputId}
                    className="text-[13.5px] font-bold text-slate-700 ml-1 tracking-normal"
                >
                    {label} {required && "*"}
                </label>
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <Input id={inputId} ref={ref} className={cn("w-full h-[60px] rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-base tracking-normal focus:border-slate-900 focus:bg-white transition-all shadow-none", icon ? "pl-11" : "px-4", error && "border-rose-500 focus:border-rose-500", className )} {...props} />
                </div>
                {error && (
                    <p className="text-xs font-bold text-rose-500 ml-1">{error}</p>
                )}
            </div>
        );
    }
);
FormInput.displayName = "FormInput";
