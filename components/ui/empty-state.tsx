import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    className?: string;
    iconClassName?: string;
    children?: React.ReactNode;
}

/**
 * Reusable empty state component used across tables and lists.
 *
 * Usage:
 * <EmptyState icon={Users} title="Сотрудники не найдены" description="Попробуйте изменить запрос" />
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    className,
    iconClassName,
    children,
}: EmptyStateProps) {
    return (
        <div className={cn("text-center py-20 flex flex-col items-center justify-center animate-in fade-in duration-500", className)} data-testid="empty-state">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 hover:scale-110">
                <Icon className={cn("w-8 h-8 text-slate-300", iconClassName)} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 tracking-tight">{title}</h3>
            {description && (
                <p className="text-sm font-medium text-slate-400/80 mt-1.5 max-w-sm mx-auto leading-relaxed">{description}</p>
            )}
            {children}
        </div>
    );
}
