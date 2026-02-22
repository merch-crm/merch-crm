"use client";

import { CheckSquare, Square, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface S3RowBaseProps {
    isSelected: boolean;
    isMultiSelectMode: boolean;
    onSelect: () => void;
    onClick?: () => void;
    onRename?: () => void;
    onDelete?: () => void;
    icon: React.ReactNode;
    iconWrapperClass?: string;
    title: string;
    subtitle?: string;
    rightText?: string;
    extraActions?: React.ReactNode;
}

export const S3RowBase = ({
    isSelected,
    isMultiSelectMode,
    onSelect,
    onClick,
    onRename,
    onDelete,
    icon,
    iconWrapperClass,
    title,
    subtitle,
    rightText,
    extraActions,
}: S3RowBaseProps) => {
    return (
        <tr
            className={cn(
                "crm-tr-clickable group",
                isSelected && "crm-tr-selected"
            )}
        >
            {isMultiSelectMode && (
                <td className="crm-td crm-td-selection text-center cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                }}>
                    <button type="button"
                        className="p-1 hover:bg-indigo-100 rounded transition-colors"
                        aria-label={isSelected ? "Снять выделение" : "Выбрать элемент"}
                        aria-pressed={isSelected}
                    >
                        {isSelected ? (
                            <CheckSquare size={20} className="text-primary" />
                        ) : (
                            <Square size={20} className="text-slate-300" />
                        )}
                    </button>
                </td>
            )}
            <td
                className="crm-td cursor-pointer"
                onClick={onClick}
            >
                <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-[12px] group-hover:scale-110 transition-transform shadow-sm", iconWrapperClass)}>
                        {icon}
                    </div>
                    <div className="max-w-[300px] sm:max-w-none">
                        <p className="text-sm font-bold text-slate-700 truncate">{title}</p>
                        {subtitle && <p className="text-xs text-slate-400 font-medium tracking-tight">{subtitle}</p>}
                    </div>
                </div>
            </td>
            <td className="crm-td text-right">
                <span className="text-xs font-mono font-bold text-slate-500">{rightText || "---"}</span>
            </td>
            <td className="crm-td crm-td-actions">
                <div className="flex items-center justify-center gap-2">
                    {!isMultiSelectMode && (
                        <>
                            {extraActions}
                            {onRename && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRename();
                                    }}
                                    className="h-8 w-8 text-slate-300 hover:text-primary hover:bg-indigo-50"
                                    aria-label="Переименовать"
                                >
                                    <Edit2 size={16} />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                                    aria-label="Удалить"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};
