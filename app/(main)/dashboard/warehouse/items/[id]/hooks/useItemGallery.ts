import { useState, useMemo } from "react";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";

export function useItemGallery(item: InventoryItem) {
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
    const [isMainImageZoomed, setIsMainImageZoomed] = useState(false);

    const allGalleryImages = useMemo(() => {
        if (!item) return [];
        const images: { src: string; label: string }[] = [];
        if (item.image) images.push({ src: item.image, label: "Основное фото" });
        if (item.imageBack) images.push({ src: item.imageBack, label: "Вид сзади" });
        if (item.imageSide) images.push({ src: item.imageSide, label: "Вид сбоку" });
        if (item.imageDetails && Array.isArray(item.imageDetails)) {
            item.imageDetails.forEach((img, idx) => {
                if (img) images.push({ src: img, label: `Деталь ${idx + 1}` });
            });
        }
        return images;
    }, [item]);

    const openGallery = (src?: string) => {
        if (!src) {
            setCurrentGalleryIndex(0);
            setIsMainImageZoomed(true);
            return;
        }
        const idx = allGalleryImages.findIndex(img => img.src === src);
        if (idx >= 0) {
            setCurrentGalleryIndex(idx);
            setIsMainImageZoomed(true);
        } else {
            // Fallback to first if not found (shouldn't happen)
            setCurrentGalleryIndex(0);
            setIsMainImageZoomed(true);
        }
    };


    return {
        currentGalleryIndex,
        setCurrentGalleryIndex,
        isMainImageZoomed,
        setIsMainImageZoomed,
        allGalleryImages,
        openGallery
    };
}
