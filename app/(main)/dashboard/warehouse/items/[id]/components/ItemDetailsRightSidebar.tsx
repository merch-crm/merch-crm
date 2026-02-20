import { useItemDetail } from "../context/ItemDetailContext";
import { ItemActionButtons } from "./ItemActionButtons";
import { ItemStockAlerts } from "./ItemStockAlerts";
import { ItemFinancialSection } from "./ItemFinancialSection";
import { ItemPlacementWrapper } from "./ItemPlacementWrapper";
import { cn } from "@/lib/utils";

export function ItemDetailsRightSidebar() {
    const {
        item,
        storageLocations,
        stocks,
        isEditing,
        editData,
        setEditData,
        handleStartEdit,
        handleDownload,
        setDialogs,
        user,
        history,
        timeframe,
        setTimeframe,
        tabletTab
    } = useItemDetail();

    return (
        <>
            <div className="hidden xl:grid xl:grid-cols-3 xl:gap-3 xl:col-span-4">
                <ItemActionButtons
                    item={item}
                    setShowLabelDialog={(val) => setDialogs((prev) => ({ ...prev, label: val }))}
                    handleDownload={handleDownload}
                    setShowArchiveReason={(val) => setDialogs((prev) => ({ ...prev, archiveReason: val }))}
                />
            </div>

            <ItemStockAlerts
                item={item}
                isEditing={isEditing}
                editData={editData}
                setEditData={setEditData}
                handleStartEdit={handleStartEdit}
                className={cn("hidden xl:block xl:col-span-4 crm-card rounded-3xl p-6 relative group/alerts overflow-hidden bg-card/50 h-full")}
            />

            <ItemFinancialSection
                item={item}
                history={history}
                isEditing={isEditing}
                editData={editData}
                setEditData={setEditData}
                handleStartEdit={handleStartEdit}
                user={user}
                className="hidden xl:flex xl:col-span-8 xl:h-full"
                timeframe={timeframe}
                setTimeframe={setTimeframe}
            />

            <ItemPlacementWrapper
                storageLocations={storageLocations}
                stocks={stocks}
                tabletTab={tabletTab}
            />
        </>
    );
}
