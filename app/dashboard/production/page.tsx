import { ProductionWidgets } from "./production-widgets";
import { ProductionBoard } from "./production-board";
import { getProductionStats, getProductionItems } from "./actions";

export default async function ProductionPage() {
    const stats = await getProductionStats();
    const items = await getProductionItems();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="px-1">
                <h1 className="text-4xl font-bold text-slate-900 leading-none">Производство</h1>
                <p className="text-slate-400 text-sm font-medium mt-3">Управление очередью печати и цеховыми процессами</p>
            </div>

            {/* Widgets */}
            <ProductionWidgets stats={stats} />

            {/* Kanban Board */}
            <ProductionBoard items={items} />
        </div>
    );
}
