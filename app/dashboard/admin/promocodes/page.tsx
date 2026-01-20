import AdminTabs from "../admin-tabs";
import { getPromocodes } from "./actions";
import { PromocodesClient } from "./promocodes-client";

export default async function PromocodesPage() {
    const { data = [] } = await getPromocodes();

    return (
        <div className="space-y-8">
            <AdminTabs />
            <PromocodesClient initialData={data} />
        </div>
    );
}
