import { SkeletonStats, SkeletonTable } from "@/components/ui/skeleton";

export default function ClientsLoading() {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="space-y-3">
                    <div className="h-10 w-48 bg-slate-200 rounded-2xl" />
                    <div className="h-4 w-80 bg-slate-50 rounded-lg" />
                </div>
                <div className="flex gap-3">
                    <div className="h-11 w-36 bg-slate-200 rounded-xl" />
                    <div className="h-11 w-36 bg-slate-200 rounded-xl" />
                </div>
            </div>
            <SkeletonStats count={4} />
            <SkeletonTable rows={8} columns={6} />
        </div>
    );
}
