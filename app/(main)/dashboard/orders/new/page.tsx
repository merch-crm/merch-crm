import { getInventoryForSelect } from "../actions/core.actions";;
import { CreateOrderPageClient } from "./page-client";
import { getSession } from "@/lib/auth";

export const metadata = {
    title: "Новый заказ | CRM",
    description: "Оформление нового заказа в системе",
};

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
    const inventoryRes = await getInventoryForSelect();
    const inventory = inventoryRes.success && inventoryRes.data ? inventoryRes.data : [];
    const session = await getSession();

    return (
        <CreateOrderPageClient
            initialInventory={inventory.map(i => ({ ...i, quantity: i.quantity || 0, unit: null }))}
            userRoleName={session?.roleName}
        />
    );
}
