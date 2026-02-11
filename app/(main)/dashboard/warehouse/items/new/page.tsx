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
    const [categoriesRes, locationsRes, unitsRes, attributesRes, typesRes, usersRes] = await Promise.all([
        getInventoryCategories(),
        getStorageLocations(),
        getMeasurementUnits(),
        getInventoryAttributes(),
        getInventoryAttributeTypes(),
        import("../../actions").then(m => m.getAllUsers())
    ]);

    const categories = 'data' in categoriesRes && categoriesRes.data ? categoriesRes.data : [];
    const storageLocations = 'data' in locationsRes && locationsRes.data ? locationsRes.data : [];
    const measurementUnits = 'data' in unitsRes && unitsRes.data ? unitsRes.data : [];
    const dynamicAttributes = 'data' in attributesRes && attributesRes.data ? attributesRes.data : [];
    const attributeTypes = 'data' in typesRes && typesRes.data ? typesRes.data : [];
    const users = 'data' in usersRes && usersRes.data ? usersRes.data : [];

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
