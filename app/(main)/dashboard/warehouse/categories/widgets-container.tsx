import { WarehouseWidgets } from "../warehouse-widgets";
import { type RecentTransaction } from "../warehouse-stats-actions";

interface WarehouseStatsData {
  totalItems: number;
  totalQuantity: number;
  totalReserved: number;
  totalStorages: number;
  archivedCount: number;
  totalCategories: number;
  totalSubCategories: number;
  criticalItems: Array<{ id: string; name: string; quantity: number; unit: string }>;
  activity: { ins: number; usage: number; waste: number; transfers: number; adjustments: number };
  financials: { totalCostValue: number; totalRetailValue: number; frozenCostValue: number; frozenRetailValue: number; writeOffValue30d: number };
  currencySymbol: string;
  recentTransactions: RecentTransaction[];
  topSoldItems: Array<{ id: string; name: string; unit: string; totalSold: number }>;
  stagnantItems: Array<{ id: string; name: string; quantity: number; unit: string; lastActivityAt: Date | null }>;
}

export async function WarehouseWidgetsContainer() {
  // const res = await getWarehouseStats();
  const res: { success: boolean; data: WarehouseStatsData } = {
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

  if (!res.success || !res.data) {
    return null;
  }

  return <WarehouseWidgets stats={res.data} />;
}
