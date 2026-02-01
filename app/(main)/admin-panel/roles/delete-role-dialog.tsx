"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Lock } from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

interface DeleteRoleDialogProps {
    role: { id: string; name: string; isSystem?: boolean } | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string, password?: string) => Promise<void>;
}

export function DeleteRoleDialog({ role, isOpen, onClose, onConfirm }: DeleteRoleDialogProps) {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");

    const handleConfirm = async () => {
        if (!role) return;
        setLoading(true);
        try {
            await onConfirm(role.id, password);
            setPassword("");
            // onClose is handled in the caller's onConfirm
        } catch (error) {
            console.error("Failed to delete role:", error);
            setPassword("");
        } finally {
            setLoading(false);
        }
    };

    if (!role) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                setPassword("");
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="p-8 space-y-6">
                    <div className="mb-6 flex items-center gap-4 text-center justify-center flex-col">
                        <div className="h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-sm animate-in fade-in zoom-in duration-300">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Подтвердите удаление</h3>
                            <p className="text-[13px] font-medium text-slate-500 text-center">
                                Вы уверены, что хотите удалить роль <span className="text-slate-900 font-bold underline decoration-rose-200 decoration-2 underline-offset-4">{role.name}</span>?
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-[18px] p-4 mb-6 border border-slate-200 text-center backdrop-blur-sm">
                        <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                            Это действие <span className="text-slate-900 font-bold">нельзя будет отменить</span>. Все настройки разрешений для этой роли будут безвозвратно удалены.
                        </p>
                    </div>

                    {role.isSystem && (
                        <div className="p-4 bg-rose-50 rounded-[18px] border border-rose-100">
                            <div className="flex items-center gap-2 text-rose-600 mb-3">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-bold  tracking-wider">Системная защита</span>
                            </div>
                            <p className="text-xs font-bold text-rose-500/80 mb-3">
                                Это системная роль. Для подтверждения удаления введите пароль от своей учетной записи.
                            </p>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Пароль от своей учетной записи"
                                className="w-full h-11 px-4 rounded-[18px] border-2 border-rose-200 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-slate-900 placeholder:text-rose-200"
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={() => {
                                setPassword("");
                                onClose();
                            }}
                            disabled={loading}
                            className="btn-dialog-secondary flex-1"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading || (role.isSystem && !password.trim())}
                            className="btn-dialog-destructive flex-[1.2]"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Удаление..." : "Удалить роль"}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
