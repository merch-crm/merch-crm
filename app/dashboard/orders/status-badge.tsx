import { Badge } from "@/components/ui/badge";
import {
    Sparkles,
    Paintbrush,
    Settings2,
    CheckCircle2,
    Truck
} from "lucide-react";

export default function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string, icon: any, color: string, lightBg: string }> = {
        new: {
            label: "Новый",
            icon: Sparkles,
            color: "text-blue-600",
            lightBg: "bg-blue-50 border-blue-100"
        },
        design: {
            label: "Дизайн",
            icon: Paintbrush,
            color: "text-purple-600",
            lightBg: "bg-purple-50 border-purple-100"
        },
        production: {
            label: "Производство",
            icon: Settings2,
            color: "text-amber-600",
            lightBg: "bg-amber-50 border-amber-100"
        },
        done: {
            label: "Готов",
            icon: CheckCircle2,
            color: "text-emerald-600",
            lightBg: "bg-emerald-50 border-emerald-100"
        },
        shipped: {
            label: "Отправлен",
            icon: Truck,
            color: "text-slate-600",
            lightBg: "bg-slate-100 border-slate-200"
        },
    };

    const item = config[status] || config.new;
    const Icon = item.icon;

    return (
        <Badge
            variant="outline"
            className={`
                rounded-md font-bold text-[10px] uppercase tracking-wider gap-1.5 px-2 py-0.5
                ${item.lightBg} ${item.color}
            `}
        >
            <Icon className="w-3 h-3" />
            {item.label}
        </Badge>
    );
}
