import { getWarehouseStats } from "../actions";
import { WarehouseWidgets } from "../warehouse-widgets";

export async function WarehouseWidgetsContainer() {
    const res = await getWarehouseStats();

    if (res.error || !res.data) {
        return null; // Or handle error
    }

    return <WarehouseWidgets stats={res.data} />;
}
