"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageGalleryUploadProps, GalleryItem } from "./types";

export function ImageGalleryUpload({
    value = [],
    onChange,
    maxFiles = 6,
    maxSize = 5 * 1024 * 1024,
    disabled = false,
    className,
}: ImageGalleryUploadProps) {
    const [items, setItems] = React.useState<GalleryItem[]>([]);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Инициализация
    React.useEffect(() => {
        const safeValue = Array.isArray(value) ? value : [];
        if (Array.isArray(items) && items.length === 0 && safeValue.length > 0) {
            setItems(safeValue.map(url => ({ id: crypto.randomUUID(), url })));
        }
    }, [value, items]);

    const handleFiles = (newFileList: FileList) => {
        if (disabled) return;

        const safeItems = Array.isArray(items) ? items : [];
        const fileArray = Array.from(newFileList).filter((f) => f.size <= maxSize);
        const availableSlots = maxFiles - safeItems.length;
        const filesToAdd = fileArray.slice(0, availableSlots);

        if (filesToAdd.length === 0) return;

        const newItems: GalleryItem[] = filesToAdd.map((f) => ({
            id: crypto.randomUUID(),
            url: URL.createObjectURL(f),
            file: f
        }));

        setItems((prev) => {
            const updated = [...prev, ...newItems];
            const allNewFiles = updated
                .map(item => item.file)
                .filter((f): f is File => f !== undefined);

            // Вызываем onChange асинхронно, чтобы не блокировать рендер
            setTimeout(() => onChange?.(allNewFiles), 0);

            return updated;
        });
    };

    const removeImage = (id: string) => {
        if (disabled) return;

        setItems((prev) => {
            const removingItem = prev.find(i => i.id === id);
            if (removingItem?.file) {
                URL.revokeObjectURL(removingItem.url);
            }

            const updated = prev.filter((item) => item.id !== id);
            const allNewFiles = updated
                .map(item => item.file)
                .filter((f): f is File => f !== undefined);

            setTimeout(() => onChange?.(allNewFiles), 0);

            return updated;
        });
    };

    return (
        <div className={cn("grid grid-cols-3 gap-3", className)}>
            {Array.isArray(items) && items.map((item, index) => (
                <div key={item.id} className="relative aspect-square group">
                    <Image
                        src={item.url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl border border-slate-100"
                        width={200}
                        height={200}
                    />
                    {!disabled && (
                        <button
                            type="button"
                            onClick={() => removeImage(item.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-slate-900"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            ))}

            {Array.isArray(items) && items.length < maxFiles && !disabled && (
                <div role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={() => inputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-all group"
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            if (e.target.files) handleFiles(e.target.files);
                            e.target.value = "";
                        }}
                        className="sr-only"
                    />
                    <div className="text-center group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                        <p className="text-xs font-medium text-slate-500">Добавить</p>
                    </div>
                </div>
            )}
        </div>
    );
}
