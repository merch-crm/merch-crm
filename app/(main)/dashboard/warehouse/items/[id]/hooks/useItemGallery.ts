import { useState, useEffect, useMemo } from "react";
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

    // Gallery Keyboard Controls
    useEffect(() => {
        if (!isMainImageZoomed) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                setCurrentGalleryIndex(prev => (prev > 0 ? prev - 1 : allGalleryImages.length - 1));
            } else if (e.key === "ArrowRight") {
                setCurrentGalleryIndex(prev => (prev < allGalleryImages.length - 1 ? prev + 1 : 0));
            } else if (e.key === "Escape") {
                setIsMainImageZoomed(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMainImageZoomed, allGalleryImages.length]);

    return {
        currentGalleryIndex,
        setCurrentGalleryIndex,
        isMainImageZoomed,
        setIsMainImageZoomed,
        allGalleryImages,
        openGallery
    };
}
