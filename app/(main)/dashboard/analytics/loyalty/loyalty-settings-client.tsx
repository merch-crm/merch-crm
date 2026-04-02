"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
    Plus,
    RefreshCw,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    createLoyaltyLevel,
    updateLoyaltyLevel,
    deleteLoyaltyLevel,
    recalculateAllClientsLoyalty
} from "@/app/(main)/dashboard/clients/actions/loyalty.actions";
import type { LoyaltyLevel } from "@/lib/schema/clients/loyalty";
import { LoyaltyLevelCard } from "./components/loyalty-level-card";
import { LoyaltyLevelModal } from "./components/loyalty-level-modal";

interface LoyaltySettingsClientProps {
    initialLevels: LoyaltyLevel[];
    initialStats: {
        levelId: string;
        levelName: string;
        color: string;
        clientsCount: number;
        totalRevenue: number;
    }[];
}

export function LoyaltySettingsClient({ initialLevels, initialStats }: LoyaltySettingsClientProps) {
    const [levels, setLevels] = useState<LoyaltyLevel[]>(initialLevels);
    const [stats] = useState(initialStats);
    const [ui, setUi] = useState({
        isCreateOpen: false,
        editingLevel: null as LoyaltyLevel | null,
        deletingLevel: null as LoyaltyLevel | null,
        recalculating: false,
    });

    const [formData, setFormData] = useState({
        levelKey: "",
        levelName: "",
        minOrdersAmount: 0,
        minOrdersCount: 0,
        discountPercent: 0,
        color: "#64748b",
        priority: 0,
        isActive: true,
    });

    const resetForm = () => {
        setFormData({
            levelKey: "",
            levelName: "",
            minOrdersAmount: 0,
            minOrdersCount: 0,
            discountPercent: 0,
            color: "#64748b",
            priority: 0,
            isActive: true,
        });
    };

    const openEditModal = (level: LoyaltyLevel) => {
        setFormData({
            levelKey: level.levelKey,
            levelName: level.levelName,
            minOrdersAmount: Number(level.minOrdersAmount || 0),
            minOrdersCount: level.minOrdersCount || 0,
            discountPercent: Number(level.discountPercent || 0),
            color: level.color || "#64748b",
            priority: level.priority || 0,
            isActive: level.isActive || true,
        });
        setUi(prev => ({ ...prev, editingLevel: level }));
    };

    const handleSave = async () => {
        if (!formData.levelKey || !formData.levelName) {
            toast.error("Заполните обязательные поля");
            return;
        }

        const res = ui.editingLevel
            ? await updateLoyaltyLevel(ui.editingLevel.id, {
                ...formData,
                minOrdersAmount: formData.minOrdersAmount.toString(),
                discountPercent: formData.discountPercent.toString()
            })
            : await createLoyaltyLevel({
                ...formData,
                minOrdersAmount: formData.minOrdersAmount.toString(),
                discountPercent: formData.discountPercent.toString(),
                bonusDescription: null,
                icon: null
            });

        if (res.success) {
            toast.success(ui.editingLevel ? "Уровень обновлен" : "Уровень создан");
            if (res.data) {
                if (ui.editingLevel) {
                    setLevels(prev => prev.map(l => l.id === ui.editingLevel?.id ? (res.data as LoyaltyLevel) : l));
                } else {
                    setLevels(prev => [...prev, res.data as LoyaltyLevel]);
                }
            }
            setUi(prev => ({ ...prev, isCreateOpen: false, editingLevel: null }));
            resetForm();
        } else {
            toast.error(res.error || "Ошибка сохранения");
        }
    };

    const handleDelete = async () => {
        if (!ui.deletingLevel) return;
        const res = await deleteLoyaltyLevel(ui.deletingLevel.id);
        if (res.success) {
            toast.success("Уровень удален");
            setLevels(prev => prev.filter(l => l.id !== ui.deletingLevel?.id));
            setUi(prev => ({ ...prev, deletingLevel: null }));
        } else {
            toast.error(res.error || "Ошибка удаления");
        }
    };

    const handleRecalculate = async () => {
        setUi(prev => ({ ...prev, recalculating: true }));
        const res = await recalculateAllClientsLoyalty();
        if (res.success) {
            toast.success("Лояльность всех клиентов пересчитана");
        } else {
            toast.error(res.error || "Ошибка пересчета");
        }
        setUi(prev => ({ ...prev, recalculating: false }));
    };

    const getStatForLevel = (levelId: string) => {
        return stats.find(s => s.levelId === levelId);
    };

    return (
        <div className="space-y-3">
            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    type="button"
                    onClick={() => {
                        resetForm();
                        setUi(prev => ({ ...prev, isCreateOpen: true }));
                    }}
                    className="h-11 px-6 rounded-xl text-sm font-bold"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить уровень
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleRecalculate}
                    disabled={ui.recalculating}
                    className="h-11 px-6 rounded-xl text-sm font-bold"
                >
                    {ui.recalculating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Пересчитать всех клиентов
                </Button>
            </div>

            {/* Levels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <AnimatePresence mode="popLayout">
                    {levels
                        .sort((a, b) => (a.priority || 0) - (b.priority || 0))
                        .map((level, index) => (
                            <LoyaltyLevelCard
                                key={level.id}
                                level={level}
                                index={index}
                                stat={getStatForLevel(level.id)}
                                onEdit={openEditModal}
                                onDelete={(l) => setUi(prev => ({ ...prev, deletingLevel: l }))}
                            />
                        ))}
                </AnimatePresence>
            </div>

            {/* Create/Edit Modal */}
            <LoyaltyLevelModal
                isOpen={ui.isCreateOpen || !!ui.editingLevel}
                onClose={() => {
                    setUi(prev => ({ ...prev, isCreateOpen: false, editingLevel: null }));
                    resetForm();
                }}
                editingLevel={ui.editingLevel}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!ui.deletingLevel}
                onClose={() => setUi(prev => ({ ...prev, deletingLevel: null }))}
                onConfirm={handleDelete}
                title="Удалить уровень?"
                description={`Уровень "${ui.deletingLevel?.levelName}" будет удален навсегда. Это не повлияет на клиентов, но они лишатся скидок этого уровня.`}
                confirmText="Удалить"
                cancelText="Отмена"
                variant="destructive"
            />
        </div>
    );
}
