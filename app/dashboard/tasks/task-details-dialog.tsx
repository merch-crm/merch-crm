"use client";

import {
    X,
    AlignLeft,
    User,
    CheckCircle2,
    Clock,
    UserCircle2,
    Trash2,
    Paperclip,
    FileIcon,
    FileText,
    Image as ImageIcon,
    Download,
    UploadCloud
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toggleTaskStatus, deleteTask, uploadTaskFile } from "./actions";
import { useTransition, useRef } from "react";

interface Attachment {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    contentType: string;
}

interface Task {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    assignedToUserId?: string | null;
    assignedToRoleId?: string | null;
    assignedToUser?: { name: string } | null;
    assignedToRole?: { name: string } | null;
    creator?: { name: string } | null;
    dueDate?: Date | string | null;
    createdAt: Date | string;
    attachments?: Attachment[];
}

interface TaskDetailsDialogProps {
    task: Task;
    onClose: () => void;
}

export function TaskDetailsDialog({ task, onClose }: TaskDetailsDialogProps) {
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case "high": return { label: "Высокий приоритет", color: "text-rose-600 bg-rose-50", iconColor: "text-rose-500" };
            case "normal": return { label: "Обычный приоритет", color: "text-amber-600 bg-amber-50", iconColor: "text-amber-500" };
            default: return { label: "Низкий приоритет", color: "text-slate-500 bg-slate-50", iconColor: "text-slate-400" };
        }
    };

    const handleToggle = () => {
        startTransition(async () => {
            await toggleTaskStatus(task.id, task.status);
            onClose();
        });
    };

    const handleDelete = () => {
        if (!confirm("Вы уверены, что хотите удалить эту задачу?")) return;
        startTransition(async () => {
            await deleteTask(task.id);
            onClose();
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        startTransition(async () => {
            const res = await uploadTaskFile(task.id, formData);
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

    const config = getPriorityConfig(task.priority);
    const isDone = task.status === "done";

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 border border-slate-100 max-h-[90vh] flex flex-col">
                <div className="overflow-y-auto p-10 pt-12 flex-1 scrollbar-hide">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-6 mb-8">
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                                <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", config.color)}>
                                    {config.label}
                                </span>
                                {isDone && (
                                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Выполнено
                                    </span>
                                )}
                            </div>
                            <h2 className={cn(
                                "text-3xl font-black text-slate-900 tracking-tight leading-tight",
                                isDone && "line-through text-slate-400"
                            )}>
                                {task.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-slate-100 rounded-2xl transition-all group"
                        >
                            <X className="w-6 h-6 text-slate-300 group-hover:text-slate-600" />
                        </button>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                    <UserCircle2 className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div className="flex flex-col pt-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Исполнитель</span>
                                    <span className="text-base font-black text-slate-900">
                                        {task.assignedToUser?.name || task.assignedToRole?.name || "Вся команда"}
                                    </span>
                                    <span className="text-sm font-medium text-slate-400">
                                        {task.assignedToRole ? "Групповое поручение" : "Персональная задача"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                    <Clock className="w-6 h-6 text-amber-500" />
                                </div>
                                <div className="flex flex-col pt-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Срок выполнения</span>
                                    <span className="text-base font-black text-slate-900">
                                        {task.dueDate ? format(new Date(task.dueDate), "d MMMM yyyy", { locale: ru }) : "Срок не установлен"}
                                    </span>
                                    <span className="text-sm font-medium text-slate-400 italic">
                                        {task.dueDate ? `Осталось совсем немного` : "Без привязки ко времени"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Создано</span>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                    <User className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">{task.creator?.name || "Система"}</p>
                                    <p className="text-xs font-medium text-slate-400">{format(new Date(task.createdAt), "HH:mm, dd.MM.yyyy")}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    {task.description && (
                        <div className="mb-10 p-8 bg-slate-50/30 rounded-3xl border border-slate-100/50">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlignLeft className="w-3.5 h-3.5" />
                                Подробное описание
                            </h4>
                            <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                                {task.description}
                            </p>
                        </div>
                    )}

                    {/* Attachments Section */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Paperclip className="w-3.5 h-3.5" />
                                Вложения ({task.attachments?.length || 0})
                            </h4>
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isPending}
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black hover:bg-indigo-100 transition-all disabled:opacity-50"
                            >
                                <UploadCloud className="w-3 h-3" />
                                ЗАГРУЗИТЬ
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {task.attachments?.map((file) => (
                                <a
                                    key={file.id}
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                                        {getFileIcon(file.contentType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-slate-900 truncate">{file.fileName}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{formatSize(file.fileSize)}</p>
                                    </div>
                                    <Download className="w-4 h-4 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                                </a>
                            ))}
                            {(!task.attachments || task.attachments.length === 0) && (
                                <div className="col-span-full py-8 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300">
                                    <Paperclip className="w-8 h-8 mb-2 opacity-20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Нет прикрепленных файлов</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="p-8 pt-0 mt-auto bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleToggle}
                            disabled={isPending}
                            className={cn(
                                "flex-1 py-4 rounded-2xl font-black shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3",
                                isDone
                                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-slate-200/50"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30"
                            )}
                        >
                            {isDone ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                            {isDone ? "ВЕРНУТЬ В РАБОТУ" : "ОТМЕТИТЬ КАК ВЫПОЛНЕНО"}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all active:scale-[0.98] shadow-lg shadow-rose-200/50"
                        >
                            <Trash2 className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
