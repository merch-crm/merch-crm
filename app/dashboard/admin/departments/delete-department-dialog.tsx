"use client";

import { useState } from "react";
import { X, AlertTriangle, Loader2, Lock } from "lucide-react";

interface DeleteDepartmentDialogProps {
    department: { id: string; name: string; userCount?: number; isSystem?: boolean } | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string, password?: string) => Promise<void>;
}

export function DeleteDepartmentDialog({ department, isOpen, onClose, onConfirm }: DeleteDepartmentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");

    const handleConfirm = async () => {
        if (!department) return;
        setLoading(true);
        try {
            await onConfirm(department.id, password);
            setPassword("");
            onClose();
        } catch (error) {
            console.error("Failed to delete department:", error);
            setPassword("");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPassword("");
        onClose();
    };

    if (!isOpen || !department) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={handleClose} />

                <div className="relative transform overflow-hidden rounded-[18px] bg-white p-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
                    <div className="absolute top-0 right-0 pt-6 pr-6">
                        <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-8 text-center">
                        <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Подтвердите действие</h3>
                        <p className="text-slate-500 mt-2">Вы уверены, что хотите удалить этот отдел?</p>
                    </div>

                    <div className="bg-slate-50 rounded-[18px] p-4 mb-6 border border-slate-100">
                        <p className="text-sm font-bold text-slate-700 mb-1">Отдел для удаления:</p>
                        <p className="text-lg font-bold text-slate-900">{department.name}</p>
                        {department.userCount !== undefined && department.userCount > 0 && (
                            <p className="text-xs text-red-600 font-bold mt-2">
                                ⚠️ В этом отделе {department.userCount} сотрудник(ов)
                            </p>
                        )}
                    </div>

                    {department.isSystem && (
                        <div className="mb-6 p-4 bg-rose-50 rounded-[18px] border border-rose-100">
                            <div className="flex items-center gap-2 text-rose-600 mb-3">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-bold  tracking-wider">Системная защита</span>
                            </div>
                            <p className="text-xs font-bold text-rose-500/80 mb-3">
                                Это системный отдел. Для подтверждения удаления введите ваш пароль администратора.
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

                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[18px] transition-colors disabled:opacity-50"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading || (department.isSystem && !password.trim())}
                            className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-3 bg-red-600 text-white text-sm font-bold rounded-[18px] hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Удаление..." : "Удалить"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
