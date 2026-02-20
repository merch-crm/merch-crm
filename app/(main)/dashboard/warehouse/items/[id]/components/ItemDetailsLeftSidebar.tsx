import { useItemDetail } from "../context/ItemDetailContext";
import { ItemImagePreview } from "./ItemImagePreview";
import { ItemImageCropper } from "./ItemImageCropper";
import { ItemMobileInfo } from "./ItemMobileInfo";
import { ItemMobileActions } from "./ItemMobileActions";
import { ItemMobileTabs } from "./ItemMobileTabs";

export function ItemDetailsLeftSidebar() {
    const {
        item,
        isEditing,
        thumbSettings,
        baseScale,
        handleMainMouseDown,
        setAspectRatio,
        openGallery,
        updateThumb,
        resetThumbSettings,
        maxBounds,
        handleStartEdit,
        displayUnit,
        reservedQuantity,
        setAdjustType,
        setDialogs,
        handleDownload,
        tabletTab,
        setTabletTab
    } = useItemDetail();

    return (
        <>
            <ItemImagePreview
                item={item}
                isEditing={isEditing}
                thumbSettings={thumbSettings}
                baseScale={baseScale}
                handleMainMouseDown={handleMainMouseDown}
                setAspectRatio={setAspectRatio}
                openGallery={openGallery}
            />

            {isEditing && (
                <ItemImageCropper
                    thumbSettings={thumbSettings}
                    updateThumb={updateThumb}
                    resetThumbSettings={resetThumbSettings}
                    maxBounds={maxBounds}
                />
            )}

            <ItemMobileInfo
                item={item}
                handleStartEdit={handleStartEdit}
                displayUnit={displayUnit}
                reservedQuantity={reservedQuantity}
            />
            <ItemMobileActions
                setAdjustType={setAdjustType}
                setShowTransfer={(val) => setDialogs((prev) => ({ ...prev, transfer: val }))}
                setShowLabelDialog={(val) => setDialogs((prev) => ({ ...prev, label: val }))}
                handleDownload={handleDownload}
                setShowArchiveReason={(val) => setDialogs((prev) => ({ ...prev, archiveReason: val }))}
                item={item}
                tabletTab={tabletTab}
            />

            <ItemMobileTabs tabletTab={tabletTab} setTabletTab={setTabletTab} />
        </>
    );
}
