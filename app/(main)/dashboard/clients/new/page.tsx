import { getManagers } from "../actions";
import { NewClientPageClient } from "./page-client";

export const metadata = {
    title: "Новый клиент | CRM",
    description: "Создание нового клиента в системе",
};

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
    const managersRes = await getManagers();
    const managers = (managersRes.success && managersRes.data) ? managersRes.data : [];

    return (
        <NewClientPageClient managers={managers} />
    );
}
