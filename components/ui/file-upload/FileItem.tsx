import * as React from "react";
import Image from "next/image";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/formatters";
import { FileItemProps } from "./types";
import { getFileIcon } from "./utils";

export function FileItem({ uploadedFile, onRemove }: FileItemProps) {
    const { file, progress, status, error, preview } = uploadedFile;

    return (
        <div
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                status === "error"
                    ? "border-rose-200 bg-rose-50"
                    : status === "success"
                        ? "border-slate-200 bg-white"
                        : "border-slate-200 bg-slate-50"
            )}
        >
            {/* Превью или иконка */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                {preview ? (
                    <Image
                        src={preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        width={80}
                        height={80}
                    />
                ) : (
                    <span className="text-slate-400">{getFileIcon(file)}</span>
                )}
            </div>

            {/* Информация о файле */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
                    {status === "error" && error && (
                        <span className="text-xs text-rose-500">{error}</span>
                    )}
                </div>

                {/* Прогресс-бар */}
                {status === "uploading" && (
                    <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Статус / Действия */}
            <div className="shrink-0">
                {status === "uploading" && (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
                {status === "success" && (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
                {status === "error" && (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                )}
                {(status === "success" || status === "error") && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="ml-2 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                )}
            </div>
        </div>
    );
}
