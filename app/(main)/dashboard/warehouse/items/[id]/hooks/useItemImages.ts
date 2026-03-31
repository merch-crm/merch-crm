import { useState, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/toast";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";
import { useImageUploader } from "@/hooks/use-image-uploader";

export function useItemImages(
    item: InventoryItem,
    setItem: React.Dispatch<React.SetStateAction<InventoryItem>>
) {
    const { toast } = useToast();

    const { uploadStates, processFiles, cancelUpload } = useImageUploader({
        folder: "items",
        maxSizeMB: 1,
        maxWidth: 1920,
        maxHeight: 1920,
        maxOriginalSizeMB: 20
    });

    // We keep a shadow state for local Files if needed, but for the detail page
    // we primarily care about the URLs returned by the uploader to update the Item record.
    const [localFiles, setLocalFiles] = useState({
        front: null as File | null,
        back: null as File | null,
        side: null as File | null,
        details: [] as File[],
    });

    // Mapping slots to indices for useImageUploader
    const getTypeIndex = (type: "front" | "back" | "side" | "details", index?: number) => {
        if (type === "front") return 0;
        if (type === "back") return 1;
        if (type === "side") return 2;
        if (type === "details") return 3 + (index ?? 0);
        return 0;
    };

    const handleImageUpdate = useCallback(async (file: File | null, type: "front" | "back" | "side" | "details", index?: number) => {
        if (!file) return;

        const globalIndex = getTypeIndex(type, index);

        await processFiles(
            [file],
            globalIndex,
            (processed) => {
                // Once uploaded to server, we get the URL in processed.preview
                const url = processed.preview;

                setItem(prev => {
                    const next = { ...prev };
                    if (type === "front") next.image = url;
                    else if (type === "back") next.imageBack = url;
                    else if (type === "side") next.imageSide = url;
                    else if (type === "details") {
                        const newDetails = [...(prev.imageDetails || [])];
                        if (typeof index === 'number') {
                            while (newDetails.length <= index) newDetails.push("");
                            newDetails[index] = url;
                        } else {
                            newDetails.push(url);
                        }
                        next.imageDetails = newDetails.filter(Boolean);
                    }
                    return next;
                });

                // Update local files just in case other logic needs the originals
                setLocalFiles(prev => {
                    const next = { ...prev };
                    if (type === "front") next.front = processed.file;
                    else if (type === "back") next.back = processed.file;
                    else if (type === "side") next.side = processed.file;
                    else if (type === "details") {
                        const newFiles = [...prev.details];
                        if (typeof index === 'number') {
                            newFiles[index] = processed.file;
                        } else {
                            newFiles.push(processed.file);
                        }
                        next.details = newFiles;
                    }
                    return next;
                });

                toast(`Файл загружен`, "success");
            },
            (errorMsg) => {
                toast(errorMsg, "destructive");
            }
        );
    }, [setItem, processFiles, toast]);

    const handleImageRemove = useCallback((type: string, index?: number) => {
        if (type === "details" && typeof index === "number") {
            setItem(prev => {
                const newDetails = [...(prev.imageDetails || [])];
                newDetails.splice(index, 1);
                return { ...prev, imageDetails: newDetails };
            });
            setLocalFiles(prev => {
                const newFiles = [...prev.details];
                newFiles.splice(index, 1);
                return { ...prev, details: newFiles };
            });
        } else {
            const field = type === "front" ? "image" : type === "back" ? "imageBack" : "imageSide";
            setItem(prev => ({ ...prev, [field]: null }));

            const localField = type === "front" ? "front" : type === "back" ? "back" : "side";
            setLocalFiles(prev => ({ ...prev, [localField]: null }));
        }
    }, [setItem]);

    const handleSetMain = useCallback((type: "front" | "back" | "side" | "details", index?: number) => {
        const currentMain = item.image;
        let newMain: string | null = null;
        const updatedItem = { ...item };

        if (type === "back") {
            newMain = item.imageBack;
            updatedItem.imageBack = currentMain;
        } else if (type === "side") {
            newMain = item.imageSide;
            updatedItem.imageSide = currentMain;
        } else if (type === "details" && typeof index === "number" && item.imageDetails) {
            newMain = item.imageDetails[index];
            const newDetails = [...item.imageDetails];
            newDetails[index] = currentMain || "";
            updatedItem.imageDetails = newDetails;
        }

        if (newMain) {
            updatedItem.image = newMain;
            setItem(updatedItem);
            toast("Фото установлено как основное", "success");
        }
    }, [item, setItem, toast]);

    const resetUploads = useCallback(() => {
        setLocalFiles({ front: null, back: null, side: null, details: [] });
    }, []);

    const isAnyUploading = useMemo(() =>
        Object.values(uploadStates).some(s => s.uploading)
        , [uploadStates]);

    return {
        uploads: {
            ...localFiles,
            states: uploadStates
        },
        handleImageUpdate,
        handleImageRemove,
        handleSetMain,
        resetUploads,
        isAnyUploading,
        cancelUpload
    };
}
