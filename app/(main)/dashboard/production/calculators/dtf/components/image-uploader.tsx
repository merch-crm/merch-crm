"use client";

import { useState, useRef, useCallback, memo } from "react";
import NextImage from "next/image";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  getImageDimensions,
  createImagePreview,
  getFileNameWithoutExtension,
  isValidImageFile,
  isValidFileSize,
} from "../../lib/image-utils";
import { DEFAULT_DPI, DPI_OPTIONS, type DpiOption } from "../../types";

interface ImageUploaderProps {
  imagePreview: string | null | undefined;
  onImageChange: (preview: string | null) => void;
  onSizeDetected: (widthMm: number, heightMm: number, fileName: string) => void;
}

export const ImageUploader = memo(function ImageUploader({
  imagePreview,
  onImageChange,
  onSizeDetected,
}: ImageUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dpi, setDpi] = useState(DEFAULT_DPI);
  const [showDpiSelect, setShowDpiSelect] = useState(false);

  // Обработка файла
  const processFile = useCallback(
    async (file: File) => {
      // Валидация типа
      if (!isValidImageFile(file)) {
        toast("Неподдерживаемый формат: Используйте PNG, JPEG или WebP", "destructive");
        return;
      }

      // Валидация размера
      if (!isValidFileSize(file)) {
        toast("Файл слишком большой: Максимальный размер — 10 МБ", "destructive");
        return;
      }

      setIsLoading(true);

      try {
        // Получаем размеры и превью параллельно
        const [dimensions, preview] = await Promise.all([
          getImageDimensions(file, dpi),
          createImagePreview(file),
        ]);

        onImageChange(preview);
        onSizeDetected(
          dimensions.widthMm,
          dimensions.heightMm,
          getFileNameWithoutExtension(file.name)
        );

        toast(`Размеры определены: ${dimensions.widthMm}×${dimensions.heightMm} мм (${dimensions.widthPx}×${dimensions.heightPx} px, ${dpi} DPI)`, "success");
      } catch (_error) {
        toast("Ошибка при загрузке изображения", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [dpi, onImageChange, onSizeDetected, toast]
  );

  // Обработчик выбора файла
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
      // Сбрасываем input для повторного выбора того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFile]
  );

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  // Удаление изображения
  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onImageChange(null);
    },
    [onImageChange]
  );

  // Клик по области загрузки
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="shrink-0">
      <div className="flex items-center justify-between mb-1.5">
        <Label className="ml-1">Макет </Label>
        {!imagePreview && (
          <button
            type="button"
            onClick={() => setShowDpiSelect(!showDpiSelect)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            &nbsp;{dpi} DPI
          </button>
        )}
      </div>

      {/* DPI Select */}
      {showDpiSelect && !imagePreview && (
        <div className="flex gap-1 mb-1.5">
          {DPI_OPTIONS.map((opt: DpiOption) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setDpi(opt.value);
                setShowDpiSelect(false);
              }}
              className={cn(
                "px-2 py-1 rounded-md text-xs font-medium transition-colors",
                dpi === opt.value
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
              title={opt.description}
            >
              {opt.value}
            </button>
          ))}
        </div>
      )}

      {/* Upload Area / Preview */}
      {imagePreview ? (
        // Preview
        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 group">
          <NextImage src={imagePreview} alt="Превью" fill className="object-cover" unoptimized />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      ) : (
        // Upload Area
        <button
          type="button"
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          disabled={isLoading}
          className={cn(
            "w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center transition-all",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-slate-200 hover:border-primary/50 hover:bg-primary/5",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
          ) : (
            <ImageIcon className="h-5 w-5 text-slate-400" />
          )}
        </button>
      )}

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
});
