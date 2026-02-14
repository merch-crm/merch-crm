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
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

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
    const { toast } = useToast();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        startTransition(async () => {
            const res = await uploadOrderFile(orderId, formData);
            if (res.error) {
                toast(res.error, "error");
            } else {
                toast("Файл успешно загружен", "success");
            }
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
        <div className="crm-card !p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 flex items-center  tracking-normal text-xs">
                    <Paperclip className="w-4 h-4 mr-3 text-primary" />
                    Макеты и документы ({attachments.length})
                </h3>
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />
                <Button
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-2xl text-[10px] font-bold hover:bg-primary/10 transition-all disabled:opacity-50 tracking-normal h-auto"
                >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Загрузить
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attachments.map((file: Attachment) => (
                    <a
                        key={file.id}
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all group"
                    >
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                            {getFileIcon(file.contentType || "")}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate  tracking-normal">{file.fileName}</p>
                            <p className="text-[10px] font-bold text-slate-400  tracking-normal">{file.fileSize ? formatSize(file.fileSize) : "0 B"}</p>
                        </div>
                        <Download className="w-4 h-4 text-slate-200 group-hover:text-primary transition-colors shrink-0" />
                    </a>
                ))}

                {attachments.length === 0 && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="col-span-full border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 cursor-pointer hover:border-primary/20 hover:bg-slate-50/50 transition-all group"
                    >
                        <div className="mx-auto w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-slate-300 group-hover:text-primary" />
                        </div>
                        <p className="text-[10px] font-bold  tracking-normal mb-1 text-slate-500">Нет прикрепленных файлов</p>
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
