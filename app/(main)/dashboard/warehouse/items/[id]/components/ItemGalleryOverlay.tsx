import React from "react";
import { ModernImageGallery, GalleryImage } from "@/components/ui/modern-image-gallery";

export interface ItemGalleryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  images: GalleryImage[];
  currentIndex: number;
  onIndexChange?: (index: number | ((prev: number) => number)) => void;
}

export const ItemGalleryOverlay = React.memo(({
  isOpen,
  onClose,
  itemName,
  images,
  currentIndex,
  onIndexChange: _onIndexChange,
}: ItemGalleryOverlayProps) => {
  return (
    <ModernImageGallery isOpen={isOpen} onClose={onClose} images={images} initialIndex={currentIndex} itemName={itemName} />
  );
});

ItemGalleryOverlay.displayName = "ItemGalleryOverlay";
