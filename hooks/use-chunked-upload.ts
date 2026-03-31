"use client";

/**
 * Хук для chunked upload с прогрессом
 */

import { useState, useCallback } from "react";

interface UploadProgress {
  status: "idle" | "initializing" | "uploading" | "completing" | "done" | "error";
  progress: number; // 0-100
  chunksUploaded: number;
  totalChunks: number;
  error?: string;
}

interface UploadResult {
  url: string;
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface UseChunkedUploadOptions {
  destination?: string;
  onProgress?: (progress: number) => void;
  onComplete?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

export function useChunkedUpload(options: UseChunkedUploadOptions = {}) {
  const { destination, onProgress, onComplete, onError } = options;

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: "idle",
    progress: 0,
    chunksUploaded: 0,
    totalChunks: 0,
  });

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      try {
        // 1. Инициализация
        setUploadProgress({
          status: "initializing",
          progress: 0,
          chunksUploaded: 0,
          totalChunks: 0,
        });

        const initResponse = await fetch("/api/upload/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          }),
        });

        if (!initResponse.ok) {
          const error = await initResponse.json();
          throw new Error(error.error || "Ошибка инициализации");
        }

        const { uploadId, chunkSize, totalChunks } = await initResponse.json();

        setUploadProgress({
          status: "uploading",
          progress: 0,
          chunksUploaded: 0,
          totalChunks,
        });

        // 2. Загрузка чанков
        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);
          const chunkBuffer = await chunk.arrayBuffer();

          const chunkResponse = await fetch("/api/upload/chunk", {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
              "x-upload-id": uploadId,
              "x-chunk-index": i.toString(),
            },
            body: chunkBuffer,
          });

          if (!chunkResponse.ok) {
            const error = await chunkResponse.json();
            throw new Error(error.error || `Ошибка загрузки чанка ${i}`);
          }

          const progress = Math.round(((i + 1) / totalChunks) * 100);

          setUploadProgress({
            status: "uploading",
            progress,
            chunksUploaded: i + 1,
            totalChunks,
          });

          onProgress?.(progress);
        }

        // 3. Завершение
        setUploadProgress((prev) => ({ ...prev, status: "completing" }));

        const completeResponse = await fetch("/api/upload/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadId, destination }),
        });

        if (!completeResponse.ok) {
          const error = await completeResponse.json();
          throw new Error(error.error || "Ошибка завершения загрузки");
        }

        const result = await completeResponse.json();

        setUploadProgress({
          status: "done",
          progress: 100,
          chunksUploaded: totalChunks,
          totalChunks,
        });

        onComplete?.(result.file);
        return result.file;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";

        setUploadProgress((prev) => ({
          ...prev,
          status: "error",
          error: errorMessage,
        }));

        onError?.(errorMessage);
        return null;
      }
    },
    [destination, onProgress, onComplete, onError]
  );

  const reset = useCallback(() => {
    setUploadProgress({
      status: "idle",
      progress: 0,
      chunksUploaded: 0,
      totalChunks: 0,
    });
  }, []);

  return {
    upload,
    reset,
    ...uploadProgress,
    isUploading: uploadProgress.status === "uploading" || uploadProgress.status === "completing",
  };
}
