import { DesignWidgets } from "./design-widgets";
import { DesignQueue } from "./design-queue";
import { getDesignStats, getDesignOrders } from "./actions";

export default async function DesignPage() {
    const stats = await getDesignStats();
    const orders = await getDesignOrders();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="px-1">
                <h1 className="text-4xl font-bold text-slate-900 leading-none">Дизайн-студия</h1>
                <p className="text-slate-400 text-sm font-medium mt-3">Управление макетами и согласованиями</p>
            </div>

            {/* Widgets */}
            <DesignWidgets stats={stats} />

            {/* Queue */}
            <DesignQueue orders={orders} />
        </div>
    );
}
