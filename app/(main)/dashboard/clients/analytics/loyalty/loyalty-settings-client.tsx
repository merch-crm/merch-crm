"use client";

import { useState } from "react";
import { Reorder } from "framer-motion";
import {
    Trophy,
    Plus,
    GripVertical,
    Edit2,
    Trash2,
    RefreshCw,
    Percent,
    ShieldCheck,
    Zap,
    Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
    createLoyaltyLevel,
    updateLoyaltyLevel,
    deleteLoyaltyLevel,
    reorderLoyaltyLevels,
    recalculateAllClientsLoyalty,
} from "../../actions/loyalty.actions";
import type { LoyaltyLevel } from "@/lib/schema";

interface LoyaltySettingsClientProps {
    initialLevels: LoyaltyLevel[];
    initialStats?: {
        levelId: string;
        levelName: string;
        color: string;
        clientsCount: number;
        totalRevenue: number;
    }[];
}

const availableColors = [
    "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899", "#94A3B8"
];

export function LoyaltySettingsClient({ initialLevels }: LoyaltySettingsClientProps) {
    const [levels, setLevels] = useState(initialLevels);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState<LoyaltyLevel | null>(null);
    const [deletingLevelId, setDeletingLevelId] = useState<string | null>(null);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        minOrdersAmount: "",
        minOrdersCount: "",
        discountPercent: "",
        color: "#6366F1",
        icon: "Trophy",
        isActive: true,
    });

    const handleOpenModal = (level?: LoyaltyLevel) => {
        if (level) {
            setEditingLevel(level);
            setFormData({
                name: level.levelName,
                minOrdersAmount: String(level.minOrdersAmount || ""),
                minOrdersCount: String(level.minOrdersCount || ""),
                discountPercent: String(level.discountPercent || ""),
                color: level.color || "#6366F1",
                icon: level.icon || "Trophy",
                isActive: !!level.isActive,
            });
        } else {
            setEditingLevel(null);
            setFormData({
                name: "",
                minOrdersAmount: "",
                minOrdersCount: "",
                discountPercent: "",
                color: "#6366F1",
                icon: "Trophy",
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const data = {
                levelName: formData.name,
                levelKey: formData.name.toLowerCase().replace(/\s+/g, '_'), // Simple key generation
                minOrdersAmount: String(Number(formData.minOrdersAmount) || 0),
                minOrdersCount: Number(formData.minOrdersCount) || 0,
                discountPercent: String(Number(formData.discountPercent) || 0),
                bonusDescription: "",
                color: formData.color,
                icon: formData.icon,
                isActive: formData.isActive,
            };

            if (editingLevel) {
                const result = await updateLoyaltyLevel(editingLevel.id, data);
                if (result.success) {
                    toast("Уровень обновлен", "success");
                } else {
                    toast(result.error || "Ошибка", "error");
                    return;
                }
            } else {
                const result = await createLoyaltyLevel({
                    ...data,
                    priority: levels.length,
                });
                if (result.success) {
                    toast("Уровень создан", "success");
                } else {
                    toast(result.error || "Ошибка", "error");
                    return;
                }
            }
            setIsModalOpen(false);
            window.location.reload();
        } catch {
            toast("Ошибка сохранения", "error");
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingLevelId) return;
        try {
            const result = await deleteLoyaltyLevel(deletingLevelId);
            if (result.success) {
                setLevels(prev => prev.filter(l => l.id === deletingLevelId));
                toast("Уровень удален", "success");
            } else {
                toast(result.error || "Ошибка", "error");
            }
        } catch {
            toast("Ошибка удаления", "error");
        } finally {
            setDeletingLevelId(null);
        }
    };

    const handleReorder = async (newLevels: LoyaltyLevel[]) => {
        const oldLevels = levels;
        setLevels(newLevels);
        try {
            const result = await reorderLoyaltyLevels(newLevels.map((l, i) => ({ id: l.id, priority: i })));
            if (!result.success) {
                setLevels(oldLevels);
                toast(result.error || "Ошибка порядка", "error");
            }
        } catch {
            setLevels(oldLevels);
            toast("Ошибка изменения порядка", "error");
        }
    };

    const handleRecalculate = async () => {
        setIsRecalculating(true);
        try {
            const result = await recalculateAllClientsLoyalty();
            if (result.success) {
                toast(`Пересчет завершен. Обновлено: ${result.data?.updatedCount}`, "success");
            } else {
                toast(result.error || "Ошибка пересчета", "error");
            }
        } catch {
            toast("Ошибка пересчета", "error");
        } finally {
            setIsRecalculating(false);
        }
    };

    return (
        <div className="space-y-3 pb-20">
            {/* Информация и Пересчет */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-3 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3 justify-center md:justify-start">
                            <ShieldCheck className="w-8 h-8" />
                            Автоматическая лояльность
                        </h3>
                        <p className="text-indigo-100 font-medium max-w-md">
                            Система автоматически назначает уровни клиентам на основе их общей суммы покупок и количества заказов.
                        </p>
                    </div>

                    <Button
                        onClick={handleRecalculate}
                        disabled={isRecalculating}
                        className="h-14 px-8 rounded-2xl bg-white text-indigo-600 font-bold hover:bg-slate-50 shadow-lg shadow-black/10 active:scale-95 transition-all gap-3 shrink-0"
                    >
                        {isRecalculating ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Zap className="w-5 h-5 fill-current" />
                        )}
                        Пересчитать для всех
                    </Button>
                </div>

                {/* Декоративные элементы */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -ml-16 -mb-16 blur-2xl" />
            </div>

            {/* Список уровней */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-xs font-bold text-slate-400">Этапы лояльности</h4>
                    <Button
                        onClick={() => handleOpenModal()}
                        size="sm"
                        className="h-9 rounded-xl gap-2 font-bold bg-slate-900 shadow-lg shadow-slate-200 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Добавить уровень
                    </Button>
                </div>

                <Reorder.Group axis="y" values={levels} onReorder={handleReorder} className="space-y-3">
                    {levels.map((level) => (
                        <Reorder.Item
                            key={level.id}
                            value={level}
                            className="group relative"
                        >
                            <div className={cn(
                                "bg-white p-3 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3 transition-all hover:shadow-md hover:border-slate-200 cursor-default",
                                !level.isActive && "opacity-60 saturate-50"
                            )}>
                                <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors">
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0"
                                    style={{ backgroundColor: `${level.color || '#F1F5F9'}15`, color: level.color || '#64748B' }}
                                >
                                    <Trophy className="w-7 h-7" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h5 className="font-bold text-slate-900 text-lg tracking-tight">{level.levelName}</h5>
                                        {!level.isActive && (
                                            <span className="text-xs font-bold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                                                Черновик
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                            <Target className="w-3.5 h-3.5" />
                                            <span>от {Number(level.minOrdersAmount).toLocaleString()} ₽</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            <span>от {level.minOrdersCount || 0} зак.</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 px-6 border-x border-slate-100">
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-slate-400 mb-1">Скидка</p>
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="text-xl font-bold text-slate-900">{level.discountPercent || 0}</span>
                                            <Percent className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleOpenModal(level)}>
                                        <Edit2 className="w-4 h-4 text-slate-400" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-500" onClick={() => setDeletingLevelId(level.id)}>
                                        <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>

            {/* Modal */}
            <ResponsiveModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingLevel ? "Редактировать уровень" : "Новый уровень"}
                description="Настройте условия и привилегии для клиентов"
            >
                <div className="p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-2 block">Название этапа</label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Напр: VIP Клиент"
                                    className="h-12 rounded-xl border-slate-200 font-bold focus:ring-slate-100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-2 block">Сумма покупок</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={formData.minOrdersAmount}
                                            onChange={e => setFormData({ ...formData, minOrdersAmount: e.target.value })}
                                            className="h-12 rounded-xl pl-4 pr-10 font-bold border-slate-200"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₽</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-2 block">Кол-во заказов</label>
                                    <Input
                                        type="number"
                                        value={formData.minOrdersCount}
                                        onChange={e => setFormData({ ...formData, minOrdersCount: e.target.value })}
                                        className="h-12 rounded-xl font-bold border-slate-200"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-2 block">Скидка %</label>
                                    <Input
                                        type="number"
                                        value={formData.discountPercent}
                                        onChange={e => setFormData({ ...formData, discountPercent: e.target.value })}
                                        className="h-12 rounded-xl font-bold text-indigo-600 border-slate-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-2 block">Цвет иконки</label>
                                <div className="flex gap-2 flex-wrap">
                                    {availableColors.map(color => (
                                        <button
                                            type="button"
                                            key={color}
                                            onClick={() => setFormData({ ...formData, color })}
                                            className={cn(
                                                "w-8 h-8 rounded-full border-4 border-white shadow-sm transition-transform active:scale-90",
                                                formData.color === color ? "scale-110 ring-2 ring-slate-200" : "scale-100"
                                            )}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={formData.isActive}
                                onCheckedChange={checked => setFormData({ ...formData, isActive: checked })}
                            />
                            <span className="text-sm font-bold text-slate-700">Уровень активен</span>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="h-12 px-6 rounded-xl font-bold">
                                Отмена
                            </Button>
                            <Button onClick={handleSave} className="h-12 px-8 rounded-xl font-bold bg-indigo-600 shadow-lg shadow-indigo-100 active:scale-95">
                                Сохранить уровень
                            </Button>
                        </div>
                    </div>
                </div>
            </ResponsiveModal>
            <ConfirmDialog
                isOpen={!!deletingLevelId}
                onClose={() => setDeletingLevelId(null)}
                onConfirm={handleConfirmDelete}
                title="Удаление уровня"
                description="Вы уверены, что хотите удалить этот уровень лояльности?"
                variant="destructive"
            />
        </div>
    );
}
