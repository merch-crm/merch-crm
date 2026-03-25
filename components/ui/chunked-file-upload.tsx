"use client";

/**
 * Компонент загрузки больших файлов с прогрессом
 */

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useChunkedUpload } from "@/hooks/use-chunked-upload";
import { cn } from "@/lib/utils";
import { Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ChunkedFileUploadProps {
  onUploadComplete: (file: {
    url: string;
    key: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }) => void;
  onError?: (error: string) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  destination?: string;
  className?: string;
}

export function ChunkedFileUpload({
  onUploadComplete,
  onError,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    "application/pdf": [".pdf"],
    "application/postscript": [".ai", ".eps"],
  },
  maxSize = 500 * 1024 * 1024, // 500MB
  destination = "uploads",
  className,
}: ChunkedFileUploadProps) {
  const {
    upload,
    reset,
    status,
    progress,
    chunksUploaded,
    totalChunks,
    error,
    isUploading,
  } = useChunkedUpload({
    destination,
    onComplete: onUploadComplete,
    onError,
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      await upload(file);
    },
    [upload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          isUploading && "cursor-not-allowed opacity-60",
          status === "done" && "border-green-500 bg-green-50",
          status === "error" && "border-red-500 bg-red-50",
          !isDragActive && status === "idle" && "border-muted-foreground/25 hover:border-primary"
        )}
      >
        <input {...getInputProps()} />

        {status === "idle" && (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {isDragActive
                ? "Отпустите файл для загрузки"
                : "Перетащите файл или нажмите для выбора"}
            </p>
            <p className="text-xs text-muted-foreground/70">
              Максимальный размер: {Math.round(maxSize / 1024 / 1024)} МБ
            </p>
          </div>
        )}

        {(status === "initializing" || status === "uploading" || status === "completing") && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="w-full max-w-xs">
              <Progress value={progress} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              {status === "initializing" && "Подготовка..."}
              {status === "uploading" && `Загрузка: ${progress}% (${chunksUploaded}/${totalChunks})`}
              {status === "completing" && "Завершение..."}
            </p>
          </div>
        )}

        {status === "done" && (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <p className="text-sm font-medium text-green-700">Файл успешно загружен</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}
      </div>

      {(status === "done" || status === "error") && (
        <Button variant="outline" size="sm" onClick={reset} className="w-full">
          Загрузить другой файл
        </Button>
      )}
    </div>
  );
}
