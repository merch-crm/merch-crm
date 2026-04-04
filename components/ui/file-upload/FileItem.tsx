import * as React from"react";
import Image from"next/image";
import { X, CheckCircle, AlertCircle, Loader2 } from"lucide-react";
import { cn } from"@/lib/utils";
import { formatFileSize } from"@/lib/formatters";
import { FileItemProps } from"./types";
import { getFileIcon } from"./utils";

export function FileItem({ uploadedFile, onRemove }: FileItemProps) {
    const { file, progress, status, error, preview } = uploadedFile;

    return (
        <div
            className={cn(
                "group relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300",
                status === "error"
                    ? "border-rose-200 bg-rose-50/50 shadow-sm shadow-rose-100/20"
                    : status === "success"
                        ? "border-slate-100 bg-white shadow-sm hover:border-slate-200 hover:shadow-md"
                        : "border-slate-100 bg-slate-50/30"
            )}
        >
            {/* Preview or Icon */}
            <div className="relative size-12 rounded-xl overflow-hidden bg-slate-100/80 border border-slate-200/50 flex items-center justify-center shrink-0 shadow-inner">
                {preview ? (
                    <Image
                        src={preview}
                        alt={file.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        width={80}
                        height={80}
                    />
                ) : (
                    <div className="text-slate-400 group-hover:text-primary-base transition-colors duration-300">
                        {getFileIcon(file)}
                    </div>
                )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black text-slate-900 truncate   font-heading leading-tight">
                        {file.name}
                    </p>
                    {status === "success" && (
                        <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                    )}
                    {status === "error" && (
                        <AlertCircle className="size-4 text-rose-500 shrink-0" />
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-slate-400   leading-none">
                        {formatFileSize(file.size)}
                    </span>
                    {status === "error" && error && (
                        <span className="text-[11px] font-bold text-rose-500 leading-none truncate">
                            • {error}
                        </span>
                    )}
                </div>

                {/* Progress Bar */}
                {status === "uploading" && (
                    <div className="mt-3 w-full">
                        <div className="flex items-center justify-between mb-1.5">
                           <span className="text-[11px] font-black text-primary-base   animate-pulse">Загрузка...</span>
                           <span className="text-[11px] font-bold text-slate-500">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                            <div
                                className="h-full bg-primary-base rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(var(--primary-base-rgb),0.3)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Action Button */}
            {(status === "success" || status === "error") && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove?.();
                    }}
                    className="size-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 border border-slate-200 transition-all duration-300 group/btn"
                    title="Удалить файл"
                >
                    <X className="size-4 group-hover/btn:rotate-90 transition-transform duration-300" />
                </button>
            )}

            {status === "uploading" && (
                <div className="shrink-0 size-8 flex items-center justify-center">
                    <Loader2 className="size-5 text-primary-base animate-spin" />
                </div>
            )}
        </div>
    );
}
