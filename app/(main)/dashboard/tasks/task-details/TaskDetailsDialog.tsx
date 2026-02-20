"use client";

import { useTransition, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { playSound } from "@/lib/sounds";
import { compressImage } from "@/lib/image-processing";
import {
    toggleTaskStatus,
    deleteTask,
    uploadTaskFile,
    addTaskComment,
    addTaskChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem
} from "../actions";
import { Task } from "../types";

import { TaskHeader } from "./TaskHeader";
import { TaskTabs, TabId } from "./TaskTabs";
import { TaskDetailsTab } from "./TaskDetailsTab";
import { TaskChecklistTab } from "./TaskChecklistTab";
import { TaskCommentsTab } from "./TaskCommentsTab";
import { TaskHistoryTab } from "./TaskHistoryTab";
import { TaskActions } from "./TaskActions";

interface TaskDetailsDialogProps {
    task: Task;
    onClose: () => void;
}

export function TaskDetailsDialog({ task, onClose }: TaskDetailsDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('details');
    const [newComment, setNewComment] = useState("");
    const [newChecklistItem, setNewChecklistItem] = useState("");
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleToggleStatus = () => {
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        let fileToUpload = file;

        if (file.type.startsWith("image/")) {
            toast("Сжимаем изображение...", "info");
            try {
                const result = await compressImage(file, { maxWidth: 1920, maxSizeMB: 1 });
                fileToUpload = result.file;
            } catch (err) {
                console.error("Image compression failed:", err);
            }
        }

        const formData = new FormData();
        formData.append("file", fileToUpload);

        startTransition(async () => {
            const res = await uploadTaskFile(task.id, formData);
            if (!res.success) {
                toast(res.error || "Ошибка загрузки", "error");
                playSound("notification_error");
            } else {
                toast("Файл загружен", "success");
                playSound("notification_success");
            }
        });
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

    return (
        <ResponsiveModal
            isOpen={true}
            onClose={onClose}
            title={task.title}
            description={undefined}
            className="sm:max-w-2xl p-0 overflow-hidden"
            hideClose={true}
            showVisualTitle={false}
        >
            <div className="flex flex-col h-full max-h-[85vh] sm:max-h-[80vh]">
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <TaskHeader task={task} onClose={onClose} />
                    <TaskTabs task={task} activeTab={activeTab} onTabChange={setActiveTab} />

                    <div className="content-area">
                        {activeTab === 'details' && (
                            <TaskDetailsTab
                                task={task}
                                isPending={isPending}
                                fileInputRef={fileInputRef}
                                onFileUpload={handleFileUpload}
                            />
                        )}
                        {activeTab === 'checklist' && (
                            <TaskChecklistTab
                                task={task}
                                newItemValue={newChecklistItem}
                                onItemValueChange={setNewChecklistItem}
                                onAddItem={handleAddChecklistItem}
                                onToggleItem={handleToggleChecklist}
                                onDeleteItem={handleDeleteChecklist}
                            />
                        )}
                        {activeTab === 'comments' && (
                            <TaskCommentsTab
                                task={task}
                                newCommentValue={newComment}
                                isPending={isPending}
                                onCommentValueChange={setNewComment}
                                onAddComment={handleAddComment}
                            />
                        )}
                        {activeTab === 'history' && (
                            <TaskHistoryTab task={task} />
                        )}
                    </div>
                </div>

                <TaskActions
                    task={task}
                    isPending={isPending}
                    onToggleStatus={handleToggleStatus}
                    onDeleteRequest={() => setShowDeleteConfirm(true)}
                />
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
        </ResponsiveModal>
    );
}
