import * as React from "react";
import {
    Check,
    Clock,
    Package,
    Truck,
    CreditCard,
    ShoppingCart,
    XCircle,
    AlertCircle,
    RotateCcw,
    MapPin,
    Edit,
    Star,
} from "lucide-react";
import { StatusType, StatusState } from "./types";

export const STATUS_CONFIG: Record<StatusType, { icon: React.ReactNode; color: string; bgColor: string }> = {
    created: {
        icon: <ShoppingCart className="w-4 h-4" />,
        color: "text-slate-600",
        bgColor: "bg-slate-100",
    },
    confirmed: {
        icon: <Check className="w-4 h-4" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
    },
    paid: {
        icon: <CreditCard className="w-4 h-4" />,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
    },
    processing: {
        icon: <Clock className="w-4 h-4" />,
        color: "text-amber-600",
        bgColor: "bg-amber-100",
    },
    packed: {
        icon: <Package className="w-4 h-4" />,
        color: "text-violet-600",
        bgColor: "bg-violet-100",
    },
    shipped: {
        icon: <Truck className="w-4 h-4" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
    },
    in_transit: {
        icon: <MapPin className="w-4 h-4" />,
        color: "text-cyan-600",
        bgColor: "bg-cyan-100",
    },
    delivered: {
        icon: <Check className="w-4 h-4" />,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
    },
    completed: {
        icon: <Star className="w-4 h-4" />,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
    },
    cancelled: {
        icon: <XCircle className="w-4 h-4" />,
        color: "text-rose-600",
        bgColor: "bg-rose-100",
    },
    refunded: {
        icon: <RotateCcw className="w-4 h-4" />,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
    },
    on_hold: {
        icon: <AlertCircle className="w-4 h-4" />,
        color: "text-amber-600",
        bgColor: "bg-amber-100",
    },
    custom: {
        icon: <Edit className="w-4 h-4" />,
        color: "text-slate-600",
        bgColor: "bg-slate-100",
    },
};

export const STATE_STYLES: Record<StatusState, { line: string; dot: string; dotBorder: string }> = {
    completed: {
        line: "bg-emerald-500",
        dot: "bg-emerald-500",
        dotBorder: "border-emerald-500",
    },
    current: {
        line: "bg-slate-200",
        dot: "bg-primary",
        dotBorder: "border-primary",
    },
    pending: {
        line: "bg-slate-200",
        dot: "bg-slate-200",
        dotBorder: "border-slate-300",
    },
    error: {
        line: "bg-rose-200",
        dot: "bg-rose-500",
        dotBorder: "border-rose-500",
    },
};
