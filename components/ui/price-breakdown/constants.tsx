import * as React from "react";
import {
    Package,
    Paintbrush,
    Percent,
    Truck,
    Gift,
    Tag,
    Plus,
    Box,
    Sparkles,
    Calculator,
    Info,
    Layers,
    Palette,
    Scissors,
    Settings,
} from "lucide-react";
import { PriceLineType } from "./types";

// Иконки по типу
export const TYPE_ICONS: Record<PriceLineType, React.ReactNode> = {
    base: <Package className="w-4 h-4" />,
    blank: <Box className="w-4 h-4" />,
    print: <Paintbrush className="w-4 h-4" />,
    embroidery: <Layers className="w-4 h-4" />,
    engraving: <Sparkles className="w-4 h-4" />,
    discount: <Percent className="w-4 h-4" />,
    markup: <Plus className="w-4 h-4" />,
    shipping: <Truck className="w-4 h-4" />,
    packaging: <Gift className="w-4 h-4" />,
    service: <Settings className="w-4 h-4" />,
    subtotal: <Calculator className="w-4 h-4" />,
    total: <Tag className="w-4 h-4" />,
    custom: <Info className="w-4 h-4" />,
};

// Цвета по типу
export const TYPE_COLORS: Record<PriceLineType, { text: string; bg: string }> = {
    base: { text: "text-slate-600", bg: "bg-slate-100" },
    blank: { text: "text-blue-600", bg: "bg-blue-100" },
    print: { text: "text-violet-600", bg: "bg-violet-100" },
    embroidery: { text: "text-amber-600", bg: "bg-amber-100" },
    engraving: { text: "text-cyan-600", bg: "bg-cyan-100" },
    discount: { text: "text-emerald-600", bg: "bg-emerald-100" },
    markup: { text: "text-rose-600", bg: "bg-rose-100" },
    shipping: { text: "text-orange-600", bg: "bg-orange-100" },
    packaging: { text: "text-pink-600", bg: "bg-pink-100" },
    service: { text: "text-indigo-600", bg: "bg-indigo-100" },
    subtotal: { text: "text-slate-700", bg: "bg-slate-100" },
    total: { text: "text-slate-900", bg: "bg-slate-900" },
    custom: { text: "text-slate-600", bg: "bg-slate-100" },
};

// Конфиг методов нанесения
export const PRINT_METHOD_CONFIG: Record<string, { name: string; icon: React.ReactNode; color: string; bg: string }> = {
    screen: { name: "Шелкография", icon: <Layers className="w-4 h-4" />, color: "text-violet-600", bg: "bg-violet-100" },
    digital: { name: "Цифровая печать", icon: <Paintbrush className="w-4 h-4" />, color: "text-cyan-600", bg: "bg-cyan-100" },
    embroidery: { name: "Вышивка", icon: <Scissors className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-100" },
    engraving: { name: "Гравировка", icon: <Sparkles className="w-4 h-4" />, color: "text-slate-600", bg: "bg-slate-100" },
    transfer: { name: "Термотрансфер", icon: <Palette className="w-4 h-4" />, color: "text-orange-600", bg: "bg-orange-100" },
    sublimation: { name: "Сублимация", icon: <Paintbrush className="w-4 h-4" />, color: "text-pink-600", bg: "bg-pink-100" },
};
