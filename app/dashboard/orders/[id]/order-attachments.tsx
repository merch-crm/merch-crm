"use client";

import {
    Paperclip,
    FileIcon,
    FileText,
    Image as ImageIcon,
    Download,
    UploadCloud,
    Plus
} from "lucide-react";
import { useTransition, useRef } from "react";
import { uploadOrderFile } from "../actions";

interface Attachment {
    id: string;
    fileUrl: string;
    fileName: string;
    fileSize: number | null;
    contentType: string | null;
}

interface OrderAttachmentsProps {
    orderId: string;
    attachments: Attachment[];
}

export default function OrderAttachments({ orderId, attachments = [] }: OrderAttachmentsProps) {
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        startTransition(async () => {
            const res = await uploadOrderFile(orderId, formData);
            if (res.error) alert(res.error);
        });
    };

    const getFileIcon = (contentType: string) => {
        if (contentType?.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
        if (contentType?.includes("pdf") || contentType?.includes("text")) return <FileText className="w-5 h-5 text-orange-500" />;
        return <FileIcon className="w-5 h-5 text-slate-400" />;
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return "0 Б";
        const k = 1024;
        const sizes = ["Б", "КБ", "МБ", "ГБ"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900 flex items-center uppercase tracking-widest text-xs">
                    <Paperclip className="w-4 h-4 mr-3 text-indigo-500" />
                    Макеты и документы ({attachments.length})
                </h3>
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black hover:bg-indigo-100 transition-all disabled:opacity-50 uppercase tracking-widest"
                >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Загрузить
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attachments.map((file: Attachment) => (
                    <a
                        key={file.id}
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                    >
                        <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                            {getFileIcon(file.contentType || "")}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{file.fileName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{file.fileSize ? formatSize(file.fileSize) : "0 B"}</p>
                        </div>
                        <Download className="w-4 h-4 text-slate-200 group-hover:text-indigo-400 transition-colors shrink-0" />
                    </a>
                ))}

                {attachments.length === 0 && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="col-span-full border-2 border-dashed border-slate-100 rounded-3xl p-10 text-center text-slate-400 cursor-pointer hover:border-indigo-200 hover:bg-slate-50/50 transition-all group"
                    >
                        <div className="mx-auto w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-slate-300 group-hover:text-indigo-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500">Нет прикрепленных файлов</p>
                        <p className="text-[10px] font-medium text-slate-400">Нажмите, чтобы добавить макет или ТЗ</p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface Attachment {
    id: string;
    fileUrl: string;
    fileName: string;
    fileSize: number | null;
    contentType: string | null;
}
