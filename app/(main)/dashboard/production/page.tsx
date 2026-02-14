import { ProductionWidgets } from "./production-widgets";
import { ProductionBoard } from "./production-board";
import { getProductionStats, getProductionItems } from "./actions";

export default async function ProductionPage() {
    const statsRes = await getProductionStats();
    const stats = (statsRes.success && statsRes.data) ? statsRes.data : { active: 0, urgent: 0, efficiency: 0, completedToday: 0 };

    const itemsRes = await getProductionItems();
    const items = (itemsRes.success && itemsRes.data) ? itemsRes.data : [];

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
