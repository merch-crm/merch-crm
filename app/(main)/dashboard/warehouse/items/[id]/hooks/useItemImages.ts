import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { compressImage } from "@/lib/image-processing";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";

export function useItemImages(
    item: InventoryItem,
    setItem: React.Dispatch<React.SetStateAction<InventoryItem>>
) {
    const { toast } = useToast();
    const [uploads, setUploads] = useState({
        front: null as File | null,
        back: null as File | null,
        side: null as File | null,
        details: [] as File[],
        states: {} as Record<string, { uploading: boolean, progress: number, uploaded: boolean }>
    });

    const simulateUpload = (type: string, fileName: string, onComplete?: () => void) => {
        setUploads(prev => ({
            ...prev,
            states: {
                ...prev.states,
                [type]: { uploading: true, progress: 0, uploaded: false }
            }
        }));

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 20) + 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setUploads(prev => ({
                    ...prev,
                    states: {
                        ...prev.states,
                        [type]: { uploading: false, progress: 100, uploaded: true }
                    }
                }));
                toast(`Файл ${fileName} готов`, "success");
                if (onComplete) onComplete();
            } else {
                setUploads(prev => ({
                    ...prev,
                    states: {
                        ...prev.states,
                        [type]: { ...prev.states[type], progress }
                    }
                }));
            }
        }, 300);
    };

    const handleImageUpdate = async (file: File | null, type: "front" | "back" | "side" | "details", index?: number) => {
        if (!file) return;

        try {
            const { file: compressedFile, preview } = await compressImage(file, {
                maxWidth: 1920,
                maxHeight: 1920,
                maxSizeMB: 0.7
            });

            if (type === "details") {
                const currentCount = (item.imageDetails?.length || 0);
                const isAdding = typeof index !== 'number' || index >= currentCount;

                if (isAdding && currentCount >= 3) {
                    toast("Максимальное количество дополнительных фото — 3", "error");
                    return;
                }

                setUploads(prev => ({ ...prev, details: [...prev.details, compressedFile] }));

                simulateUpload("details", compressedFile.name, () => {
                    setItem(prev => {
                        const newDetails = [...(prev.imageDetails || [])];
                        if (typeof index === 'number' && index < 3) {
                            while (newDetails.length <= index) newDetails.push("");
                            newDetails[index] = preview;
                        } else {
                            newDetails.push(preview);
                        }
                        return { ...prev, imageDetails: newDetails.filter(Boolean) };
                    });
                });
                return;
            }

            if (type === "front") setUploads(prev => ({ ...prev, front: compressedFile }));
            else if (type === "back") setUploads(prev => ({ ...prev, back: compressedFile }));
            else if (type === "side") setUploads(prev => ({ ...prev, side: compressedFile }));

            simulateUpload(type, compressedFile.name, () => {
                setItem(prev => {
                    if (type === "front") return { ...prev, image: preview };
                    if (type === "back") return { ...prev, imageBack: preview };
                    if (type === "side") return { ...prev, imageSide: preview };
                    return prev;
                });
            });
        } catch (error) {
            console.error("Compression failed:", error);
            toast("Ошибка при обработке изображения", "error");
        }
    };

    const handleImageRemove = (type: string, index?: number) => {
        if (type === "details" && typeof index === "number") {
            const newDetails = [...(item.imageDetails || [])];
            newDetails.splice(index, 1);
            setItem(prev => ({ ...prev, imageDetails: newDetails }));
        } else {
            setItem(prev => ({ ...prev, [type === "front" ? "image" : type === "back" ? "imageBack" : "imageSide"]: null }));
        }
    };

    const handleSetMain = (type: "front" | "back" | "side" | "details", index?: number) => {
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
    };

    const resetUploads = () => {
        setUploads(prev => ({ ...prev, front: null, back: null, side: null, details: [], states: {} }));
    };

    return {
        uploads,
        isAnyUploading: Object.values(uploads.states).some(s => s.uploading),
        handleImageUpdate,
        handleImageRemove,
        handleSetMain,
        resetUploads
    };
}
