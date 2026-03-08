import React from "react";
import Image from "next/image";
import { ImageIcon, Trash2, Maximize2, Plus, ImagePlus, RefreshCw, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";
import { ModernImageGallery } from "@/components/ui/modern-image-gallery";
import { useItemDetail } from "../context/ItemDetailContext";

const PHOTOS_PER_PAGE = 5;

interface ItemMediaSectionProps {
    item: InventoryItem;
    isEditing: boolean;
    onImageChange: (file: File | null, type: "front" | "back" | "side" | "details", index?: number) => void;
    onImageRemove: (type: "front" | "back" | "side" | "details", index?: number) => void;
}

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
    const { uploads, cancelUpload } = useItemDetail();
    const allImages = React.useMemo(() => getAllItemImages(item), [item]);

    // Index mapping for useImageUploader
    const getTypeIndex = (type: "front" | "back" | "side" | "details", index?: number) => {
        if (type === "front") return 0;
        if (type === "back") return 1;
        if (type === "side") return 2;
        if (type === "details") return 3 + (index ?? 0);
        return 0;
    };

    const [galleryOpen, setGalleryOpen] = React.useState(false);
    const [galleryIndex, setGalleryIndex] = React.useState(0);
    const [page, setPage] = React.useState(0);
    const [slideKey, setSlideKey] = React.useState(0);
    const [slideFrom, setSlideFrom] = React.useState<"right" | "left" | null>(null);
    const [isAnimating, setIsAnimating] = React.useState(false);

    // Visible images depend on editing mode
    const visibleImages = React.useMemo(
        () => isEditing ? allImages : allImages.filter(i => i.src),
        [allImages, isEditing]
    );

    const totalPages = Math.max(1, Math.ceil(visibleImages.length / PHOTOS_PER_PAGE));
    const safePage = Math.min(page, totalPages - 1);
    const pageImages = visibleImages.slice(safePage * PHOTOS_PER_PAGE, (safePage + 1) * PHOTOS_PER_PAGE);

    const goToPage = (newPage: number, dir: "left" | "right") => {
        if (isAnimating || newPage === safePage || newPage < 0 || newPage >= totalPages) return;
        setIsAnimating(true);
        setSlideFrom(dir);
        setPage(newPage);
        setSlideKey(k => k + 1);
        setTimeout(() => setIsAnimating(false), 350);
    };

    const handleFullscreenOpen = (src: string | null) => {
        if (!src) return;
        const idx = allImages.findIndex(img => img.src === src);
        setGalleryIndex(idx >= 0 ? idx : 0);
        setGalleryOpen(true);
    };

    const GalleryUploadButton = ({
        type, index, label, isMain = false
    }: {
        type: "front" | "back" | "side" | "details";
        index?: number;
        label: string;
        isMain?: boolean;
    }) => {
        const globalIndex = getTypeIndex(type, index);
        const state = uploads.states[globalIndex];
        const isUploading = state?.uploading;

        return (
            <label className={cn(
                "w-full h-full flex flex-col items-center justify-center transition-colors group/u",
                isUploading ? "cursor-default bg-slate-100" : "cursor-pointer hover:bg-slate-900/5"
            )}>
                {!isUploading && <input
                    type="file" className="hidden" accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onImageChange(file, type, index);
                    }}
                />}

                {isUploading ? (
                    <div className="relative flex flex-col items-center">
                        <div className="relative w-16 h-16 flex items-center justify-center mb-3">
                            <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-black text-slate-900">{state.progress}%</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 rounded-full text-xs font-bold border-slate-200 hover:bg-white active:scale-95"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); cancelUpload(globalIndex); }}
                        >
                            <X className="w-3 h-3 mr-1" />
                            Отмена
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className={cn(
                            "rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-900 mb-3 transition-all group-hover/u:scale-110 active:scale-90",
                            isMain ? "w-16 h-16" : "w-12 h-12"
                        )}>
                            <Plus className={isMain ? "w-8 h-8" : "w-6 h-6"} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 group-hover/u:text-slate-900 transition-colors">{label}</span>
                    </>
                )}
            </label>
        );
    };

    const mainImg = pageImages[0];
    const secondaryImgs = pageImages.slice(1);

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center text-background transition-all shadow-sm">
                        <ImageIcon className="w-6 h-6" aria-label="Image placeholder" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground font-black tracking-tight">Галерея</h3>
                        <p className="text-xs font-bold text-muted-foreground mt-0.5 opacity-60">
                            Загружено {allImages.filter(i => i.src).length} из {allImages.length} {allImages.length === 1 ? "фотографии" : "фотографий"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => goToPage(safePage - 1, "left")}
                                disabled={safePage === 0 || isAnimating}
                                aria-label="Предыдущая страница"
                                className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all border",
                                    safePage === 0
                                        ? "border-slate-100 text-slate-300 cursor-not-allowed"
                                        : "border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 active:scale-95"
                                )}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1 px-0.5">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        aria-label={`Лист #${i + 1}`}
                                        onClick={() => goToPage(i, i > safePage ? "right" : "left")}
                                        className={cn(
                                            "rounded-full transition-all duration-300",
                                            i === safePage
                                                ? "w-5 h-2 bg-slate-900"
                                                : "w-2 h-2 bg-slate-300 hover:bg-slate-500"
                                        )}
                                    />
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => goToPage(safePage + 1, "right")}
                                disabled={safePage >= totalPages - 1 || isAnimating}
                                aria-label="Следующая страница"
                                className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all border",
                                    safePage >= totalPages - 1
                                        ? "border-slate-100 text-slate-300 cursor-not-allowed"
                                        : "border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 active:scale-95"
                                )}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {isEditing && allImages.some(i => !i.src) && (
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

            <div className="relative overflow-hidden rounded-[40px] border border-slate-100 p-1 bg-slate-50/30">
                <div
                    key={slideKey}
                    style={{
                        animation: slideFrom === "right"
                            ? "slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both"
                            : slideFrom === "left"
                                ? "slideInFromLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) both"
                                : "fadeIn 0.3s ease both"
                    }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-1"
                >
                    {mainImg && (mainImg.src || isEditing) && (
                        <div
                            role="button"
                            tabIndex={mainImg.src ? 0 : -1}
                            onClick={() => { if (mainImg.src) handleFullscreenOpen(mainImg.src); }}
                            className={cn(
                                "group/item relative rounded-[36px] overflow-hidden border transition-all duration-500 bg-white aspect-square sm:col-span-2 sm:row-span-2",
                                mainImg.src ? "cursor-pointer hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] ring-1 ring-slate-100" : "border-dashed border-slate-200"
                            )}
                        >
                            {mainImg.src ? (
                                <>
                                    <Image
                                        src={mainImg.src}
                                        alt={mainImg.label}
                                        fill
                                        priority={true}
                                        className="object-cover transition-transform duration-1000 ease-out group-hover/item:scale-105"
                                        unoptimized
                                    />
                                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover/item:opacity-100 transition-all duration-500 translate-y-4 group-hover/item:translate-y-0">
                                        <span className="text-xs font-black text-white/50 mb-2 block">Основной ракурс</span>
                                        <h4 className="text-3xl font-black text-white tracking-tight">{mainImg.label}</h4>
                                    </div>
                                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-all translate-x-4 group-hover/item:translate-x-0">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform">
                                            <Maximize2 className="w-5 h-5" />
                                        </div>
                                    </div>
                                </>
                            ) : isEditing && (
                                <GalleryUploadButton type={mainImg.type} index={mainImg.index} label="Добавить основное фото" isMain />
                            )}
                        </div>
                    )}

                    {secondaryImgs.map((img, idx) => {
                        if (!img.src && !isEditing) return null;
                        const globalIndex = getTypeIndex(img.type, img.index);
                        const state = uploads.states[globalIndex];
                        const isUploading = state?.uploading;

                        return (
                            <div
                                key={`${safePage}-${idx}`}
                                role="button"
                                tabIndex={img.src ? 0 : -1}
                                onClick={() => { if (img.src) handleFullscreenOpen(img.src); }}
                                className={cn(
                                    "group/item relative rounded-[28px] overflow-hidden border transition-all duration-500 bg-white aspect-square",
                                    img.src ? "cursor-pointer hover:shadow-2xl hover:shadow-slate-900/10 ring-1 ring-slate-100" : "border-dashed border-slate-200"
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
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white scale-90 group-hover/item:scale-100 transition-transform">
                                                <Maximize2 className="w-5 h-5" />
                                            </div>
                                        </div>
                                        {isEditing && (
                                            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover/item:opacity-100 transition-all translate-x-2 group-hover/item:translate-x-0">
                                                <Button
                                                    variant="destructive" size="icon" className="w-9 h-9 rounded-xl p-0 shadow-lg border-none"
                                                    onClick={(e) => { e.stopPropagation(); onImageRemove(img.type, img.index); }}
                                                >
                                                    <Trash2 className="w-4 h-4 text-white" />
                                                </Button>
                                                <Button
                                                    variant="secondary" size="icon" className="w-9 h-9 rounded-xl p-0 shadow-lg bg-white hover:bg-slate-50 text-slate-900 border-none"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <label className="cursor-pointer w-full h-full flex items-center justify-center">
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
                                    <GalleryUploadButton type={img.type} index={img.index} label={img.label} />
                                )}

                                {isUploading && (
                                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                                        <Loader2 className="w-8 h-8 text-slate-900 animate-spin mb-2" />
                                        <div className="text-sm font-black text-slate-900 mb-2">{state.progress}%</div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs font-bold text-slate-500 hover:text-red-600"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); cancelUpload(globalIndex); }}
                                        >
                                            Отмена
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @keyframes slideInFromRight {
                    from { opacity: 0; transform: translateX(40px) scale(0.98); }
                    to   { opacity: 1; transform: translateX(0) scale(1); }
                }
                @keyframes slideInFromLeft {
                    from { opacity: 0; transform: translateX(-40px) scale(0.98); }
                    to   { opacity: 1; transform: translateX(0) scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
            `}</style>

            <ModernImageGallery
                isOpen={galleryOpen}
                onClose={() => setGalleryOpen(false)}
                images={allImages}
                initialIndex={galleryIndex}
                itemName={item.name}
            />
        </div>
    );
});

ItemMediaSection.displayName = "ItemMediaSection";
