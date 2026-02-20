"use client";

import React from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";

interface ItemImagePreviewProps {
    item: InventoryItem;
    isEditing: boolean;
    thumbSettings: { zoom: number; x: number; y: number };
    baseScale: number;
    handleMainMouseDown: (e: React.MouseEvent) => void;
    setAspectRatio: (ratio: number) => void;
    openGallery: (src: string) => void;
}

export function ItemImagePreview({
    item,
    isEditing,
    thumbSettings,
    baseScale,
    handleMainMouseDown,
    setAspectRatio,
    openGallery
}: ItemImagePreviewProps) {
    return (
        <div className="group relative w-full aspect-square crm-card rounded-3xl overflow-hidden">
            <div role="button" tabIndex={0}
                className={cn(
                    "absolute inset-0 bg-muted/50 overflow-hidden",
                    isEditing ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                )}
                onMouseDown={handleMainMouseDown}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!isEditing && item.image) openGallery(item.image);
                    }
                }}
                onClick={() => !isEditing && item.image && openGallery(item.image)}
            >
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain transition-transform duration-500 ease-out select-none pointer-events-none"
                        unoptimized
                        priority
                        style={{
                            transform: `scale(${((isEditing ? thumbSettings?.zoom : item.thumbnailSettings?.zoom) ?? 1) * baseScale}) translate(${(isEditing ? thumbSettings?.x : item.thumbnailSettings?.x) ?? 0}%, ${(isEditing ? thumbSettings?.y : item.thumbnailSettings?.y) ?? 0}%)`,
                            transformOrigin: 'center center',
                        }}
                        onLoad={(img: React.SyntheticEvent<HTMLImageElement>) => {
                            const target = img.target as HTMLImageElement;
                            setAspectRatio(target.naturalWidth / target.naturalHeight);
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 bg-muted/50">
                        <div className="w-20 h-20 rounded-3xl bg-card shadow-inner flex items-center justify-center mb-4">
                            <ImageIcon className="w-10 h-10 opacity-30" aria-label="No image" />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground/50">Нет фото</p>
                    </div>
                )}
            </div>
        </div>
    );
}
