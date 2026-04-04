import React from "react";
import Image from "next/image";
import { Trash2, Maximize2, ImagePlus, RefreshCw, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";
import { ModernImageGallery } from "@/components/ui/modern-image-gallery";
import { useItemDetail } from "../context/ItemDetailContext";
import { pluralize } from "@/lib/pluralize";
import { playSound } from "@/lib/sounds";

const PHOTOS_PER_PAGE = 5;

interface ItemMediaSectionProps {
    item: InventoryItem;
    isEditing: boolean;
    onImageChange: (file: File | null, type: "front" | "back" | "side" | "details", index?: number) => void;
    onImageRemove: (type: "front" | "back" | "side" | "details", index?: number) => void;
}

/**
 * Получает название для количества изображений с учетом русской плюрализации
 */
function getImagesCountLabel(count: number) {
    return `${count} ${pluralize(count, "изображение", "изображения", "изображений")}`;
}

function getAllItemImages(item: InventoryItem) {
    const images: { src: string | null; label: string, type: "front" | "back" | "side" | "details", index?: number }[] = [
        { src: item.image || null, label: "Основное", type: "front" },
        { src: item.imageBack || null, label: "Вид сзади", type: "back" },
        { src: item.imageSide || null, label: "Вид сбоку", type: "side" },
    ];

    const detailsCount = item.imageDetails ? item.imageDetails.length : 0;
    const slotsCount = Math.max(3, detailsCount + 1);

    for (let i = 0; i < slotsCount; i++) {
        images.push({
            src: (item.imageDetails && item.imageDetails[i]) || null,
            label: `Деталь ${i + 1}`,
            type: "details",
            index: i
        });
    }

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

    // Маппинг индексов для useImageUploader
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

    // Видимые изображения зависят от режима редактирования
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
        type, index, isMain = false
    }: {
        type: "front" | "back" | "side" | "details";
        index?: number;
        label: string;
        isMain?: boolean;
    }) => {
        const globalIndex = getTypeIndex(type, index);
        const state = uploads.states[globalIndex];
        const isUploading = state?.uploading;

        const _isMain = isMain; // Подавление предупреждения об использовании

        return (
            <label className={cn(
                "w-full h-full flex flex-col items-center justify-center transition-colors group/u rounded-[24px]",
                isUploading ? "cursor-default bg-slate-100" : "cursor-pointer border-2 border-dashed border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-200"
            )}>
                {!isUploading && <input
                    type="file" className="hidden" accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            onImageChange(file, type, index);
                            playSound("notification_success");
                        }
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
                    <div className="flex flex-col items-center justify-center transition-transform duration-300 group-hover/u:scale-105">
                        <span className="text-2xl font-medium text-slate-400/80 mb-1 group-hover/u:text-blue-500 transition-colors">upload</span>
                        <span className="text-xs font-black text-slate-400 group-hover/u:text-blue-500 transition-colors text-center">
                            загрузить
                        </span>
                    </div>
                )}
            </label>
        );
    };

    const mainImg = pageImages[0];
    const secondaryImgs = pageImages.slice(1);

    const hasVisibleImages = visibleImages.length > 0;

    return (
        <div className={cn("bg-white border border-slate-100/60 rounded-[28px] p-6 flex flex-col gap-3 shadow-sm",
            !hasVisibleImages && !isEditing && "hidden"
        )}>
            {/* Заголовок */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black text-slate-900">
                    Медиатека <span className="text-sm font-bold text-slate-400 ml-1">({getImagesCountLabel(allImages.filter(i => i.src).length)})</span>
                </h3>

                <div className="flex items-center gap-3 shrink-0">
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => goToPage(safePage - 1, "left")}
                                disabled={safePage === 0 || isAnimating}
                                aria-label="Предыдущая страница"
                                className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                                    safePage === 0
                                        ? "text-slate-300 cursor-not-allowed opacity-50"
                                        : "text-slate-700 hover:bg-white hover:text-slate-900 hover:shadow-sm active:scale-95"
                                )}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center justify-center min-w-[3rem] select-none">
                                <span className="text-xs font-black text-slate-700 tabular-nums">
                                    {(safePage + 1).toString().padStart(2, '0')} <span className="text-xs text-slate-400 font-bold mx-0.5">/</span> {totalPages.toString().padStart(2, '0')}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => goToPage(safePage + 1, "right")}
                                disabled={safePage >= totalPages - 1 || isAnimating}
                                aria-label="Следующая страница"
                                className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                                    safePage >= totalPages - 1
                                        ? "text-slate-300 cursor-not-allowed opacity-50"
                                        : "text-slate-700 hover:bg-white hover:text-slate-900 hover:shadow-sm active:scale-95"
                                )}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {isEditing && allImages.some(i => !i.src) && (
                        <label className="cursor-pointer text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1.5 px-2 py-1">
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
                            <span className="hidden sm:inline">Добавить</span>
                        </label>
                    )}
                </div>
            </div>

            {(hasVisibleImages || isEditing) && (
                <div className="relative overflow-hidden mt-4">
                    <div
                        key={slideKey}
                        style={{
                            animation: slideFrom === "right"
                                ? "slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both"
                                : slideFrom === "left"
                                    ? "slideInFromLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) both"
                                    : "fadeIn 0.3s ease both"
                        }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
                    >
                        {mainImg && (mainImg.src || isEditing) && (
                            <div
                                role="button"
                                tabIndex={mainImg.src ? 0 : -1}
                                onClick={() => { if (mainImg.src) handleFullscreenOpen(mainImg.src); }}
                                className={cn(
                                    "group/item relative rounded-[24px] overflow-hidden transition-all duration-500 bg-slate-50 aspect-square",
                                    mainImg.src ? "cursor-pointer" : "border-dashed border-slate-200"
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
                                        <div className="absolute inset-x-4 bottom-4 p-5 rounded-[24px] bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl opacity-0 group-hover/item:opacity-100 transition-all duration-500 translate-y-2 group-hover/item:translate-y-0">
                                            <h4 className="text-xl font-bold text-slate-900  mb-0.5">{mainImg.label}</h4>
                                            <span className="text-xs font-black text-slate-500 block">Основной ракурс</span>
                                        </div>
                                        <div className="absolute top-6 right-6 flex gap-1.5 opacity-0 group-hover/item:opacity-100 transition-all translate-x-4 group-hover/item:translate-x-0">
                                            <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-2xl border border-white/40 flex items-center justify-center text-slate-900 active:scale-90 transition-transform shadow-xl">
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
                                        "group/item relative rounded-[18px] overflow-hidden transition-all duration-500 bg-slate-50 aspect-square",
                                        img.src ? "cursor-pointer" : "border-dashed border-slate-200"
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
                                            <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-3xl bg-white/30 backdrop-blur-2xl border border-white/40 flex items-center justify-center text-white scale-90 group-hover/item:scale-100 transition-transform shadow-2xl">
                                                    <Maximize2 className="w-5 h-5" />
                                                </div>
                                            </div>
                                            {isEditing && (
                                                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover/item:opacity-100 transition-all translate-x-2 group-hover/item:translate-x-0">
                                                    <Button
                                                        variant="destructive" size="icon" type="button" className="w-9 h-9 rounded-xl p-0 shadow-lg border-none"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onImageRemove(img.type, img.index);
                                                            playSound("client_deleted");
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-white" />
                                                    </Button>
                                                    <Button
                                                        variant="secondary" size="icon" type="button" className="w-9 h-9 rounded-xl p-0 shadow-lg bg-white hover:bg-slate-50 text-slate-900 border-none"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <label className="cursor-pointer w-full h-full flex items-center justify-center">
                                                            <input
                                                                type="file" className="hidden" accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        onImageChange(file, img.type, img.index);
                                                                        playSound("notification_success");
                                                                    }
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
            )}

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
