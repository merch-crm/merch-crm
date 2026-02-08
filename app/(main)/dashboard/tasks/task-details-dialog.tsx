"use client";

import NextImage from "next/image";
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
import { Task } from "./types";
import {
    toggleTaskStatus,
    deleteTask,
    uploadTaskFile,
    addTaskComment,
    addTaskChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
} from "./actions";
import { playSound } from "@/lib/sounds";
import { useTransition, useRef, useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";


interface TaskDetailsDialogProps {
    task: Task;
    onClose: () => void;
}

export function TaskDetailsDialog({ task, onClose }: TaskDetailsDialogProps) {
    const [isPending, startTransition] = useTransition();

    // Lock scroll on mount
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'checklist' | 'comments' | 'history'>('details');
    const [newComment, setNewComment] = useState("");
    const [newChecklistItem, setNewChecklistItem] = useState("");
    const { toast } = useToast();
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
            const res = await toggleTaskStatus(task.id, task.status);
            if (res.success) {
                toast(task.status === "done" ? "Задача возвращена в работу" : "Задача выполнена", "success");
                if (task.status !== "done") playSound("task_completed");
                else playSound("notification_success");
                onClose();
            } else {
                toast(res.error || "Ошибка", "error");
                playSound("notification_error");
            }
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            const res = await deleteTask(task.id);
            if (res.success) {
                toast("Задача удалена", "success");
                playSound("notification_success");
                onClose();
            } else {
                toast(res.error || "Ошибка при удалении", "error");
                playSound("notification_error");
            }
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        startTransition(async () => {
            const res = await uploadTaskFile(task.id, formData);
            if (res.error) {
                toast(res.error, "error");
                playSound("notification_error");
            } else {
                toast("Файл загружен", "success");
                playSound("notification_success");
            }
        });
    };

    const getFileIcon = (contentType: string) => {
        if (contentType?.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
        if (contentType?.includes("pdf") || contentType?.includes("text")) return <FileText className="w-5 h-5 text-orange-500" />;
        return <FileIcon className="w-5 h-5 text-slate-400" />;
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        startTransition(async () => {
            const res = await addTaskComment(task.id, newComment.trim());
            if (res.success) {
                setNewComment("");
                toast("Комментарий добавлен", "success");
                playSound("notification_success");
            } else {
                toast(res.error || "Ошибка", "error");
                playSound("notification_error");
            }
        });
    };

    const handleAddChecklistItem = () => {
        if (!newChecklistItem.trim()) return;
        startTransition(async () => {
            const res = await addTaskChecklistItem(task.id, newChecklistItem.trim());
            if (res.success) {
                setNewChecklistItem("");
                toast("Пункт добавлен", "success");
                playSound("notification_success");
            } else {
                toast(res.error || "Ошибка", "error");
                playSound("notification_error");
            }
        });
    };

    const handleToggleChecklist = (id: string, completed: boolean) => {
        startTransition(async () => {
            const res = await toggleChecklistItem(id, completed);
            if (!res.success) {
                toast(res.error || "Ошибка", "error");
                playSound("notification_error");
            }
        });
    };

    const handleDeleteChecklist = (id: string) => {
        startTransition(async () => {
            const res = await deleteChecklistItem(id);
            if (!res.success) {
                toast(res.error || "Ошибка", "error");
                playSound("notification_error");
            } else {
                toast("Пункт удален", "success");
                playSound("notification_success");
            }
        });
    };

    interface TaskActivity {
        type: string;
        oldValue?: string | null;
        newValue?: string | null;
    }

    const getActivityLabel = (activity: TaskActivity) => {
        switch (activity.type) {
            case 'status_change': return `заменил статус с ${activity.oldValue} на ${activity.newValue}`;
            case 'comment_add': return `добавил комментарий`;
            case 'file_upload': return `загрузил файл`;
            case 'checklist_update': return activity.newValue || "обновил чек-лист";
            default: return "сделал изменение";
        }
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true" data-dialog-open="true">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 border border-slate-200 max-h-[90vh] flex flex-col">
                <div className="overflow-y-auto p-10 pt-12 flex-1 scrollbar-hide">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-6 mb-8">
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                                <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold  tracking-normal", config.color)}>
                                    {config.label}
                                </span>
                                {isDone && (
                                    <span className="px-4 py-1.5 rounded-full text-[10px] font-bold  tracking-normal bg-emerald-50 text-emerald-600 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Выполнено
                                    </span>
                                )}
                            </div>
                            <h2 className={cn(
                                "text-3xl font-bold text-slate-900 tracking-normal leading-tight",
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

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
                        {[
                            { id: 'details', label: 'Детали' },
                            { id: 'checklist', label: 'Чек-лист' },
                            { id: 'comments', label: 'Обсуждение' },
                            { id: 'history', label: 'История' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as "details" | "checklist" | "comments" | "history")}
                                className={cn(
                                    "px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "border-primary text-primary"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {tab.label}
                                {tab.id === 'checklist' && task.checklists && task.checklists.length > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px]">
                                        {task.checklists.filter(i => i.isCompleted).length}/{task.checklists.length}
                                    </span>
                                )}
                                {tab.id === 'comments' && task.comments && task.comments.length > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-primary/5 text-primary rounded-md text-[10px]">
                                        {task.comments.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Section */}
                    {activeTab === 'details' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                <div className="space-y-8">
                                    <div className="text-[11px] font-bold text-slate-400  tracking-normal mb-1">Исполнитель</div>
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
                                            <p className="text-[10px] font-bold text-slate-400  tracking-normal">
                                                {task.assignedToDepartmentId ? "Групповая задача" : "Персональная"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                            <Clock className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <div className="flex flex-col pt-1">
                                            <span className="text-xs font-bold text-slate-400  tracking-normal mb-1">Срок выполнения</span>
                                            <span className="text-base font-bold text-slate-900">
                                                {task.dueDate ? format(new Date(task.dueDate), "d MMMM yyyy", { locale: ru }) : "Срок не установлен"}
                                            </span>
                                            <div className="text-sm text-slate-400">
                                                {task.dueDate ? `Осталось совсем немного` : "Без привязки ко времени"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400  tracking-normal block mb-4">Создано</span>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                            <User className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{task.creator?.name || "Система"}</p>
                                            <p className="text-xs font-medium text-slate-400">{format(new Date(task.createdAt), "HH:mm, dd.MM.yyyy")}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {task.description && (
                                <div className="mb-10 p-8 bg-slate-50/30 rounded-2xl border border-slate-200/50">
                                    <h4 className="text-xs font-bold text-slate-400  tracking-normal mb-4 flex items-center gap-2">
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
                                    <h4 className="text-xs font-bold text-slate-400  tracking-normal flex items-center gap-2">
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
                                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-2xl text-[10px] font-bold hover:bg-primary/10 transition-all disabled:opacity-50"
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
                                            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                                        >
                                            <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                                                {getFileIcon(file.contentType || "")}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">{file.fileName}</p>
                                                <p className="text-[10px] font-bold text-slate-400  tracking-normal">{formatSize(file.fileSize || 0)}</p>
                                            </div>
                                            <Download className="w-4 h-4 text-slate-200 group-hover:text-primary transition-colors" />
                                        </a>
                                    ))}
                                    {(!task.attachments || task.attachments.length === 0) && (
                                        <div className="col-span-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                                            <Paperclip className="w-8 h-8 mb-2 opacity-20" />
                                            <span className="text-[10px] font-bold  tracking-normal">Нет прикрепленных файлов</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'checklist' && (
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={newChecklistItem}
                                    onChange={(e) => setNewChecklistItem(e.target.value)}
                                    placeholder="Добавить новый пункт..."
                                    className="flex-1 px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium outline-none focus:border-primary transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                                />
                                <button
                                    onClick={handleAddChecklistItem}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all"
                                >
                                    ДОБАВИТЬ
                                </button>
                            </div>

                            <div className="space-y-2">
                                {task.checklists?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all"
                                    >
                                        <button
                                            onClick={() => handleToggleChecklist(item.id, !item.isCompleted)}
                                            className={cn(
                                                "h-6 w-6 rounded-2xl border-2 flex items-center justify-center transition-all",
                                                item.isCompleted
                                                    ? "bg-emerald-500 border-emerald-500"
                                                    : "border-slate-200 hover:border-primary"
                                            )}
                                        >
                                            {item.isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </button>
                                        <span className={cn(
                                            "flex-1 text-sm font-bold text-slate-700",
                                            item.isCompleted && "line-through text-slate-400"
                                        )}>
                                            {item.content}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteChecklist(item.id)}
                                            className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Написать комментарий..."
                                    rows={3}
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium outline-none focus:border-primary transition-all resize-none"
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim() || isPending}
                                        className="px-8 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        ОТПРАВИТЬ
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {task.comments?.map((comment) => (
                                    <div key={comment.id} className="flex gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-slate-100 shrink-0 overflow-hidden">
                                            {comment.user.avatar ? (
                                                <NextImage src={comment.user.avatar} alt={comment.user.name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary font-bold text-xs ">
                                                    {comment.user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">{comment.user.name}</span>
                                                <span className="text-[10px] font-bold text-slate-400">{format(new Date(comment.createdAt), "HH:mm, dd.MM.yyyy")}</span>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl rounded-tl-none">
                                                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {task.history?.map((activity) => (
                                <div key={activity.id} className="relative">
                                    <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-white border-2 border-primary z-10" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900">
                                            {activity.user.name}{" "}
                                            <span className="text-slate-500 font-medium">
                                                {getActivityLabel(activity)}
                                            </span>
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400  tracking-normal leading-none">
                                            {format(new Date(activity.createdAt), "HH:mm, dd MMM yyyy", { locale: ru })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions Footer */}
                <div className="p-8 pt-0 mt-auto bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleToggle}
                            disabled={isPending}
                            className={cn(
                                "flex-1 py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3",
                                isDone
                                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-slate-200/50"
                                    : "bg-primary text-white hover:opacity-90 shadow-primary/30"
                            )}
                        >
                            {isDone ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                            {isDone ? "ВЕРНУТЬ В РАБОТУ" : "ОТМЕТИТЬ КАК ВЫПОЛНЕНО"}
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isPending}
                            className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all active:scale-[0.98] shadow-lg shadow-rose-200/50"
                        >
                            <Trash2 className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Удаление задачи"
                description="Вы уверены, что хотите удалить эту задачу? Это действие необратимо."
                confirmText="Удалить"
                variant="destructive"
                isLoading={isPending}
            />
        </div >
    );
}
