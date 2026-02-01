"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ImageIcon, RefreshCcw, Trash2, ChevronLeft, ChevronRight, Maximize2, X, Plus, Star, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryItem } from "../../../types";

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

export function ItemMediaSection({
    item,
    isEditing,
    onImageChange,
    onImageRemove,
    onSetMain,
    onImageClick,
    uploadStates
}: ItemMediaSectionProps) {
    const allImages = React.useMemo(() => getAllItemImages(item), [item]);
    const [fullscreen, setFullscreen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageZoomed, setImageZoomed] = useState(false);
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

    // Draggable Scroll Logic
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftState, setScrollLeftState] = useState(0);
    const [dragDistance, setDragDistance] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeftState(scrollRef.current.scrollLeft);
        setDragDistance(0);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // multiplier for scroll speed
        scrollRef.current.scrollLeft = scrollLeftState - walk;
        setDragDistance(Math.abs(x - startX));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };


    const openFullscreen = (src: string | null) => {
        if (!src) return;
        const idx = allImages.findIndex(img => img.src === src);
        setCurrentIndex(idx >= 0 ? idx : 0);
        setImageZoomed(false);
        setFullscreen(true);
    };

    const nextImage = () => {
        setCurrentIndex(prev => (prev + 1) % allImages.length);
        setImageZoomed(false);
    };

    const prevImage = () => {
        setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
        setImageZoomed(false);
    };

    // Focus management for keyboard navigation
    const lightboxRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (fullscreen && lightboxRef.current) {
            lightboxRef.current.focus();
        }
    }, [fullscreen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
            setImageZoomed(false);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            setCurrentIndex(prev => (prev + 1) % allImages.length);
            setImageZoomed(false);
        } else if (e.key === "Escape") {
            e.preventDefault();
            setFullscreen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-slate-900 flex items-center justify-center text-white transition-all shadow-sm">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Галерея</h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-1">
                            Загружено {allImages.filter(i => i.src).length} из 6 фото
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {allImages.some(i => !i.src) && (
                        <label className="cursor-pointer group/upload">
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
                            <div className="h-11 px-6 rounded-[var(--radius-inner)] bg-slate-900 hover:bg-black text-white flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-900/10 group">
                                <ImagePlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                <span className="text-[10px] font-bold">Добавить больше</span>
                            </div>
                        </label>
                    )}
                </div>
            </div>

            {/* Gallery Grid: Modern Mosaic / Horizontal Scroll */}
            <div className="relative group/gallery">
                <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    className={cn(
                        "flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar",
                        isDragging ? "cursor-grabbing select-none snap-none scroll-auto" : "cursor-grab snap-x scroll-smooth"
                    )}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {allImages.map((img, idx) => {
                        if (!img.src && !isEditing) return null;
                        return (
                            <div
                                key={idx}
                                onClick={() => {
                                    if (dragDistance < 15 && img.src) {
                                        if (onImageClick) {
                                            onImageClick(idx);
                                        } else {
                                            openFullscreen(img.src);
                                        }
                                    }
                                }}
                                onMouseUp={() => {
                                    // Fallback for very quick clics where dragDistance might be slightly off
                                    if (dragDistance < 3 && img.src && !isDragging) {
                                        if (onImageClick) onImageClick(idx);
                                        else openFullscreen(img.src);
                                    }
                                }}
                                className={cn(
                                    "group relative flex-none w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-[var(--radius-inner)] overflow-hidden border transition-all duration-500 bg-slate-50 snap-start",
                                    img.src
                                        ? "border-slate-200/60 hover:border-slate-300 cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50"
                                        : "border-dashed border-slate-200 hover:bg-slate-100/50"
                                )}
                            >
                                {img.src ? (
                                    <>
                                        <Image
                                            src={img.src}
                                            alt={img.label}
                                            fill
                                            className="object-cover transition-transform duration-1000 cubic-bezier"
                                            unoptimized
                                        />

                                        {/* Glassmorphism Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <p className="text-[10px] font-bold text-white">{img.label}</p>
                                        </div>

                                        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Action Buttons */}
                                        {isEditing && (
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onImageRemove(img.type, img.index);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center bg-rose-500 text-white rounded-[var(--radius-inner)] shadow-lg hover:bg-rose-600 active:scale-90 transition-all z-20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>

                                                <label
                                                    className="w-8 h-8 flex items-center justify-center bg-white text-slate-600 rounded-[var(--radius-inner)] shadow-lg hover:bg-slate-50 hover:text-primary active:scale-90 transition-all cursor-pointer z-20"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
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

                                                {img.type !== "front" && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSetMain(img.type, img.index);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center btn-dark rounded-[var(--radius-inner)] shadow-lg active:scale-90 transition-all border-none z-20"
                                                    >
                                                        <Star className="w-4 h-4 fill-current" />
                                                    </button>
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
                                                            className="text-slate-100"
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
                                                            strokeDasharray={`${uploadStates[img.type].progress}, 100`}
                                                        />
                                                    </svg>
                                                    <span className="absolute text-[10px] font-bold text-primary">
                                                        {uploadStates[img.type].progress}%
                                                    </span>
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400 animate-pulse">Загрузка...</span>
                                            </div>
                                        ) : !isEditing ? (
                                            <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-white shadow-sm flex items-center justify-center">
                                                <ImageIcon className="w-5 h-5 text-slate-300" />
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer group/upload flex flex-col items-center justify-center w-full h-full">
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
                                                <div className="w-10 h-10 flex items-center justify-center bg-primary/5 text-primary rounded-[var(--radius-inner)] group-hover/upload:bg-primary group-hover/upload:text-white transition-all transform group-hover/upload:rotate-90 group-hover/upload:shadow-lg mb-2">
                                                    <Plus className="w-5 h-5" />
                                                </div>
                                                <span className="text-[8px] font-bold text-slate-400 group-hover/upload:text-primary transition-colors">Добавить</span>
                                            </label>
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
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={() => setFullscreen(false)}
                    />

                    {/* Close Button */}
                    <button
                        onClick={() => setFullscreen(false)}
                        className="absolute top-8 right-8 w-11 h-11 flex items-center justify-center rounded-[var(--radius-inner)] bg-white/5 text-white hover:bg-white hover:text-slate-900 active:scale-95 transition-all z-[110] border border-white/10 group"
                    >
                        <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-500" />
                    </button>

                    {/* Navigation */}
                    <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-10 w-14 h-14 hidden md:flex items-center justify-center rounded-[var(--radius-inner)] bg-white/5 text-white hover:bg-white hover:text-slate-900 border border-white/10 transition-all z-[110] backdrop-blur-md active:scale-90"
                    >
                        <ChevronLeft className="w-7 h-7" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-10 w-14 h-14 hidden md:flex items-center justify-center rounded-[var(--radius-inner)] bg-white/5 text-white hover:bg-white hover:text-slate-900 border border-white/10 transition-all z-[110] backdrop-blur-md active:scale-90"
                    >
                        <ChevronRight className="w-7 h-7" />
                    </button>

                    {/* Main Content */}
                    <div className="relative w-full max-w-5xl aspect-square md:aspect-auto h-full flex flex-col items-center justify-center gap-8 z-[105]">
                        <div className="relative w-full h-[70vh] flex items-center justify-center">
                            {allImages[currentIndex].src && (
                                <Image
                                    src={allImages[currentIndex].src || ""}
                                    alt="Full view"
                                    fill
                                    className={cn(
                                        "object-contain rounded-[var(--radius-outer)] shadow-2xl transition-transform duration-700 ease-out",
                                        imageZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                                    )}
                                    onClick={() => setImageZoomed(!imageZoomed)}
                                    unoptimized
                                />
                            )}
                        </div>

                        <div className="px-6 py-3 bg-white/5 backdrop-blur-xl rounded-[var(--radius-inner)] border border-white/10 flex items-center gap-4">
                            <span className="text-[10px] font-bold text-white">{allImages[currentIndex].label}</span>
                            <div className="w-px h-4 bg-white/20" />
                            <span className="text-[10px] font-bold text-white/40">{currentIndex + 1} / 6</span>
                        </div>
                    </div>

                    {/* Bottom Thumbnails */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-white/5 backdrop-blur-xl rounded-[var(--radius-outer)] border border-white/10">
                        {allImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                className={cn(
                                    "relative w-16 h-16 rounded-[var(--radius-inner)] overflow-hidden border-2 transition-all duration-300",
                                    i === currentIndex ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-transparent opacity-40 hover:opacity-100"
                                )}
                            >
                                {img.src ? (
                                    <Image src={img.src} alt="thumb" fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 text-slate-600" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
