"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Session } from "@/lib/auth";
import { InventoryAttribute as Attribute, AttributeType } from "./types";
import { useWarehouseCharacteristic } from "./hooks/use-warehouse-characteristic";
import { CategoryTabs } from "./components/characteristic/CategoryTabs";
import { CharacteristicGrid } from "./components/characteristic/CharacteristicGrid";
import { EditTypeDialog } from "./components/characteristic/EditTypeDialog";
import { EditValueDialog } from "./components/characteristic/EditValueDialog";
import { PasswordProtection } from "./components/characteristic/PasswordProtection";

interface Category {
    id: string;
    name: string;
    parentId?: string | null;
}

interface CharacteristicProps {
    attributes?: Attribute[];
    attributeTypes?: AttributeType[];
    categories?: Category[];
    user?: Session | null;
}

export function WarehouseCharacteristic({ attributes = [], attributeTypes = [], categories = [], user }: CharacteristicProps) {
    const {
        rootCategories,
        hasUncategorized,
        activeCategoryId,
        valueForm, setValueForm,
        typeForm, setTypeForm,
        deleteDialog, setDeleteDialog,
        editingTypeLatest,
        editingTypeValues,
        filteredTypes,
        handleCategoryChange,
        openAddValue,
        openEditValue,
        handleValueSave,
        handleDeleteConfirm,
        handleDeleteTypeConfirm,
        openEditType,
        handleTypeUpdate
    } = useWarehouseCharacteristic({ attributes, attributeTypes, categories });

    const activeCategoryName = activeCategoryId === "uncategorized"
        ? "Без категории"
        : (categories.find(c => c.id === activeCategoryId)?.name || "Категория");

    return (
        <div className="space-y-4 pb-20">
            <CategoryTabs
                rootCategories={rootCategories}
                hasUncategorized={hasUncategorized}
                activeCategoryId={activeCategoryId}
                handleCategoryChange={handleCategoryChange}
            />

            <CharacteristicGrid
                filteredTypes={filteredTypes}
                attributes={attributes}
                activeCategoryId={activeCategoryId}
                activeCategoryName={activeCategoryName}
                openEditType={openEditType}
                openEditValue={openEditValue}
                openAddValue={openAddValue}
            />

            <EditTypeDialog
                typeForm={typeForm}
                setTypeForm={setTypeForm}
                rootCategories={rootCategories}
                user={user}
                editingTypeLatest={editingTypeLatest}
                editingTypeValues={editingTypeValues}
                openAddValue={openAddValue}
                openEditValue={openEditValue}
                setDeleteDialog={setDeleteDialog}
                handleTypeUpdate={handleTypeUpdate}
            />

            <EditValueDialog
                valueForm={valueForm}
                setValueForm={setValueForm}
                attributeTypes={attributeTypes}
                setDeleteDialog={setDeleteDialog}
                handleValueSave={handleValueSave}
            />

            <ConfirmDialog
                isOpen={!!deleteDialog.attribute}
                onClose={() => setDeleteDialog(prev => ({ ...prev, attribute: null }))}
                onConfirm={handleDeleteConfirm}
                title="Удаление значения"
                description={`Вы уверены, что хотите удалить «${deleteDialog.attribute?.name}»?`}
                confirmText="Удалить"
                variant="destructive"
                isLoading={deleteDialog.isDeleting}
            />

            <ConfirmDialog
                isOpen={!!deleteDialog.type}
                onClose={() => setDeleteDialog(prev => ({ ...prev, type: null, password: "" }))}
                onConfirm={handleDeleteTypeConfirm}
                title="Удаление раздела"
                description={`Вы уверены, что хотите удалить раздел «${deleteDialog.type?.name}»? Все значения в нем также будут недоступны.`}
                confirmText="Удалить"
                variant="destructive"
                isLoading={deleteDialog.isDeletingType}
                isConfirmDisabled={!!deleteDialog.type?.isSystem && !deleteDialog.password.trim()}
            >
                {deleteDialog.type?.isSystem && (
                    <PasswordProtection
                        password={deleteDialog.password}
                        setPassword={(val) => setDeleteDialog(prev => ({ ...prev, password: val }))}
                    />
                )}
            </ConfirmDialog>
        </div>
    );
}
