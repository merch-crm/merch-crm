import { getInventoryForSelect } from "../actions";
import { CreateOrderPageClient } from "./page-client";

export const metadata = {
    title: "Новый заказ | CRM",
    description: "Оформление нового заказа в системе",
};

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
    const inventory = await getInventoryForSelect();

    return (
        <CreateOrderPageClient initialInventory={inventory} />
    );
}
