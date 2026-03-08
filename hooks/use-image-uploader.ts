import { useState, useCallback, useRef } from "react";
import { compressImage } from "@/lib/image-processing";

export interface UploadState {
    uploading: boolean;
    progress: number;
    uploaded: boolean;
}

export interface ProcessedImage {
    file: File;
    preview: string;
}

export interface UseImageUploaderOptions {
    maxSizeMB?: number;
    maxWidth?: number;
    maxHeight?: number;
    maxFiles?: number;
    maxOriginalSizeMB?: number;
    type?: "image/webp" | "image/jpeg" | "image/png";
    folder?: string;
}

export function useImageUploader(options: UseImageUploaderOptions = {}) {
    const {
        maxSizeMB = 1,
        maxWidth = 1920,
        maxHeight = 1920,
        type = "image/webp",
        maxFiles = Infinity,
        maxOriginalSizeMB = 20,
        folder = "items",
    } = options;

    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadStates, setUploadStates] = useState<Record<number, UploadState>>({});

    // Hash map to track processed files in the current session
    // Uses file.name + file.size as a simple unique identifier
    const processedHashes = useRef<Set<string>>(new Set());

    // Track active XHR requests for cancellation (by globalIndex)
    const activeUploads = useRef<Map<number, XMLHttpRequest>>(new Map());


    const cancelUpload = useCallback((index: number) => {
        const xhr = activeUploads.current.get(index);
        if (xhr) {
            xhr.abort(); // Реально прерывает сетевую передачу
            activeUploads.current.delete(index);
            setUploadStates((prev) => {
                const newStates = { ...prev };
                delete newStates[index];
                return newStates;
            });
        }
    }, []);

    const processFiles = useCallback(
        async (
            files: FileList | File[] | null,
            currentCount: number = 0,
            onFileProcessed?: (processed: ProcessedImage, globalIndex: number) => void,
            onError?: (error: string, file: File) => void
        ): Promise<ProcessedImage[]> => {
            if (!files || files.length === 0) return [];

            const remainingSlots = maxFiles - currentCount;
            if (remainingSlots <= 0) return [];

            const filesArray = Array.from(files);
            const processedImages: ProcessedImage[] = [];

            setIsProcessing(true);
            let processedCount = 0;

            const handleInternalFileProcessing = async (file: File): Promise<ProcessedImage | null> => {
                try {
                    return await compressImage(file, { maxSizeMB, type, maxWidth, maxHeight });
                } catch (error) {
                    console.error("Ошибка при сжатии изображения:", error);
                    return null;
                }
            };

            const internalNetworkUpload = (index: number, processedFile: File, onComplete: (url: string) => void, onInternalError: (err: string) => void) => {
                setUploadStates((prev) => ({ ...prev, [index]: { uploading: true, progress: 0, uploaded: false } }));
                const xhr = new XMLHttpRequest();
                xhr.open("POST", "/api/upload", true);
                activeUploads.current.set(index, xhr);
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        setUploadStates((prev) => ({ ...prev, [index]: { ...prev[index], progress } }));
                    }
                };
                xhr.onload = () => {
                    activeUploads.current.delete(index);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            if (response.success && response.url) {
                                setUploadStates((prev) => ({ ...prev, [index]: { uploading: false, progress: 100, uploaded: true } }));
                                onComplete(response.url);
                            } else {
                                onInternalError(response.error || "Ошибка загрузки");
                            }
                        } catch (_e) { onInternalError("Неверный ответ сервера"); }
                    } else { onInternalError(`Ошибка сервера: ${xhr.status}`); }
                };
                xhr.onerror = () => { activeUploads.current.delete(index); onInternalError("Сетевая ошибка при загрузке"); };
                xhr.onabort = () => { activeUploads.current.delete(index); onInternalError("Загрузка отменена"); };
                const formData = new FormData();
                formData.append("file", processedFile);
                formData.append("folder", folder);
                xhr.send(formData);
            };

            for (let i = 0; i < filesArray.length; i++) {
                if (processedCount >= remainingSlots) break;
                const file = filesArray[i];
                const fileHash = `${file.name}-${file.size}`;
                if (processedHashes.current.has(fileHash)) continue;
                if (file.size > maxOriginalSizeMB * 1024 * 1024) {
                    onError?.(`Файл ${file.name} слишком большой. Максимум ${maxOriginalSizeMB}MB.`, file);
                    continue;
                }
                if (!file.type.startsWith('image/')) {
                    onError?.(`Файл ${file.name} не является изображением.`, file);
                    continue;
                }
                processedHashes.current.add(fileHash);
                const globalIndex = currentCount + processedCount;

                const processed = await handleInternalFileProcessing(file);
                if (processed) {
                    await new Promise<void>((resolve) => {
                        internalNetworkUpload(
                            globalIndex,
                            processed.file,
                            (url) => {
                                const finalProcessed = { ...processed, preview: url };
                                processedImages.push(finalProcessed);
                                onFileProcessed?.(finalProcessed, globalIndex);
                                resolve();
                            },
                            (errMsj) => {
                                onError?.(`Ошибка сети: ${errMsj}`, file);
                                processedHashes.current.delete(fileHash);
                                resolve();
                            }
                        );
                    });
                    processedCount++;
                } else {
                    onError?.(`Не удалось сжать ${file.name}`, file);
                    processedHashes.current.delete(fileHash);
                }
            }

            setIsProcessing(false);
            setTimeout(() => setUploadStates({}), 1000);
            return processedImages;
        },
        [maxFiles, maxSizeMB, maxWidth, maxHeight, type, maxOriginalSizeMB, folder]
    );

    return {
        isProcessing,
        uploadStates,
        processFiles,
        cancelUpload,
    };
}
