"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ImageIcon, RefreshCcw, Trash2, ChevronLeft, ChevronRight, Maximize2, X, Plus, Star, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";
import { useDraggableScroll } from "@/components/hooks/useDraggableScroll";
import { useGalleryLightbox } from "@/components/hooks/useGalleryLightbox";

interface ItemMediaSectionProps {
    item: InventoryItem;
    isEditing: boolean;
    // For editing
    onImageChange: (file: File | null, type: "front" | "back" | "side" | "details", index?: number) => void;
    onImageRemove: (type: "front" | "back" | "side" | "details", index?: number) => void;
    onSetMain: (type: "front" | "back" | "side" | "details", index?: number) => void;
    onImageClick?: (index: number) => void;
    uploadStates?: Record<string, UploadState>;
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
    onImageRemove,
    onSetMain,
    onImageClick,
    uploadStates
}: ItemMediaSectionProps) => {
    const allImages = React.useMemo(() => getAllItemImages(item), [item]);
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

    // Draggable Scroll Logic
    const { ref: scrollRef, isDragging, dragDistance, events: scrollEvents } = useDraggableScroll<HTMLDivElement>();

    // Lightbox Logic
    const {
        fullscreen,
        currentIndex,
        imageZoomed,
        lightboxRef,
        setFullscreen,
        setCurrentIndex,
        setImageZoomed,
        openFullscreen,
        nextImage,
        prevImage,
        handleKeyDown
    } = useGalleryLightbox(allImages.length);

    const handleFullscreenOpen = (src: string | null) => {
        if (!src) return;
        const idx = allImages.findIndex(img => img.src === src);
        openFullscreen(idx);
    };

    return (
        <div className="space-y-4">
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

                <div className="flex items-center gap-3">
                    {allImages.some(i => !i.src) && (
                        <Button
                            asChild
                            type="button"
                            variant="btn-dark"
                            className="h-10 px-6 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center gap-2 border-none"
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
                                                setLoadingIndex(firstEmptyIdx);
                                                onImageChange(file, img.type, img.index);
                                            }
                                        }
                                    }}
                                />
                                <ImagePlus className="w-4 h-4" aria-label="Add image" />
                                <span>Добавить больше</span>
                            </label>
                        </Button>
                    )}
                </div>
            </div>

            {/* Gallery Grid: Modern Mosaic / Horizontal Scroll */}
            <div className="relative group/gallery">
                <div
                    ref={scrollRef}
                    {...scrollEvents}
                    className={cn(
                        "flex overflow-x-auto gap-3 snap-x snap-mandatory no-scrollbar",
                        isDragging ? "cursor-grabbing select-none snap-none scroll-auto" : "cursor-grab snap-x scroll-smooth"
                    )}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {allImages.map((img, idx) => {
                        if (!img.src && !isEditing) return null;
                        return (
                            <div
                                role="button"
                                tabIndex={img.src ? 0 : -1}
                                key={idx}
                                onClick={() => {
                                    if (dragDistance < 15 && img.src) {
                                        if (onImageClick) {
                                            onImageClick(idx);
                                        } else {
                                            handleFullscreenOpen(img.src);
                                        }
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        if (img.src) {
                                            if (onImageClick) onImageClick(idx);
                                            else handleFullscreenOpen(img.src);
                                        }
                                    }
                                }}
                                aria-label={`Просмотреть ${img.label}`}
                                className={cn(
                                    "group relative flex-none w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-2xl overflow-hidden border transition-all duration-500 bg-muted/30 snap-start",
                                    img.src
                                        ? "border-border/60 hover:border-border hover:shadow-2xl hover:shadow-black/5 cursor-pointer"
                                        : "border-dashed border-border hover:bg-muted/50"
                                )}
                            >
                                {img.src ? (
                                    <>
                                        <Image
                                            src={img.src}
                                            alt={img.label}
                                            fill
                                            className="object-cover transition-transform duration-1000 ease-out"
                                            unoptimized
                                        />

                                        {/* Glassmorphism Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <p className="text-xs font-bold text-white">{img.label}</p>
                                        </div>

                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Action Buttons */}
                                        {isEditing && (
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    aria-label="Удалить изображение"
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        onImageRemove(img.type, img.index);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center bg-rose-500 text-white rounded-2xl shadow-lg hover:bg-rose-600 active:scale-90 transition-all z-20 p-0 border-none"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>

                                                <Button
                                                    asChild
                                                    type="button"
                                                    variant="secondary"
                                                    size="icon"
                                                    aria-label="Изменить изображение"
                                                    className="w-8 h-8 flex items-center justify-center rounded-2xl shadow-lg active:scale-90 transition-all cursor-pointer z-20 p-0 border-none"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <label>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setLoadingIndex(idx);
                                                                    onImageChange(file, img.type, img.index);
                                                                }
                                                            }}
                                                        />
                                                        <RefreshCcw className="w-4 h-4" />
                                                    </label>
                                                </Button>

                                                {img.type !== "front" && (
                                                    <Button
                                                        type="button"
                                                        variant="btn-dark"
                                                        size="icon"
                                                        aria-label="Сделать основным"
                                                        onClick={(e: React.MouseEvent) => {
                                                            e.stopPropagation();
                                                            onSetMain(img.type, img.index);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center btn-dark rounded-2xl shadow-lg active:scale-90 transition-all border-none z-20 p-0"
                                                    >
                                                        <Star className="w-4 h-4 fill-current" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white/30">
                                            <Maximize2 className="w-5 h-5" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                        {(isEditing && uploadStates?.[img.type]?.uploading && loadingIndex === idx) ? (
                                            <div className="flex flex-col items-center justify-center gap-3 w-full h-full animate-in fade-in duration-300">
                                                <div className="relative w-12 h-12 flex items-center justify-center">
                                                    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                                        <path
                                                            className="text-muted/30"
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                        />
                                                        <path
                                                            className="text-primary transition-all duration-300 ease-out"
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                            strokeDasharray={`${uploadStates?.[img.type]?.progress ?? 0}, 100`}
                                                        />
                                                    </svg>
                                                    <span className="absolute text-xs font-bold text-primary">
                                                        {uploadStates?.[img.type]?.progress ?? 0}%
                                                    </span>
                                                </div>
                                                <span className="text-xs font-bold text-muted-foreground animate-pulse">Загрузка...</span>
                                            </div>
                                        ) : !isEditing ? (
                                            <div className="w-10 h-10 rounded-2xl bg-card shadow-sm flex items-center justify-center">
                                                <ImageIcon className="w-5 h-5 text-muted-foreground/50" aria-label="No image" />
                                            </div>
                                        ) : (
                                            <Button
                                                asChild
                                                type="button"
                                                variant="ghost"
                                                className="w-full h-full flex flex-col items-center justify-center p-0 rounded-2xl border-none hover:bg-primary/5 group/upload"
                                            >
                                                <label className="cursor-pointer">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setLoadingIndex(idx);
                                                                onImageChange(file, img.type, img.index);
                                                            }
                                                        }}
                                                    />
                                                    <div className="w-10 h-10 flex items-center justify-center bg-primary/5 text-primary rounded-2xl group-hover/upload:bg-primary group-hover/upload:text-white transition-all transform group-hover/upload:rotate-90 group-hover/upload:shadow-lg mb-2">
                                                        <Plus className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-xs font-bold text-muted-foreground group-hover/upload:text-primary transition-colors">Добавить</span>
                                                </label>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Lightbox Overlay */}
            {fullscreen && (
                <div
                    ref={lightboxRef}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300 outline-none"
                    role="dialog"
                    aria-modal="true"
                    data-dialog-open="true"
                >
                    {/* Backdrop */}
                    <div role="button" tabIndex={0}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={() => setFullscreen(false)}
                    />

                    {/* Close Button */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFullscreen(false)}
                        aria-label="Закрыть"
                        className="absolute top-8 right-8 w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-white hover:bg-white hover:text-foreground active:scale-95 transition-all z-[110] border border-white/10 group p-0"
                    >
                        <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-500" />
                    </Button>

                    {/* Navigation */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Назад"
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-10 w-14 h-14 hidden md:flex items-center justify-center rounded-2xl bg-white/5 text-white hover:bg-white hover:text-foreground border border-white/10 transition-all z-[110] backdrop-blur-md active:scale-90 p-0"
                    >
                        <ChevronLeft className="w-7 h-7" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Вперед"
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-10 w-14 h-14 hidden md:flex items-center justify-center rounded-2xl bg-white/5 text-white hover:bg-white hover:text-foreground border border-white/10 transition-all z-[110] backdrop-blur-md active:scale-90 p-0"
                    >
                        <ChevronRight className="w-7 h-7" />
                    </Button>

                    {/* Main Content */}
                    <div className="relative w-full max-w-5xl aspect-square md:aspect-auto h-full flex flex-col items-center justify-center gap-3 z-[105]">
                        <div className="relative w-full h-[70vh] flex items-center justify-center">
                            {allImages[currentIndex].src && (
                                <button
                                    type="button"
                                    className="relative w-full h-full block"
                                    onClick={() => setImageZoomed(!imageZoomed)}
                                    aria-label="Увеличить/уменьшить изображение"
                                >
                                    <Image
                                        src={allImages[currentIndex].src || ""}
                                        alt={allImages[currentIndex].label}
                                        fill
                                        className={cn(
                                            "object-contain rounded-3xl shadow-2xl transition-transform duration-700 ease-out",
                                            imageZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                                        )}
                                        unoptimized
                                    />
                                </button>
                            )}
                        </div>

                        <div className="px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-3">
                            <span className="text-xs font-bold text-white">{allImages[currentIndex].label}</span>
                            <div className="w-px h-4 bg-white/20" />
                            <span className="text-xs font-bold text-white/40">{currentIndex + 1} / {allImages.length}</span>
                        </div>
                    </div>

                    {/* Bottom Thumbnails */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
                        {allImages.map((img, i) => (
                            <Button
                                key={i}
                                type="button"
                                variant="ghost"
                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); setCurrentIndex(i); }}
                                className={cn(
                                    "relative w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-300 p-0 min-w-0 flex-shrink-0",
                                    i === currentIndex ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-transparent opacity-40 hover:opacity-100"
                                )}
                            >
                                {img.src ? (
                                    <Image src={img.src} alt={`Миниатюра: ${img.label}`} fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 text-muted-foreground" aria-label="Image icon" />
                                    </div>
                                )}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

ItemMediaSection.displayName = "ItemMediaSection";
