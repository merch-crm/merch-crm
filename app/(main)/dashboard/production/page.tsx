import { ProductionDashboardClient } from "./production-dashboard-client";
import {
    getProductionStats,
    getTasksByLine,
    getUrgentProductionTasks,
    getEquipmentStatus,
    getStaffOnShift,
    getDailyOutputData
} from "./actions/production-dashboard-actions";
import { PageContainer } from "@/components/ui/page-container";

export default async function ProductionPage() {
    const [
        statsRes,
        tasksByLineRes,
        urgentTasksRes,
        equipmentStatusRes,
        staffOnShiftRes,
        dailyOutputRes
    ] = await Promise.all([
        getProductionStats(),
        getTasksByLine(),
        getUrgentProductionTasks(),
        getEquipmentStatus(),
        getStaffOnShift(),
        getDailyOutputData()
    ]);

    return (
        <PageContainer>
            <ProductionDashboardClient
                stats={statsRes.success ? statsRes.data! : null}
                tasksByLine={tasksByLineRes.success ? tasksByLineRes.data! : []}
                urgentTasks={urgentTasksRes.success ? urgentTasksRes.data! : []}
                equipmentStatus={equipmentStatusRes.success ? equipmentStatusRes.data! : []}
                staffOnShift={staffOnShiftRes.success ? staffOnShiftRes.data! : []}
                dailyOutput={dailyOutputRes.success ? dailyOutputRes.data! : []}
            />
        </PageContainer>
    );
}
