"use client";

import { useState } from "react";
import { deleteUser } from "../actions";
import { Loader2, Lock } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

    if (!user) return null;

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="Удалить сотрудника?"
            description="Вы действительно хотите удалить данного сотрудника?"
            className="items-start"
        >
            <div>
                <div className="bg-slate-50 rounded-[var(--radius-inner)] p-4 mb-6 border border-slate-200">
                    <p className="text-sm font-bold text-slate-700 mb-1">Сотрудник:</p>
                    <p className="text-lg font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-red-600 font-bold mt-2">
                        Это действие нельзя отменить. Доступ будет немедленно прекращен.
                    </p>
                </div>

                {user.isSystem && (
                    <div className="mb-6 p-4 bg-rose-50 rounded-[var(--radius-inner)] border border-rose-100">
                        <div className="flex items-center gap-2 text-rose-600 mb-3">
                            <Lock className="w-4 h-4" />
                            <span className="text-xs font-bold tracking-wider">Системная защита</span>
                        </div>
                        <p className="text-xs font-bold text-rose-500/80 mb-3">
                            Это системный пользователь. Для подтверждения удаления введите пароль от своей учетной записи.
                        </p>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль от своей учетной записи"
                            className="w-full h-11 px-4 rounded-[var(--radius-inner)] border-2 border-rose-200 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-slate-900 placeholder:text-rose-200"
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
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-[var(--radius-inner)] transition-colors border border-slate-200 shadow-sm h-11"
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading || (user.isSystem && !password.trim())}
                        className="flex-1 inline-flex justify-center items-center gap-2 rounded-[var(--radius-inner)] h-11 font-bold shadow-lg shadow-red-500/10"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                        {isLoading ? "Удаление..." : "Удалить"}
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    );
}
