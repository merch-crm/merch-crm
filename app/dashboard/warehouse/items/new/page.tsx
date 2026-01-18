import { getInventoryCategories, getStorageLocations, getMeasurementUnits, getInventoryAttributes, getInventoryAttributeTypes } from "../../actions";
import { NewItemPageClient } from "./new-item-page-client";

export const metadata = {
    title: "Добавить товар | CRM",
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
    const [categoriesRes, locationsRes, unitsRes, attributesRes, typesRes] = await Promise.all([
        getInventoryCategories(),
        getStorageLocations(),
        getMeasurementUnits(),
        getInventoryAttributes(),
        getInventoryAttributeTypes()
    ]);

    const categories = categoriesRes.data || [];
    const storageLocations = locationsRes.data || [];
    const measurementUnits = unitsRes.data || [];
    const dynamicAttributes = attributesRes.data || [];
    const attributeTypes = typesRes.data || [];

    return (
        <NewItemPageClient
            categories={categories}
            storageLocations={storageLocations}
            measurementUnits={measurementUnits}
            dynamicAttributes={dynamicAttributes}
            attributeTypes={attributeTypes}
            initialCategoryId={categoryId}
            initialSubcategoryId={subcategoryId}
        />
    );
}
