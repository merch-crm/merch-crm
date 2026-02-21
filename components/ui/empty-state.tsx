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
        <div className={cn("text-center py-20", className)} data-testid="empty-state">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                <Icon className={cn("w-8 h-8 text-slate-200", iconClassName)} />
            </div>
            <p className="text-base font-bold text-slate-900">{title}</p>
            {description && (
                <p className="text-sm text-slate-400 mt-1">{description}</p>
            )}
            {children}
        </div>
    );
}
