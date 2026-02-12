"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

    if (!department) return null;

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Подтвердите действие"
            description="Вы уверены, что хотите удалить этот отдел?"
            className="items-start"
        >
            <div className="space-y-6">
                <div className="bg-slate-50 rounded-[18px] p-4 mb-6 border border-slate-200">
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
                            Это системный отдел. Для подтверждения удаления введите пароль от своей учетной записи.
                        </p>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль от своей учетной записи"
                            className="w-full h-11 px-4 rounded-[18px] border-2 border-rose-200 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-slate-900 placeholder:text-rose-200"
                            autoFocus
                        />
                    </div>
                )}

                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[18px] transition-colors disabled:opacity-50 h-auto border-none"
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={loading || (department.isSystem && !password.trim())}
                        className="flex-1 inline-flex justify-center items-center gap-2 rounded-[18px] h-12"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Удаление..." : "Удалить"}
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    );
}
