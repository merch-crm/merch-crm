"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download,
    Check,
    ChevronDown,
    ChevronRight,
    Filter,
    Loader2,
    X,
} from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { getExportData, getExportPresets } from "../actions";
import { EXPORT_COLUMNS, ExportColumn } from "../actions/export.types";

interface ExportDialogProps {
    open: boolean;
    onClose: () => void;
    selectedIds?: string[];
    filters?: Record<string, unknown>;
    totalCount?: number;
}

type ColumnCategory = "basic" | "contacts" | "analytics" | "meta";

const categoryLabels: Record<ColumnCategory, string> = {
    basic: "Основные данные",
    contacts: "Контакты",
    analytics: "Аналитика",
    meta: "Служебные",
};

const categoryIcons: Record<ColumnCategory, string> = {
    basic: "👤",
    contacts: "📱",
    analytics: "📊",
    meta: "🏷️",
};

export function ExportDialog({
    open,
    onClose,
    selectedIds,
    filters,
    totalCount,
}: ExportDialogProps) {
    const { toast } = useToast();

    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        EXPORT_COLUMNS.filter(c => c.default).map(c => c.key)
    );
    const [expandedCategories, setExpandedCategories] = useState<ColumnCategory[]>(["basic", "contacts"]);
    const [isExporting, setIsExporting] = useState(false);
    const [presets, setPresets] = useState<Array<{ id: string; name: string; description: string; columns: string[] }>>([]);
    const [activePreset, setActivePreset] = useState<string | null>("basic");
    const [includeArchived, setIncludeArchived] = useState(false);

    // Загружаем пресеты
    useEffect(() => {
        getExportPresets().then(res => {
            if (res.success && res.data) {
                setPresets(res.data);
            }
        });
    }, []);

    // Группируем колонки по категориям
    const columnsByCategory = EXPORT_COLUMNS.reduce((acc, col) => {
        if (!acc[col.category]) acc[col.category] = [];
        acc[col.category].push(col);
        return acc;
    }, {} as Record<ColumnCategory, ExportColumn[]>);

    const toggleCategory = (category: ColumnCategory) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const toggleColumn = (key: string) => {
        setSelectedColumns(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
        setActivePreset(null);
    };

    const toggleAllInCategory = (category: ColumnCategory, checked: boolean) => {
        const categoryKeys = columnsByCategory[category].map(c => c.key);
        setSelectedColumns(prev => {
            if (checked) {
                return [...new Set([...prev, ...categoryKeys])];
            } else {
                return prev.filter(k => !categoryKeys.includes(k));
            }
        });
        setActivePreset(null);
    };

    const applyPreset = (presetId: string) => {
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
            setSelectedColumns(preset.columns);
            setActivePreset(presetId);
        }
    };

    const handleExport = async () => {
        if (selectedColumns.length === 0) {
            toast("Выберите хотя бы одну колонку", "error");
            return;
        }

        setIsExporting(true);
        try {
            const res = await getExportData({
                columns: selectedColumns,
                format: "csv",
                clientIds: selectedIds,
                filters: filters as Record<string, unknown>,
                includeArchived: includeArchived,
            });

            if (res.success && res.data && res.filename) {
                // Создаём и скачиваем файл
                const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = res.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast(`Экспорт завершён: ${res.filename}`, "success");
                onClose();
            } else {
                toast(res.error || "Не удалось выполнить экспорт", "error");
            }
        } catch (_error) {
            toast("Произошла ошибка при экспорте", "error");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <ResponsiveModal
            isOpen={open}
            onClose={onClose}
            title="Экспорт клиентов"
            description={
                selectedIds?.length
                    ? `Выбрано клиентов: ${selectedIds.length}`
                    : `Всего клиентов: ${totalCount || 0}`
            }
            footer={
                <div className="flex items-center justify-between w-full">
                    <div className="text-xs font-bold text-slate-500">
                        Выбрано полей: <span className="text-slate-900">{selectedColumns.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isExporting} className="h-10 rounded-xl font-bold">
                            <X className="w-4 h-4 mr-2" />
                            Отмена
                        </Button>
                        <Button type="submit" onClick={handleExport} disabled={isExporting || selectedColumns.length === 0} className="h-10 rounded-xl font-bold">
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            Скачать CSV
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-3 p-6">
                {/* Пресеты */}
                <div>
                    <label className="text-xs font-black text-slate-400 mb-2 block px-1">
                        Быстрый выбор
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {presets.map(preset => (
                            <button
                                type="button"
                                key={preset.id}
                                onClick={() => applyPreset(preset.id)}
                                className={cn(
                                    "p-3 rounded-2xl border-2 text-left transition-all",
                                    activePreset === preset.id
                                        ? "border-primary bg-primary/5 shadow-inner"
                                        : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                                )}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-[13px] text-slate-900">
                                        {preset.name}
                                    </span>
                                    {activePreset === preset.id && (
                                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[11px] font-medium text-slate-500 line-clamp-2">{preset.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Колонки по категориям */}
                <div>
                    <label className="text-xs font-black text-slate-400 mb-2 block px-1">
                        Поля для экспорта
                    </label>
                    <div className="space-y-3">
                        {(Object.keys(columnsByCategory) as ColumnCategory[]).map(category => {
                            const columns = columnsByCategory[category];
                            const isExpanded = expandedCategories.includes(category);
                            const selectedInCategory = columns.filter(c => selectedColumns.includes(c.key)).length;
                            const allSelected = selectedInCategory === columns.length;
                            const someSelected = selectedInCategory > 0 && !allSelected;

                            return (
                                <div
                                    key={category}
                                    className="border border-slate-100 rounded-2xl overflow-hidden bg-white"
                                >
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 transition-colors border-none bg-transparent text-left"
                                        onClick={() => toggleCategory(category)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                                className="flex bg-transparent border-none p-0"
                                            >
                                                <Checkbox
                                                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                                                    onCheckedChange={(checked) => toggleAllInCategory(category, !!checked)}
                                                />
                                            </button>
                                            <span className="text-xl">{categoryIcons[category]}</span>
                                            <span className="font-bold text-slate-900 text-[14px]">
                                                {categoryLabels[category]}
                                            </span>
                                            <Badge variant="secondary" className="text-xs font-bold h-5 px-1.5 bg-slate-100 text-slate-500 border-none">
                                                {selectedInCategory}/{columns.length}
                                            </Badge>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-slate-300" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-slate-300" />
                                        )}
                                    </button>

                                    {/* Columns list */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border-t border-slate-50 bg-slate-50/30">
                                                    {columns.map(column => (
                                                        <label
                                                            key={column.key}
                                                            className={cn(
                                                                "flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all border",
                                                                selectedColumns.includes(column.key)
                                                                    ? "bg-white border-slate-200 shadow-sm"
                                                                    : "hover:bg-white/50 border-transparent"
                                                            )}
                                                        >
                                                            <Checkbox
                                                                checked={selectedColumns.includes(column.key)}
                                                                onCheckedChange={() => toggleColumn(column.key)}
                                                            />
                                                            <span className={cn("text-[13px] transition-colors",
                                                                selectedColumns.includes(column.key) ? "font-bold text-slate-900" : "font-medium text-slate-600"
                                                            )}>
                                                                {column.label}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Опции */}
                <div className="p-4 bg-slate-900 rounded-2xl space-y-3 shadow-xl">
                    <label className="text-xs font-black text-slate-400 block mb-1 px-1">
                        Дополнительные опции
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group py-1">
                        <Checkbox
                            checked={includeArchived}
                            onCheckedChange={(v) => setIncludeArchived(!!v)}
                            className="border-slate-700 bg-slate-800"
                        />
                        <span className="text-[13px] font-bold text-slate-200 group-hover:text-white transition-colors">
                            Включить архивных клиентов
                        </span>
                    </label>
                </div>

                {/* Информация об экспорте */}
                {(selectedIds?.length || filters) && (
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Filter className="w-4 h-4" />
                        </div>
                        <div className="text-[13px] font-medium text-blue-700 pt-1">
                            {selectedIds?.length ? (
                                <>Будет экспортировано <span className="font-bold">{selectedIds.length}</span> выбранных клиентов</>
                            ) : (
                                <>Будут экспортированы клиенты с учётом текущих активных фильтров</>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ResponsiveModal>
    );
}
