import { getInventoryCategories, getInventoryItems, getInventoryHistory, getStorageLocations, getAllUsers, seedStorageLocations } from "./actions";
// Auto-deploy trigger v1.1 - Restarting...
import { WarehouseClient } from "./warehouse-client";

export default async function WarehousePage() {
    const { data: categoriesFromDb = [] } = await getInventoryCategories();
    const { data: items = [] } = await getInventoryItems();
    const { data: history = [] } = await getInventoryHistory();
    const { data: storageLocations = [] } = await getStorageLocations();
    const { data: users = [] } = await getAllUsers();

    const desiredOrder = [
        "Футболки", "Худи", "Свитшот", "Лонгслив", "Анорак",
        "Зип-худи", "Штаны", "Поло", "Упаковка", "Расходники"
    ];

    const categories = [...categoriesFromDb].sort((a, b) => {
        const indexA = desiredOrder.indexOf(a.name);
        const indexB = desiredOrder.indexOf(b.name);

        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-[32px] font-black text-[#0f172a] tracking-tight leading-tight">Складской учёт</h1>
                    <p className="text-[#64748b] text-lg font-normal leading-relaxed">
                        Управление остатками товаров и расходных материалов
                    </p>
                </div>
            </div>

            <WarehouseClient
                items={items}
                categories={categories}
                history={history}
                storageLocations={storageLocations}
                users={users}
            />
        </div>
    );
}
