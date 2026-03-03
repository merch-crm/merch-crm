import { type LucideIcon } from"lucide-react";
import { cn } from"@/lib/utils";
import { Switch } from"@/components/ui/switch";

interface SwitchRowProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    /** Extra className for the container */
    className?: string;
    /** Colour token applied to the icon wrapper, e.g."text-blue-600 bg-white" */
    iconClassName?: string;
    /** Switch variant:"primary" |"success" */
    variant?:"primary" |"success";
    /** Optional click handler for the whole row */
    onClick?: () => void;
    /** Disable state */
    disabled?: boolean;
}

/**
 * Reusable Switch row with icon, title, description and a toggle switch.
 */
export function SwitchRow({
    icon: Icon,
    title,
    description,
    checked,
    onCheckedChange,
    className,
    iconClassName ="bg-white text-slate-400",
    variant ="primary",
    onClick,
    disabled
}: SwitchRowProps) {
    return (
        <div
            role="button"
            tabIndex={!disabled && onClick ? 0 : undefined}
            onClick={!disabled ? onClick : undefined}
            onKeyDown={(e) => {
                if (!disabled && onClick && (e.key ==="Enter" || e.key ==="")) {
                    e.preventDefault();
                    onClick();
                }
            }}
            className={cn("flex items-center justify-between p-3.5 sm:p-4 bg-slate-50/50 rounded-2xl border border-slate-200 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                !disabled && onClick &&"cursor-pointer hover:bg-white hover:border-slate-300 hover:shadow-sm",
                disabled &&"opacity-50 grayscale-[0.5] cursor-not-allowed",
                className
            )}
        >
            <div className="flex items-center gap-3.5 min-w-0">
                {Icon && (
                    <div className={cn("w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 shrink-0", iconClassName)}>
                        <Icon className="w-5 h-5 transition-transform duration-300" />
                    </div>
                )}
                <div className="flex flex-col min-w-0 justify-center">
                    <p className={cn("text-sm font-bold text-slate-900 leading-tight",
                        description &&"mb-1"
                    )}>
                        {title}
                    </p>
                    {description && (
                        <p className="text-xs text-slate-400 font-bold leading-tight">{description}</p>
                    )}
                </div>
            </div>
            <div
                role="button"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 ml-4 flex items-center"
            >
                <Switch
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    variant={variant}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}
