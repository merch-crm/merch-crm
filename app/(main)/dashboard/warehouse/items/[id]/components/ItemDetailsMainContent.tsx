import { ItemActionButtons } from "./ItemActionButtons";
import { ItemTabsSwitcher } from "./ItemTabsSwitcher";
import { ItemCharacteristicSection } from "./ItemCharacteristicSection";
import { ItemFinancialSection } from "./ItemFinancialSection";
import { ItemMediaSection } from "./ItemMediaSection";
import { ItemActiveOrdersWrapper } from "./ItemActiveOrdersWrapper";
import { ItemHistoryWrapper } from "./ItemHistoryWrapper";
import { ItemPlacementWrapper } from "./ItemPlacementWrapper";
import { cn } from "@/lib/utils";
import { useItemDetail } from "../context/ItemDetailContext";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";

export function ItemDetailsMainContent() {
    const context = useItemDetail();
    const {
        item,
        isEditing,
        editData,
        setEditData,
        tabletTab,
        setTabletTab,
        handleStartEdit,
        user,
        timeframe,
        setTimeframe,
        handleImageUpdate,
        handleImageRemove,
        activeOrders,
        reservedQuantity,
        displayUnit,
        history,
        handleExportHistory,
        setDialogs,
        storageLocations,
        stocks,
        setAdjustType,
        handleDownload
    } = context;

    return (
        <>
            <div className="md:col-span-2 xl:col-span-12">
                <ItemTabsSwitcher
                    tabletTab={tabletTab}
                    setTabletTab={setTabletTab}
                />
            </div>

            {/* LEFT/MAIN COLUMN: Characteristics, Actions, Financial */}
            <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-8">
                <ItemCharacteristicSection />

                {/* ACTION BUTTONS — Only visible on tablet/mobile characteristic tab */}
                <div className="xl:hidden">
                    <ItemActionButtons
                        setAdjustType={setAdjustType}
                        setShowLabelDialog={(val) => setDialogs((prev) => ({ ...prev, label: val }))}
                        handleDownload={handleDownload}
                        onArchive={context.handleDelete}
                        tabletTab={tabletTab}
                    />
                </div>

                <ItemFinancialSection
                    item={item}
                    history={history}
                    isEditing={isEditing}
                    editData={editData}
                    setEditData={setEditData}
                    handleStartEdit={handleStartEdit}
                    user={user}
                    className={cn("xl:flex",
                        tabletTab === 'cost' ? "flex" : "hidden"
                    )}
                    timeframe={timeframe}
                    setTimeframe={setTimeframe}
                />

            </div>

            {/* RIGHT COLUMN/SIDEBAR: Placement, Alerts */}
            <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-4">
                <ItemPlacementWrapper
                    item={item}
                    storageLocations={storageLocations}
                    stocks={stocks}
                    isEditing={isEditing}
                    editData={editData}
                    setEditData={setEditData as React.Dispatch<React.SetStateAction<Partial<InventoryItem>>>}
                    handleStartEdit={handleStartEdit}
                    className={cn("xl:flex",
                        tabletTab === 'placement' ? "flex" : "hidden"
                    )}
                />
            </div>

            <div className={
                cn("md:col-span-2 xl:col-span-12 crm-card rounded-3xl p-4 sm:p-6 flex flex-col",
                    tabletTab === 'characteristic' ? "flex" : "hidden", "xl:flex"
                )}>
                <ItemMediaSection
                    item={item}
                    isEditing={isEditing}
                    onImageChange={handleImageUpdate}
                    onImageRemove={handleImageRemove}
                />
            </div>

            <div className="md:col-span-2 xl:col-span-12">
                <ItemActiveOrdersWrapper
                    activeOrders={activeOrders}
                    reservedQuantity={reservedQuantity}
                    displayUnit={displayUnit}
                    tabletTab={tabletTab}
                />
            </div>

            <div className="md:col-span-2 xl:col-span-12">
                <ItemHistoryWrapper
                    history={history}
                    onExport={handleExportHistory}
                    tabletTab={tabletTab}
                />
            </div>
        </>
    );
}
