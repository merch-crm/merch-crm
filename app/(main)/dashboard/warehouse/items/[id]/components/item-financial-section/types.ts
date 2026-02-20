"use client";

import { LucideIcon } from "lucide-react";
import { InventoryItem, ItemHistoryTransaction } from "@/app/(main)/dashboard/warehouse/types";

export type Timeframe = 'month' | 'quarter' | 'half-year' | 'year' | 'all';

export const PERIODS = [
    { label: "Месяц", value: "month" },
    { label: "3 месяца", value: "quarter" },
    { label: "Полгода", value: "half-year" },
    { label: "Год", value: "year" },
    { label: "Все время", value: "all" },
] as const;

export interface FinancialMetricCardProps {
    label: string;
    value: number | string;
    secondaryValue?: string | number;
    icon: LucideIcon | string;
    bgColor: string;
    iconColor: string;
    currencySymbol: string;
    isEditing?: boolean;
    editValue?: number | string | null; // Allow null to match editData
    onEditChange?: (value: string) => void;
    onDoubleClick?: () => void;
    className?: string;
}
