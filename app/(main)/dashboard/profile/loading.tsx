import { SkeletonCard, SkeletonForm } from "@/components/ui/skeleton";

export default function ProfileLoading() {
    return (
        <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
            <div className="h-10 w-48 bg-slate-200 rounded-2xl mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                    <SkeletonCard className="h-64" />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <SkeletonForm fields={3} />
                    </div>
                </div>
            </div>
        </div>
    );
}
