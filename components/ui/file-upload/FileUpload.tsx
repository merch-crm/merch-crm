"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/formatters";
import { FileUploadProps, UploadedFile } from "./types";
import { FileItem } from "./FileItem";

export function FileUpload({
    value = [],
    onChange,
    onUpload,
    accept,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10 МБ
    multiple = true,
    disabled = false,
    label = "Загрузите файлы",
    description,
    className,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = React.useState(false);
    const [files, setFiles] = React.useState<UploadedFile[]>([]);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dragCounter = React.useRef(0);

    // Синхронизация с внешним value
    React.useEffect(() => {
        if (value.length > 0 && files.length === 0) {
            setFiles(
                value.map((file) => ({
                    id: crypto.randomUUID(),
                    file,
                    progress: 100,
                    status: "success" as const,
                    preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
                }))
            );
        }
    }, [value, files.length]);

    // Очистка превью при размонтировании
    React.useEffect(() => {
        return () => {
            files.forEach((f) => {
                if (f.preview) URL.revokeObjectURL(f.preview);
            });
        };
    }, [files]);

    const validateFile = (file: File): string | null => {
        if (maxSize && file.size > maxSize) {
            return `Файл слишком большой. Максимум: ${formatFileSize(maxSize)}`;
        }
        if (accept) {
            const acceptedTypes = accept.split(",").map((t) => t.trim());
            const fileType = file.type;
            const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

            const isAccepted = acceptedTypes.some((type) => {
                if (type.startsWith(".")) return fileExt === type.toLowerCase();
                if (type.endsWith("/*")) return fileType.startsWith(type.replace("/*", "/"));
                return fileType === type;
            });

            if (!isAccepted) {
                return "Недопустимый формат файла";
            }
        }
        return null;
    };

    const processFiles = async (newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles);
        const availableSlots = maxFiles - files.length;
        const filesToAdd = fileArray.slice(0, availableSlots);

        const uploadedFiles: UploadedFile[] = filesToAdd.map((file) => {
            const error = validateFile(file);
            return {
                id: crypto.randomUUID(),
                file,
                progress: error ? 0 : 0,
                status: error ? "error" : "pending",
                error: error || undefined,
                preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
            };
        });

        setFiles((prev) => [...prev, ...uploadedFiles]);

        // Загрузка файлов
        for (const uploadedFile of uploadedFiles) {
            if (uploadedFile.status === "error") continue;

            setFiles((prev) =>
                prev.map((f) =>
                    f.id === uploadedFile.id ? { ...f, status: "uploading" } : f
                )
            );

            // Симуляция прогресса
            const progressInterval = setInterval(() => {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === uploadedFile.id && f.progress < 90
                            ? { ...f, progress: f.progress + 10 }
                            : f
                    )
                );
            }, 100);

            try {
                if (onUpload) {
                    await onUpload(uploadedFile.file);
                } else {
                    // Симуляция загрузки
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                clearInterval(progressInterval);
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === uploadedFile.id
                            ? { ...f, progress: 100, status: "success" }
                            : f
                    )
                );
            } catch {
                clearInterval(progressInterval);
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === uploadedFile.id
                            ? { ...f, status: "error", error: "Ошибка загрузки" }
                            : f
                    )
                );
            }
        }

        // Обновляем внешнее состояние
        const successFiles = [...files, ...uploadedFiles]
            .filter((f) => f.status === "success" || f.status === "pending")
            .map((f) => f.file);
        onChange?.(successFiles);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        if (disabled) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
        // Сброс input для повторной загрузки того же файла
        e.target.value = "";
    };

    const removeFile = (id: string) => {
        setFiles((prev) => {
            const file = prev.find((f) => f.id === id);
            if (file?.preview) URL.revokeObjectURL(file.preview);
            return prev.filter((f) => f.id !== id);
        });

        const remainingFiles = files
            .filter((f) => f.id !== id && (f.status === "success" || f.status === "pending"))
            .map((f) => f.file);
        onChange?.(remainingFiles);
    };

    const acceptDescription = React.useMemo(() => {
        if (description) return description;
        const parts: string[] = [];
        if (accept) {
            const types = accept.split(",").map((t) => t.trim().replace(".", "").toUpperCase());
            parts.push(types.join(", "));
        }
        if (maxSize) {
            parts.push(`до ${formatFileSize(maxSize)}`);
        }
        return parts.join(" • ");
    }, [accept, maxSize, description]);

    return (
        <div className={cn("space-y-3", className)}>
            {/* Зона загрузки */}
            <div role="button" tabIndex={0}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={() => !disabled && inputRef.current?.click()}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                    isDragging
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                    disabled && "cursor-not-allowed opacity-50 hover:border-slate-200 hover:bg-transparent"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    disabled={disabled}
                    onChange={handleInputChange}
                    className="sr-only"
                />

                <div className="flex flex-col items-center gap-3">
                    <div
                        className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
                            isDragging ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
                        )}
                    >
                        <Upload className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{label}</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Перетащите файлы сюда или{" "}
                            <span className="text-primary font-medium">выберите</span>
                        </p>
                    </div>
                    {acceptDescription && (
                        <p className="text-xs text-slate-400">{acceptDescription}</p>
                    )}
                </div>

                {/* Оверлей при перетаскивании */}
                {isDragging && (
                    <div className="absolute inset-0 rounded-xl bg-primary/5 flex items-center justify-center">
                        <p className="text-sm font-bold text-primary">Отпустите для загрузки</p>
                    </div>
                )}
            </div>

            {/* Список файлов */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((uploadedFile) => (
                        <FileItem
                            key={uploadedFile.id}
                            uploadedFile={uploadedFile}
                            onRemove={() => removeFile(uploadedFile.id)}
                        />
                    ))}
                </div>
            )}

            {/* Счётчик файлов */}
            {maxFiles > 1 && (
                <p className="text-xs text-slate-400 text-right">
                    {files.length} / {maxFiles} файлов
                </p>
            )}
        </div>
    );
}
