import { Badge } from "@/components/ui/badge";
import {
    Sparkles,
    Paintbrush,
    Settings2,
    CheckCircle2,
    Truck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatusBadge({ status }: { status: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <div
            className={cn(
                "inline-flex items-center gap-1.5 px-2 py-1 rounded-full transition-all",
                item.lightBg,
                item.color
            )}
            title={item.label}
        >
            <Icon className="w-3.5 h-3.5 sm:hidden" />
            <div className={cn("hidden sm:block w-1.5 h-1.5 rounded-full animate-pulse", item.color.replace("text-", "bg-"))} />
            <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
        </div>
    );
}
