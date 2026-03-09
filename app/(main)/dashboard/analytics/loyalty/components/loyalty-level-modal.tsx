"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { cn } from "@/lib/utils";
import type { LoyaltyLevel } from "@/lib/schema";

const COLOR_PRESETS = [
    "#64748b", // slate
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#ef4444", // red
];

interface LoyaltyLevelFormData {
    levelKey: string;
    levelName: string;
    minOrdersAmount: number;
    minOrdersCount: number;
    discountPercent: number;
    color: string;
    priority: number;
    isActive: boolean;
}

interface LoyaltyLevelModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingLevel: LoyaltyLevel | null;
    formData: LoyaltyLevelFormData;
    setFormData: React.Dispatch<React.SetStateAction<LoyaltyLevelFormData>>;
    onSave: () => void;
}

export function LoyaltyLevelModal({
    isOpen,
    onClose,
    editingLevel,
    formData,
    setFormData,
    onSave
}: LoyaltyLevelModalProps) {
    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingLevel ? "Редактировать уровень" : "Новый уровень"}
            className="max-w-lg"
        >
            <div className="p-6 space-y-3">
                {/* Key & Name */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                            Ключ <span className="text-rose-500">*</span>
                        </label>
                        <Input
                            type="text"
                            value={formData.levelKey}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                levelKey: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                            }))}
                            placeholder="gold"
                            disabled={!!editingLevel}
                            className="h-12 rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                            Название <span className="text-rose-500">*</span>
                        </label>
                        <Input
                            type="text"
                            value={formData.levelName}
                            onChange={(e) => setFormData(prev => ({ ...prev, levelName: e.target.value }))}
                            placeholder="Золото"
                            className="h-12 rounded-xl"
                        />
                    </div>
                </div>

                {/* Thresholds */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                            Мин. сумма заказов
                        </label>
                        <Input
                            type="number"
                            value={formData.minOrdersAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, minOrdersAmount: Number(e.target.value) }))}
                            min={0}
                            className="h-12 rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                            Мин. количество заказов
                        </label>
                        <Input
                            type="number"
                            value={formData.minOrdersCount}
                            onChange={(e) => setFormData(prev => ({ ...prev, minOrdersCount: Number(e.target.value) }))}
                            min={0}
                            className="h-12 rounded-xl"
                        />
                    </div>
                </div>

                {/* Discount */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                        Скидка (%)
                    </label>
                    <Input
                        type="number"
                        value={formData.discountPercent}
                        onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: Number(e.target.value) }))}
                        min={0}
                        max={100}
                        className="h-12 rounded-xl"
                    />
                </div>

                {/* Color */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                        Цвет
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {COLOR_PRESETS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, color }))}
                                className={cn(
                                    "w-10 h-10 rounded-xl border-2 transition-all",
                                    formData.color === color
                                        ? "border-slate-900 scale-110"
                                        : "border-transparent hover:scale-105"
                                )}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                        <input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                            className="w-10 h-10 rounded-xl cursor-pointer"
                        />
                    </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                        Приоритет (чем выше — тем престижнее)
                    </label>
                    <Input
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
                        className="h-12 rounded-xl"
                    />
                </div>

                {/* Active */}
                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <div>
                        <p className="text-sm font-bold text-slate-900">Активен</p>
                        <p className="text-[11px] text-slate-500">Уровень доступен для назначения</p>
                    </div>
                </label>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-11 rounded-xl text-sm font-bold"
                    >
                        Отмена
                    </Button>
                    <Button
                        type="button"
                        onClick={onSave}
                        className="flex-1 h-11 rounded-xl text-sm font-bold"
                    >
                        {editingLevel ? "Сохранить" : "Создать"}
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    );
}
