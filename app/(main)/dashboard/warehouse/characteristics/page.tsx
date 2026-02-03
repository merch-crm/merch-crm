import { getInventoryAttributes, getInventoryAttributeTypes, getInventoryCategories } from "../actions";
import { WarehouseCharacteristic } from "../warehouse-characteristic";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CharacteristicsPage() {
    const [
        { data: attributes = [] },
        { data: attributeTypes = [] },
        { data: categories = [] },
        session
    ] = await Promise.all([
        getInventoryAttributes(),
        getInventoryAttributeTypes(),
        getInventoryCategories(),
        getSession()
    ]);

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
