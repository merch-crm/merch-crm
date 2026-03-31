import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CalculatorsSkeleton() {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-28" />
                </div>
            </div>

            {/* Navigation */}
            <Skeleton className="h-14 w-full rounded-[20px]" />

            {/* Parameters Card */}
            <Card>
                <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Print Groups */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-32" />
                </div>

                {/* Print Group Card */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="flex gap-3">
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                    <Skeleton className="h-12 w-12 rounded-xl shrink-0 mt-6" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton key={i} className="h-7 w-14 rounded-lg" />
                                    ))}
                                </div>
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Button Skeleton */}
                <Skeleton className="h-14 w-full rounded-2xl" />
            </div>

            {/* Calculate Button */}
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
    );
}

// Скелетон для результатов расчёта
export function CalculationResultSkeleton() {
    return (
        <div className="space-y-3 animate-in fade-in duration-300">
            {/* Cost Summary */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-10 w-48" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-20 rounded-full" />
                            <Skeleton className="h-8 w-24 rounded-full" />
                            <Skeleton className="h-8 w-28 rounded-full" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-primary/10">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="space-y-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Film Layout */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-36" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-9 w-28 rounded-lg" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <div className="flex gap-3 mt-3">
                        <Skeleton className="h-8 w-32 rounded-lg" />
                        <Skeleton className="h-8 w-36 rounded-lg" />
                    </div>
                </CardContent>
            </Card>

            {/* Consumption Cards */}
            <Card>
                <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-44" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <Skeleton className="h-6 w-12" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Cost per Print Table */}
            <Card>
                <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                            >
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-4 rounded-md" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 flex-1 rounded-lg" />
            </div>
        </div>
    );
}
