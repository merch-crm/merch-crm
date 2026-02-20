import React, { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface GalleryImage {
    src: string;
    label: string;
}

interface ItemGalleryOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    itemName: string;
    images: GalleryImage[];
    currentIndex: number;
    onIndexChange: (index: number | ((prev: number) => number)) => void;
}

export const ItemGalleryOverlay = React.memo(({
    isOpen,
    onClose,
    itemName,
    images,
    currentIndex,
    onIndexChange,
}: ItemGalleryOverlayProps) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onIndexChange(prev => (typeof prev === 'number' ? (prev - 1 + images.length) % images.length : prev));
            if (e.key === "ArrowRight") onIndexChange(prev => (typeof prev === 'number' ? (prev + 1) % images.length : prev));
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, onIndexChange, images.length]);

    if (!isOpen || images.length === 0) return null;

    return (
        <div
            className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
            aria-label={`Галерея: ${itemName}`}
        >
            {/* Backdrop click to close */}
            <div
                className="absolute inset-0 cursor-pointer"
                onClick={onClose}
                role="button"
                aria-label="Закрыть галерею"
            />
            {/* Header Info */}
            <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-10">
                <div className="flex flex-col">
                    <h3 className="text-white text-xl font-black">{itemName}</h3>
                    <p className="text-white/40 text-xs font-bold mt-1">
                        {images[currentIndex]?.label} — {currentIndex + 1} / {images.length}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    aria-label="Закрыть галерею"
                    className="w-11 h-11 bg-white/5 hover:bg-white/10 active:scale-95 rounded-3xl flex items-center justify-center text-white transition-all border border-white/10 group p-0"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                </Button>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                <Button
                    variant="ghost"
                    aria-label="Предыдущее изображение"
                    onClick={(e) => {
                        e.stopPropagation();
                        onIndexChange(prev => (typeof prev === 'number' ? (prev - 1 + images.length) % images.length : prev));
                    }}
                    className="w-14 h-14 rounded-3xl bg-white/5 hover:bg-white text-white hover:text-slate-900 border border-white/10 transition-all flex items-center justify-center pointer-events-auto active:scale-90 backdrop-blur-xl p-0"
                >
                    <ChevronLeft className="w-7 h-7" />
                </Button>
                <Button
                    variant="ghost"
                    aria-label="Следующее изображение"
                    onClick={(e) => {
                        e.stopPropagation();
                        onIndexChange(prev => (typeof prev === 'number' ? (prev + 1) % images.length : prev));
                    }}
                    className="w-14 h-14 rounded-3xl bg-white/5 hover:bg-white text-white hover:text-slate-900 border border-white/10 transition-all flex items-center justify-center pointer-events-auto active:scale-90 backdrop-blur-xl p-0"
                >
                    <ChevronRight className="w-7 h-7" />
                </Button>
            </div>

            {/* Main Image View */}
            <div className="relative w-full max-w-[85vw] h-[75vh] flex flex-col items-center justify-center z-0 px-4">
                <div className="relative w-full h-[65vh] flex items-center justify-center transition-all duration-500 animate-in zoom-in-95">
                    <Image
                        src={images[currentIndex].src}
                        alt={`${itemName}: ${images[currentIndex]?.label}`}
                        fill
                        className="object-contain drop-shadow-2xl"
                        unoptimized
                        priority
                    />
                </div>

                {/* Centered Caption */}
                <div className="mt-8 px-6 py-2.5 bg-white/10 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="text-white text-sm font-black">
                        {images[currentIndex]?.label}
                    </p>
                </div>
            </div>

            {/* Thumbnails Strip */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 z-10 overflow-x-auto max-w-[90vw] scrollbar-hide">
                {images.map((img, i) => (
                    <Button
                        key={i}
                        variant="ghost"
                        aria-label={`Перейти к изображению ${i + 1}: ${img.label}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onIndexChange(i);
                        }}
                        className={cn(
                            "relative w-16 h-16 rounded-3xl overflow-hidden border-2 transition-all duration-300 p-0 shrink-0",
                            i === currentIndex
                                ? "border-primary scale-110 shadow-lg shadow-primary/20"
                                : "border-transparent opacity-40 hover:opacity-100"
                        )}
                    >
                        <Image src={img.src} alt={`Миниатюра ${i + 1}: ${img.label}`} fill className="object-cover" unoptimized />
                    </Button>
                ))}
            </div>
        </div>
    );
});

ItemGalleryOverlay.displayName = "ItemGalleryOverlay";
