"use client";

import { motion } from "framer-motion";
import { User, Building2, Crown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TopClientData } from "../../actions/analytics.actions";
import { rfmSegmentLabels, rfmSegmentColors } from "../../actions/rfm.types";
import Link from "next/link";

interface TopClientsTableProps {
    clients: TopClientData[];
    currencySymbol?: string;
    className?: string;
}

export function TopClientsTable({
    clients,
    currencySymbol = "₽",
    className
}: TopClientsTableProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {(clients || []).map((client, index) => (
                <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <Link
                        href={`/dashboard/clients?client=${client.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
                    >
                        {/* Rank */}
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0",
                            index === 0 && "bg-amber-100 text-amber-700",
                            index === 1 && "bg-slate-200 text-slate-600",
                            index === 2 && "bg-orange-100 text-orange-700",
                            index > 2 && "bg-slate-100 text-slate-500"
                        )}>
                            {index === 0 ? <Crown className="w-4 h-4" /> : index + 1}
                        </div>

                        {/* Client info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                {client.clientType === "b2b" ? (
                                    <Building2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                ) : (
                                    <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                )}
                                <p className="font-semibold text-slate-900 truncate">
                                    {client.fullName}
                                </p>
                            </div>
                            {client.company && (
                                <p className="text-xs text-slate-500 truncate">{client.company}</p>
                            )}
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {client.loyaltyLevelName && (
                                <Badge
                                    variant="outline"
                                    className="text-xs"
                                    style={{
                                        borderColor: client.loyaltyLevelColor || undefined,
                                        color: client.loyaltyLevelColor || undefined
                                    }}
                                >
                                    {client.loyaltyLevelName}
                                </Badge>
                            )}
                            {client.rfmSegment && (
                                <Badge
                                    className="text-xs text-white"
                                    style={{
                                        backgroundColor: rfmSegmentColors[client.rfmSegment as keyof typeof rfmSegmentColors]
                                    }}
                                >
                                    {rfmSegmentLabels[client.rfmSegment as keyof typeof rfmSegmentLabels]}
                                </Badge>
                            )}
                        </div>

                        {/* Revenue */}
                        <div className="text-right flex-shrink-0 w-28">
                            <p className="font-bold text-slate-900">
                                {client.totalOrdersAmount.toLocaleString()} {currencySymbol}
                            </p>
                            <p className="text-xs text-slate-500">
                                {client.totalOrdersCount} заказов
                            </p>
                        </div>

                        <TrendingUp className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors flex-shrink-0" />
                    </Link>
                </motion.div>
            ))}

            {(clients || []).length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    Нет данных о клиентах
                </div>
            )}
        </div>
    );
}
