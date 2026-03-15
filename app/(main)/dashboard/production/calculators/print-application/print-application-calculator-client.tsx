"use client";

import { useEffect } from "react";
import { Scissors, Layers, Clock, RotateCcw, Sparkles, MousePointer2 } from "lucide-react";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import {
  CalculatorLayout,
  CalculatorSection,
  CalculatorResults,
  ResultRow,
} from "../../components/calculator-layout";
import { WarehouseMaterialsList } from "../../components/warehouse-materials-list";
import { usePrintApplicationCalculator } from "./hooks/use-print-application-calculator";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";

const PRINT_TYPES = [
  { value: "flex", label: "Флекс", description: "Гладкая плёнка" },
  { value: "flock", label: "Флок", description: "Бархатистая" },
  { value: "reflective", label: "Светоотраж.", description: "Рефлектив" },
  { value: "glitter", label: "Глиттер", description: "С блестками" },
  { value: "neons", label: "Неон", description: "Яркие цвета" },
  { value: "transfer", label: "Трансфер", description: "Полноцвет" },
];

const APPLICATION_TYPES = [
  { value: "thermal", label: "Термоподъем", description: "Термопресс" },
  { value: "sew-on", label: "Пришив", description: "Швейная машина" },
  { value: "patch", label: "Патч", description: "На липучке/клей" },
];

const SIZE_OPTIONS = [
  { value: "small", label: "До 5х5 см" },
  { value: "medium", label: "До 15х15 см" },
  { value: "large", label: "До 30х30 см" },
  { value: "xlarge", label: "Более 30х30 см" },
];

const WEED_COMPLEXITY = [
  { value: "simple", label: "Простая" },
  { value: "medium", label: "Средняя" },
  { value: "complex", label: "Сложная" },
];

const URGENCY_OPTIONS = [
  { value: "normal", label: "Обычный", days: "2-4 дня" },
  { value: "express", label: "Экспресс", days: "24 часа" },
  { value: "urgent", label: "Срочный", days: "При вас" },
];

export function PrintApplicationCalculatorClient() {
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
  } = usePrintApplicationCalculator();

  useEffect(() => {
    setCustomTrail([
      { label: "Главная", href: "/dashboard" },
      { label: "Производство", href: "/dashboard/production" },
      { label: "Калькуляторы", href: "/dashboard/production/calculators" },
      { label: "Нанесение принта", href: "/dashboard/production/calculators/print-application" },
    ]);
    return () => setCustomTrail(null);
  }, [setCustomTrail]);

  return (
    <CalculatorLayout
      title="Печать и нанесение"
      description="Калькулятор термотрансферного переноса и пришивных элементов"
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
          {/* Тип печати */}
          <CalculatorSection title="Тип материала" icon={<Sparkles className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-2">
              {PRINT_TYPES.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => updateSettings({ printType: option.value as typeof settings.printType })}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    settings.printType === option.value
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="font-bold text-xs">{option.label}</div>
                  <div className="text-xs text-slate-500">{option.description}</div>
                </button>
              ))}
            </div>
          </CalculatorSection>

          {/* Параметры */}
          <div className="space-y-3">
            <CalculatorSection title="Размер и тираж">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Размер (макс.)</Label>
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
                <div className="space-y-2">
                  <Label>Тираж</Label>
                  <Input
                    type="number"
                    min={1}
                    value={settings.quantity}
                    onChange={(e) => updateSettings({ quantity: Math.max(1, Number(e.target.value)) })}
                  />
                </div>
              </div>
            </CalculatorSection>

            <CalculatorSection title="Тип нанесения" icon={<MousePointer2 className="w-4 h-4" />}>
              <Select
                options={APPLICATION_TYPES.map(opt => ({
                  id: opt.value,
                  title: opt.label
                }))}
                value={settings.applicationType}
                onChange={(value) => updateSettings({ applicationType: value as typeof settings.applicationType })}
                className="h-9"
              />
            </CalculatorSection>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Резка и выборка */}
          <CalculatorSection title="Резка и выборка" icon={<Scissors className="w-4 h-4" />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Сложный контур</Label>
                <Switch
                  checked={settings.complexCutting}
                  onCheckedChange={(checked) => updateSettings({ complexCutting: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Сложность выборки (weed)</Label>
                <div className="grid grid-cols-3 gap-2">
                   {WEED_COMPLEXITY.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => updateSettings({ weedComplexity: option.value as typeof settings.weedComplexity })}
                      className={cn(
                        "p-2 rounded-lg border text-center transition-all text-xs font-bold",
                        settings.weedComplexity === option.value
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
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
        </div>

        {/* Материалы */}
        <CalculatorSection title="Материалы со склада">
          <WarehouseMaterialsList
            materials={materials}
            onChange={setMaterials}
            applicationTypeId="print-application"
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
        itemLabel={pluralize(settings.quantity, "нанесение", "нанесения", "нанесений")}
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
