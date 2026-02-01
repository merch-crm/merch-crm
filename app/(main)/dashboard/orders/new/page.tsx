import { getInventoryForSelect } from "../actions";
import { CreateOrderPageClient } from "./page-client";
import { getSession } from "@/lib/auth";

export const metadata = {
    title: "Новый заказ | CRM",
    description: "Оформление нового заказа в системе",
};

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
    const inventory = await getInventoryForSelect();
    const session = await getSession();

    return (
        <CreateOrderPageClient
            initialInventory={inventory}
            userRoleName={session?.roleName}
        />
    );
}
