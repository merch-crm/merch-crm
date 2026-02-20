"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useToast } from "@/components/ui/toast";
import { StorageLocationSelect } from "@/components/ui/storage-location-select";
import { CategorySelect } from "../../category-select";
import { pluralize } from "@/lib/pluralize";
import { bulkMoveInventoryItems, bulkUpdateInventoryCategory } from "../../bulk-actions";;
import { Category } from "../../types";
import { StorageLocation } from "../../storage-locations-tab";

interface BulkMoveDialogProps {
    isOpen: boolean;
    selectedIds: string[];
    storageLocations: StorageLocation[];
    onClose: () => void;
    onSuccess: () => void;
}

export const BulkMoveDialog = React.memo(({
    isOpen,
    selectedIds,
    storageLocations,
    onClose,
    onSuccess
}: BulkMoveDialogProps) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [targetLocationId, setTargetLocationId] = useState("");
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (isOpen) {
            setTargetLocationId("");
            setComment("");
        }
    }, [isOpen]);

    const handleMove = async () => {
        if (!targetLocationId) return;
        setIsLoading(true);
        try {
            const res = await bulkMoveInventoryItems(selectedIds, targetLocationId, comment);
            if (res.success) {
                toast("Успешно перемещено: " + selectedIds.length + " " + pluralize(selectedIds.length, 'позиция', 'позиции', 'позиций'), "success");
                onSuccess();
            } else {
                toast(res.error || "Ошибка при перемещении", "error");
            }
        } catch {
            toast("Произошла ошибка", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="Массовое перемещение"
            className="sm:max-w-md"
        >
            <div className="p-6 space-y-4">
                <div>
                    <p className="text-sm text-slate-500 font-medium">Перемещение {selectedIds.length} {pluralize(selectedIds.length, 'позиции', 'позиций', 'позиций')}</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="bulk-move-target" className="text-xs font-semibold text-slate-500 ml-1">Целевой склад</label>
                        <StorageLocationSelect
                            id="bulk-move-target"
                            value={targetLocationId}
                            onChange={setTargetLocationId}
                            options={storageLocations}
                            placeholder="Выберите склад…"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="bulk-move-comment" className="text-xs font-semibold text-slate-500 ml-1">Комментарий</label>
                        <textarea
                            id="bulk-move-comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full h-24 p-4 rounded-[var(--radius)] border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:bg-white focus:border-primary transition-all resize-none"
                            placeholder="Причина перемещения…"
                        />
                    </div>

                    <Button
                        type="button"
                        onClick={handleMove}
                        disabled={!targetLocationId || isLoading}
                        className="w-full h-11 btn-dark rounded-[var(--radius)] font-bold transition-all"
                    >
                        {isLoading ? "Перемещение…" : "Подтвердить перемещение"}
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    );
});

BulkMoveDialog.displayName = "BulkMoveDialog";

interface BulkCategoryDialogProps {
    isOpen: boolean;
    selectedIds: string[];
    categories: Category[];
    onClose: () => void;
    onSuccess: () => void;
}

export const BulkCategoryDialog = React.memo(({
    isOpen,
    selectedIds,
    categories,
    onClose,
    onSuccess
}: BulkCategoryDialogProps) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [targetCategoryId, setTargetCategoryId] = useState("");

    const handleUpdate = async () => {
        if (!targetCategoryId) return;
        setIsLoading(true);
        try {
            const res = await bulkUpdateInventoryCategory(selectedIds, targetCategoryId);
            if (res.success) {
                toast("Категория изменена для " + selectedIds.length + " " + pluralize(selectedIds.length, 'позиции', 'позиций', 'позиций'), "success");
                onSuccess();
            } else {
                toast(res.error || "Ошибка", "error");
            }
        } catch {
            toast("Произошла ошибка", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="Смена категории"
            description={`${selectedIds.length} поз. выбрано`}
            className="sm:max-w-md"
        >
            <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="bulk-category-target" className="text-xs font-semibold text-slate-500 ml-1">Новая категория</label>
                    <CategorySelect
                        id="bulk-category-target"
                        categories={categories}
                        value={targetCategoryId}
                        onChange={setTargetCategoryId}
                        placeholder="Выберите новую категорию..."
                    />
                </div>

                <Button
                    type="button"
                    onClick={handleUpdate}
                    disabled={!targetCategoryId || isLoading}
                    className="w-full h-11 btn-dark rounded-[var(--radius)] font-bold transition-all"
                >
                    {isLoading ? "Обновление..." : "Сменить категорию"}
                </Button>
            </div>
        </ResponsiveModal>
    );
});

BulkCategoryDialog.displayName = "BulkCategoryDialog";
