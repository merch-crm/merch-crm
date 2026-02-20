"use client";

import NextImage from "next/image";
import {
    User,
    Clock,
    UserCircle2,
    AlignLeft,
    Paperclip,
    UploadCloud,
    Download,
    Image as ImageIcon,
    FileText,
    FileIcon
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/formatters";
import { Task } from "../types";

interface TaskDetailsTabProps {
    task: Task;
    isPending: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TaskDetailsTab({ task, isPending, fileInputRef, onFileUpload }: TaskDetailsTabProps) {
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
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-400 mb-1">Исполнитель</div>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                            {task.assignedToUser?.avatar ? (
                                <NextImage src={task.assignedToUser.avatar} alt={task.assignedToUser.name} width={36} height={36} className="w-full h-full object-cover" unoptimized />
                            ) : (
                                <UserCircle2 className="w-5 h-5 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight">
                                {task.assignedToUser?.name || task.assignedToDepartment?.name || "Все"}
                            </p>
                            <p className="text-xs font-bold text-slate-400">
                                {task.assignedToDepartmentId ? "Групповая задача" : "Персональная"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6 text-amber-500" />
                        </div>
                        <div className="flex flex-col pt-1">
                            <span className="text-xs font-bold text-slate-400 mb-1">Срок выполнения</span>
                            <span className="text-base font-bold text-slate-900">
                                {task.dueDate ? formatDate(task.dueDate, "d MMMM yyyy") : "Срок не установлен"}
                            </span>
                            <div className="text-sm text-slate-400">
                                {task.dueDate ? `Осталось совсем немного` : "Без привязки ко времени"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200">
                    <span className="text-xs font-bold text-slate-400 block mb-4">Создано</span>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{task.creator?.name || "Система"}</p>
                            <p className="text-xs font-medium text-slate-400">{formatDateTime(task.createdAt, "HH:mm, dd.MM.yyyy")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {task.description && (
                <div className="mb-10 p-8 bg-slate-50/30 rounded-2xl border border-slate-200/50">
                    <h4 className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-2">
                        <AlignLeft className="w-3.5 h-3.5" />
                        Подробное описание
                    </h4>
                    <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                        {task.description}
                    </p>
                </div>
            )}

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-slate-400 flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5" />
                        Вложения ({task.attachments?.length || 0})
                    </h4>
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={onFileUpload}
                    />
                    <button type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPending}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-2xl text-xs font-bold hover:bg-primary/10 transition-all disabled:opacity-50"
                    >
                        <UploadCloud className="w-3 h-3" />
                        Загрузить
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {task.attachments?.map((file) => (
                        <a
                            key={file.id}
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                        >
                            <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                                {getFileIcon(file.contentType || "")}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{file.fileName}</p>
                                <p className="text-xs font-bold text-slate-400">{formatSize(file.fileSize || 0)}</p>
                            </div>
                            <Download className="w-4 h-4 text-slate-200 group-hover:text-primary transition-colors" />
                        </a>
                    ))}
                    {(!task.attachments || task.attachments.length === 0) && (
                        <div className="col-span-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                            <Paperclip className="w-8 h-8 mb-2 opacity-20" />
                            <span className="text-xs font-bold">Нет прикрепленных файлов</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
