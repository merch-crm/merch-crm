"use client";

import { useCallback, memo } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrintGroupCard } from "./print-group-card";
import {
    type PrintGroupInput,
    type PlacementData,
    createEmptyPrintGroup,
    getPrintGroupColor,
    isPrintGroupFilled,
} from "../../types";

interface PrintGroupsListProps {
    groups: PrintGroupInput[];
    placements: PlacementData[];
    onChange: (groups: PrintGroupInput[]) => void;
}

export const PrintGroupsList = memo(function PrintGroupsList({
    groups,
    placements,
    onChange,
}: PrintGroupsListProps) {
    // Можно ли добавить новую группу
    const canAddGroup =
        groups.length === 0 || isPrintGroupFilled(groups[groups.length - 1]);

    // Добавление группы
    const handleAddGroup = useCallback(() => {
        if (!canAddGroup) return;
        const newGroup = createEmptyPrintGroup(getPrintGroupColor(groups.length));
        onChange([...groups, newGroup]);
    }, [canAddGroup, groups, onChange]);

    // Обновление группы
    const handleUpdateGroup = useCallback(
        (id: string, updates: Partial<PrintGroupInput>) => {
            onChange(groups.map((g) => (g.id === id ? { ...g, ...updates } : g)));
        },
        [groups, onChange]
    );

    // Удаление группы
    const handleRemoveGroup = useCallback(
        (id: string) => {
            const filtered = groups.filter((g) => g.id !== id);
            if (filtered.length === 0) {
                // Оставляем пустую группу
                onChange([createEmptyPrintGroup(getPrintGroupColor(0))]);
            } else {
                // Переназначаем цвета
                onChange(
                    filtered.map((g, i) => ({
                        ...g,
                        color: getPrintGroupColor(i),
                    }))
                );
            }
        },
        [groups, onChange]
    );

    const filledCount = groups.filter(isPrintGroupFilled).length;
    const totalQuantity = groups.reduce((sum, g) => sum + (g.quantity || 0), 0);

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="font-bold">Принты</h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                        {filledCount} {filledCount === 1 ? "принт" : "принтов"}
                    </span>
                    {totalQuantity > 0 && (
                        <>
                            <span>•</span>
                            <span>{totalQuantity} шт. всего</span>
                        </>
                    )}
                </div>
            </div>

            {/* Groups */}
            <div className="space-y-3">
                {groups.map((group, index) => (
                    <PrintGroupCard
                        key={group.id}
                        group={group}
                        index={index}
                        placements={placements}
                        onUpdate={(updates) => handleUpdateGroup(group.id, updates)}
                        onRemove={() => handleRemoveGroup(group.id)}
                        canRemove={groups.length > 1 || isPrintGroupFilled(group)}
                    />
                ))}
            </div>

            {/* Add Button */}
            {canAddGroup && (
                <button
                    type="button"
                    onClick={handleAddGroup}
                    className={cn(
                        "w-full p-4 rounded-2xl border-2 border-dashed border-slate-200",
                        "hover:border-primary/50 hover:bg-primary/5",
                        "transition-all duration-200",
                        "flex items-center justify-center gap-2",
                        "text-sm font-bold text-slate-500 hover:text-primary"
                    )}
                >
                    <Plus className="h-4 w-4" />
                    Добавить ещё один принт
                </button>
            )}
        </div>
    );
});
