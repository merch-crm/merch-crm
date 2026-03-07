"use client";

import React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGalleryLightbox } from "@/components/hooks/useGalleryLightbox";

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
    itemName
}: ModernImageGalleryProps) {
    const {
        fullscreen,
        currentIndex,
        imageZoomed,
        lightboxRef,
        setFullscreen,
        setCurrentIndex,
        setImageZoomed,
        handleKeyDown,
        nextImage,
        prevImage
    } = useGalleryLightbox(images.length);

    // Sync initial index when opening
    React.useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setFullscreen(true);
            setImageZoomed(false);
        }
    }, [isOpen, initialIndex, setCurrentIndex, setFullscreen, setImageZoomed]);

    // Handle internal close to sync with parent
    const handleClose = React.useCallback(() => {
        setFullscreen(false);
        onClose();
    }, [onClose, setFullscreen]);

    if (!isOpen || !fullscreen) return null;

    const content = (
        <div
            ref={lightboxRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-[--padding-xl] animate-in fade-in duration-300 outline-none"
            role="dialog"
            aria-modal="true"
            data-dialog-open="true"
        >
            {/* Backdrop */}
            <div
                role="button"
                tabIndex={0}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClose(); } }}
                onClick={handleClose}
            />

            {/* Close Button */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClose}
                aria-label="Закрыть"
                className="absolute top-8 right-8 w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-white hover:bg-white hover:text-foreground active:scale-95 transition-all z-[110] border border-white/10 group p-0"
            >
                <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-500" />
            </Button>

            {/* Navigation */}
            {images.length > 1 && (
                <>
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
                </>
            )}

            {/* Main Content */}
            <div className="relative w-full max-w-5xl aspect-square md:aspect-auto h-full flex flex-col items-center justify-center gap-3 z-[105]">
                <div className="relative w-full h-[70vh] flex items-center justify-center">
                    {images[currentIndex]?.src && (
                        <button
                            type="button"
                            className="relative w-full h-full block"
                            onClick={() => setImageZoomed(!imageZoomed)}
                            aria-label="Увеличить/уменьшить изображение"
                        >
                            <Image
                                src={images[currentIndex].src || ""}
                                alt={images[currentIndex].alt || itemName || "Изображение"}
                                fill
                                className={cn("object-contain rounded-3xl shadow-2xl transition-transform duration-700 ease-out",
                                    imageZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                                )}
                                unoptimized
                            />
                        </button>
                    )}
                </div>

                <div className="px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-500">
                    <span className="text-xs font-bold text-white">{images[currentIndex]?.label || itemName}</span>
                    <div className="w-px h-4 bg-white/20" />
                    <span className="text-xs font-bold text-white/40">{currentIndex + 1} / {images.length}</span>
                </div>
            </div>

            {/* Bottom Thumbnails */}
            {images.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 animate-in slide-in-from-bottom-8 duration-700">
                    {images.map((img, i) => (
                        <Button
                            key={i}
                            type="button"
                            variant="ghost"
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setCurrentIndex(i); }}
                            className={cn("relative w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-300 p-0 min-w-0 flex-shrink-0",
                                i === currentIndex ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-transparent opacity-40 hover:opacity-100"
                            )}
                        >
                            {img.src ? (
                                <Image src={img.src} alt={`Миниатюра: ${img.label || i}`} fill className="object-cover" unoptimized />
                            ) : (
                                <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-muted-foreground" aria-label="Image icon" />
                                </div>
                            )}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );

    if (typeof document === "undefined") return null;
    return createPortal(content, document.body);
}
