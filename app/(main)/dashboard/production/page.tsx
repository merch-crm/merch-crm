import { ProductionWidgets } from "./production-widgets";
import { ProductionBoard } from "./production-board";
import { getProductionStats, getProductionItems } from "./actions";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function ProductionPage() {
    const statsRes = await getProductionStats();
    const stats = (statsRes.success && statsRes.data) ? statsRes.data : { active: 0, urgent: 0, efficiency: 0, completedToday: 0 };

    const itemsRes = await getProductionItems();
    const items = (itemsRes.success && itemsRes.data) ? itemsRes.data : [];

    return (
        <PageContainer>
            {/* Header */}
            <PageHeader
                title="Производство"
                description="Управление очередью печати и цеховыми процессами"
                className="px-1"
            />

            {/* Widgets */}
            <ProductionWidgets stats={stats} />

            {/* Kanban Board */}
            <ProductionBoard items={items} />
        </PageContainer>
    );
}
