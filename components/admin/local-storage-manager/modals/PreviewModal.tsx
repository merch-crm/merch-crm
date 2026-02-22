"use client";

import React from "react";
import NextImage from "next/image";
import { File, ExternalLink } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";

interface PreviewModalProps {
    file: { name: string, url: string, type: 'image' | 'other' } | null;
    onClose: () => void;
    onExternalOpen: (url: string) => void;
}

export function PreviewModal({
    file,
    onClose,
    onExternalOpen
}: PreviewModalProps) {
    return (
        <ResponsiveModal
            isOpen={!!file}
            onClose={onClose}
            title="Просмотр файла"
            description={file?.name || "Информация о файле"}
        >
            {file && (
                <div className="space-y-3">
                    <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
                        {file.type === 'image' ? (
                            <NextImage
                                src={file.url}
                                alt={file.name}
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <File size={48} className="text-slate-700 mb-4" />
                                <p className="text-sm font-bold text-slate-500">Предпросмотр недоступен</p>
                            </div>
                        )}
                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button"
                                onClick={() => onExternalOpen(file.url)}
                                className="p-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl transition-colors"
                            >
                                <ExternalLink size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={() => onExternalOpen(file.url)}
                            className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl font-bold h-12"
                        >
                            <ExternalLink size={16} className="mr-2" />
                            Открыть
                        </Button>
                        <Button
                            onClick={onClose}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-12 shadow-md shadow-emerald-100"
                        >
                            Закрыть
                        </Button>
                    </div>
                </div>
            )}
        </ResponsiveModal>
    );
}
