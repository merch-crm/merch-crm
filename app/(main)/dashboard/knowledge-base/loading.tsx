


export default function KnowledgeBaseLoading() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="space-y-3 mx-auto text-center max-w-2xl">
                <div className="h-10 w-64 bg-slate-200 rounded-2xl mx-auto" />
                <div className="h-4 w-96 bg-slate-50 rounded-lg mx-auto" />
                <div className="h-12 w-full max-w-lg bg-slate-100 rounded-2xl mx-auto mt-6" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                        <div className="space-y-2">
                            <div className="h-6 w-3/4 bg-slate-200 rounded" />
                            <div className="h-4 w-full bg-slate-50 rounded" />
                            <div className="h-4 w-2/3 bg-slate-50 rounded" />
                        </div>
                        <div className="pt-8">
                            <div className="h-4 w-24 bg-slate-100 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
