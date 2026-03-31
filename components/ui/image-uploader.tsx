import React, { useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useImageUploader, UseImageUploaderOptions } from "@/hooks/use-image-uploader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export type UploadedImage = {
    file?: File;
    preview: string;
};

export interface ImageUploaderProps extends UseImageUploaderOptions {
    value?: UploadedImage[];
    onChange?: (images: UploadedImage[]) => void;
    multiple?: boolean;
    className?: string;
    label?: string;
    sublabel?: string;
}

export function ImageUploader({
    value = [],
    onChange,
    multiple = false,
    maxFiles = multiple ? Infinity : 1,
    maxSizeMB = 1,
    maxWidth = 1920,
    maxHeight = 1920,
    maxOriginalSizeMB = 20,
    type = "image/webp",
    className,
    label = "Загрузить фото",
    sublabel: _sublabel = "SVG, PNG, JPG или WebP",
}: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const { isProcessing, uploadStates, processFiles, cancelUpload } = useImageUploader({
        maxFiles,
        maxSizeMB,
        maxWidth,
        maxHeight,
        maxOriginalSizeMB,
        type,
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Если не multiple и уже есть файл (и maxFiles = 1), заменяем
        const currentCount = (multiple && maxFiles > 1) ? value.length : 0;

        const newProcessed = await processFiles(
            files,
            currentCount,
            undefined, // onFileProcessed
            (errorMsg) => {
                toast(errorMsg, "destructive");
            }
        );

        if (newProcessed.length > 0) {
            const newImages = newProcessed.map(p => ({
                file: p.file,
                preview: p.preview
            }));

            if (multiple && maxFiles > 1) {
                onChange?.([...value, ...newImages]);
            } else {
                onChange?.(newImages); // Заменяем полностью
            }
        }

        // Сброс input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemove = (index: number) => {
        const newImages = [...value];
        newImages.splice(index, 1);
        onChange?.(newImages);
    };

    return (
        <div className={cn("w-full flex gap-3 flex-wrap", className)}>
            {/* Отрисовка текущих загруженных/загружаемых изображений */}
            {value.map((img, idx) => (
                <div
                    key={idx}
                    className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group shrink-0"
                >
                    <Image
                        src={img.preview}
                        alt={`Upload ${idx}`}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            variant="destructive"
                            size="icon"
                            className="w-8 h-8 rounded-full"
                            onClick={(e) => {
                                e.preventDefault();
                                handleRemove(idx);
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}

            {/* Отрисовка процесса загрузки (skeletons) */}
            {Object.keys(uploadStates).map((key) => {
                const index = Number(key);
                const state = uploadStates[index];
                if (!state.uploading) return null;
                return (
                    <div
                        key={`loading-${key}`}
                        className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col items-center justify-center shrink-0 group"
                    >
                        <Loader2 className="w-5 h-5 text-slate-400 animate-spin mb-2" />
                        <span className="text-xs font-bold text-slate-500">{state.progress}%</span>

                        {/* Progress bar background */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
                            <div
                                className="h-full bg-primary transition-all duration-100"
                                style={{ width: `${state.progress}%` }}
                            />
                        </div>

                        {/* Cancel Button */}
                        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    cancelUpload(index);
                                }}
                                className="p-1.5 rounded-full bg-white shadow-sm hover:scale-110 hover:bg-red-50 transition-all border border-slate-200"
                                title="Отменить"
                            >
                                <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
                            </button>
                        </div>
                    </div>
                );
            })}

            {/* Кнопка добавления (если лимит не исчерпан) */}
            {value.length < maxFiles && (
                <label
                    className={cn(
                        "w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50 hover:bg-primary/5 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 shrink-0",
                        isProcessing && "opacity-50 pointer-events-none"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple={multiple}
                        onChange={handleFileChange}
                        disabled={isProcessing}
                    />
                    <Plus className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 text-center px-1 leading-tight hidden group-hover/btn:block">
                        {label}
                    </span>
                </label>
            )}
        </div>
    );
}
