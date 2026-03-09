"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Tag, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepFooter } from "./step-footer";
import { Select } from "@/components/ui/select";
import { RadioGroup } from "@/components/ui/radio-group";
import { getLinesByCategory } from "@/app/(main)/dashboard/warehouse/lines/actions";
import { getCollections } from "@/app/(main)/dashboard/design/prints/actions";
import { type InferSelectModel } from "drizzle-orm";
import { productLines } from "@/lib/schema/product-lines";
import { printCollections } from "@/lib/schema/designs";

type ProductLine = InferSelectModel<typeof productLines>;
type PrintCollection = InferSelectModel<typeof printCollections>;

export type CreationType = "single" | "base_line" | "finished_line";
export type LineMode = "new" | "existing";

interface PositionTypeStepProps {
    categoryId: string;
    state: {
        creationType: CreationType;
        lineMode: LineMode;
        selectedLineId: string;
        selectedCollectionId: string;
        validationError: string;
    };
    actions: {
        onCreationTypeChange: (type: CreationType) => void;
        onLineModeChange: (mode: LineMode) => void;
        onLineSelect: (lineId: string) => void;
        onCollectionSelect: (collectionId: string) => void;
        onNext: () => void;
        onBack: () => void;
        setValidationError: (error: string) => void;
    };
}

const TYPE_OPTIONS = [
    {
        id: "single" as CreationType,
        title: "Одиночная позиция",
        description: "Создать одну позицию без привязки к линейке",
        icon: Box,
        color: "slate",
    },
    {
        id: "base_line" as CreationType,
        title: "Базовая линейка",
        description: "Создать линейку с вариациями (цвет, размер, объём)",
        icon: Package,
        color: "blue",
    },
    {
        id: "finished_line" as CreationType,
        title: "Готовая продукция",
        description: "Линейка с привязкой к коллекции дизайнов",
        icon: Tag,
        color: "green",
    },
];

const COLOR_MAP: Record<string, { border: string; bg: string; icon: string; check: string }> = {
    slate: { border: "border-slate-500", bg: "bg-slate-50", icon: "bg-slate-500 text-white", check: "bg-slate-500 text-white" },
    blue: { border: "border-blue-500", bg: "bg-blue-50", icon: "bg-blue-500 text-white", check: "bg-blue-500 text-white" },
    green: { border: "border-green-500", bg: "bg-green-50", icon: "bg-green-500 text-white", check: "bg-green-500 text-white" },
};

export function PositionTypeStep({
    categoryId,
    state,
    actions,
}: PositionTypeStepProps) {
    const {
        creationType,
        lineMode,
        selectedLineId,
        selectedCollectionId,
        validationError
    } = state;

    const {
        onCreationTypeChange,
        onLineModeChange,
        onLineSelect,
        onCollectionSelect,
        onNext,
        onBack,
        setValidationError
    } = actions;
    const [existingLines, setExistingLines] = useState<ProductLine[]>([]);
    const [collections, setCollections] = useState<PrintCollection[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Загрузка существующих линеек для категории
    useEffect(() => {
        if (!categoryId) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                const [linesRes, collectionsRes] = await Promise.all([
                    getLinesByCategory(categoryId),
                    getCollections(),
                ]);

                if (linesRes.success && linesRes.data) {
                    // getLinesByCategory returns ProductLineWithStats[], extract as ProductLine
                    setExistingLines(linesRes.data as unknown as ProductLine[]);
                }
                if (collectionsRes.success && collectionsRes.data) {
                    setCollections(collectionsRes.data as unknown as PrintCollection[]);
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [categoryId]);

    const baseLines = existingLines.filter((l) => l.type === "base");
    const finishedLines = existingLines.filter((l) => l.type === "finished");

    const handleNext = () => {
        setValidationError("");

        if (creationType === "base_line") {
            if (lineMode === "existing" && !selectedLineId) {
                setValidationError("Выберите существующую линейку");
                return;
            }
        }

        if (creationType === "finished_line") {
            if (!selectedCollectionId) {
                setValidationError("Выберите коллекцию дизайнов");
                return;
            }
            if (lineMode === "existing" && !selectedLineId) {
                setValidationError("Выберите существующую линейку");
                return;
            }
        }

        onNext();
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                <div className="p-8 space-y-3">
                    {/* Заголовок */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Тип создания
                            </h2>
                            <p className="text-xs font-bold text-slate-700 opacity-60">
                                Выберите, что вы хотите создать
                            </p>
                        </div>
                    </div>

                    {/* Карточки выбора типа */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {TYPE_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            const isSelected = creationType === option.id;
                            const colors = COLOR_MAP[option.color] || COLOR_MAP.slate;

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                        onCreationTypeChange(option.id);
                                        setValidationError("");
                                    }}
                                    className={cn(
                                        "relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-200",
                                        "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                                        isSelected
                                            ? `${colors.border} ${colors.bg} shadow-md`
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                                            isSelected ? colors.icon : "bg-slate-100 text-slate-500"
                                        )}
                                    >
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">
                                        {option.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 text-center">
                                        {option.description}
                                    </p>
                                    {isSelected && (
                                        <div
                                            className={cn(
                                                "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center",
                                                colors.check
                                            )}
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Дополнительные опции для линеек */}
                    {creationType !== "single" && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                            {/* Режим: новая или существующая линейка */}
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-4">
                                    {creationType === "base_line"
                                        ? "Базовая линейка"
                                        : "Готовая линейка"}
                                </h4>

                                <RadioGroup
                                    options={[
                                        {
                                            value: "new",
                                            label: "Создать новую линейку",
                                        },
                                        {
                                            value: "existing",
                                            label: "Добавить в существующую линейку",
                                            disabled:
                                                creationType === "base_line"
                                                    ? baseLines.length === 0
                                                    : finishedLines.length === 0,
                                        },
                                    ]}
                                    value={lineMode}
                                    onValueChange={(v: string) => {
                                        onLineModeChange(v as LineMode);
                                        onLineSelect("");
                                        setValidationError("");
                                    }}
                                />

                                {/* Выбор существующей линейки */}
                                {lineMode === "existing" && (
                                    <div className="mt-4 animate-in fade-in duration-200">
                                        <Select
                                            options={(creationType === "base_line"
                                                ? baseLines
                                                : finishedLines
                                            ).map((line) => ({
                                                id: line.id,
                                                title: line.name,
                                            }))}
                                            value={selectedLineId}
                                            onChange={onLineSelect}
                                            placeholder="Выберите линейку..."
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Выбор коллекции для готовой продукции */}
                            {creationType === "finished_line" && (
                                <div className="p-6 rounded-2xl bg-green-50 border border-green-100">
                                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-green-600" />
                                        Коллекция дизайнов
                                    </h4>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Выберите коллекцию, макеты которой будут использоваться для
                                        готовой продукции
                                    </p>

                                    <Select
                                        options={collections.map((c) => ({
                                            id: c.id,
                                            title: c.name,
                                        }))}
                                        value={selectedCollectionId}
                                        onChange={onCollectionSelect}
                                        placeholder={
                                            collections.length === 0
                                                ? "Нет доступных коллекций"
                                                : "Выберите коллекцию..."
                                        }
                                        disabled={isLoading || collections.length === 0}
                                    />

                                    {collections.length === 0 && (
                                        <p className="mt-3 text-xs text-slate-500">
                                            Сначала создайте коллекцию дизайнов в разделе{" "}
                                            <Link
                                                href="/dashboard/design/prints"
                                                className="text-green-600 hover:underline"
                                            >
                                                Принты
                                            </Link>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ошибка валидации */}
                    {validationError && (
                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 animate-in fade-in">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-sm font-medium">{validationError}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-auto shrink-0">
                <StepFooter onBack={onBack} onNext={handleNext} />
            </div>
        </div>
    );
}
