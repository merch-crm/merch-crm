import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface SwitchRowProps {
    icon: LucideIcon;
    title: string;
    description: string;
    checked: boolean;
    onCheckedChange: () => void;
    /** Extra className for the container */
    className?: string;
    /** Colour token applied to the icon wrapper, e.g. "text-blue-600 bg-white" */
    iconClassName?: string;
}

/**
 * Reusable Switch row with icon, title, description and a toggle switch.
 * Primarily used in settings/notifications pages.
 *
 * Usage:
 * <SwitchRow
 *   icon={Bell}
 *   title="Общие уведомления"
 *   description="Показывать в колокольчике CRM"
 *   checked={settings.system.enabled}
 *   onCheckedChange={() => toggle("system", "enabled")}
 * />
 */
export function SwitchRow({
    icon: Icon,
    title,
    description,
    checked,
    onCheckedChange,
    className,
    iconClassName = "bg-white text-slate-400",
}: SwitchRowProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-200 transition-colors hover:border-blue-200",
                className
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", iconClassName)}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-700 mt-0.5 font-medium">{description}</p>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}
