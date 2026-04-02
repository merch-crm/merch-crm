"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Send,
  MoreHorizontal,
  Edit3,
  Trash2,
  Loader2,
  MessageSquare,
  User,
  Clock,
} from "lucide-react";
import {
  addTaskComment,
  updateTaskComment,
  deleteTaskComment,
} from "../../actions/comment-actions";
import type { Task, TaskComment } from "@/lib/types/tasks";

interface TaskCommentsSectionProps {
  task: Task;
  currentUserId: string;
  onTaskUpdated?: () => void;
}

export function TaskCommentsSection({
  task,
  currentUserId,
  onTaskUpdated,
}: TaskCommentsSectionProps) {
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loadingCommentId, setLoadingCommentId] = useState<string | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const comments = task.comments || [];

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addTaskComment(task.id, newComment.trim());
      if (result.success) {
        setNewComment("");
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось добавить комментарий");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editText.trim()) {
      setEditingCommentId(null);
      return;
    }

    setLoadingCommentId(commentId);
    try {
      // Assuming updateTaskComment exists as per standard naming
      const result = await updateTaskComment(task.id, commentId, editText.trim());
      if (result.success) {
        setEditingCommentId(null);
        setEditText("");
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось обновить комментарий");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setLoadingCommentId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    setLoadingCommentId(commentId);
    try {
      const result = await deleteTaskComment(task.id, commentId);
      if (result.success) {
        toast.success("Комментарий удалён");
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось удалить комментарий");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setLoadingCommentId(null);
    }
  };

  const startEditing = (comment: TaskComment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date(); // suppressHydrationWarning
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "только что";
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="flex flex-col h-full max-h-[60vh]">
      {/* Comments list */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Нет комментариев</p>
            <p className="text-sm text-muted-foreground mt-1">
              Начните обсуждение задачи
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwn = comment.userId === currentUserId;
            return (
              <div
                key={comment.id}
                className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={comment.user?.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {comment.user?.name?.[0] || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex-1 max-w-[80%] ${isOwn ? "flex flex-col items-end" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {!isOwn && (
                      <span className="font-medium text-sm">
                        {comment.user?.name || "Пользователь"}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(comment.createdAt)}
                    </span>
                    {comment.updatedAt &&
                      comment.updatedAt !== comment.createdAt && (
                        <Badge variant="outline" className="text-xs h-4">
                          изменено
                        </Badge>
                      )}
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="space-y-2 w-full">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        autoFocus
                        className="resize-none"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCommentId(null)}
                        >
                          Отмена
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(comment.id)}
                          disabled={loadingCommentId === comment.id}
                        >
                          {loadingCommentId === comment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Сохранить"
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`relative group inline-block p-3 rounded-2xl ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {comment.text}
                      </p>

                      {isOwn && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`absolute -left-10 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ${
                                isOwn ? "text-foreground" : ""
                              }`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onClick={() => startEditing(comment)}
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(comment.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t pt-4 bg-background">
        <div className="flex gap-3">
          <Textarea
            placeholder="Написать комментарий..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={2}
            className="flex-1 resize-none bg-muted/50 focus:bg-background transition-colors"
          />
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            className="self-end bg-gradient-to-r from-primary to-violet-600 h-10 w-10 p-0 rounded-xl"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 tracking-tight">
          Ctrl/Cmd + Enter для быстрой отправки
        </p>
      </div>
    </div>
  );
}
