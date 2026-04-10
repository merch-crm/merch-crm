import { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from "react";
import { useImageUploader } from "@/hooks/use-image-uploader";
import { ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { useToast } from "@/components/ui/toast";

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
  const { toast } = useToast();
  const { isProcessing, uploadStates: genericUploadStates, processFiles } = useImageUploader({
    maxFiles: Infinity,
    maxSizeMB: 1,
    type: "image/webp",
    maxWidth: 1920,
    maxHeight: 1920,
    maxOriginalSizeMB: 20
  });

  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  // Map generic numerical upload states back to the legacy 'front' and 'details' keys for the UI
  const uploadStates = useMemo(() => {
    const states: Record<string, UploadState> = {};

    // Find which index is currently uploading
    const activeEntry = Object.entries(genericUploadStates).find(([_, state]) => state.uploading);
    if (activeEntry) {
      const idx = Number(activeEntry[0]);
      if (loadingIndex === 0 || (!formData.imagePreview && idx === 0)) {
        states.front = activeEntry[1];
      } else {
        states.details = activeEntry[1];
      }
    }
    return states;
  }, [genericUploadStates, loadingIndex, formData.imagePreview]);

  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [containerDims, setContainerDims] = useState<{ w: number, h: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Product photo is now optional
  const isMinimumRequiredMet = true;

  const thumbSettings = useMemo(() =>
    (formData.thumbSettings as { zoom: number; x: number; y: number }) || { zoom: 1, x: 0, y: 0 },
    [formData.thumbSettings]);

  // Keep a mutable ref so the bounds-clamping effect can read
  // the LATEST thumbSettings without re-running every time they change.
  // Must be declared AFTER thumbSettings.
  const thumbSettingsRef = useRef(thumbSettings);

  // Sync the ref whenever thumbSettings changes (synchronous, before paint)
  useLayoutEffect(() => {
    thumbSettingsRef.current = thumbSettings;
  }, [thumbSettings]);

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
  // IMPORTANT: thumbSettings is intentionally NOT in the dependency array.
  // We read it via thumbSettingsRef to avoid an infinite loop:
  //  maxBounds changes → effect runs → updateFormData called → thumbSettings changes → maxBounds changes → ...
  useEffect(() => {
    if (!aspectRatio) return;

    const { x, y, zoom } = thumbSettingsRef.current;
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
        thumbSettings: { zoom, x: newX, y: newY }
      });
    }
  }, [maxBounds, aspectRatio, updateFormData]);

  const updateThumb = useCallback((settings: Partial<{ zoom: number; x: number; y: number }>) => {
    updateFormData({ thumbSettings: { ...thumbSettings, ...settings } });
  }, [thumbSettings, updateFormData]);

  const resetThumbSettings = useCallback(() => {
    updateFormData({ thumbSettings: { zoom: 1, x: 0, y: 0 } });
  }, [updateFormData]);


  // Upload Processing
  // Unified Multi-Upload Processing
  const handleMultiImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const currentDetailsCount = formData.imageDetailsPreviews?.length || 0;
    const hasMain = !!formData.imagePreview;
    const currentTotal = (hasMain ? 1 : 0) + currentDetailsCount;

    const localFiles = [...(formData.imageDetailsFiles || [])];
    const localPreviews = [...(formData.imageDetailsPreviews || [])];
    let localMainFile = formData.imageFile;
    let localMainPreview = formData.imagePreview;

    // Set the initial loading index
    // Assume first processing file maps to the next available slot
    const isInitialTargetingMain = !localMainPreview;
    setLoadingIndex(isInitialTargetingMain ? 0 : localPreviews.length + 1);

    await processFiles(
      files,
      currentTotal,
      (processed, _globalIndex) => {
        const isTargetingMain = !localMainPreview;

        if (isTargetingMain) {
          localMainFile = processed.file;
          localMainPreview = processed.preview;
        } else {
          localFiles.push(processed.file);
          localPreviews.push(processed.preview);
        }

        // Update UI IMMEDIATELY for this photo
        updateFormData({
          imageFile: localMainFile,
          imagePreview: localMainPreview,
          imageDetailsFiles: [...localFiles],
          imageDetailsPreviews: [...localPreviews],
          ...(isTargetingMain ? { thumbSettings: { zoom: 1, x: 0, y: 0 } } : {})
        });

        // Set loading index for the *next* potential file
        const isNextTargetingMain = !localMainPreview;
        setLoadingIndex(isNextTargetingMain ? 0 : localPreviews.length + 1);
      },
      (errorMsg) => {
        toast(errorMsg, "destructive");
      }
    );

    setLoadingIndex(null);
  };

  // Main Methods
  const handleMainImageChange = async (files: FileList | null) => {
    handleMultiImageUpload(files);
  };

  const handleDetailImageChange = async (files: FileList | null) => {
    handleMultiImageUpload(files);
  };

  const handleDetailImageReplace = async (index: number, file: File | null) => {
    if (!file) return;
    setLoadingIndex(index + 1); // Offset by 1 for Main

    await processFiles(
      [file],
      index + 1,
      (processed) => {
        const newFiles = [...(formData.imageDetailsFiles || [])];
        const newPreviews = [...(formData.imageDetailsPreviews || [])];

        if (index < newFiles.length) newFiles[index] = processed.file;
        else newFiles.push(processed.file);

        if (index < newPreviews.length) newPreviews[index] = processed.preview;
        else newPreviews.push(processed.preview);

        updateFormData({ imageDetailsFiles: newFiles, imageDetailsPreviews: newPreviews });
        setLoadingIndex(null);
      },
      (errorMsg) => {
        toast(errorMsg, "destructive");
        setLoadingIndex(null);
      }
    );

    setLoadingIndex(null);
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
      handleMainImageChange(e.target.files);
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
    removeDetailImage: (index: number) => {
      const newFiles = [...(formData.imageDetailsFiles || [])];
      const newPreviews = [...(formData.imageDetailsPreviews || [])];
      newFiles.splice(index, 1);
      newPreviews.splice(index, 1);
      updateFormData({ imageDetailsFiles: newFiles, imageDetailsPreviews: newPreviews });
    }
  };
}
