"use client";

import NextImage from "next/image";
import { formatDateTime } from "@/lib/formatters";
import { Task } from "../types";

interface TaskCommentsTabProps {
    task: Task;
    newCommentValue: string;
    isPending: boolean;
    onCommentValueChange: (value: string) => void;
    onAddComment: () => void;
}

export function TaskCommentsTab({
    task,
    newCommentValue,
    isPending,
    onCommentValueChange,
    onAddComment
}: TaskCommentsTabProps) {
    return (
        <div className="space-y-3">
            <div className="space-y-3">
                <textarea
                    value={newCommentValue}
                    onChange={(e) => onCommentValueChange(e.target.value)}
                    placeholder="Написать комментарий..."
                    rows={3}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium outline-none focus:border-primary transition-all resize-none"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            onAddComment();
                        }
                    }}
                />
                <div className="flex justify-end gap-2 items-center">
                    <span className="text-xs text-slate-400 font-bold hidden sm:inline-block">Cmd + Enter для отправки</span>
                    <button type="button"
                        onClick={onAddComment}
                        disabled={!newCommentValue.trim() || isPending}
                        className="px-8 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        Отправить
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {task.comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-slate-100 shrink-0 overflow-hidden">
                            {comment.user.avatar ? (
                                <NextImage src={comment.user.avatar} alt={comment.user.name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary font-bold text-xs">
                                    {comment.user.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">{comment.user.name}</span>
                                <span className="text-xs font-bold text-slate-400">{formatDateTime(comment.createdAt, "HH:mm, dd.MM.yyyy")}</span>
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
    );
}
