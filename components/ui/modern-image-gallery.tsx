"use client";

import React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GalleryImage {
    src: string | null;
    label?: string;
    alt?: string;
}

interface ModernImageGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    images: GalleryImage[];
    initialIndex?: number;
    itemName?: string;
}

export function ModernImageGallery({
    isOpen,
    onClose,
    images,
    initialIndex = 0,
    itemName,
}: ModernImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
    const [zoomed, setZoomed] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Sync index when opening
    React.useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setZoomed(false);
            // Focus trap
            setTimeout(() => containerRef.current?.focus(), 50);
        }
    }, [isOpen, initialIndex]);

    const validImages = React.useMemo(() => images.filter(img => img.src), [images]);

    const goNext = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setZoomed(false);
        setCurrentIndex(prev => (prev + 1) % validImages.length);
    }, [validImages.length]);

    const goPrev = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setZoomed(false);
        setCurrentIndex(prev => (prev - 1 + validImages.length) % validImages.length);
    }, [validImages.length]);

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
        else if (e.key === "Escape") { e.preventDefault(); onClose(); }
        else if (e.key === "z" || e.key === "Z") { setZoomed(v => !v); }
    }, [goNext, goPrev, onClose]);

    if (!isOpen || validImages.length === 0) return null;

    const current = validImages[currentIndex] ?? validImages[0];

    const content = (
        <div
            ref={containerRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="fixed inset-0 outline-none"
            style={{ zIndex: 99999 }}
            role="dialog"
            aria-modal="true"
        >
            {/* Full black backdrop */}
            <button
                className="absolute inset-0 bg-black cursor-default w-full h-full border-none p-0 outline-none"
                onClick={onClose}
                aria-label="Закрыть галерею"
                type="button"
            />

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="text-white/40 text-xs font-bold">
                        {itemName}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setZoomed(v => !v)}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all"
                        aria-label={zoomed ? "Уменьшить" : "Увеличить"}
                    >
                        {zoomed
                            ? <ZoomOut className="w-4 h-4" />
                            : <ZoomIn className="w-4 h-4" />
                        }
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all"
                        aria-label="Закрыть"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Image */}
            <div className="absolute inset-0 flex items-center justify-center px-20 py-20">
                <button
                    type="button"
                    className={cn(
                        "relative w-full h-full transition-transform duration-500 ease-out border-none p-0 bg-transparent outline-none",
                        zoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                    )}
                    onClick={() => setZoomed(v => !v)}
                    aria-label={zoomed ? "Уменьшить" : "Увеличить"}
                >
                    {current.src && (
                        <Image src={current.src} alt={current.alt || current.label || itemName || "Изображение"} fill className="object-contain select-none" unoptimized priority draggable={false} />
                    )}
                </button>
            </div>

            {/* Left Arrow */}
            {validImages.length > 1 && (
                <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-90 border border-white/10"
                    aria-label="Предыдущее"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}

            {/* Right Arrow */}
            {validImages.length > 1 && (
                <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-90 border border-white/10"
                    aria-label="Следующее"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}

            {/* Bottom: counter + thumbnails */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center gap-3 pb-6">
                {/* Label & counter */}
                <div className="flex items-center gap-3">
                    {current.label && (
                        <>
                            <span className="text-white text-sm font-bold">{current.label}</span>
                            <div className="w-1 h-1 rounded-full bg-white/30" />
                        </>
                    )}
                    <span className="text-white/40 text-sm font-bold">
                        {currentIndex + 1} / {validImages.length}
                    </span>
                </div>

                {/* Thumbnails */}
                {validImages.length > 1 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10">
                        {validImages.map((img, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); setZoomed(false); }}
                                className={cn(
                                    "relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0",
                                    i === currentIndex
                                        ? "border-white scale-110 shadow-lg"
                                        : "border-transparent opacity-40 hover:opacity-80"
                                )}
                                aria-label={`Фото ${i + 1}`}
                            >
                                {img.src ? (
                                    <Image src={img.src} alt={img.label || `Фото ${i + 1}`} fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                        <ImageIcon className="w-4 h-4 text-white/40" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    if (typeof document === "undefined") return null;
    return createPortal(content, document.body);
}
