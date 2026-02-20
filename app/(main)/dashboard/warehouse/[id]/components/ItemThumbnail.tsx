"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { InventoryItem, ThumbnailSettings } from "../../types";

interface ItemThumbnailProps {
    item: InventoryItem;
}

export const ItemThumbnail = React.memo(({ item }: ItemThumbnailProps) => {
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);
    const settings = (item.thumbnailSettings as ThumbnailSettings) || { zoom: 1, x: 0, y: 0 };

    const baseScale = useMemo(() => {
        if (!aspectRatio) return 1;
        return Math.max(aspectRatio, 1 / aspectRatio);
    }, [aspectRatio]);

    if (!item.image) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Package className="w-5 h-5 opacity-20" />
            </div>
        );
    }

    return (
        <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain"
            unoptimized
            onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                setAspectRatio(img.naturalWidth / img.naturalHeight);
            }}
            style={{
                transform: `scale(${(settings.zoom || 1) * baseScale}) translate(${settings.x ?? 0}%, ${settings.y ?? 0}%)`,
                transformOrigin: 'center center'
            }}
        />
    );
});

ItemThumbnail.displayName = "ItemThumbnail";
