"use client";

import { motion } from "framer-motion";
import {
    Pencil,
    Trash2,
    Coins,
    ShoppingBag,
    Percent,
    Users,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoyaltyLevelBadge } from "@/app/(main)/dashboard/clients/components/loyalty-level-badge";
import type { LoyaltyLevel } from "@/lib/schema/loyalty-levels";
import { useBranding } from "@/components/branding-provider";

interface LoyaltyLevelCardProps {
    level: LoyaltyLevel;
    index: number;
    stat?: {
        clientsCount: number;
        totalRevenue: number;
    };
    onEdit: (level: LoyaltyLevel) => void;
    onDelete: (level: LoyaltyLevel) => void;
}

export function LoyaltyLevelCard({
    level,
    index,
    stat,
    onEdit,
    onDelete
}: LoyaltyLevelCardProps) {
    const { currencySymbol } = useBranding();
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                "crm-card p-6 space-y-3",
                !level.isActive && "opacity-60"
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                        style={{ backgroundColor: `${level.color}20` }}
                    >
                        <LoyaltyLevelBadge
                            level={level}
                            size="lg"
                            showDiscount={false}
                            className="!bg-transparent !px-0"
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">
                            {level.levelName}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono">
                            {level.levelKey}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(level)}
                        className="h-8 w-8 p-0 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(level)}
                        className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50 outline-none focus:ring-2 focus:ring-rose-200"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Thresholds */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Coins className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">Мин. сумма</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                        {Number(level.minOrdersAmount || 0).toLocaleString()} {currencySymbol}
                    </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">Мин. заказов</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                        {level.minOrdersCount || 0}
                    </p>
                </div>
            </div>

            {/* Discount */}
            {Number(level.discountPercent || 0) > 0 && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                    <Percent className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">
                        Скидка {level.discountPercent}%
                    </span>
                </div>
            )}

            {/* Stats */}
            {stat && (
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-bold">{stat.clientsCount} клиентов</span>
                        </div>
                        <span className="font-bold text-slate-900">
                            {stat.totalRevenue.toLocaleString()} {currencySymbol}
                        </span>
                    </div>
                </div>
            )}

            {/* Inactive Badge */}
            {!level.isActive && (
                <div className="flex items-center gap-2 text-amber-600 text-xs font-bold">
                    <X className="w-3.5 h-3.5" />
                    Неактивен
                </div>
            )}
        </motion.div>
    );
}
