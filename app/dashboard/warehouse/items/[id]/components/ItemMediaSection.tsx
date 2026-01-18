"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageIcon, RefreshCcw, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryItem, ThumbnailSettings } from "../../../types";

interface ItemMediaSectionProps {
    item: InventoryItem;
    isEditing: boolean;
    // For editing
    onImageChange: (file: File | null, type: "front" | "back" | "side" | "details", index?: number) => void;
    onImageRemove: (type: "front" | "back" | "side" | "details", index?: number) => void;
    thumbnailSettings?: ThumbnailSettings | null;
}

export function ItemMediaSection({
    item,
    isEditing,
    onImageChange,
    onImageRemove,
    thumbnailSettings
}: ItemMediaSectionProps) {
    const allImages = getAllItemImages(item);
    const [fullscreen, setFullscreen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    function getAllItemImages(item: InventoryItem) {
        const images: { src: string; label: string, type: string, index?: number }[] = [];
        if (item.image) images.push({ src: item.image, label: "Лицевая сторона", type: "front" });
        if (item.imageBack) images.push({ src: item.imageBack, label: "Со спины", type: "back" });
        if (item.imageSide) images.push({ src: item.imageSide, label: "Сбоку", type: "side" });
        if (item.imageDetails) {
            item.imageDetails.forEach((src: string, idx: number) => {
                images.push({ src, label: `Детали ${idx + 1}`, type: "details", index: idx });
            });
        }
        return images;
    }

    const openFullscreen = (src: string) => {
        const idx = allImages.findIndex(img => img.src === src);
        setCurrentIndex(idx >= 0 ? idx : 0);
        setFullscreen(true);
    };

    const nextImage = () => setCurrentIndex(prev => (prev + 1) % allImages.length);
    const prevImage = () => setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);


    return (
        <div className="space-y-6">
            {/* Gallery Grid */}
            <div className="flex flex-wrap gap-3">
                {allImages.map((img, idx) => (
                    <div
                        key={idx}
                        onClick={() => openFullscreen(img.src)}
                        className={cn(
                            "group relative flex-grow basis-[calc(100%/6-12px)] min-w-[150px] aspect-square rounded-[24px] overflow-hidden border-2 border-slate-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100 transition-all cursor-pointer bg-slate-50"
                        )}
                    >
                        <Image
                            src={img.src}
                            alt={img.label}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            unoptimized
                            style={(() => {
                                // Apply thumbnail settings ONLY to the front image (primary)
                                if (img.type === "front" && thumbnailSettings) {
                                    return {
                                        transform: `scale(${thumbnailSettings.zoom || 1}) translate(${thumbnailSettings.x ?? 0}%, ${thumbnailSettings.y ?? 0}%)`
                                    };
                                }
                                return {};
                            })()}
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {isEditing && (
                                <div className="flex gap-2">
                                    <label
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-3 bg-white rounded-2xl text-indigo-600 shadow-xl hover:scale-110 transition-transform cursor-pointer"
                                    >
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) onImageChange(file, img.type as "front" | "back" | "side" | "details", img.index);
                                            }}
                                        />
                                        <RefreshCcw className="w-4 h-4" />
                                    </label>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onImageRemove(img.type as "front" | "back" | "side" | "details", img.index);
                                        }}
                                        className="p-3 bg-white rounded-2xl text-rose-500 shadow-xl hover:scale-110 transition-transform"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Label Overlay */}
                        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-white text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            {img.label}
                        </div>
                    </div>
                ))}

                {/* Add New Button */}
                {isEditing && (
                    <label className="flex-grow basis-[calc(100%/6-12px)] min-w-[150px] aspect-square rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer">
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onImageChange(file, "details");
                            }}
                        />
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Добавить фото</span>
                    </label>
                )}
            </div>

            {/* Fullscreen Modal */}
            {fullscreen && (
                <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center">
                    <button
                        onClick={() => setFullscreen(false)}
                        className="absolute top-10 right-10 w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95 z-[110]"
                    >
                        <RefreshCcw className="w-6 h-6 rotate-45" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-10 w-16 h-16 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10 transition-all z-[110]"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <div className="relative w-[90vw] h-[80vh]">
                        <Image
                            src={allImages[currentIndex].src}
                            alt="Full view"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-10 w-16 h-16 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10 transition-all z-[110]"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    <div className="absolute bottom-10 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white/40 text-xs font-black tracking-widest z-[110]">
                        {currentIndex + 1} / {allImages.length}
                    </div>
                </div>
            )}
        </div>
    );
}
