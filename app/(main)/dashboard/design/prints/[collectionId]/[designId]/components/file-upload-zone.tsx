"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, FileImage, FileCode, CheckCircle, AlertCircle } from "lucide-react";
import { uploadPrintFiles, validateFile, formatFileSize } from "@/lib/utils/upload";
import { formatCount } from "@/lib/pluralize";

interface FileUploadZoneProps {
  collectionId: string;
  designId: string;
  versionId: string;
  onUploadComplete: () => void;
}

type UploadStatus = "idle" | "validating" | "uploading" | "success" | "error";

export function FileUploadZone({
  collectionId,
  designId,
  versionId,
  onUploadComplete,
}: FileUploadZoneProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      // Валидация файлов
      setStatus("validating");
      setMessage("Проверка файлов...");

      for (const file of acceptedFiles) {
        const validation = validateFile(file);
        if (!validation.valid) {
          setStatus("error");
          setMessage(`${file.name}: ${validation.error}`);
          return;
        }
      }

      // Загрузка
      setStatus("uploading");
      setProgress(0);
      setMessage(`Загрузка ${acceptedFiles.length} файлов...`);

      const result = await uploadPrintFiles(acceptedFiles, {
        collectionId,
        designId,
        versionId,
        onProgress: (p) => {
          setProgress(p.percent);
          setMessage(
            `Загружено ${formatFileSize(p.loaded)} из ${formatFileSize(p.total)}`
          );
        },
      });

      if (result.success) {
        setStatus("success");
        const fileCount = result.files?.length ?? 0;
        setMessage(`Загружено ${formatCount(fileCount, "файл", "файла", "файлов")}`);
        onUploadComplete();

        // Сброс через 2 секунды
        setTimeout(() => {
          setStatus("idle");
          setProgress(0);
          setMessage("");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(result.error || "Ошибка загрузки");
      }
    },
    [collectionId, designId, versionId, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    disabled: status === "uploading",
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
      "image/tiff": [".tiff", ".tif"],
      "application/pdf": [".pdf"],
      "image/svg+xml": [".svg"],
      "application/postscript": [".eps", ".ai"],
      "image/vnd.adobe.photoshop": [".psd"],
      "application/octet-stream": [".psd", ".ai", ".cdr"],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
        status === "idle" && "cursor-pointer",
        status === "idle" && !isDragActive && "border-muted-foreground/25 hover:border-muted-foreground/50",
        isDragActive && !isDragReject && "border-primary bg-primary/5",
        isDragReject && "border-destructive bg-destructive/5",
        status === "uploading" && "border-primary/50 bg-primary/5 cursor-wait",
        status === "success" && "border-green-500 bg-green-500/5",
        status === "error" && "border-destructive bg-destructive/5"
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-3">
        {/* Иконка статуса */}
        {status === "idle" && (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        {status === "validating" && (
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        )}
        {status === "uploading" && (
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        )}
        {status === "success" && (
          <CheckCircle className="h-8 w-8 text-green-500" />
        )}
        {status === "error" && (
          <AlertCircle className="h-8 w-8 text-destructive" />
        )}

        {/* Текст */}
        {status === "idle" && (
          <>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Перетащите файлы</span>
              {""}или нажмите для выбора
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileImage className="h-3.5 w-3.5" />
                <span>PNG, JPG, WEBP, GIF</span>
              </div>
              <div className="flex items-center gap-1">
                <FileCode className="h-3.5 w-3.5" />
                <span>PSD, AI, PDF, TIFF, SVG, CDR, EPS</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Максимум 500 МБ на файл
            </p>
          </>
        )}

        {status !== "idle" && (
          <p className="text-sm">{message}</p>
        )}

        {/* Прогресс-бар */}
        {status === "uploading" && (
          <div className="w-full max-w-xs">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
