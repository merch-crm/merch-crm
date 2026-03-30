import { getStorageLocations } from "../storage-actions";
import { AntigravityLocationCard } from "./components/antigravity-location-card";
import { Package, Search, Plus, Filter, LayoutGrid, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Preview: Antigravity Signature Dark",
};

export const dynamic = "force-dynamic";

export default async function StoragePreviewPage() {
    const locationsRes = await getStorageLocations();
    const locations = ('data' in locationsRes && locationsRes.data) ? locationsRes.data : [];

    return (
        <div className="min-h-screen bg-black px-4 py-8 lg:px-12">
            {/* Design Header */}
            <div className="mb-12 flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-end">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#9EFF00]/10 px-3 py-1 border border-[#9EFF00]/20">
                        <span className="text-xs font-black text-[#9EFF00]">
                            дизайн-концепт v1.0
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
                        Storage <span className="text-primary">Intelligence</span>
                    </h1>
                    <p className="max-w-md font-medium text-white/40">
                        A premium real-time monitoring interface for inventory throughput and warehouse health.
                    </p>
                </div>

                <div className="flex w-full items-center gap-3 lg:w-auto">
                    <div className="relative flex-grow lg:w-64">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                        <input
                            type="text"
                            placeholder="Быстрый поиск..."
                            className="h-12 w-full rounded-2xl bg-white/5 px-11 text-sm font-medium text-white ring-1 ring-white/10 focus:outline-none focus:ring-[#9EFF00]/30"
                        />
                    </div>
                    <Button className="h-12 rounded-2xl bg-[#9EFF00] px-6 text-sm font-black text-black hover:bg-[#9EFF00]/90">
                        <Plus className="mr-2 h-4 w-4 stroke-[3]" />
                        Добавить
                    </Button>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Всего единиц", value: "24,812", trend: "+12.4%", icon: Package, color: "text-[#9EFF00]" },
                    { label: "Заполняемость", value: "78.2%", trend: "-2.1%", icon: LayoutGrid, color: "text-rose-400" },
                    { label: "Активные локации", value: "14", trend: "0%", icon: Filter, color: "text-white/20" },
                ].map((stat, idx) => (
                    <div key={idx} className="flex flex-col rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
                        <div className="flex items-center justify-between">
                            <stat.icon className="h-5 w-5 text-white/20" />
                            <span className={stat.color + " text-xs font-bold"}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="mt-4">
                            <span className="text-2xl font-black text-white">{stat.value}</span>
                            <p className="text-xs font-bold text-white/20">
                                {stat.label.toLowerCase()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Locations Grid */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {locations.length > 0 ? (
                    locations.map((loc) => (
                        <AntigravityLocationCard key={loc.id} loc={loc} />
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 text-white/20">
                            <Package className="h-10 w-10" />
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-white">Локации не найдены</h3>
                        <p className="mt-2 text-white/30">Выберите другой фильтр или добавьте новый склад.</p>
                    </div>
                )}
            </div>

            {/* Back Button for Navigation */}
            <div className="mt-16 flex justify-center">
                <a
                    href="/dashboard/warehouse/storage"
                    className="group inline-flex items-center gap-3 text-sm font-bold text-white/30 hover:text-white transition-all"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    К текущему дизайну
                    <div className="h-[2px] w-4 bg-[#9EFF00] transition-all group-hover:w-8" />
                </a>
            </div>
        </div>
    );
}
