import { AddItemDialog } from "./add-item-dialog";
import { InventoryTable } from "./inventory-table";

export default function WarehousePage() {
    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-white">Управление складом</h1>
                <div className="mt-4 sm:mt-0">
                    <AddItemDialog />
                </div>
            </div>

            <InventoryTable />
        </div>
    );
}
