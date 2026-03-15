"use client";

import { useEffect } from "react";
import { Printer, Maximize2, Layers, Scissors, Clock, RotateCcw, Sparkles } from "lucide-react";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import {
  CalculatorLayout,
  CalculatorSection,
  CalculatorResults,
  ResultRow,
} from "../../components/calculator-layout";
import { WarehouseMaterialsList } from "../../components/warehouse-materials-list";
import { useDTFCalculator } from "./hooks/use-dtf-calculator";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";

const FILM_OPTIONS = [
  { value: "standard", label: "Стандартная", description: "Базовая плёнка" },
  { value: "premium", label: "Премиум", description: "Повышенная стойкость" },
  { value: "glitter", label: "Глиттер", description: "С блёстками" },
  { value: "glow", label: "Светящаяся", description: "Светится в темноте" },
  { value: "metallic", label: "Металлик", description: "Металлический эффект" },
];

const QUALITY_OPTIONS = [
  { value: "draft", label: "Черновик", dpi: "300 DPI" },
  { value: "standard", label: "Стандарт", dpi: "600 DPI" },
  { value: "high", label: "Высокое", dpi: "1200 DPI" },
];

const WHITE_LAYER_OPTIONS = [
  { value: "none", label: "Без белого", description: "Только для белых тканей" },
  { value: "auto", label: "Авто", description: "Автоматически под цвета" },
  { value: "full", label: "Полный", description: "Сплошной белый слой" },
];

const CUTTING_OPTIONS = [
  { value: "none", label: "Без резки", price: 0 },
  { value: "contour", label: "По контуру", price: 15 },
  { value: "rectangle", label: "Прямоугольник", price: 5 },
];

const URGENCY_OPTIONS = [
  { value: "normal", label: "Обычный", days: "3-5 дней" },
  { value: "express", label: "Экспресс", days: "1-2 дня" },
  { value: "urgent", label: "Срочный", days: "24 часа" },
];

export function DTFCalculatorClient() {
  const { setCustomTrail } = useBreadcrumbs();

  const {
    settings,
    materials,
    margin,
    calculation,
    updateSettings,
    setMaterials,
    setMargin,
    reset,
  } = useDTFCalculator();

  useEffect(() => {
    setCustomTrail([
      { label: "Главная", href: "/dashboard" },
      { label: "Производство", href: "/dashboard/production" },
      { label: "Калькуляторы", href: "/dashboard/production/calculators" },
      { label: "DTF печать", href: "/dashboard/production/calculators/dtf" },
    ]);
    return () => setCustomTrail(null);
  }, [setCustomTrail]);

  return (
    <CalculatorLayout
      title="DTF калькулятор"
      description="Расчёт стоимости DTF печати"
      icon={<Printer className="w-5 h-5" />}
      actions={
        <Button variant="outline" size="sm" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Сбросить</span>
        </Button>
      }
    >
      {/* Левая колонка */}
      <div className="lg:col-span-2 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Размеры */}
          <CalculatorSection title="Размеры принта" icon={<Maximize2 className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Ширина (см)</Label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  step={0.5}
                  value={settings.width}
                  onChange={(e) => updateSettings({ width: Math.max(1, Number(e.target.value)) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Высота (см)</Label>
                <Input
                  type="number"
                  min={1}
                  max={90}
                  step={0.5}
                  value={settings.height}
                  onChange={(e) => updateSettings({ height: Math.max(1, Number(e.target.value)) })}
                />
              </div>
            </div>
            <div className="mt-3 p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Площадь:</span>
                <span className="font-semibold">{calculation.areaSqCm.toFixed(1)} см²</span>
              </div>
            </div>
          </CalculatorSection>

          {/* Количество */}
          <CalculatorSection title="Количество">
            <div className="space-y-2">
              <Label>Тираж</Label>
              <Input
                type="number"
                min={1}
                value={settings.quantity}
                onChange={(e) => updateSettings({ quantity: Math.max(1, Number(e.target.value)) })}
              />
            </div>
          </CalculatorSection>
        </div>

        {/* Тип плёнки */}
        <CalculatorSection title="Тип плёнки" icon={<Layers className="w-4 h-4" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {FILM_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => updateSettings({ filmType: option.value as typeof settings.filmType })}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all",
                  settings.filmType === option.value
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-slate-500">{option.description}</div>
              </button>
            ))}
          </div>
        </CalculatorSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Качество печати */}
          <CalculatorSection title="Качество печати" icon={<Sparkles className="w-4 h-4" />}>
            <div className="grid grid-cols-3 gap-2">
              {QUALITY_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => updateSettings({ printQuality: option.value as typeof settings.printQuality })}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all",
                    settings.printQuality === option.value
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-slate-400">{option.dpi}</div>
                </button>
              ))}
            </div>
          </CalculatorSection>

          {/* Белый слой */}
          <CalculatorSection title="Белый слой">
            <Select
              options={WHITE_LAYER_OPTIONS.map(opt => ({
                id: opt.value,
                title: opt.label,
                description: opt.description
              }))}
              value={settings.whiteLayerMode}
              onChange={(value) => updateSettings({ whiteLayerMode: value as typeof settings.whiteLayerMode })}
            />
          </CalculatorSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Резка */}
          <CalculatorSection title="Резка" icon={<Scissors className="w-4 h-4" />}>
            <div className="grid grid-cols-3 gap-2">
              {CUTTING_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => updateSettings({ cutting: option.value as typeof settings.cutting })}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all",
                    settings.cutting === option.value
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  {option.price > 0 && (
                    <div className="text-xs text-slate-400">+{option.price} ₽</div>
                  )}
                </button>
              ))}
            </div>
          </CalculatorSection>

          {/* Срочность */}
          <CalculatorSection title="Срочность" icon={<Clock className="w-4 h-4" />}>
            <div className="grid grid-cols-3 gap-2">
              {URGENCY_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => updateSettings({ urgency: option.value as typeof settings.urgency })}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all",
                    settings.urgency === option.value
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-slate-400">{option.days}</div>
                </button>
              ))}
            </div>
          </CalculatorSection>
        </div>

        {/* Материалы */}
        <CalculatorSection title="Материалы со склада">
          <WarehouseMaterialsList
            materials={materials}
            onChange={setMaterials}
            applicationTypeId="dtf"
          />
        </CalculatorSection>

        {/* Наценка */}
        <CalculatorSection title="Наценка">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Маржа</Label>
              <span className="text-sm font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">
                {margin}%
              </span>
            </div>
            <Slider
              value={[margin]}
              onValueChange={([value]) => setMargin(value)}
              min={0}
              max={100}
              step={5}
              className="py-4"
            />
          </div>
        </CalculatorSection>
      </div>

      {/* Правая колонка - результаты */}
      <CalculatorResults
        total={calculation.total}
        perItem={calculation.perItem}
        quantity={settings.quantity}
        itemLabel={pluralize(settings.quantity, "принт", "принта", "принтов")}
      >
        <div className="space-y-2">
          <div className="text-sm font-bold text-slate-900 mb-3 tracking-wider text-xs">
            Детализация расчёта
          </div>
          <div className="space-y-1">
            {calculation.breakdown.map((item, index) => (
              <ResultRow 
                key={index} 
                label={item.label} 
                value={item.value} 
                type={item.type} 
              />
            ))}
          </div>
        </div>

        {calculation.discount > 0 && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700">Скидка за объём</span>
              <span className="font-bold text-emerald-700">-{calculation.discount}%</span>
            </div>
          </div>
        )}

        {materials.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700">Складские материалы ({materials.length})</span>
              <span className="font-bold text-blue-700">
                {calculation.materialsCost.toLocaleString("ru-RU")} ₽
              </span>
            </div>
          </div>
        )}
      </CalculatorResults>
    </CalculatorLayout>
  );
}
