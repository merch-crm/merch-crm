"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ClientType = "b2c" | "b2b";

interface ClientTypeSwitchProps {
    value: ClientType;
    onChange: (value: ClientType) => void;
    disabled?: boolean;
}

const options: { id: ClientType; label: string; description: string; icon: typeof User }[] = [
    {
        id: "b2c",
        label: "Частное лицо",
        description: "Физическое лицо, индивидуальный клиент",
        icon: User
    },
    {
        id: "b2b",
        label: "Организация",
        description: "Юридическое лицо, компания",
        icon: Building2
    },
];

export const ClientTypeSwitch = memo(function ClientTypeSwitch({
    value,
    onChange,
    disabled = false,
}: ClientTypeSwitchProps) {
    return (
        <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 ml-1">
                Тип клиента
            </label>
            <div className="grid grid-cols-2 gap-2">
                {options.map((option) => {
                    const isActive = value === option.id;
                    const Icon = option.icon;

                    return (
                        <button
                            key={option.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange(option.id)}
                            className={cn(
                                "relative flex flex-col items-start gap-1.5 p-4 rounded-xl border-2 transition-all text-left",
                                isActive
                                    ? "border-primary bg-primary/5"
                                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50",
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="clientTypeIndicator"
                                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                                    transition={{
                                        type: "spring",
                                        bounce: 0.2,
                                        duration: 0.4,
                                    }}
                                >
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                            )}

                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                isActive
                                    ? "bg-primary text-white"
                                    : "bg-slate-100 text-slate-500"
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <div>
                                <p className={cn(
                                    "text-sm font-bold transition-colors",
                                    isActive ? "text-primary" : "text-slate-900"
                                )}>
                                    {option.label}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    {option.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});
