import { type ReactNode, type ComponentType } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

export function SwitchWrapper({
    checked,
    onChange,
    disabled,
    label,
    icon: Icon,
    description,
    variant
}: {
    checked: boolean,
    onChange: (val: boolean) => void,
    disabled?: boolean,
    label?: ReactNode,
    icon?: ComponentType<{ className?: string }>,
    description?: string,
    variant?: "primary" | "success"
}) {
    return (
        <div className={cn(
            "flex items-center justify-between group",
            disabled && "opacity-50"
        )}>
            <div className="flex flex-col gap-0.5">
                {label && (
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 leading-[1.1]">{label}</span>
                        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 mt-1" />}
                    </div>
                )}
                {description && <span className="text-xs text-slate-500 font-bold leading-tight mt-0.5">{description}</span>}
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onChange}
                disabled={disabled}
                variant={variant}
            />
        </div>
    );
}
