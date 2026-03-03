import { DesignWidgets } from"./design-widgets";
import { DesignQueue } from"./design-queue";
import { getDesignStats, getDesignOrders } from"./actions";
import { PageContainer } from"@/components/ui/page-container";
import { PageHeader } from"@/components/layout/page-header";

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
            <PageHeader
                title="Дизайн-студия"
                description="Управление макетами и согласованиями"
                className="px-1"
            />

            {/* Widgets */}
            <DesignWidgets stats={stats} />

            {/* Queue */}
            <DesignQueue orders={orders} />
        </PageContainer>
    );
}
