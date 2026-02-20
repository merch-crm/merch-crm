import { SkeletonStats, SkeletonTable, SkeletonPageHeader } from "@/components/ui/skeleton";

export default function OrdersLoading() {
    return (
        <div className="space-y-4 animate-pulse">
            <SkeletonPageHeader buttons={2} />
            <SkeletonStats count={4} />
            <div className="h-[58px] bg-white/50 border border-slate-200/50 rounded-[22px]" />
            <SkeletonTable rows={10} columns={7} />
        </div>
    );
}
