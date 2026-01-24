"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Lock } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
                    <DialogHeader className="space-y-4">
                        <div className="flex justify-center">
                            <div className="h-16 w-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-sm animate-in fade-in zoom-in duration-300">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                        </div>
                        <div className="space-y-2 text-center">
                            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Подтвердите удаление</DialogTitle>
                            <DialogDescription className="text-slate-500 text-base">
                                Вы уверены, что хотите удалить роль <br />
                                <span className="text-slate-900 font-extrabold break-all underline decoration-red-200 decoration-4 underline-offset-4">&quot;{role.name}&quot;</span>?
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="bg-slate-50/80 rounded-[18px] p-6 border border-slate-100 text-center backdrop-blur-sm">
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
                                Это системная роль. Для подтверждения удаления введите ваш пароль администратора.
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

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={() => {
                                setPassword("");
                                onClose();
                            }}
                            disabled={loading}
                            className="flex-1 px-6 py-3.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 rounded-[18px] transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading || (role.isSystem && !password.trim())}
                            className="flex-[1.2] inline-flex justify-center items-center gap-2 px-6 py-3.5 bg-red-600 text-white text-sm font-bold rounded-[18px] hover:bg-red-700 shadow-lg shadow-red-200 hover:shadow-red-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
