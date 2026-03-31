"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Image from "next/image";
import {
    Upload,
    File as FileIcon,
    Download,
    Eye,
    Loader2,
    Trash2,
    History
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { uploadDesignFile, deleteDesignFile, DesignFile } from "@/app/(main)/dashboard/design/actions/order-design-actions";

interface FileUploadZoneProps {
    taskId: string;
    type: "source" | "preview" | "mockup" | "client_file";
    files: DesignFile[];
    onUpdate: (file: DesignFile) => void;
}

const typeLabels: Record<string, string> = {
    source: "исходник",
    preview: "превью",
    mockup: "мокап",
    client_file: "файл от клиента",
};

export function FileUploadZone({ taskId, type, files, onUpdate }: FileUploadZoneProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewFile, setPreviewFile] = useState<DesignFile | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setIsUploading(true);

        for (const file of acceptedFiles) {
            const result = await uploadDesignFile({
                taskId,
                type,
                file,
            });

            if (result.success && result.data) {
                onUpdate(result.data);
                toast.success(`Файл "${file.name}" загружен`);
            } else {
                toast.error(result.error || `Ошибка загрузки "${file.name}"`);
            }
        }

        setIsUploading(false);
    }, [taskId, type, onUpdate]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
            "application/pdf": [".pdf"],
            "application/postscript": [".ai", ".eps"],
            "image/vnd.adobe.photoshop": [".psd"],
        },
        maxSize: 50 * 1024 * 1024, // 50MB
        disabled: isUploading,
    });

    const handleDelete = async (fileId: string) => {
        const result = await deleteDesignFile(fileId);

        if (result.success) {
            toast.success("Файл удалён");
            // В реальном приложении здесь нужно убрать файл из списка через onUpdate или рефетч
        } else {
            toast.error(result.error);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const activeFiles = files.filter((f) => f.isActive);
    const archivedFiles = files.filter((f) => !f.isActive);

    return (
        <div className="space-y-3">
            <div
                {...getRootProps()}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive ? "border-lime-500 bg-lime-50" : "border-muted-foreground/25 hover:border-lime-500/50 hover:bg-muted/30"}
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
            >
                <input {...getInputProps()} />
                {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-lime-600" />
                        <p className="text-sm font-medium text-muted-foreground">Загрузка файлов...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <Upload className="h-10 w-10 text-muted-foreground/50" />
                        <div>
                            <p className="text-sm font-medium">
                                {isDragActive
                                    ? "Отпустите файлы здесь"
                                    : `Нажмите или перетащите ${typeLabels[type]}`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG, PDF, AI, PSD до 50MB
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {activeFiles.length > 0 && (
                <div className="space-y-3">
                    {activeFiles.map((file) => (
                        <Card key={file.id} className="p-3 border-l-4 border-l-lime-500">
                            <div className="flex items-center gap-3">
                                {file.thumbnailPath || file.mimeType?.startsWith("image/") ? (
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className="relative w-16 h-16 bg-white border rounded overflow-hidden cursor-pointer flex-shrink-0"
                                        onClick={() => { if (file.path) setPreviewFile(file); }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                if (file.path) setPreviewFile(file);
                                            }
                                        }}
                                    >
                                        <Image
                                            src={file.thumbnailPath || file.path}
                                            alt={file.originalName || "File"}
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                                        <FileIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm truncate">{file.originalName}</p>
                                        <Badge variant="secondary" className="text-xs py-0 h-4">v{file.version}</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                        <span>{formatFileSize(file.size || 0)}</span>
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                        <span>
                                            {file.createdAt ? format(new Date(file.createdAt), "d MMM, HH:mm", { locale: ru }) : "—"}
                                        </span>
                                    </div>
                                    {file.comment && (
                                        <p className="text-xs text-muted-foreground mt-1 italic">
                                            &quot;{file.comment}&quot;
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {(file.thumbnailPath || file.mimeType?.startsWith("image/")) && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9"
                                            onClick={() => { if (file.path) setPreviewFile(file); }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                        asChild
                                    >
                                        <a href={file.path} download={file.originalName}>
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(file.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {archivedFiles.length > 0 && (
                <details className="text-xs group">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground list-none flex items-center gap-2 py-1 px-2 rounded-md hover:bg-muted w-fit transition-colors">
                        <History className="h-3 w-3" />
                        <span>Предыдущие версии ({archivedFiles.length})</span>
                    </summary>
                    <div className="mt-2 space-y-2 pl-6 border-l-2 ml-2">
                        {archivedFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between text-muted-foreground group/item">
                                <span className="truncate">
                                    v{file.version} — {file.originalName} — {file.createdAt ? format(new Date(file.createdAt), "d MMM", { locale: ru }) : "—"}
                                </span>
                                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                    <a href={file.path} download={file.originalName}>
                                        <Download className="h-3 w-3" />
                                    </a>
                                </Button>
                            </div>
                        ))}
                    </div>
                </details>
            )}

            <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
                <DialogContent className="max-w-4xl p-1 bg-zinc-900 border-zinc-800 outline-none">
                    <DialogHeader className="p-4 border-b border-white/5">
                        <DialogTitle className="text-white flex items-center gap-3">
                            <span className="text-sm font-mono text-white/50">v{previewFile?.version}</span>
                            {previewFile?.originalName}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center bg-zinc-950 min-h-[50vh] max-h-[80vh] overflow-auto">
                        {previewFile && (
                            <div className="relative w-full min-h-[50vh]">
                                <Image
                                    src={previewFile.path || "/placeholder.png"}
                                    alt={previewFile.originalName || "File"}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        )}
                    </div>
                    <div className="p-4 flex justify-end">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" asChild>
                            <a href={previewFile?.path || "#"} download={previewFile?.originalName || "file"}>
                                <Download className="mr-2 h-4 w-4" />
                                Скачать оригинал
                            </a>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
