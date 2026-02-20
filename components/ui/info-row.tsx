import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoRowProps {
    icon: LucideIcon;
    label: string;
    value: React.ReactNode;
    className?: string;
    iconClassName?: string;
    variant?: "default" | "minimal";
}

/**
 * Reusable info row component: icon + label + value block.
 * Used in profile drawers and detail sections.
 */
export function InfoRow({
    icon: Icon,
    label,
    value,
    className,
    iconClassName,
    variant = "default"
}: InfoRowProps) {
    if (variant === "minimal") {
        return (
            <div className={cn("flex items-center gap-3 py-2 px-1", className)}>
                <Icon className={cn("w-4 h-4 text-slate-400 shrink-0", iconClassName)} />
                <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400 tracking-wider">{label}</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm", className)}>
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shrink-0 shadow-sm">
                <Icon className={cn("w-5 h-5", iconClassName)} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 mb-0.5 tracking-tight">{label}</p>
                <div className="text-sm font-bold text-slate-900 truncate">{value}</div>
            </div>
        </div>
    );
}
