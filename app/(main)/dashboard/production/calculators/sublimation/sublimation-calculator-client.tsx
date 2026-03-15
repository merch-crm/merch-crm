"use client";

import { useEffect } from "react";
import { Coffee, Maximize2, Layers, Clock, RotateCcw, Sparkles } from "lucide-react";
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
import { useSublimationCalculator } from "./hooks/use-sublimation-calculator";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";

const PRODUCT_OPTIONS = [
  { value: "tshirt", label: "Футболка" },
  { value: "mug", label: "Кружка" },
  { value: "plate", label: "Тарелка" },
  { value: "pillow", label: "Подушка" },
  { value: "mousepad", label: "Коврик для мыши" },
  { value: "puzzle", label: "Пазл" },
  { value: "custom", label: "Своё изделие" },
];

const SIZE_OPTIONS = [
  { value: "small", label: "S / Малый" },
  { value: "medium", label: "M / Средний" },
  { value: "large", label: "L / Большой" },
  { value: "xlarge", label: "XL / Максимальный" },
];

const QUALITY_OPTIONS = [
  { value: "standard", label: "Стандарт", description: "Обычная цветопередача" },
  { value: "premium", label: "Премиум", description: "Максимальная яркость" },
];

const COATING_OPTIONS = [
  { value: "none", label: "Без покрытия" },
  { value: "glossy", label: "Глянцевый лак" },
  { value: "matte", label: "Матовый лак" },
];

const URGENCY_OPTIONS = [
  { value: "normal", label: "Обычный", days: "3-5 дней" },
  { value: "express", label: "Экспресс", days: "1-2 дня" },
  { value: "urgent", label: "Срочный", days: "24 часа" },
];

export function SublimationCalculatorClient() {
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
  } = useSublimationCalculator();

  useEffect(() => {
    setCustomTrail([
      { label: "Главная", href: "/dashboard" },
      { label: "Производство", href: "/dashboard/production" },
      { label: "Калькуляторы", href: "/dashboard/production/calculators" },
      { label: "Сублимация", href: "/dashboard/production/calculators/sublimation" },
    ]);
  }, [setCustomTrail]);

  return (
    <CalculatorLayout
      title="Сублимационный калькулятор"
      description="Расчёт стоимости сублимационной печати на различных изделиях"
      icon={<Coffee className="w-5 h-5" />}
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
          {/* Тип изделия */}
          <CalculatorSection title="Тип изделия" icon={<Layers className="w-4 h-4" />}>
            <Select
              options={PRODUCT_OPTIONS.map(opt => ({
                id: opt.value,
                title: opt.label
              }))}
              value={settings.productType}
              onChange={(value) => updateSettings({ productType: value as typeof settings.productType })}
            />
          </CalculatorSection>

          {/* Параметры */}
          <CalculatorSection title="Параметры и количество">
             <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Размер</Label>
                  <Select
                    options={SIZE_OPTIONS.map(opt => ({
                      id: opt.value,
                      title: opt.label
                    }))}
                    value={settings.size}
                    onChange={(value) => updateSettings({ size: value as typeof settings.size })}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Покрытие печати */}
          <CalculatorSection title="Покрытие (площадь)" icon={<Maximize2 className="w-4 h-4" />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Заполнение</Label>
                <span className="text-sm font-bold text-primary">{settings.coverage}%</span>
              </div>
              <Slider
                value={[settings.coverage]}
                onValueChange={([value]) => updateSettings({ coverage: value })}
                min={10}
                max={100}
                step={5}
              />
              <p className="text-xs text-slate-400">
                Процент площади изделия, занимаемый принтом
              </p>
            </div>
          </CalculatorSection>

          {/* Качество печати */}
          <CalculatorSection title="Качество печати" icon={<Sparkles className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-2">
              {QUALITY_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => updateSettings({ quality: option.value as typeof settings.quality })}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    settings.quality === option.value
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-slate-500 leading-tight">{option.description}</div>
                </button>
              ))}
            </div>
          </CalculatorSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Покрытие лаком */}
          <CalculatorSection title="Доп. покрытие">
             <div className="grid grid-cols-3 gap-2">
              {COATING_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => updateSettings({ coating: option.value as typeof settings.coating })}
                  className={cn(
                    "p-2 rounded-xl border text-center transition-all",
                    settings.coating === option.value
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="text-xs font-medium">{option.label}</div>
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
            applicationTypeId="sublimation"
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
          <div className="text-xs font-bold text-slate-900 mb-3">
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
