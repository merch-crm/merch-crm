
import { WarehouseWidgets } from "../warehouse-widgets";

export async function WarehouseWidgetsContainer() {
    console.log("[DEBUG] SSR: WarehouseWidgetsContainer - BYPASSING stats call");
    // const res = await getWarehouseStats();
    const res = {
        success: true,
        data: {
            totalItems: 10,
            totalQuantity: 100,
            totalReserved: 5,
            totalStorages: 2,
            archivedCount: 0,
            totalCategories: 3,
            totalSubCategories: 5,
            criticalItems: [],
            activity: { ins: 10, usage: 5, waste: 0, transfers: 2, adjustments: 1 },
            financials: { totalCostValue: 1000, totalRetailValue: 2000, frozenCostValue: 50, frozenRetailValue: 100, writeOffValue30d: 0 },
            currencySymbol: "₽",
            recentTransactions: [],
            topSoldItems: [],
            stagnantItems: [],
        }
    };

    console.log("[DEBUG] SSR: WarehouseWidgetsContainer - returning dummy data");

    if (!res.success || !res.data) {
        return null; // Or handle error
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <WarehouseWidgets stats={res.data as any} />;
}
