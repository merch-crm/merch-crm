import { SkeletonStats, SkeletonTable } from "@/components/ui/skeleton";

export default function TasksLoading() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="space-y-3">
                    <div className="h-10 w-48 bg-slate-200 rounded-2xl" />
                    <div className="h-4 w-72 bg-slate-50 rounded-lg" />
                </div>
                <div className="h-11 w-44 bg-slate-200 rounded-xl" />
            </div>
            <SkeletonStats count={3} />
            <SkeletonTable rows={8} columns={5} />
        </div>
    );
}
