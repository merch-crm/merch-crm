import * as React from "react";
import { Edit, Star, CheckCircle, CreditCard, Play, Eye, Package, Truck, Trash2, RotateCcw, Pause, Flag, Flame } from "lucide-react";
import { OrderStatus, OrderPriority } from "@/lib/types";

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    image?: string;
}

export interface OrderData {
    id: string;
    number: string;
    status: OrderStatus;
    priority: OrderPriority;
    customer: {
        name: string;
        phone?: string;
        email?: string;
        company?: string;
        isVip?: boolean;
    };
    items: OrderItem[];
    totalItems: number;
    totalAmount: number;
    paidAmount?: number;
    createdAt: Date;
    deadline?: Date;
    assignee?: {
        name: string;
        avatar?: string;
    };
    deliveryMethod?: string;
    deliveryCity?: string;
    hasComments?: boolean;
    commentsCount?: number;
    hasProblems?: boolean;
    problemDescription?: string;
    tags?: string[];
    progress?: number;
}

export const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    draft: { label: "Черновик", color: "text-slate-400", bgColor: "bg-slate-100", icon: <Edit className="w-3.5 h-3.5" /> },
    new: { label: "Новый", color: "text-blue-600", bgColor: "bg-blue-100", icon: <Star className="w-3.5 h-3.5" /> },
    confirmed: { label: "Подтверждён", color: "text-indigo-600", bgColor: "bg-indigo-100", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    paid: { label: "Оплачен", color: "text-emerald-600", bgColor: "bg-emerald-100", icon: <CreditCard className="w-3.5 h-3.5" /> },
    in_production: { label: "В производстве", color: "text-amber-600", bgColor: "bg-amber-100", icon: <Play className="w-3.5 h-3.5" /> },
    quality_check: { label: "Проверка", color: "text-violet-600", bgColor: "bg-violet-100", icon: <Eye className="w-3.5 h-3.5" /> },
    packing: { label: "Упаковка", color: "text-cyan-600", bgColor: "bg-cyan-100", icon: <Package className="w-3.5 h-3.5" /> },
    ready: { label: "Готов", color: "text-teal-600", bgColor: "bg-teal-100", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    shipped: { label: "Отправлен", color: "text-orange-600", bgColor: "bg-orange-100", icon: <Truck className="w-3.5 h-3.5" /> },
    delivered: { label: "Доставлен", color: "text-green-600", bgColor: "bg-green-100", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    completed: { label: "Выполнен", color: "text-emerald-700", bgColor: "bg-emerald-50", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    cancelled: { label: "Отменён", color: "text-rose-600", bgColor: "bg-rose-100", icon: <Trash2 className="w-3.5 h-3.5" /> },
    refunded: { label: "Возврат", color: "text-amber-700", bgColor: "bg-amber-50", icon: <RotateCcw className="w-3.5 h-3.5" /> },
    on_hold: { label: "На паузе", color: "text-slate-600", bgColor: "bg-slate-100", icon: <Pause className="w-3.5 h-3.5" /> },
};

export const PRIORITY_CONFIG: Record<OrderPriority, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    low: { label: "Низкий", color: "text-slate-500", bgColor: "bg-slate-100", icon: <Flag className="w-3 h-3" /> },
    normal: { label: "Обычный", color: "text-blue-500", bgColor: "bg-blue-100", icon: <Flag className="w-3 h-3" /> },
    high: { label: "Высокий", color: "text-orange-500", bgColor: "bg-orange-100", icon: <Flag className="w-3 h-3" /> },
    urgent: { label: "Срочный", color: "text-rose-500", bgColor: "bg-rose-100", icon: <Flame className="w-3 h-3" /> },
};
