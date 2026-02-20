import { getInventoryAttributes, getInventoryAttributeTypes } from "../attribute-actions";
import { getInventoryCategories } from "../category-actions";;
import { WarehouseCharacteristic } from "../warehouse-characteristic";
import { getSession } from "@/lib/auth";

export const metadata = {
    title: "Характеристики | Склад",
};

export const dynamic = "force-dynamic";

export default async function CharacteristicsPage() {
    const [
        attrRes,
        attrTypesRes,
        catsRes,
        session
    ] = await Promise.all([
        getInventoryAttributes(),
        getInventoryAttributeTypes(),
        getInventoryCategories(),
        getSession()
    ]);

    const attributes = 'data' in attrRes && attrRes.data ? attrRes.data : [];
    const attributeTypes = 'data' in attrTypesRes && attrTypesRes.data ? attrTypesRes.data : [];
    const categories = 'data' in catsRes && catsRes.data ? catsRes.data : [];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <WarehouseCharacteristic
                attributes={attributes}
                attributeTypes={attributeTypes}
                categories={categories}
                user={session}
            />
        </div>
    );
}
