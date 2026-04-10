import React, { useCallback } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
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
    const { toast } = useToast();

    const { isProcessing, uploadStates, processFiles, cancelUpload } = useImageUploader({
        maxFiles,
        maxSizeMB,
        maxWidth,
        maxHeight,
        maxOriginalSizeMB,
        type,
    });

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const currentCount = (multiple && maxFiles > 1) ? value.length : 0;

        const newProcessed = await processFiles(
            acceptedFiles,
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
                onChange?.(newImages);
            }
        }
    }, [multiple, maxFiles, value, processFiles, onChange, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple,
        disabled: isProcessing || value.length >= maxFiles,
    });

    const handleRemove = (index: number) => {
        const newImages = [...value];
        newImages.splice(index, 1);
        onChange?.(newImages);
    };

    return (
        <div className={cn("w-full flex gap-3 flex-wrap items-start", className)}>
            <AnimatePresence mode="popLayout" initial={false}>
                {/* Отрисовка текущих загруженных/загружаемых изображений */}
                {value.map((img, idx) => (
                    <motion.div
                        key={img.preview}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200/60 bg-white/50 backdrop-blur-sm group shrink-0 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <Image src={img.preview} alt={`Upload ${idx}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                            <Button type="button" variant="solid" color="danger" size="icon" className="w-9 h-9 rounded-full scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg" onClick={(e) => {
                                    e.preventDefault();
                                    handleRemove(idx);
                                }}
                            >
                                <Trash2 className="w-4.5 h-4.5" />
                            </Button>
                        </div>
                    </motion.div>
                ))}

                {/* Отрисовка процесса загрузки (skeletons) */}
                {Object.keys(uploadStates).map((key) => {
                    const index = Number(key);
                    const state = uploadStates[index];
                    if (!state.uploading) return null;
                    return (
                        <motion.div
                            key={`loading-${key}`}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50/50 backdrop-blur-sm flex flex-col items-center justify-center shrink-0 group border-dashed"
                        >
                            <Loader2 className="w-6 h-6 text-primary/60 animate-spin mb-2" />
                            <span className="text-[11px] font-bold text-slate-500 tabular-nums">{state.progress}%</span>

                            {/* Progress bar glassmorphism */}
                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100/50 overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${state.progress}%` }}
                                    transition={{ duration: 0.2 }}
                                />
                            </div>

                            {/* Cancel Button */}
                            <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        cancelUpload(index);
                                    }}
                                    className="p-2 rounded-full bg-white/90 shadow-sm hover:scale-110 hover:bg-red-50 transition-all border border-slate-200/50 backdrop-blur-md"
                                    title="Отменить"
                                >
                                    <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Кнопка добавления */}
                {value.length < maxFiles && (
                    (() => {
                        const { onAnimationStart: _onAnimationStart, onDragStart: _onDragStart, onDragEnd: _onDragEnd, onDrag: _onDrag, ...rootProps } = getRootProps();
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                {...rootProps}
                                className={cn(
                                    "w-28 h-28 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 shrink-0 group/btn relative overflow-hidden",
                                    isDragActive && "border-primary bg-primary/5 scale-105",
                                    isProcessing && "opacity-50 pointer-events-none"
                                )}
                            >
                                <input {...getInputProps()} />
                                <div className="relative">
                                    <Plus className={cn("w-7 h-7 text-slate-400 transition-all duration-300 group-hover/btn:scale-110 group-hover/btn:text-primary", isDragActive && "text-primary scale-125")} />
                                    {isDragActive && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1.2 }}
                                            className="absolute -inset-2 bg-primary/10 rounded-full blur-md -z-10"
                                        />
                                    )}
                                </div>
                                
                                <div className="flex flex-col items-center text-center px-2">
                                    <span className="text-[11px] font-bold text-slate-500 leading-tight group-hover/btn:text-primary transition-colors">
                                        {isDragActive ? "Бросайте сюда" : label}
                                    </span>
                                    {_sublabel && !isDragActive && (
                                        <span className="text-[11px] text-slate-400 leading-tight mt-0.5 opacity-80">
                                            {_sublabel}
                                        </span>
                                    )}
                                </div>

                                {/* Animated background gradient on hover */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none" />
                            </motion.div>
                        );
                    })()
                )}
            </AnimatePresence>
        </div>
    );
}
