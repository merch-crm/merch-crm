"use client";

import {
    InventoryItem,
    Category,
    InventoryAttribute,
    AttributeType,
    StorageLocation,
} from "../../types";
import { Session } from "@/lib/auth";
import { ResponsiveDetailLayout } from "@/components/ui/responsive-detail-layout";
import { ItemHeader } from "./components/ItemHeader";
import { ItemEditingBar } from "./components/ItemEditingBar";
import { ItemDialogs } from "./components/ItemDialogs";
import { ItemOfflineOverlay } from "./components/ItemOfflineOverlay";
import { ItemGalleryOverlay } from "./components/ItemGalleryOverlay";

// New aggregate components
import { ItemDetailsMainContent } from "./components/ItemDetailsMainContent";
import { ItemDetailsLeftSidebar } from "./components/ItemDetailsLeftSidebar";
import { ItemDetailsRightSidebar } from "./components/ItemDetailsRightSidebar";

import { ItemDetailProvider, useItemDetail } from "./context/ItemDetailContext";

interface ItemDetailClientProps {
    item: InventoryItem;
    storageLocations: StorageLocation[];
    categories: Category[];
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
    user: Session | null;
}

export function ItemDetailClient(props: ItemDetailClientProps) {
    return (
        <ItemDetailProvider {...props} initialItem={props.item}>
            <ItemDetailContent />
        </ItemDetailProvider>
    );
}

function ItemDetailContent() {
    const {
        item,
        isEditing,
        isSaving,
        editData,
        setEditData,
        hasChanges,
        isAnyUploading,
        handleRestore,
        handleCancelEdit,
        handleSave,
        setIsEditing,
        tabletTab,
        isMounted,
        isOnline,
        handleDelete,
        setDialogs,
        setPendingExitAction
    } = useItemDetail();

    return (
        <>
            <ResponsiveDetailLayout
                isArchived={item.isArchived ?? false}
                hideLeftSidebarOnMobile={tabletTab !== 'characteristic'}
                header={
                    <ItemHeader
                        item={item}
                        isEditing={isEditing}
                        isSaving={isSaving}
                        isAnyUploading={isAnyUploading}
                        editName={editData.name || ""}
                        onEditNameChange={(name) => setEditData(prev => ({ ...prev, name }))}
                        onCancel={() => {
                            if (hasChanges) {
                                handleCancelEdit();
                            } else {
                                setIsEditing(false);
                                handleCancelEdit();
                            }
                        }}
                        onSave={() => handleSave()}
                        onEdit={() => setIsEditing(true)}
                        onUnarchive={handleRestore}
                    />
                }
                leftSidebar={<ItemDetailsLeftSidebar />}
                mainContent={<ItemDetailsMainContent />}
                rightSidebar={<ItemDetailsRightSidebar />}
            />

            <ItemEditingBar
                isEditing={isEditing}
                isMounted={isMounted}
                hasChanges={hasChanges}
                editData={editData}
                item={item}
                isSaving={isSaving}
                onCancel={() => {
                    if (hasChanges) {
                        setDialogs(prev => ({ ...prev, unsavedChanges: true }));
                        setPendingExitAction(() => () => {
                            setIsEditing(false);
                            handleCancelEdit();
                        });
                    } else {
                        setIsEditing(false);
                    }
                }}
                onSave={() => handleSave()}
                onDelete={() => handleDelete()}
            />

            <ItemDialogs />
            <ItemGalleryWrapper />
            <ItemOfflineOverlay isOnline={isOnline} />
        </>
    );
}

function ItemGalleryWrapper() {
    const {
        isMainImageZoomed,
        setIsMainImageZoomed,
        item,
        allGalleryImages,
        currentGalleryIndex,
        setCurrentGalleryIndex
    } = useItemDetail();

    return (
        <ItemGalleryOverlay
            isOpen={isMainImageZoomed}
            onClose={() => setIsMainImageZoomed(false)}
            itemName={item.name}
            images={allGalleryImages}
            currentIndex={currentGalleryIndex}
            onIndexChange={setCurrentGalleryIndex}
        />
    );
}
