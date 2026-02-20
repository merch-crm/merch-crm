"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageUploadProps } from "./types";

export function ImageUpload({
    value,
    onChange,
    onUpload,
    accept = "image/*",
    maxSize = 5 * 1024 * 1024,
    disabled = false,
    placeholder = "Загрузить фото",
    className,
    size = "md",
}: ImageUploadProps) {
    const [preview, setPreview] = React.useState<string | null>(value || null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (value) setPreview(value);
    }, [value]);

    const sizeClasses = {
        sm: "w-20 h-20",
        md: "w-32 h-32",
        lg: "w-40 h-40",
    };

    const handleFile = async (file: File) => {
        if (file.size > maxSize) {
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);
        setIsUploading(true);

        try {
            if (onUpload) {
                const url = await onUpload(file);
                setPreview(url);
                URL.revokeObjectURL(localPreview);
            }
            onChange?.(file);
        } catch {
            setPreview(value || null);
            URL.revokeObjectURL(localPreview);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleRemove = () => {
        setPreview(null);
        onChange?.(null);
    };

    return (
        <div
            className={cn("relative group", sizeClasses[size], className)}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                disabled={disabled}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = "";
                }}
                className="sr-only"
            />

            <div role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={() => !disabled && !isUploading && inputRef.current?.click()}
                className={cn(
                    "w-full h-full rounded-xl border-2 border-dashed overflow-hidden cursor-pointer transition-all flex items-center justify-center",
                    isDragging
                        ? "border-primary bg-primary/5"
                        : preview
                            ? "border-transparent"
                            : "border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100",
                    disabled && "cursor-not-allowed opacity-50"
                )}
            >
                {preview ? (
                    <Image
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        width={200}
                        height={200}
                    />
                ) : (
                    <div className="text-center p-2">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                        <p className="text-xs text-slate-500 mt-1">{placeholder}</p>
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                )}
            </div>

            {/* Кнопка удаления */}
            {preview && !isUploading && !disabled && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}
