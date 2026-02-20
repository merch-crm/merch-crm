import * as React from "react";
import {
    Truck,
    MapPin,
    Check,
    AlertCircle,
    Building2,
    Plane,
    Package,
    Warehouse,
    Navigation,
    RefreshCw,
} from "lucide-react";
import { DeliveryProvider, DeliveryStatus } from "./types";

export const PROVIDER_CONFIG: Record<DeliveryProvider, { name: string; color: string; bgColor: string; trackingUrl: (tracking: string) => string }> = {
    cdek: {
        name: "СДЭК",
        color: "text-green-600",
        bgColor: "bg-green-100",
        trackingUrl: (t) => `https://www.cdek.ru/ru/tracking?order_id=${t}`,
    },
    russian_post: {
        name: "Почта России",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        trackingUrl: (t) => `https://www.pochta.ru/tracking#${t}`,
    },
    boxberry: {
        name: "Boxberry",
        color: "text-rose-600",
        bgColor: "bg-rose-100",
        trackingUrl: (t) => `https://boxberry.ru/tracking-page?id=${t}`,
    },
    dpd: {
        name: "DPD",
        color: "text-red-600",
        bgColor: "bg-red-100",
        trackingUrl: (t) => `https://www.dpd.ru/ols/trace2/standard.do2?parcelNumber=${t}`,
    },
    pek: {
        name: "ПЭК",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        trackingUrl: (t) => `https://pecom.ru/services-are/tracking/?code=${t}`,
    },
    dellin: {
        name: "Деловые Линии",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        trackingUrl: (t) => `https://www.dellin.ru/tracker/?id=${t}`,
    },
    custom: {
        name: "Другой",
        color: "text-slate-600",
        bgColor: "bg-slate-100",
        trackingUrl: () => "#",
    },
};

export const STATUS_CONFIG: Record<DeliveryStatus, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
    created: {
        icon: <Package className="w-4 h-4" />,
        color: "text-slate-600",
        bgColor: "bg-slate-100",
        label: "Создан",
    },
    accepted: {
        icon: <Warehouse className="w-4 h-4" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        label: "Принят",
    },
    in_transit: {
        icon: <Truck className="w-4 h-4" />,
        color: "text-amber-600",
        bgColor: "bg-amber-100",
        label: "В пути",
    },
    arrived_at_destination: {
        icon: <Building2 className="w-4 h-4" />,
        color: "text-violet-600",
        bgColor: "bg-violet-100",
        label: "Прибыл в город",
    },
    out_for_delivery: {
        icon: <Navigation className="w-4 h-4" />,
        color: "text-cyan-600",
        bgColor: "bg-cyan-100",
        label: "Передан курьеру",
    },
    delivered: {
        icon: <Check className="w-4 h-4" />,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
        label: "Доставлен",
    },
    returned: {
        icon: <RefreshCw className="w-4 h-4" />,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        label: "Возврат",
    },
    lost: {
        icon: <AlertCircle className="w-4 h-4" />,
        color: "text-rose-600",
        bgColor: "bg-rose-100",
        label: "Утерян",
    },
    customs: {
        icon: <Plane className="w-4 h-4" />,
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        label: "Таможня",
    },
    awaiting_pickup: {
        icon: <MapPin className="w-4 h-4" />,
        color: "text-primary",
        bgColor: "bg-primary/10",
        label: "Ожидает получения",
    },
};

export const PROGRESS_STEPS: DeliveryStatus[] = ["created", "accepted", "in_transit", "arrived_at_destination", "delivered"];
