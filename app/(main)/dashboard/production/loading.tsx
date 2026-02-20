import { SkeletonTable } from "@/components/ui/skeleton";

export default function ProductionLoading() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="space-y-3">
                    <div className="h-10 w-52 bg-slate-200 rounded-2xl" />
                    <div className="h-4 w-72 bg-slate-50 rounded-lg" />
                </div>
            </div>
            <div className="h-[58px] bg-white/50 border border-slate-200/50 rounded-[22px]" />
            <SkeletonTable rows={8} columns={6} />
        </div>
    );
}
