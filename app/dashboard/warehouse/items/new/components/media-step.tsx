import { useState, useRef, useEffect, useMemo } from "react";
import { Trash2, Plus, Images, RotateCcw, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepFooter } from "./step-footer";
import { ItemFormData } from "../../../types";
import Image from "next/image";
import { compressImage } from "@/lib/image-processing";

interface MediaStepProps {
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function MediaStep({ formData, updateFormData, onNext, onBack }: MediaStepProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const [aspectRatio, setAspectRatio] = useState<number | null>(null);
    const [containerDims, setContainerDims] = useState<{ w: number, h: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const isFullPhotoSet = !!(
        formData.imagePreview &&
        formData.imageBackPreview &&
        formData.imageSidePreview &&
        formData.imageDetailsPreviews &&
        formData.imageDetailsPreviews.length === 3
    );

    const thumbSettings = (formData.thumbSettings as { zoom: number; x: number; y: number }) || { zoom: 1, x: 0, y: 0 };

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerDims({ w: entry.contentRect.width, h: entry.contentRect.height });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const resetThumbSettings = () => {
        updateFormData({ thumbSettings: { zoom: 1, x: 0, y: 0 } });
    };

    // Calculate base scale to achieve 'cover' fit (fill the square)
    const baseScale = useMemo(() => {
        if (!aspectRatio) return 1;
        return Math.max(aspectRatio, 1 / aspectRatio);
    }, [aspectRatio]);

    // Calculate dynamic boundaries based on effective scale
    const maxBounds = useMemo(() => {
        if (!aspectRatio) return { x: 0, y: 0 };

        // Effective scale applied to the container
        const s = (thumbSettings.zoom || 1) * baseScale;

        const ar = aspectRatio;
        const normalizedW = ar >= 1 ? 1 : ar;
        const normalizedH = ar <= 1 ? 1 : 1 / ar;

        const limitX = Math.max(0, 50 * (normalizedW - 1 / s));
        const limitY = Math.max(0, 50 * (normalizedH - 1 / s));

        return { x: limitX, y: limitY };
    }, [aspectRatio, thumbSettings.zoom, baseScale]);

    // Auto-clamp X/Y when bounds change (e.g. zooming out)
    useEffect(() => {
        const { x, y } = thumbSettings;
        let newX = x;
        let newY = y;

        const limitX = Math.max(0, maxBounds.x);
        const limitY = Math.max(0, maxBounds.y);

        if (newX > limitX) newX = limitX;
        else if (newX < -limitX) newX = -limitX;

        if (newY > limitY) newY = limitY;
        else if (newY < -limitY) newY = -limitY;

        if (newX !== x || newY !== y) {
            updateFormData({
                thumbSettings: {
                    zoom: thumbSettings.zoom,
                    x: newX,
                    y: newY
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [maxBounds, thumbSettings.x, thumbSettings.y, thumbSettings.zoom, updateFormData]);

    const handleFileProcessing = async (file: File) => {
        setIsProcessing(true);
        try {
            const result = await compressImage(file, { maxSizeMB: 1, type: "image/jpeg" });
            setIsProcessing(false);
            return result;
        } catch (error) {
            console.error("Compression error:", error);
            setIsProcessing(false);
            return null;
        }
    };

    const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const processed = await handleFileProcessing(file);
            if (processed) {
                const img = new window.Image();
                img.onload = () => {
                    const aspect = img.width / img.height;
                    setAspectRatio(aspect);
                    updateFormData({
                        imageFile: processed.file,
                        imagePreview: processed.preview,
                        thumbSettings: {
                            zoom: 1, // 1.0 now means "Cover" (Base Scale)
                            x: 0,
                            y: 0
                        }
                    });
                };
                img.src = processed.preview;
            }
        }
    };

    const handleBackImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const processed = await handleFileProcessing(file);
            if (processed) {
                updateFormData({
                    imageBackFile: processed.file,
                    imageBackPreview: processed.preview
                });
            }
        }
    };

    const handleSideImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const processed = await handleFileProcessing(file);
            if (processed) {
                updateFormData({
                    imageSideFile: processed.file,
                    imageSidePreview: processed.preview
                });
            }
        }
    };

    const handleDetailImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = [...(formData.imageDetailsFiles || [])];
            const newPreviews = [...(formData.imageDetailsPreviews || [])];

            for (let i = 0; i < files.length; i++) {
                if (newFiles.length >= 3) break;
                const processed = await handleFileProcessing(files[i]);
                if (processed) {
                    newFiles.push(processed.file);
                    newPreviews.push(processed.preview);
                }
            }
            updateFormData({ imageDetailsFiles: newFiles, imageDetailsPreviews: newPreviews });
        }
    };

    const handleDetailImageReplace = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const processed = await handleFileProcessing(file);
            if (processed) {
                const newFiles = [...(formData.imageDetailsFiles || [])];
                const newPreviews = [...(formData.imageDetailsPreviews || [])];

                // Ensure arrays are long enough (they should be)
                if (index < newFiles.length) newFiles[index] = processed.file;
                else newFiles.push(processed.file);

                if (index < newPreviews.length) newPreviews[index] = processed.preview;
                else newPreviews.push(processed.preview);

                updateFormData({ imageDetailsFiles: newFiles, imageDetailsPreviews: newPreviews });
            }
        }
    };

    const updateThumb = (settings: Partial<{ zoom: number; x: number; y: number }>) => {
        updateFormData({ thumbSettings: { ...thumbSettings, ...settings } });
    };

    const removeMainImage = () => updateFormData({ imageFile: null, imagePreview: null });
    const removeBackImage = () => updateFormData({ imageBackFile: null, imageBackPreview: null });
    const removeSideImage = () => updateFormData({ imageSideFile: null, imageSidePreview: null });

    const removeDetailImage = (index: number) => {
        const newFiles = [...(formData.imageDetailsFiles || [])];
        const newPreviews = [...(formData.imageDetailsPreviews || [])];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        updateFormData({ imageDetailsFiles: newFiles, imageDetailsPreviews: newPreviews });
    };

    return (
        <div className="flex flex-col min-h-0 h-full overflow-hidden">
            <div className="flex-1 flex flex-col px-10 pt-10 pb-0 min-h-0">
                <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col min-h-0 space-y-2">
                    {/* Header Area */}
                    <div className="flex items-center gap-4 shrink-0 relative">
                        <div className="w-12 h-12 rounded-[18px] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                            <Images className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-900 ">Галерея фотографий</h2>
                            <p className="text-[11px] text-slate-500 font-bold  opacity-60">Визуализация карточки товара</p>
                        </div>

                        {isProcessing && (
                            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 animate-pulse">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                <span className="text-[9px] font-bold  text-indigo-600">Сжатие...</span>
                            </div>
                        )}
                    </div>

                    {/* Unified Single Block Container */}
                    <div className="flex-1 bg-white rounded-[24px] flex flex-col min-h-0 overflow-hidden">
                        <div className="flex-1 flex min-h-0">
                            {/* LEFT: MAIN PHOTO */}
                            <div className="w-[35%] h-full flex flex-col min-h-0 bg-slate-50/20 pl-8 pt-3 pb-2">
                                <div
                                    className="flex items-center justify-between mb-4"
                                    style={{ width: containerDims ? containerDims.w : '100%' }}
                                >
                                    <h3 className="text-[10px] font-bold tracking-[0.12em] text-slate-400 pl-0 h-4 flex items-center">Лицевая сторона *</h3>
                                </div>

                                <div className="flex flex-col justify-start items-center w-full">
                                    <div
                                        className={cn(
                                            "relative w-full aspect-square rounded-[24px] overflow-hidden border-2 border-dashed transition-all group shrink-0",
                                            formData.imagePreview ? "border-slate-200 bg-white" : "border-slate-200 bg-white shadow-inner hover:border-indigo-400 hover:bg-slate-50"
                                        )}>
                                        <div ref={containerRef} className="absolute inset-0">
                                            {formData.imagePreview ? (
                                                <>
                                                    <div
                                                        className="relative w-full h-full flex items-center justify-center overflow-hidden"
                                                        style={{ transform: `scale(${(thumbSettings.zoom ?? 1) * (baseScale || 1)})` }}
                                                    >
                                                        <div
                                                            className="relative w-full h-full"
                                                            style={{
                                                                transform: `translate(${thumbSettings.x ?? 0}%, ${thumbSettings.y ?? 0}%)`,
                                                                aspectRatio: aspectRatio ? `${aspectRatio}` : 'auto'
                                                            }}
                                                        >
                                                            <Image
                                                                src={formData.imagePreview}
                                                                alt="Preview"
                                                                fill
                                                                className="object-contain"
                                                                onLoadingComplete={(img) => {
                                                                    setAspectRatio(img.naturalWidth / img.naturalHeight);
                                                                }}
                                                                draggable={false}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 z-50 backdrop-blur-[2px]">
                                                        <label className="flex items-center gap-2 px-5 py-3 bg-white rounded-[18px] cursor-pointer hover:bg-slate-50 transition-all shadow-lg hover:scale-105 active:scale-95 group/btn">
                                                            <RefreshCcw className="w-4 h-4 text-indigo-600 group-hover/btn:rotate-180 transition-transform duration-500" />
                                                            <span className="text-[9px] font-bold  text-slate-900">Заменить</span>
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleMainImageChange} />
                                                        </label>
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); removeMainImage(); }}
                                                            className="flex items-center gap-2 px-5 py-3 bg-rose-500 hover:bg-rose-600 border-none rounded-[18px] transition-all shadow-lg text-white hover:scale-105 active:scale-95 group/btn"
                                                        >
                                                            <Trash2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                                            <span className="text-[9px] font-bold ">Удалить</span>
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                        <Plus className="w-5 h-5 text-indigo-500" />
                                                    </div>
                                                    <span className="text-[10px] font-bold  text-slate-400 group-hover:text-indigo-500 transition-colors">Загрузить</span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleMainImageChange}
                                            accept="image/*"
                                            disabled={!!formData.imagePreview}
                                        />
                                    </div>
                                </div>

                                {/* CONTROLS */}
                                <div
                                    className={cn(
                                        "mt-4 pb-0 pt-2 transition-all duration-500",
                                        !formData.imagePreview && "opacity-40 pointer-events-none grayscale"
                                    )}
                                    style={{ width: containerDims ? containerDims.w : '100%' }}
                                >
                                    <div className="space-y-4">
                                        {/* ZOOM SLIDER */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 space-y-0.5">
                                                <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.12em] text-slate-400">
                                                    <span>Масштаб</span>
                                                    <span className={cn("transition-colors", formData.imagePreview ? "text-indigo-600" : "text-slate-400")}>{Math.round((thumbSettings.zoom ?? 1) * 100)}%</span>
                                                </div>
                                                <div className="relative h-6 flex items-center select-none touch-none">
                                                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-1 h-1 bg-slate-300 rounded-full z-0" />
                                                        <div
                                                            className="absolute top-0 bottom-0 bg-indigo-500 rounded-full transition-all duration-75"
                                                            style={{
                                                                left: '0%',
                                                                width: `${(thumbSettings.zoom - 1) / 2 * 100}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full shadow-sm border border-slate-200 bg-white transition-all duration-75 pointer-events-none z-20",
                                                            thumbSettings.zoom !== 1 && "border-indigo-100 ring-2 ring-indigo-500/10"
                                                        )}
                                                        style={{
                                                            left: `${(thumbSettings.zoom - 1) / 2 * 100}%`
                                                        }}
                                                    />
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="3"
                                                        step="0.05"
                                                        value={thumbSettings.zoom ?? 1}
                                                        onChange={(e) => updateThumb({ zoom: parseFloat(e.target.value) })}
                                                        onDoubleClick={() => updateThumb({ zoom: 1 })}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 p-0 m-0"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={resetThumbSettings}
                                                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                                                title="Сбросить"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* X/Y Sliders */}
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1 grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.12em] text-slate-400">
                                                        <span className="whitespace-nowrap">По горизонтали</span>
                                                    </div>
                                                    <div className="relative h-6 flex items-center select-none touch-none">
                                                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-slate-300 rounded-full z-0" />
                                                            <div
                                                                className="absolute top-0 bottom-0 bg-indigo-500 rounded-full transition-all duration-75"
                                                                style={{
                                                                    left: (thumbSettings.x !== undefined && thumbSettings.x < 0 && maxBounds.x > 0)
                                                                        ? `${50 + (Math.max(-1, Math.min(1, thumbSettings.x / maxBounds.x)) * 50)}%`
                                                                        : '50%',
                                                                    width: (thumbSettings.x !== undefined && maxBounds.x > 0)
                                                                        ? `${Math.abs(Math.max(-1, Math.min(1, thumbSettings.x / maxBounds.x))) * 50}%`
                                                                        : '0%'
                                                                }}
                                                            />
                                                        </div>
                                                        <div
                                                            className={cn(
                                                                "absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full shadow-sm border border-slate-200 bg-white transition-all duration-75 pointer-events-none z-20",
                                                                maxBounds.x <= 0 && "bg-slate-300",
                                                                thumbSettings.x !== 0 && "border-indigo-100 ring-2 ring-indigo-500/10"
                                                            )}
                                                            style={{
                                                                left: (maxBounds.x > 0)
                                                                    ? `${50 + (Math.max(-1, Math.min(1, (thumbSettings.x ?? 0) / maxBounds.x)) * 50)}%`
                                                                    : '50%'
                                                            }}
                                                        />
                                                        <input
                                                            type="range"
                                                            min={-Math.max(1, maxBounds.x)}
                                                            max={Math.max(1, maxBounds.x)}
                                                            step="1"
                                                            value={thumbSettings.x ?? 0}
                                                            disabled={maxBounds.x <= 0}
                                                            onChange={(e) => updateThumb({ x: parseInt(e.target.value) })}
                                                            onDoubleClick={() => updateThumb({ x: 0 })}
                                                            className={cn(
                                                                "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 p-0 m-0",
                                                                maxBounds.x <= 0 && "cursor-not-allowed"
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.12em] text-slate-400">
                                                        <span className="whitespace-nowrap">По вертикали</span>
                                                    </div>
                                                    <div className="relative h-6 flex items-center select-none touch-none">
                                                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-slate-300 rounded-full z-0" />
                                                            <div
                                                                className="absolute top-0 bottom-0 bg-indigo-500 rounded-full transition-all duration-75"
                                                                style={{
                                                                    left: (thumbSettings.y !== undefined && thumbSettings.y < 0 && maxBounds.y > 0)
                                                                        ? `${50 + (Math.max(-1, Math.min(1, thumbSettings.y / maxBounds.y)) * 50)}%`
                                                                        : '50%',
                                                                    width: (thumbSettings.y !== undefined && maxBounds.y > 0)
                                                                        ? `${Math.abs(Math.max(-1, Math.min(1, thumbSettings.y / maxBounds.y))) * 50}%`
                                                                        : '0%'
                                                                }}
                                                            />
                                                        </div>
                                                        <div
                                                            className={cn(
                                                                "absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full shadow-sm border border-slate-200 bg-white transition-all duration-75 pointer-events-none z-20",
                                                                maxBounds.y <= 0 && "bg-slate-300",
                                                                thumbSettings.y !== 0 && "border-indigo-100 ring-2 ring-indigo-500/10"
                                                            )}
                                                            style={{
                                                                left: (maxBounds.y > 0)
                                                                    ? `${50 + (Math.max(-1, Math.min(1, (thumbSettings.y ?? 0) / maxBounds.y)) * 50)}%`
                                                                    : '50%'
                                                            }}
                                                        />
                                                        <input
                                                            type="range"
                                                            min={-Math.max(1, maxBounds.y)}
                                                            max={Math.max(1, maxBounds.y)}
                                                            step="1"
                                                            value={thumbSettings.y ?? 0}
                                                            disabled={maxBounds.y <= 0}
                                                            onChange={(e) => updateThumb({ y: parseInt(e.target.value) })}
                                                            onDoubleClick={() => updateThumb({ y: 0 })}
                                                            className={cn(
                                                                "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 p-0 m-0",
                                                                maxBounds.y <= 0 && "cursor-not-allowed"
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-6 shrink-0" aria-hidden="true" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: STORYBOARD & GALLERY */}
                            <div className="flex-1 flex flex-col min-h-0 bg-white pt-3 px-8 pb-8 overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col min-h-0 space-y-10">
                                    <div className="space-y-4 shrink-0">
                                        <label className="text-[10px] font-bold tracking-[0.12em] text-slate-400 block h-4 flex items-center">
                                            Ракурсы и раскадровка
                                        </label>
                                        <div className="grid grid-cols-2 gap-4 h-[220px]">
                                            <CompactDropzone
                                                label="вид со спины"
                                                preview={formData.imageBackPreview ?? null}
                                                onChange={handleBackImageChange}
                                                onRemove={removeBackImage}
                                            />
                                            <CompactDropzone
                                                label="детализация / бок"
                                                preview={formData.imageSidePreview ?? null}
                                                onChange={handleSideImageChange}
                                                onRemove={removeSideImage}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-1 flex flex-col min-h-0">
                                        <div className="flex items-center justify-between shrink-0">
                                            <label className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                                                Галерея деталей
                                            </label>
                                            <span className="text-[9px] font-bold text-slate-300 ">
                                                {(formData.imageDetailsPreviews?.length || 0)}/3
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-3 pb-4">
                                            {formData.imageDetailsPreviews?.map((preview: string, idx: number) => (
                                                <div key={idx} className="relative aspect-square rounded-[20px] overflow-hidden border border-slate-100 shadow-sm group hover:scale-[1.02] transition-all">
                                                    <Image src={preview} alt="" fill className="object-cover" />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 z-50 backdrop-blur-[2px]">
                                                        <label className="w-8 h-8 flex items-center justify-center bg-white rounded-full cursor-pointer hover:bg-slate-50 transition-all shadow-lg hover:scale-110 active:scale-95 group/btn" title="Заменить">
                                                            <RefreshCcw className="w-4 h-4 text-indigo-600 group-hover/btn:rotate-180 transition-transform duration-500" />
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => handleDetailImageReplace(idx, e)}
                                                            />
                                                        </label>
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); removeDetailImage(idx); }}
                                                            className="w-8 h-8 flex items-center justify-center bg-rose-500 hover:bg-rose-600 border-none rounded-full transition-all shadow-lg text-white hover:scale-110 active:scale-95 group/btn"
                                                            title="Удалить"
                                                        >
                                                            <Trash2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!formData.imageDetailsPreviews || formData.imageDetailsPreviews.length < 3) && (
                                                <label className="aspect-square rounded-[20px] border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-white transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleDetailImageChange} />
                                                    <div className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-indigo-100 transition-all">
                                                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                                    </div>
                                                    <span className="text-[8px] font-bold  text-slate-400 group-hover:text-indigo-500">Добавить</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <StepFooter
                onBack={onBack}
                onNext={onNext}
                isNextDisabled={!isFullPhotoSet || isProcessing}
                validationError={!isFullPhotoSet ? "Загрузите все 6 фото (3 главных + 3 детали)" : undefined}
            />
        </div>
    );
}

function CompactDropzone({ label, preview, onChange, onRemove }: { label: string, preview: string | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onRemove: () => void }) {
    return (
        <div className="flex flex-col min-h-0 space-y-3 flex-1">
            <div className="flex items-center justify-between shrink-0">
                <span className="text-[10px] font-bold text-slate-400 tracking-[0.12em] leading-none">{label}</span>
            </div>
            <div className={cn(
                "relative flex-1 rounded-[20px] overflow-hidden border-2 border-dashed transition-all group",
                preview ? "border-slate-100 bg-white shadow-sm ring-1 ring-slate-100" : "border-slate-100 bg-slate-50/50 hover:border-indigo-300 hover:bg-white"
            )}>
                {preview ? (
                    <>
                        <Image src={preview} alt={label} fill className="object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 z-50 backdrop-blur-[2px]">
                            <label className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl cursor-pointer hover:bg-slate-50 transition-all shadow-lg hover:scale-105 active:scale-95 group/btn">
                                <RefreshCcw className="w-3.5 h-3.5 text-indigo-600 group-hover/btn:rotate-180 transition-transform duration-500" />
                                <span className="text-[8px] font-bold  text-slate-900">Заменить</span>
                                <input type="file" accept="image/*" className="hidden" onChange={onChange} />
                            </label>
                            <button
                                onClick={(e) => { e.preventDefault(); onRemove(); }}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 border-none rounded-xl transition-all shadow-lg text-white hover:scale-105 active:scale-95 group/btn"
                            >
                                <Trash2 className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
                                <span className="text-[8px] font-bold ">Удалить</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer text-slate-300">
                        <input type="file" accept="image/*" className="hidden" onChange={onChange} />
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-white transition-all">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-[8px] font-bold text-slate-400">Загрузить</span>
                    </label>
                )}
            </div>
        </div>
    );
}
