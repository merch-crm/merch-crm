import { DesignWidgets } from "./design-widgets";
import { DesignQueue } from "./design-queue";
import { getDesignStats, getDesignOrders } from "./actions";
import { PageContainer } from "@/components/ui/page-container";

export default async function DesignPage() {
    const statsRes = await getDesignStats();
    const ordersRes = await getDesignOrders();

    const stats = statsRes.success ? statsRes.data! : {
        newTasks: 0,
        pendingApproval: 0,
        completed: 0,
        efficiency: 0
    };
    const orders = ordersRes.success ? ordersRes.data! : [];

    return (
        <PageContainer>
            {/* Header */}
            <div className="px-1">
                <h1 className="text-4xl font-bold text-slate-900 leading-none">Дизайн-студия</h1>
                <p className="text-slate-400 text-sm font-medium mt-3">Управление макетами и согласованиями</p>
            </div>

            {/* Widgets */}
            <DesignWidgets stats={stats} />

            {/* Queue */}
            <DesignQueue orders={orders} />
        </PageContainer>
    );
}
