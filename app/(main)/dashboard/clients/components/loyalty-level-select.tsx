"use client";

import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Lock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoyaltyLevelBadge } from "./loyalty-level-badge";
import { getLoyaltyLevels } from "../actions/loyalty.actions";
import type { LoyaltyLevel } from "@/lib/schema/loyalty-levels";

interface LoyaltyLevelSelectProps {
    value: string | null;
    onChange: (levelId: string | null, setManually: boolean) => void;
    isManual?: boolean;
    disabled?: boolean;
    className?: string;
}

export const LoyaltyLevelSelect = memo(function LoyaltyLevelSelect({
    value,
    onChange,
    isManual = false,
    disabled = false,
    className,
}: LoyaltyLevelSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [levels, setLevels] = useState<LoyaltyLevel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLoyaltyLevels().then(result => {
            if (result.success && result.data) {
                setLevels(result.data);
            }
            setLoading(false);
        });
    }, []);

    const currentLevel = levels.find(l => l.id === value) || null;

    return (
        <div className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled || loading}
                className={cn(
                    "flex items-center gap-2 h-10 px-3 rounded-xl border-2 transition-all w-full justify-between",
                    isOpen
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <div className="flex items-center gap-2">
                    <LoyaltyLevelBadge level={currentLevel} size="sm" />
                    {isManual && (
                        <Lock
                            className="w-3 h-3 text-amber-500"
                        />
                    )}
                </div>
                <ChevronDown className={cn(
                    "w-4 h-4 text-slate-400 transition-transform shrink-0",
                    isOpen && "rotate-180"
                )} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20"
                        >
                            <div className="p-2 space-y-1">
                                {/* Опция "Автоматически" */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(value, false); // Сбрасываем ручную установку
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl transition-colors",
                                        !isManual ? "bg-emerald-50" : "hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-emerald-600" />
                                        <span className="text-xs font-bold text-emerald-700">
                                            Автоматически
                                        </span>
                                    </div>
                                    {!isManual && <Check className="w-4 h-4 text-emerald-600" />}
                                </button>

                                <div className="h-px bg-slate-100 my-1" />

                                {/* Уровни */}
                                {levels.map((level) => {
                                    const isActive = value === level.id && isManual;

                                    return (
                                        <button
                                            key={level.id}
                                            type="button"
                                            onClick={() => {
                                                onChange(level.id, true);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl transition-colors",
                                                isActive ? "bg-primary/10" : "hover:bg-slate-50"
                                            )}
                                        >
                                            <LoyaltyLevelBadge level={level} size="sm" showDiscount />
                                            {isActive && <Check className="w-4 h-4 text-primary" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
});
