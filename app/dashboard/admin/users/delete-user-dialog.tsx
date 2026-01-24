"use client";

import { useState, useEffect } from "react";
import { deleteUser } from "../actions";
import { Loader2, AlertTriangle, X, Lock } from "lucide-react";

interface DeleteUserDialogProps {
    user: { id: string; name: string; isSystem?: boolean } | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function DeleteUserDialog({ user, isOpen, onClose, onSuccess }: DeleteUserDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            setPassword("");
            setError("");
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    const handleDelete = async () => {
        if (!user) return;

        setIsLoading(true);
        setError("");

        try {
            const result = await deleteUser(user.id, password);
            if (result.error) {
                setError(result.error);
                setPassword("");
            } else {
                onSuccess();
                onClose();
            }
        } catch {
            setError("Произошла ошибка при удалении");
            setPassword("");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

                <div className="relative transform overflow-hidden rounded-[18px] bg-white p-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
                    <div className="absolute top-0 right-0 pt-6 pr-6">
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-8 text-center">
                        <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Удалить сотрудника?</h3>
                        <p className="text-slate-500 mt-2">Вы действительно хотите удалить данного сотрудника?</p>
                    </div>

                    <div className="bg-slate-50 rounded-[18px] p-4 mb-6 border border-slate-100">
                        <p className="text-sm font-bold text-slate-700 mb-1">Сотрудник:</p>
                        <p className="text-lg font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-red-600 font-bold mt-2">
                            Это действие нельзя отменить. Доступ будет немедленно прекращен.
                        </p>
                    </div>

                    {user.isSystem && (
                        <div className="mb-6 p-4 bg-rose-50 rounded-[18px] border border-rose-100">
                            <div className="flex items-center gap-2 text-rose-600 mb-3">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-bold  tracking-wider">Системная защита</span>
                            </div>
                            <p className="text-xs font-bold text-rose-500/80 mb-3">
                                Это системный пользователь. Для подтверждения удаления введите ваш пароль администратора.
                            </p>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Пароль администратора"
                                className="w-full h-11 px-4 rounded-[18px] border-2 border-rose-200 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-slate-900 placeholder:text-rose-200"
                                autoFocus
                            />
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-md border border-rose-100 mb-4 text-center font-bold">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[18px] transition-colors disabled:opacity-50"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isLoading || (user.isSystem && !password.trim())}
                            className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-3 bg-red-600 text-white text-sm font-bold rounded-[18px] hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? "Удаление..." : "Удалить"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
