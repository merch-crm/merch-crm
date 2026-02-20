import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { compressImage } from "@/lib/image-processing";
import { ItemFormData } from "@/app/(main)/dashboard/warehouse/types";

export interface UploadState {
    uploading: boolean;
    progress: number;
    uploaded: boolean;
}

interface UseMediaLogicProps {
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
}

export function useMediaLogic({ formData, updateFormData }: UseMediaLogicProps) {
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

    // Container Resize Observer
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

    // Zoom Calculation
    const baseScale = useMemo(() => {
        if (!aspectRatio) return 1;
        return Math.max(aspectRatio, 1 / aspectRatio);
    }, [aspectRatio]);

    const maxBounds = useMemo(() => {
        if (!aspectRatio) return { x: 0, y: 0 };
        const s = (thumbSettings.zoom || 1) * baseScale;
        const ar = aspectRatio;
        const normalizedW = ar >= 1 ? 1 : ar;
        const normalizedH = ar <= 1 ? 1 : 1 / ar;

        return {
            x: Math.max(0, 50 * (normalizedW - 1 / s)),
            y: Math.max(0, 50 * (normalizedH - 1 / s))
        };
    }, [aspectRatio, thumbSettings.zoom, baseScale]);

    // Bounds Clamping
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
    }, [maxBounds, thumbSettings.x, thumbSettings.y, thumbSettings.zoom, updateFormData, aspectRatio]);

    const updateThumb = useCallback((settings: Partial<{ zoom: number; x: number; y: number }>) => {
        updateFormData({ thumbSettings: { ...thumbSettings, ...settings } });
    }, [thumbSettings, updateFormData]);

    const resetThumbSettings = useCallback(() => {
        updateFormData({ thumbSettings: { zoom: 1, x: 0, y: 0 } });
    }, [updateFormData]);


    // Upload Processing
    const handleFileProcessing = async (file: File) => {
        setIsProcessing(true);
        try {
            return await compressImage(file, {
                maxSizeMB: 1,
                type: "image/webp",
                maxWidth: 1920,
                maxHeight: 1920
            });
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
                setUploadStates(prev => ({ ...prev, [type]: { ...prev[type], progress } }));
            }
        }, 150);
    };

    // Main Methods
    const handleMainImageChange = async (file: File | null) => {
        if (!file) return;
        setLoadingIndex(0);
        const processed = await handleFileProcessing(file);
        if (processed) {
            simulateUpload("front", () => {
                updateFormData({
                    imageFile: processed.file,
                    imagePreview: processed.preview,
                    thumbSettings: { zoom: 1, x: 0, y: 0 }
                });
                setLoadingIndex(null);
            });
        } else {
            setLoadingIndex(null);
        }
    };

    const handleBackImageChange = async (file: File | null) => {
        if (!file) return;
        const processed = await handleFileProcessing(file);
        if (processed) {
            simulateUpload("back", () => {
                updateFormData({ imageBackFile: processed.file, imageBackPreview: processed.preview });
            });
        }
    };

    const handleSideImageChange = async (file: File | null) => {
        if (!file) return;
        const processed = await handleFileProcessing(file);
        if (processed) {
            simulateUpload("side", () => {
                updateFormData({ imageSideFile: processed.file, imageSidePreview: processed.preview });
            });
        }
    };

    const handleDetailImageChange = async (files: FileList | null) => {
        if (!files) return;
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
    };

    const handleDetailImageReplace = async (index: number, file: File | null) => {
        if (!file) return;
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
    };

    return {
        // State
        isProcessing,
        uploadStates,
        loadingIndex,
        isMinimumRequiredMet,
        thumbSettings,
        aspectRatio,
        maxBounds,
        baseScale,
        containerRef,
        containerDims,

        // Actions
        setAspectRatio,
        updateThumb,
        resetThumbSettings,

        // Handlers
        handleMainImageChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleMainImageChange(e.target.files?.[0] || null);
            e.target.value = "";
        },
        handleBackImageChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleBackImageChange(e.target.files?.[0] || null);
            e.target.value = "";
        },
        handleSideImageChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleSideImageChange(e.target.files?.[0] || null);
            e.target.value = "";
        },
        handleDetailImageChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            handleDetailImageChange(e.target.files);
            e.target.value = "";
        },
        handleDetailImageReplace: (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
            handleDetailImageReplace(index, e.target.files?.[0] || null);
            e.target.value = "";
        },

        // Removers
        removeMainImage: () => updateFormData({ imageFile: null, imagePreview: null }),
        removeBackImage: () => updateFormData({ imageBackFile: null, imageBackPreview: null }),
        removeSideImage: () => updateFormData({ imageSideFile: null, imageSidePreview: null }),
        removeDetailImage: (index: number) => {
            const newFiles = [...(formData.imageDetailsFiles || [])];
            const newPreviews = [...(formData.imageDetailsPreviews || [])];
            newFiles.splice(index, 1);
            newPreviews.splice(index, 1);
            updateFormData({ imageDetailsFiles: newFiles, imageDetailsPreviews: newPreviews });
        }
    };
}
