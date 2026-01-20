"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageIcon, RefreshCcw, Trash2, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
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
        if (item.image) images.push({ src: item.image, label: "Face", type: "front" });
        if (item.imageBack) images.push({ src: item.imageBack, label: "Back", type: "back" });
        if (item.imageSide) images.push({ src: item.imageSide, label: "Side", type: "side" });
        if (item.imageDetails) {
            item.imageDetails.forEach((src: string, idx: number) => {
                images.push({ src, label: `D-${idx + 1}`, type: "details", index: idx });
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Gallery Grid: FinTech Modern Style */}
            <div className="flex flex-wrap gap-6">
                {allImages.map((img, idx) => (
                    <div
                        key={idx}
                        onClick={() => openFullscreen(img.src)}
                        className={cn(
                            "group relative flex-grow basis-[calc(20%-24px)] min-w-[160px] aspect-square rounded-[18px] overflow-hidden border border-slate-200 hover:border-indigo-500 transition-all cursor-pointer bg-white shadow-sm"
                        )}
                    >
                        <Image
                            src={img.src}
                            alt={img.label}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3"
                            unoptimized
                            style={(() => {
                                if (img.type === "front" && thumbnailSettings) {
                                    return {
                                        transform: `scale(${thumbnailSettings.zoom || 1}) translate(${thumbnailSettings.x ?? 0}%, ${thumbnailSettings.y ?? 0}%)`
                                    };
                                }
                                return {};
                            })()}
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                            <Maximize2 className="w-6 h-6 text-white" />

                            {isEditing && (
                                <div className="flex gap-2">
                                    <label
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-3 bg-white rounded-[18px] text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-md"
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
                                        className="p-3 bg-rose-500 rounded-[18px] text-white hover:bg-rose-600 transition-all shadow-md"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Type Indicator */}
                        <div className="absolute top-4 left-4">
                            <div className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-[18px] text-[10px] font-bold text-slate-900 border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
                                {img.label}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Button */}
                {isEditing && (item.imageDetails?.length || 0) < 3 && (
                    <label className="flex-grow basis-[calc(20%-24px)] min-w-[160px] aspect-square rounded-[18px] border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-all cursor-pointer group">
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onImageChange(file, "details");
                            }}
                        />
                        <div className="w-12 h-12 rounded-full border border-dashed border-slate-300 flex items-center justify-center group-hover:border-indigo-400 transition-colors mb-4">
                            <ImageIcon className="w-6 h-6 opacity-40 group-hover:opacity-100" />
                        </div>
                        <span className="text-xs font-semibold opacity-40 group-hover:opacity-100">Upload Details</span>
                    </label>
                )}
            </div>

            {/* Carousel Navigation (Visual Hint) */}
            <div className="flex items-center gap-4">
                <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${(currentIndex + 1) / allImages.length * 100}%` }} />
                </div>
                <div className="text-xs font-medium text-slate-500">
                    Source Base: {allImages.length}
                </div>
            </div>

            {/* Fullscreen UI Updated */}
            {fullscreen && (
                <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex items-center justify-center animate-in fade-in duration-500">
                    <button
                        onClick={() => setFullscreen(false)}
                        className="absolute top-10 right-10 w-16 h-16 flex items-center justify-center rounded-[18px] bg-white text-slate-900 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 z-[110] shadow-2xl"
                    >
                        <RefreshCcw className="w-8 h-8 rotate-45" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-10 w-20 h-20 flex items-center justify-center rounded-[18px] bg-white/10 text-white hover:bg-white border border-white/20 hover:text-slate-900 transition-all z-[110] backdrop-blur-md"
                    >
                        <ChevronLeft className="w-10 h-10" />
                    </button>

                    <div className="relative w-[85vw] h-[75vh] group/modal">
                        <Image
                            src={allImages[currentIndex].src}
                            alt="Full view"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                        <div className="absolute top-0 left-0 right-0 py-10 flex justify-center opacity-0 group-hover/modal:opacity-100 transition-opacity">
                            <span className="px-6 py-2 bg-white/10 backdrop-blur-xl rounded-[18px] text-white font-semibold border border-white/20">
                                {allImages[currentIndex].label}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-10 w-20 h-20 flex items-center justify-center rounded-[18px] bg-white/10 text-white hover:bg-white border border-white/20 hover:text-slate-900 transition-all z-[110] backdrop-blur-md"
                    >
                        <ChevronRight className="w-10 h-10" />
                    </button>

                    <div className="absolute bottom-12 flex items-center gap-3">
                        {allImages.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-all duration-300",
                                    i === currentIndex ? "bg-indigo-500 w-10" : "bg-white/30"
                                )}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
