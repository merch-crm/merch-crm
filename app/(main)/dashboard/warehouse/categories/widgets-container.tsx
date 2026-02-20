import { getWarehouseStats } from "../warehouse-stats-actions";;
import { WarehouseWidgets } from "../warehouse-widgets";

export async function WarehouseWidgetsContainer() {
    const res = await getWarehouseStats();

    if (!res.success || !res.data) {
        return null; // Or handle error
    }

    return <WarehouseWidgets stats={res.data} />;
}
