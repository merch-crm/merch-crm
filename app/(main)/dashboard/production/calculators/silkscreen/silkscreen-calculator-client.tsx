"use client";

import { useEffect } from "react";
import { Maximize2, Layers, Clock, RotateCcw, Palette, Hash } from "lucide-react";
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
import { useSilkscreenCalculator } from "./hooks/use-silkscreen-calculator";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";

const SIZE_OPTIONS = [
  { value: "small", label: "Малый (A6-A5)" },
  { value: "medium", label: "Средний (A4)" },
  { value: "large", label: "Большой (A3)" },
  { value: "xlarge", label: "Максимальный (A3+)" },
];

const INK_OPTIONS = [
  { value: "plastisol", label: "Пластизоль", description: "Стандартная печать" },
  { value: "waterbase", label: "Водная", description: "Мягкий принт" },
  { value: "discharge", label: "Вытравка", description: "Печать в структуру" },
  { value: "specialty", label: "Спецэффекты", description: "Золото, пуф и др." },
];

const MESH_OPTIONS = [
  { value: "low", label: "Крупная", description: "Для плотных красок" },
  { value: "medium", label: "Средняя", description: "Стандартная сетка" },
  { value: "high", label: "Мелкая", description: "Высокая детализация" },
];

const URGENCY_OPTIONS = [
  { value: "normal", label: "Обычный", days: "5-7 дней" },
  { value: "express", label: "Экспресс", days: "2-3 дня" },
  { value: "urgent", label: "Срочный", days: "24-48 часов" },
];

export function SilkscreenCalculatorClient() {
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
  } = useSilkscreenCalculator();

  useEffect(() => {
    setCustomTrail([
      { label: "Главная", href: "/dashboard" },
      { label: "Производство", href: "/dashboard/production" },
      { label: "Калькуляторы", href: "/dashboard/production/calculators" },
      { label: "Шелкография", href: "/dashboard/production/calculators/silkscreen" },
    ]);
  }, [setCustomTrail]);

  return (
    <CalculatorLayout
      title="Калькулятор шелкографии"
      description="Расчёт стоимости трафаретной печати (тирaжная печать)"
      icon={<Layers className="w-5 h-5" />}
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
          {/* Тираж и цвета */}
          <CalculatorSection title="Тираж и цвета" icon={<Hash className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Кол-во изделий</Label>
                <Input
                  type="number"
                  min={1}
                  value={settings.quantity}
                  onChange={(e) => updateSettings({ quantity: Math.max(1, Number(e.target.value)) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Кол-во цветов</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={settings.colors}
                  onChange={(e) => updateSettings({ colors: Math.max(1, Number(e.target.value)) })}
                />
              </div>
            </div>
          </CalculatorSection>

          {/* Места печати */}
          <CalculatorSection title="Параметры печати" icon={<Palette className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Мест печати</Label>
                <Input
                  type="number"
                  min={1}
                  max={6}
                  value={settings.printLocations}
                  onChange={(e) => updateSettings({ printLocations: Math.max(1, Number(e.target.value)) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Размер</Label>
                <Select
                  options={SIZE_OPTIONS.map(opt => ({
                    id: opt.value,
                    title: opt.label
                  }))}
                  value={settings.size}
                  onChange={(value) => updateSettings({ size: value as typeof settings.size })}
                  className="h-9"
                />
              </div>
            </div>
          </CalculatorSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Тип краски */}
          <CalculatorSection title="Тип краски">
            <div className="grid grid-cols-2 gap-2">
              {INK_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => updateSettings({ inkType: option.value as typeof settings.inkType })}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    settings.inkType === option.value
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="font-medium text-xs">{option.label}</div>
                  <div className="text-xs text-slate-500 leading-tight">{option.description}</div>
                </button>
              ))}
            </div>
          </CalculatorSection>

          {/* Сетка */}
          <CalculatorSection title="Тип сетки" icon={<Maximize2 className="w-4 h-4" />}>
            <div className="grid grid-cols-1 gap-2">
              {MESH_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => updateSettings({ meshCount: option.value as typeof settings.meshCount })}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                    settings.meshCount === option.value
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-slate-500 leading-tight">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </CalculatorSection>
        </div>

        {/* Срочность */}
        <CalculatorSection title="Срочность" icon={<Clock className="w-4 h-4" />}>
          <div className="grid grid-cols-3 gap-2">
            {URGENCY_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => updateSettings({ urgency: option.value as typeof settings.urgency })}
                className={cn(
                  "p-2 rounded-xl border text-center transition-all",
                  settings.urgency === option.value
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="text-xs font-medium">{option.label}</div>
                <div className="text-xs text-slate-400">{option.days}</div>
              </button>
            ))}
          </div>
        </CalculatorSection>

        {/* Материалы */}
        <CalculatorSection title="Материалы со склада">
          <WarehouseMaterialsList
            materials={materials}
            onChange={setMaterials}
            applicationTypeId="silkscreen"
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
        itemLabel={pluralize(settings.quantity, "изделие", "изделия", "изделий")}
      >
        <div className="space-y-2">
          <div className="text-sm font-bold text-slate-900 mb-3 tracking-wider text-xs">
            Детализация расчёта
          </div>
          
          <div className="p-3 bg-slate-50 rounded-xl mb-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Экранов необходимо:</span>
            <span className="text-sm font-bold text-slate-900">{calculation.screensNeeded} шт</span>
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
        
        {settings.quantity < 20 && (
           <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs text-amber-700 font-medium">
              * Тираж менее 20 шт. рассчитывается по стоимости минимального заказа
            </p>
          </div>
        )}
      </CalculatorResults>
    </CalculatorLayout>
  );
}
