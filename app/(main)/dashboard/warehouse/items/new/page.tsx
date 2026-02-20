import { getInventoryCategories } from "../../category-actions";
import { getStorageLocations } from "../../storage-actions";
import { getMeasurementUnits } from "../../warehouse-shared.actions";
import { getInventoryAttributes, getInventoryAttributeTypes } from "../../attribute-actions";;
import { NewItemPageClient } from "./new-item-page-client";

export const metadata = {
    title: "Новый товар | Склад",
    description: "Создание нового товара в складской системе",
};

export const dynamic = "force-dynamic";

export default async function NewItemPage({
    searchParams
}: {
    searchParams: Promise<{ categoryId?: string; subcategoryId?: string }>
}) {
    const { categoryId, subcategoryId } = await searchParams;

    // Загружаем все необходимые данные параллельно
    const [categoriesRes, locationsRes, unitsRes, attributesRes, typesRes, usersRes] = await Promise.all([
        getInventoryCategories(),
        getStorageLocations(),
        getMeasurementUnits(),
        getInventoryAttributes(),
        getInventoryAttributeTypes(),
        import("../../actions").then(m => m.getAllUsers())
    ]);

    const categories = (categoriesRes.success && 'data' in categoriesRes && categoriesRes.data) ? categoriesRes.data : [];
    const storageLocations = (locationsRes.success && 'data' in locationsRes && locationsRes.data) ? locationsRes.data : [];
    const measurementUnits = (unitsRes.success && 'data' in unitsRes && unitsRes.data) ? unitsRes.data : [];
    const dynamicAttributes = (attributesRes.success && 'data' in attributesRes && attributesRes.data) ? attributesRes.data : [];
    const attributeTypes = (typesRes.success && 'data' in typesRes && typesRes.data) ? typesRes.data : [];
    const users = (usersRes.success && 'data' in usersRes && usersRes.data) ? usersRes.data : [];

    return (
        <NewItemPageClient
            categories={categories}
            storageLocations={storageLocations}
            measurementUnits={measurementUnits}
            dynamicAttributes={dynamicAttributes}
            attributeTypes={attributeTypes}
            users={users}
            initialCategoryId={categoryId}
            initialSubcategoryId={subcategoryId}
        />
    );
}
