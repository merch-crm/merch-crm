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

            const filesArray = Array.from(files).filter(f => {
                if (processedHashes.current.has(`${f.name}-${f.size}`)) return false;
                if (f.size > maxOriginalSizeMB * 1024 * 1024) {
                    onError?.(`Файл ${f.name} слишком большой. Максимум ${maxOriginalSizeMB}MB.`, f);
                    return false;
                }
                if (!f.type.startsWith('image/')) {
                    onError?.(`Файл ${f.name} не является изображением.`, f);
                    return false;
                }
                return true;
            });

            const toProcess = filesArray.slice(0, remainingSlots);
            setIsProcessing(true);

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

            const uploadTask = async (file: File, index: number): Promise<ProcessedImage | null> => {
                const fileHash = `${file.name}-${file.size}`;
                processedHashes.current.add(fileHash);

                try {
                    const processed = await compressImage(file, { maxSizeMB, type, maxWidth, maxHeight });
                    if (!processed) throw new Error("Compression failed");

                    return await new Promise<ProcessedImage>((resolve, reject) => {
                        internalNetworkUpload(
                            index,
                            processed.file,
                            (url: string) => {
                                resolve({ ...processed, preview: url });
                            },
                            (errMsj: string) => {
                                processedHashes.current.delete(fileHash);
                                reject(new Error(errMsj));
                            }
                        );
                    });
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : `Не удалось загрузить ${file.name}`;
                    onError?.(message, file);
                    processedHashes.current.delete(fileHash);
                    return null;
                }
            };

            // Process in parallel with concurrency limit
            const results: ProcessedImage[] = [];
            const concurrency = 3;
            for (let i = 0; i < toProcess.length; i += concurrency) {
                const chunk = toProcess.slice(i, i + concurrency);
                const chunkResults = await Promise.all(
                    chunk.map((file, chunkIdx) => uploadTask(file, currentCount + i + chunkIdx))
                );
                results.push(...chunkResults.filter((r): r is ProcessedImage => r !== null));
            }

            setIsProcessing(false);
            setTimeout(() => setUploadStates({}), 1000);
            return results;
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
