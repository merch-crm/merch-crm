import { ItemTabletView } from "./ItemTabletView";
import { ItemTabsSwitcher } from "./ItemTabsSwitcher";
import { ItemCharacteristicSection } from "./ItemCharacteristicSection";
import { ItemFinancialSection } from "./ItemFinancialSection";
import { ItemMediaSection } from "./ItemMediaSection";
import { ItemActiveOrdersWrapper } from "./ItemActiveOrdersWrapper";
import { ItemHistoryWrapper } from "./ItemHistoryWrapper";
import { cn } from "@/lib/utils";
import { useItemDetail } from "../context/ItemDetailContext";

export function ItemDetailsMainContent() {
    const {
        item,
        isEditing,
        editData,
        setEditData,
        tabletTab,
        setTabletTab,
        allAttributes,
        attributeTypes,
        handleAttributeChange,
        handleRemoveAttribute,
        handleStartEdit,
        user,
        stocks,
        timeframe,
        setTimeframe,
        handleImageUpdate,
        handleImageRemove,
        handleSetMain,
        openGallery,
        uploads,
        activeOrders,
        reservedQuantity,
        displayUnit,
        history,
        handleExportHistory,
        setDialogs
    } = useItemDetail();

    return (
        <>
            <ItemTabletView
                item={item}
                setShowLabelDialog={() => setDialogs(prev => ({ ...prev, label: true }))}
                handleDownload={() => { }} // This needs context method if available
                setShowArchiveReason={() => setDialogs(prev => ({ ...prev, archiveReason: true }))}
                handleStartEdit={handleStartEdit}
                displayUnit={displayUnit}
                reservedQuantity={reservedQuantity}
                isEditing={isEditing}
                editData={editData}
                setEditData={setEditData}
            />

            <ItemTabsSwitcher
                tabletTab={tabletTab}
                setTabletTab={setTabletTab}
            />

            <ItemCharacteristicSection />

            {/* TABLET: Financial & Price Analytics (Full Width) */}
            <ItemFinancialSection
                item={item}
                history={history}
                isEditing={isEditing}
                editData={editData}
                setEditData={setEditData}
                handleStartEdit={handleStartEdit}
                user={user}
                className={cn(
                    "md:col-span-2 xl:hidden",
                    tabletTab === 'cost' ? "flex" : "hidden"
                )}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
            />

            <div className={
                cn(
                    "md:col-span-2 xl:col-span-12 crm-card rounded-3xl p-4 sm:p-8 flex flex-col",
                    tabletTab === 'characteristic' ? "flex" : "hidden",
                    "xl:flex"
                )}>
                <ItemMediaSection
                    item={item}
                    isEditing={isEditing}
                    onImageChange={handleImageUpdate}
                    onImageRemove={handleImageRemove}
                    onSetMain={handleSetMain}
                    onImageClick={(idx) => {
                        const getMediaImages = (it: typeof item) => [
                            { src: it.image || null },
                            { src: it.imageBack || null },
                            { src: it.imageSide || null },
                            { src: (it.imageDetails && it.imageDetails[0]) || null },
                            { src: (it.imageDetails && it.imageDetails[1]) || null },
                            { src: (it.imageDetails && it.imageDetails[2]) || null },
                        ];
                        const src = getMediaImages(item)[idx]?.src;
                        if (src) openGallery(src);
                    }}
                    uploadStates={uploads.states}
                />
            </div>

            <ItemActiveOrdersWrapper
                activeOrders={activeOrders}
                reservedQuantity={reservedQuantity}
                displayUnit={displayUnit}
                tabletTab={tabletTab}
            />

            <ItemHistoryWrapper
                history={history}
                onExport={handleExportHistory}
                tabletTab={tabletTab}
            />
        </>
    );
}
