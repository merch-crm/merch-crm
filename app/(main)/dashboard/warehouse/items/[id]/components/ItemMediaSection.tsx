"use client";

import React from "react";
import Image from "next/image";
import { ImageIcon, Trash2, Maximize2, Plus, ImagePlus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";
import { useGalleryLightbox } from "@/components/hooks/useGalleryLightbox";
import { ModernImageGallery } from "@/components/ui/modern-image-gallery";

interface ItemMediaSectionProps {
    item: InventoryItem;
    isEditing: boolean;
    onImageChange: (file: File | null, type: "front" | "back" | "side" | "details", index?: number) => void;
    onImageRemove: (type: "front" | "back" | "side" | "details", index?: number) => void;
}

export interface UploadState {
    uploading: boolean;
    progress: number;
    uploaded: boolean;
}

// Moved outside component for stable reference in useMemo
function getAllItemImages(item: InventoryItem) {
    const images: { src: string | null; label: string, type: "front" | "back" | "side" | "details", index?: number }[] = [
        { src: item.image || null, label: "Основное", type: "front" },
        { src: item.imageBack || null, label: "Вид сзади", type: "back" },
        { src: item.imageSide || null, label: "Вид сбоку", type: "side" },
        { src: (item.imageDetails && item.imageDetails[0]) || null, label: "Деталь 1", type: "details", index: 0 },
        { src: (item.imageDetails && item.imageDetails[1]) || null, label: "Деталь 2", type: "details", index: 1 },
        { src: (item.imageDetails && item.imageDetails[2]) || null, label: "Деталь 3", type: "details", index: 2 },
    ];
    return images;
}

export const ItemMediaSection = React.memo(({
    item,
    isEditing,
    onImageChange,
    onImageRemove
}: ItemMediaSectionProps) => {
    const allImages = React.useMemo(() => getAllItemImages(item), [item]);


    // Draggable Scroll Logic


    // Lightbox Logic
    const {
        fullscreen,
        currentIndex,
        setFullscreen,
        openFullscreen,
    } = useGalleryLightbox(allImages.length);

    const handleFullscreenOpen = (src: string | null) => {
        if (!src) return;
        const idx = allImages.findIndex(img => img.src === src);
        openFullscreen(idx);
    };

    const GalleryUploadButton = ({ type, index, label, isMain = false }: { type: "front" | "back" | "side" | "details", index?: number, label: string, isMain?: boolean }) => (
        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900/5 transition-colors group/u">
            <input
                type="file" className="hidden" accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImageChange(file, type, index);
                }}
            />
            <div className={cn(
                "rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-900 mb-3 transition-all group-hover/u:scale-110 active:scale-90",
                isMain ? "w-16 h-16" : "w-12 h-12"
            )}>
                <Plus className={isMain ? "w-8 h-8" : "w-6 h-6"} />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover/u:text-slate-900 transition-colors">{label}</span>
        </label>
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center text-background transition-all shadow-sm">
                        <ImageIcon className="w-6 h-6" aria-label="Image placeholder" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">Галерея</h3>
                        <p className="text-[11px] font-bold text-muted-foreground mt-1">
                            Загружено {allImages.filter(i => i.src).length} из {allImages.length} фото
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 shrink-0">
                    {allImages.some(i => !i.src) && (
                        <Button
                            asChild
                            type="button"
                            variant="btn-black"
                            className="h-11 px-8 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 border-none font-black text-[13px]"
                        >
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const firstEmptyIdx = allImages.findIndex(img => !img.src);
                                            if (firstEmptyIdx !== -1) {
                                                const img = allImages[firstEmptyIdx];
                                                onImageChange(file, img.type, img.index);
                                            }
                                        }
                                    }}
                                />
                                <ImagePlus className="w-4 h-4" aria-label="Add image" />
                                <span className="hidden sm:inline">Добавить больше</span>
                            </label>
                        </Button>
                    )}
                </div>
            </div>

            {/* Gallery Grid: Premium Mosaic Style */}
            <div className="relative group/gallery">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[240px]">
                    {/* Main Image - Spans 2x2 on larger screens */}
                    {allImages[0].src || isEditing ? (
                        <div
                            role="button"
                            tabIndex={allImages[0].src ? 0 : -1}
                            onClick={() => { if (allImages[0].src) handleFullscreenOpen(allImages[0].src); }}
                            className={cn(
                                "group/item relative rounded-[32px] overflow-hidden border transition-all duration-500 bg-slate-900/5 sm:col-span-2 sm:row-span-2",
                                allImages[0].src ? "cursor-pointer hover:shadow-2xl hover:shadow-slate-900/20" : "border-dashed border-slate-200"
                            )}
                        >
                            {allImages[0].src ? (
                                <>
                                    <Image
                                        src={allImages[0].src}
                                        alt={allImages[0].label}
                                        fill
                                        className="object-cover transition-transform duration-1000 ease-out group-hover/item:scale-105"
                                        unoptimized
                                    />
                                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-all duration-500 translate-y-4 group-hover/item:translate-y-0">
                                        <span className="text-[11px] font-black tracking-wider text-white/60 mb-2 block">Основной ракурс</span>
                                        <h4 className="text-2xl font-black text-white">{allImages[0].label}</h4>
                                    </div>
                                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-all translate-x-4 group-hover/item:translate-x-0">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
                                            <Maximize2 className="w-5 h-5" />
                                        </div>
                                    </div>
                                </>
                            ) : isEditing && (
                                <GalleryUploadButton type={allImages[0].type} index={allImages[0].index} label="Добавить основное фото" isMain />
                            )}
                        </div>
                    ) : null}

                    {/* Secondary Images Grid */}
                    {allImages.slice(1).map((img, idx) => {
                        if (!img.src && !isEditing) return null;
                        const realIdx = idx + 1;
                        return (
                            <div
                                key={realIdx}
                                role="button"
                                tabIndex={img.src ? 0 : -1}
                                onClick={() => { if (img.src) handleFullscreenOpen(img.src); }}
                                className={cn(
                                    "group/item relative rounded-3xl overflow-hidden border transition-all duration-500 bg-slate-900/5",
                                    img.src ? "cursor-pointer hover:shadow-xl hover:shadow-slate-900/10" : "border-dashed border-slate-200"
                                )}
                            >
                                {img.src ? (
                                    <>
                                        <Image
                                            src={img.src}
                                            alt={img.label}
                                            fill
                                            className="object-cover transition-transform duration-700 ease-out group-hover/item:scale-110"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white scale-90 group-hover/item:scale-100 transition-transform">
                                                <Maximize2 className="w-4 h-4" />
                                            </div>
                                        </div>
                                        {isEditing && (
                                            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover/item:opacity-100 transition-all translate-x-2 group-hover/item:translate-x-0">
                                                <Button
                                                    variant="destructive" size="icon" className="w-8 h-8 rounded-xl p-0"
                                                    onClick={(e) => { e.stopPropagation(); onImageRemove(img.type, img.index); }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="secondary" size="icon" className="w-8 h-8 rounded-xl p-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <label className="cursor-pointer">
                                                        <input
                                                            type="file" className="hidden" accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) onImageChange(file, img.type, img.index);
                                                            }}
                                                        />
                                                        <RefreshCw className="w-4 h-4" />
                                                    </label>
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : isEditing && (
                                    <GalleryUploadButton type={img.type} index={img.index} label="Добавить" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Lightbox Overlay */}
            <ModernImageGallery
                isOpen={fullscreen}
                onClose={() => setFullscreen(false)}
                images={allImages}
                initialIndex={currentIndex}
                itemName={item.name}
            />
        </div>
    );
});

ItemMediaSection.displayName = "ItemMediaSection";
