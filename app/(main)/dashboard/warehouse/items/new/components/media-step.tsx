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

interface UploadState {
    uploading: boolean;
    progress: number;
    uploaded: boolean;
}

export function MediaStep({ formData, updateFormData, onNext, onBack }: MediaStepProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

    const [aspectRatio, setAspectRatio] = useState<number | null>(null);
    const [containerDims, setContainerDims] = useState<{ w: number, h: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const isMinimumRequiredMet = !!(
        formData.imagePreview &&
        formData.imageBackPreview &&
        formData.imageSidePreview
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
        if (!aspectRatio) return;

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
            const result = await compressImage(file, {
                maxSizeMB: 1,
                type: "image/webp",
                maxWidth: 1920,
                maxHeight: 1920
            });
            return result;
        } catch (error) {
            console.error("Compression error:", error);
            setIsProcessing(false);
            return null;
        }
    };

    const simulateUpload = (type: string, onComplete: () => void) => {
        setUploadStates(prev => ({
            ...prev,
            [type]: { uploading: true, progress: 0, uploaded: false }
        }));

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 20) + 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setUploadStates(prev => ({
                    ...prev,
                    [type]: { uploading: false, progress: 100, uploaded: true }
                }));
                setIsProcessing(false);
                onComplete();
            } else {
                setUploadStates(prev => ({
                    ...prev,
                    [type]: { ...prev[type], progress }
                }));
            }
        }, 150);
    };

    const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLoadingIndex(0);
            const processed = await handleFileProcessing(file);
            if (processed) {
                simulateUpload("front", () => {
                    updateFormData({
                        imageFile: processed.file,
                        imagePreview: processed.preview,
                        thumbSettings: {
                            zoom: 1, // 1.0 now means "Cover" (Base Scale)
                            x: 0,
                            y: 0
                        }
                    });
                    setLoadingIndex(null);
                });
            } else {
                setLoadingIndex(null);
            }
        }
        e.target.value = "";
    };

    const handleBackImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const processed = await handleFileProcessing(file);
            if (processed) {
                simulateUpload("back", () => {
                    updateFormData({
                        imageBackFile: processed.file,
                        imageBackPreview: processed.preview
                    });
                });
            }
        }
        e.target.value = "";
    };

    const handleSideImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const processed = await handleFileProcessing(file);
            if (processed) {
                simulateUpload("side", () => {
                    updateFormData({
                        imageSideFile: processed.file,
                        imageSidePreview: processed.preview
                    });
                });
            }
        }
        e.target.value = "";
    };

    const handleDetailImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = [...(formData.imageDetailsFiles || [])];
            const newPreviews = [...(formData.imageDetailsPreviews || [])];

            for (let i = 0; i < files.length; i++) {
                if (newFiles.length >= 3) break;
                const idx = newFiles.length;
                setLoadingIndex(idx);
                const processed = await handleFileProcessing(files[i]);
                if (processed) {
                    await new Promise<void>((resolve) => {
                        simulateUpload("details", () => {
                            newFiles.push(processed.file);
                            newPreviews.push(processed.preview);
                            setLoadingIndex(null);
                            resolve();
                        });
                    });
                } else {
                    setLoadingIndex(null);
                }
            }
            updateFormData({ imageDetailsFiles: newFiles, imageDetailsPreviews: newPreviews });
        }
        e.target.value = "";
    };

    const handleDetailImageReplace = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLoadingIndex(index);
            const processed = await handleFileProcessing(file);
            if (processed) {
                simulateUpload("details", () => {
                    const newFiles = [...(formData.imageDetailsFiles || [])];
                    const newPreviews = [...(formData.imageDetailsPreviews || [])];

                    if (index < newFiles.length) newFiles[index] = processed.file;
                    else newFiles.push(processed.file);

                    if (index < newPreviews.length) newPreviews[index] = processed.preview;
                    else newPreviews.push(processed.preview);

                    updateFormData({ imageDetailsFiles: newFiles, imageDetailsPreviews: newPreviews });
                    setLoadingIndex(null);
                });
            } else {
                setLoadingIndex(null);
            }
        }
        e.target.value = "";
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
                <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col min-h-0 space-y-4">
                    {/* Header Area */}
                    <div className="flex items-center gap-4 shrink-0 relative">
                        <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                            <Images className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-900 ">Галерея фотографий</h2>
                            <p className="text-[10px] text-slate-500 font-bold  opacity-60">Визуализация карточки товара</p>
                        </div>

                        {isProcessing && (
                            <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 animate-pulse">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                <span className="text-[9px] font-bold  text-primary">Сжатие...</span>
                            </div>
                        )}
                    </div>

                    {/* Unified Single Block Container */}
                    <div className="flex-1 bg-white rounded-[24px] flex flex-col min-h-0 overflow-hidden">
                        <div className="flex-1 flex min-h-0">
                            {/* LEFT: MAIN PHOTO */}
                            <div className="w-[45%] h-full flex flex-col min-h-0 bg-slate-50/20 pl-8 pt-6 pb-2 space-y-4">
                                <div className="mb-2">
                                    <h4 className="text-xl font-bold text-slate-900">Основной ракурс <span className="text-rose-500">*</span></h4>
                                </div>

                                <div className="flex flex-col justify-start items-center w-full">
                                    <div
                                        className={cn(
                                            "relative w-full aspect-square rounded-[24px] overflow-hidden border-2 border-dashed transition-all group shrink-0",
                                            formData.imagePreview ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50/50 hover:bg-white shadow-sm"
                                        )}>
                                        <div ref={containerRef} className="absolute inset-0">
                                            {uploadStates.front?.uploading && loadingIndex === 0 ? (
                                                <div className="flex flex-col items-center justify-center gap-3 w-full h-full animate-in fade-in duration-300">
                                                    <div className="relative w-16 h-16 flex items-center justify-center">
                                                        <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                                            <path
                                                                className="text-slate-100"
                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2.5"
                                                            />
                                                            <path
                                                                className="text-primary transition-all duration-300 ease-out"
                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2.5"
                                                                strokeDasharray={`${uploadStates.front.progress}, 100`}
                                                            />
                                                        </svg>
                                                        <span className="absolute text-[12px] font-bold text-primary">
                                                            {uploadStates.front.progress}%
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-400 animate-pulse">Обработка...</span>
                                                </div>
                                            ) : formData.imagePreview ? (
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
                                                                onLoad={(e) => {
                                                                    const img = e.target as HTMLImageElement;
                                                                    setAspectRatio(img.naturalWidth / img.naturalHeight);
                                                                }}
                                                                onLoadingComplete={(img) => {
                                                                    setAspectRatio(img.naturalWidth / img.naturalHeight);
                                                                }}
                                                                draggable={false}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 z-50 backdrop-blur-[2px]">
                                                        <label className="flex items-center gap-2 px-7 py-4 bg-white rounded-full cursor-pointer hover:bg-slate-50 transition-all shadow-xl group/btn active:scale-95">
                                                            <RefreshCcw className="w-5 h-5 text-primary group-hover/btn:rotate-180 transition-transform duration-500" />
                                                            <span className="text-[12px] font-bold text-slate-900">Заменить</span>
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleMainImageChange} />
                                                        </label>
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); removeMainImage(); }}
                                                            className="flex items-center gap-2 px-7 py-4 btn-destructive rounded-full shadow-xl active:scale-95"
                                                        >
                                                            <Trash2 className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                                            <span className="text-[12px] font-bold">Удалить</span>
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm transition-all group-hover:bg-primary/5 group-hover:border-primary/20">
                                                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <span className="text-[8px] font-bold text-slate-400 group-hover:text-primary transition-colors">Добавить</span>
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
                                        "mt-1 pb-0 pt-2 transition-all duration-500",
                                        !formData.imagePreview && "opacity-40 pointer-events-none grayscale"
                                    )}
                                    style={{ width: containerDims ? containerDims.w : '100%' }}
                                >
                                    <div className="space-y-4">
                                        {/* ZOOM SLIDER */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 space-y-0.5">
                                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                                    <span>Масштаб</span>
                                                    <span className={cn("transition-colors", formData.imagePreview ? "text-primary" : "text-slate-400")}>{Math.round((thumbSettings.zoom ?? 1) * 100)}%</span>
                                                </div>
                                                <div className="relative h-6 flex items-center select-none touch-none">
                                                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-1 h-1 bg-slate-300 rounded-full z-0" />
                                                        <div
                                                            className="absolute top-0 bottom-0 bg-primary rounded-full transition-all duration-75"
                                                            style={{
                                                                left: '0%',
                                                                width: `${(thumbSettings.zoom - 1) / 2 * 100}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full shadow-sm border border-slate-200 bg-white transition-all duration-75 pointer-events-none z-20",
                                                            thumbSettings.zoom !== 1 && "border-primary/20 ring-2 ring-primary/10"
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
                                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                                        <span className="whitespace-nowrap">По горизонтали</span>
                                                    </div>
                                                    <div className="relative h-6 flex items-center select-none touch-none">
                                                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-slate-300 rounded-full z-0" />
                                                            <div
                                                                className="absolute top-0 bottom-0 bg-primary rounded-full transition-all duration-75"
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
                                                                thumbSettings.x !== 0 && "border-primary/20 ring-2 ring-primary/10"
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
                                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                                        <span className="whitespace-nowrap">По вертикали</span>
                                                    </div>
                                                    <div className="relative h-6 flex items-center select-none touch-none">
                                                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-slate-300 rounded-full z-0" />
                                                            <div
                                                                className="absolute top-0 bottom-0 bg-primary rounded-full transition-all duration-75"
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
                                                                thumbSettings.y !== 0 && "border-primary/20 ring-2 ring-primary/10"
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
                            <div className="flex-1 flex flex-col min-h-0 bg-white pt-6 px-8 pb-8 overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col min-h-0 space-y-10">
                                    <div className="space-y-4 shrink-0">
                                        <div className="grid grid-cols-2 gap-4 max-w-[480px]">
                                            <CompactDropzone
                                                label={<>Вид со спины <span className="text-rose-500">*</span></>}
                                                preview={formData.imageBackPreview ?? null}
                                                onChange={handleBackImageChange}
                                                onRemove={removeBackImage}
                                                uploading={uploadStates.back?.uploading}
                                                progress={uploadStates.back?.progress}
                                            />
                                            <CompactDropzone
                                                label={<>Вид сбоку <span className="text-rose-500">*</span></>}
                                                preview={formData.imageSidePreview ?? null}
                                                onChange={handleSideImageChange}
                                                onRemove={removeSideImage}
                                                uploading={uploadStates.side?.uploading}
                                                progress={uploadStates.side?.progress}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-1 flex flex-col min-h-0">
                                        <div className="mb-2">
                                            <h4 className="text-xl font-bold text-slate-900">Дополнительные фото</h4>
                                            <p className="text-[10px] font-bold text-slate-500 opacity-60 mt-1">До 3-х фотографий</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-5 pb-4">
                                            {formData.imageDetailsPreviews?.map((preview: string, idx: number) => (
                                                <div key={idx} className="relative aspect-square rounded-[var(--radius)] overflow-hidden border border-slate-200 shadow-sm group transition-all">
                                                    {uploadStates.details?.uploading && loadingIndex === idx ? (
                                                        <div className="flex flex-col items-center justify-center gap-2 w-full h-full bg-slate-50/50">
                                                            <div className="relative w-10 h-10 flex items-center justify-center">
                                                                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                                                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                                    <path className="text-primary transition-all duration-300 ease-out" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${uploadStates.details.progress}, 100`} />
                                                                </svg>
                                                                <span className="absolute text-[9px] font-bold text-primary">{uploadStates.details.progress}%</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Image src={preview} alt="" fill className="object-cover" />
                                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 z-50 backdrop-blur-[2px]">
                                                                <label className="w-10 h-10 flex items-center justify-center bg-white rounded-full cursor-pointer hover:bg-slate-50 transition-all shadow-lg group/btn active:scale-90" title="Заменить">
                                                                    <RefreshCcw className="w-5 h-5 text-primary group-hover/btn:rotate-180 transition-transform duration-500" />
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={(e) => handleDetailImageReplace(idx, e)}
                                                                    />
                                                                </label>
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); removeDetailImage(idx); }}
                                                                    className="w-10 h-10 flex items-center justify-center btn-destructive border-none rounded-full shadow-lg active:scale-90"
                                                                    title="Удалить"
                                                                >
                                                                    <Trash2 className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                            {(!formData.imageDetailsPreviews || formData.imageDetailsPreviews.length < 3) && (
                                                <label className="aspect-square rounded-[var(--radius)] border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group relative">
                                                    {uploadStates.details?.uploading && loadingIndex === (formData.imageDetailsPreviews?.length || 0) ? (
                                                        <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                                                            <div className="relative w-10 h-10 flex items-center justify-center">
                                                                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                                                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                                    <path className="text-primary transition-all duration-300 ease-out" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${uploadStates.details.progress}, 100`} />
                                                                </svg>
                                                                <span className="absolute text-[9px] font-bold text-primary">{uploadStates.details.progress}%</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleDetailImageChange} />
                                                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm transition-all group-hover:bg-primary/5 group-hover:border-primary/20">
                                                                <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                            </div>
                                                            <span className="text-[8px] font-bold text-slate-400 group-hover:text-primary transition-colors">Добавить</span>
                                                        </>
                                                    )}
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
                isNextDisabled={!isMinimumRequiredMet || isProcessing}
                validationError={!isMinimumRequiredMet ? "Загрузите обязательно 3 главных ракурса" : undefined}
                hint={isMinimumRequiredMet && (formData.imageDetailsPreviews?.length || 0) < 3 ? "Вы можете добавить еще 3 дополнительных ракурса" : undefined}
            />
        </div >
    );
}

function CompactDropzone({ label, preview, onChange, onRemove, uploading, progress }: { label: React.ReactNode, preview: string | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onRemove: () => void, uploading?: boolean, progress?: number }) {
    return (
        <div className="flex flex-col min-h-0 space-y-2 flex-1">
            <div className="mb-2">
                <label className="text-xl font-bold text-slate-900">{label}</label>
            </div>
            <div className={cn(
                "relative aspect-square w-full rounded-[var(--radius)] overflow-hidden border-2 border-dashed transition-all group",
                preview ? "border-slate-200 bg-white shadow-sm ring-1 ring-slate-100" : "border-slate-200 bg-slate-50/50 hover:bg-white"
            )}>
                {uploading ? (
                    <div className="flex flex-col items-center justify-center gap-2 w-full h-full animate-in fade-in duration-300">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-primary transition-all duration-300 ease-out" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${progress}, 100`} />
                            </svg>
                            <span className="absolute text-[10px] font-bold text-primary">{progress}%</span>
                        </div>
                    </div>
                ) : preview ? (
                    <>
                        <Image src={preview} alt="" fill className="object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 z-50 backdrop-blur-[2px]">
                            <label className="flex items-center gap-2 px-6 py-3 bg-white rounded-full cursor-pointer hover:bg-slate-50 transition-all shadow-xl group/btn active:scale-95">
                                <RefreshCcw className="w-4 h-4 text-primary group-hover/btn:rotate-180 transition-transform duration-500" />
                                <span className="text-[10px] font-bold text-slate-900">Заменить</span>
                                <input type="file" accept="image/*" className="hidden" onChange={onChange} />
                            </label>
                            <button
                                onClick={(e) => { e.preventDefault(); onRemove(); }}
                                className="flex items-center gap-2 px-6 py-3 btn-destructive border-none rounded-full shadow-xl active:scale-95"
                            >
                                <Trash2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                <span className="text-[10px] font-bold ">Удалить</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={onChange} />
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm transition-all group-hover:bg-primary/5 group-hover:border-primary/20">
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 group-hover:text-primary transition-colors">Добавить</span>
                    </label>
                )}
            </div>
        </div>
    );
}
