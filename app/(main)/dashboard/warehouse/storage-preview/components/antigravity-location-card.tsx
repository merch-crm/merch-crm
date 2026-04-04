"use client";

import { memo } from "react";
import {
    MapPin,
    User,
    Trash2,
    Pencil,
    Package,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StorageLocation {
    id: string;
    name: string;
    address?: string | null;
    type: "warehouse" | "production" | "office";
    responsibleUser?: { name: string } | null;
    items?: Array<{ quantity: number }>;
}

export const AntigravityLocationCard = memo(({
    loc,
    onEdit,
    onDelete
}: {
    loc: StorageLocation;
    onEdit?: () => void;
    onDelete?: () => void;
}) => {
    const totalItems = loc.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

    const typeLabel = loc.type === "warehouse" ? "Склад" :
        loc.type === "production" ? "Производство" :
            loc.type === "office" ? "Офис" : "Склад";

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            className="group relative overflow-hidden rounded-[32px] bg-[#0A0A0B] border border-white/5 p-8 transition-all duration-500 hover:border-[#9EFF00]/30 hover:shadow-[0_0_40px_-10px_rgba(158,255,0,0.15)]"
        >
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#9EFF00]/5 blur-[100px] transition-all duration-700 group-hover:bg-[#9EFF00]/10" />

            {/* Side Gradients on Hover */}
            <div className={cn(
                "absolute inset-y-0 left-0 w-24 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-r pointer-events-none",
                loc.type === "warehouse" ? "from-purple-500/10 to-transparent" :
                    loc.type === "production" ? "from-orange-500/10 to-transparent" :
                        "from-[#9EFF00]/10 to-transparent"
            )} />
            <div className={cn(
                "absolute inset-y-0 right-0 w-24 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-l pointer-events-none",
                loc.type === "warehouse" ? "from-purple-500/10 to-transparent" :
                    loc.type === "production" ? "from-orange-500/10 to-transparent" :
                        "from-[#9EFF00]/10 to-transparent"
            )} />

            <div className="relative z-10 flex h-full flex-col">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-3">
                        <div className={cn(
                            "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold border",
                            loc.type === "warehouse" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                loc.type === "production" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                    "bg-[#9EFF00]/10 text-[#9EFF00] border-[#9EFF00]/20"
                        )}>
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full animate-pulse",
                                loc.type === "warehouse" ? "bg-purple-400" :
                                    loc.type === "production" ? "bg-orange-400" :
                                        "bg-[#9EFF00]"
                            )} />
                            {typeLabel.toLowerCase()}
                        </div>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/40 ring-1 ring-white/10 transition-all duration-500 group-hover:bg-[#9EFF00]/10 group-hover:text-[#9EFF00] group-hover:ring-[#9EFF00]/20">
                        <MapPin className="h-6 w-6" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="my-8 flex flex-col justify-center">
                    <div className="flex items-baseline gap-2">
                        <span className="text-7xl font-black  text-white">
                            {totalItems}
                        </span>
                        <Package className="h-6 w-6 text-[#9EFF00]/50" />
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-bold text-white/30">
                            единиц в наличии
                        </span>
                        <div className="h-[1px] flex-grow bg-white/5" />
                        <TrendingUp className="h-3 w-3 text-[#9EFF00]" />
                    </div>
                </div>

                {/* Info & Footer */}
                <div className="mt-auto space-y-3">
                    <div>
                        <h3 className="text-2xl font-bold text-white transition-all duration-300 group-hover:text-primary">
                            {loc.name}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-white/40">
                            {loc.address || "Локация без адреса"}
                        </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                                <User className="h-4 w-4 text-white/60" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-white/30 font-bold">ответственный</span>
                                <span className="text-sm font-semibold text-white/80">
                                    {loc.responsibleUser?.name || "Не назначен"}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white ring-1 ring-white/10"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 transition-all hover:bg-rose-500/20 hover:text-rose-300 ring-1 ring-rose-500/20"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

AntigravityLocationCard.displayName = "AntigravityLocationCard";
