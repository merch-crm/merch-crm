import { cn } from "@/lib/utils";

// Базовый скелетон
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-slate-200/60",
                className
            )}
            {...props}
        />
    );
}

// Скелетон для карточки
function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-xl bg-white p-6 space-y-4", className)}>
            <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
            <div className="flex gap-3">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
            </div>
        </div>
    );
}

// Скелетон для строки таблицы
function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-slate-100">
            <td className="p-4">
                <Skeleton className="w-5 h-5 rounded" />
            </td>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-4">
                    <Skeleton className={cn("h-4", i === 0 ? "w-32" : "w-20")} />
                </td>
            ))}
        </tr>
    );
}

// Скелетон для таблицы
function SkeletonTable({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <div className="rounded-2xl bg-white overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="p-4 w-12">
                            <Skeleton className="w-5 h-5 rounded" />
                        </th>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="p-4 text-left">
                                <Skeleton className="h-3 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonTableRow key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Скелетон для элемента списка
function SkeletonListItem({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-4 p-4", className)}>
            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="w-8 h-8 rounded-md shrink-0" />
        </div>
    );
}

// Скелетон для списка
function SkeletonList({ items = 5, className }: { items?: number; className?: string }) {
    return (
        <div className={cn("divide-y divide-slate-100 rounded-xl bg-white", className)}>
            {Array.from({ length: items }).map((_, i) => (
                <SkeletonListItem key={i} />
            ))}
        </div>
    );
}

// Скелетон для мобильной карточки (в таблице)
function SkeletonMobileCard({ className }: { className?: string }) {
    return (
        <div className={cn("p-4 space-y-3", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
                <Skeleton className="w-16 h-6 rounded-md" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
            </div>
        </div>
    );
}

// Скелетон для статистики / метрик
function SkeletonStat({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-xl bg-white p-6 space-y-3", className)}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16" />
        </div>
    );
}

// Скелетон для сетки статистики
function SkeletonStats({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonStat key={i} />
            ))}
        </div>
    );
}

// Скелетон для формы
function SkeletonForm({ fields = 4 }: { fields?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20 ml-1" />
                    <Skeleton className="h-11 w-full rounded-md" />
                </div>
            ))}
            <div className="flex gap-3 pt-4">
                <Skeleton className="h-11 w-24 rounded-md" />
                <Skeleton className="h-11 flex-1 rounded-md" />
            </div>
        </div>
    );
}

// Скелетон для заголовка страницы
function SkeletonPageHeader({
    buttons = 2,
    hasSubtitle = true
}: {
    buttons?: number;
    hasSubtitle?: boolean;
}) {
    return (
        <div className="flex justify-between items-start">
            <div className="space-y-3">
                <Skeleton className="h-10 w-64 rounded-2xl bg-slate-200" />
                {hasSubtitle && <Skeleton className="h-4 w-96 rounded-lg bg-slate-50" />}
            </div>
            <div className="flex gap-3">
                {Array.from({ length: buttons }).map((_, i) => (
                    <Skeleton key={i} className="h-11 w-40 rounded-xl bg-slate-200" />
                ))}
            </div>
        </div>
    );
}

export {
    Skeleton,
    SkeletonCard,
    SkeletonTable,
    SkeletonTableRow,
    SkeletonList,
    SkeletonListItem,
    SkeletonMobileCard,
    SkeletonStat,
    SkeletonStats,
    SkeletonForm,
    SkeletonPageHeader,
};
