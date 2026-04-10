import React from "react";
import {
    Sparkles,
    Paintbrush,
    Settings2,
    CheckCircle2,
    Truck,
    type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const config: Record<string, { label: string, icon: LucideIcon, color: string, lightBg: string }> = {
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

const Root = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { variant?: 'success' | 'neutral' | 'error' | 'warning' | 'info' }
>(({ className, variant = 'neutral', ...props }, ref) => {
    const variants = {
        success: "bg-emerald-50 border-emerald-100 text-emerald-600",
        neutral: "bg-slate-50 border-slate-200 text-slate-600",
        error: "bg-rose-50 border-rose-100 text-rose-600",
        warning: "bg-amber-50 border-amber-100 text-amber-600",
        info: "bg-blue-50 border-blue-100 text-blue-600",
    }

    return (
        <div
            ref={ref}
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all font-bold text-xs",
                variants[variant],
                className
            )}
            {...props}
        />
    )
})
Root.displayName = "StatusBadge"

const Icon = ({
    as: IconComp,
    className,
    ...props
}: React.ComponentPropsWithoutRef<'svg'> & {
    as: React.ComponentType<{ className?: string }>;
}) => {
    return <IconComp className={cn('size-3.5 shrink-0', className)} {...props} />;
};

export function StatusBadge({ status, className }: { status: string, className?: string }) {
    const item = config[status] || config.new;
    const IconComponent = item.icon;

    return (
        <Root className={className} variant={status === 'done' ? 'success' : status === 'shipped' ? 'neutral' : status === 'new' ? 'info' : 'warning'}>
            <Icon as={IconComponent} />
            <span>{item.label}</span>
        </Root>
    );
}

export { Root, Icon }
