"use client";

import { useEffect } from "react";
import { Printer, Maximize2, Palette, Clock, RotateCcw } from "lucide-react";
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
import { useDTGCalculator } from "./hooks/use-dtg-calculator";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";

const FABRIC_COLORS = [
  { value: "white", label: "Белый", description: "Без подложки" },
  { value: "light", label: "Светлый", description: "Цветная ткань" },
  { value: "dark", label: "Тёмный", description: "С подложкой" },
  { value: "black", label: "Чёрный", description: "Макс. подложка" },
];

const QUALITY_OPTIONS = [
  { value: "standard", label: "Стандарт", dpi: "720 DPI" },
  { value: "high", label: "Высокое", dpi: "1440 DPI" },
  { value: "photo", label: "Фото", dpi: "2880 DPI" },
];

const FIXATION_OPTIONS = [
  { value: "standard", label: "Стандартная" },
  { value: "enhanced", label: "Усиленная" },
];

const URGENCY_OPTIONS = [
  { value: "normal", label: "Обычный", days: "3-5 дней" },
  { value: "express", label: "Экспресс", days: "1-2 дня" },
  { value: "urgent", label: "Срочный", days: "24 часа" },
];

export function DTGCalculatorClient() {
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
  } = useDTGCalculator();

  useEffect(() => {
    setCustomTrail([
      { label: "Главная", href: "/dashboard" },
      { label: "Производство", href: "/dashboard/production" },
      { label: "Калькуляторы", href: "/dashboard/production/calculators" },
      { label: "DTG печать", href: "/dashboard/production/calculators/dtg" },
    ]);
    return () => setCustomTrail(null);
  }, [setCustomTrail]);

  return (
    <CalculatorLayout
      title="DTG калькулятор"
      description="Прямая цифровая печать на ткани (Direct to Garment)"
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
                  max={40}
                  step={0.5}
                  value={settings.width}
                  onChange={(e) => updateSettings({ width: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Высота (см)</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  step={0.5}
                  value={settings.height}
                  onChange={(e) => updateSettings({ height: Number(e.target.value) })}
                />
              </div>
            </div>
          </CalculatorSection>

          {/* Количество */}
          <CalculatorSection title="Тираж">
            <div className="space-y-2">
              <Label>Количество изделий (шт)</Label>
              <Input
                type="number"
                min={1}
                value={settings.quantity}
                onChange={(e) => updateSettings({ quantity: Math.max(1, Number(e.target.value)) })}
              />
            </div>
          </CalculatorSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Параметры ткани и качества */}
          <CalculatorSection title="Параметры печати" icon={<Palette className="w-4 h-4" />}>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Цвет ткани</Label>
                <Select
                  options={FABRIC_COLORS.map(opt => ({
                    id: opt.value,
                    title: opt.label,
                    description: opt.description
                  }))}
                  value={settings.fabricColor}
                  onChange={(value) => updateSettings({ fabricColor: value as typeof settings.fabricColor })}
                />
              </div>
              <div className="space-y-2">
                <Label>Качество</Label>
                <Select
                  options={QUALITY_OPTIONS.map(opt => ({
                    id: opt.value,
                    title: opt.label,
                    description: opt.dpi
                  }))}
                  value={settings.printQuality}
                  onChange={(value) => updateSettings({ printQuality: value as typeof settings.printQuality })}
                />
              </div>
            </div>
          </CalculatorSection>

          {/* Фиксация и Срочность */}
          <div className="space-y-3">
            <CalculatorSection title="Обработка и фиксация">
              <div className="space-y-3">
                <Select
                  options={FIXATION_OPTIONS.map(opt => ({
                    id: opt.value,
                    title: opt.label
                  }))}
                  value={settings.fixation}
                  onChange={(value) => updateSettings({ fixation: value as typeof settings.fixation })}
                />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Праймер</Label>
                    <p className="text-xs text-slate-500">Улучшает яркость на цвете</p>
                  </div>
                  <Switch
                    checked={settings.pretreatment}
                    onCheckedChange={(checked) => updateSettings({ pretreatment: checked })}
                  />
                </div>
              </div>
            </CalculatorSection>

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
        </div>

        {/* Материалы */}
        <CalculatorSection title="Дополнительные материалы">
          <WarehouseMaterialsList
            materials={materials}
            onChange={setMaterials}
            applicationTypeId="dtg"
          />
        </CalculatorSection>

        {/* Наценка */}
        <CalculatorSection title="Ценовая политика">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Наценка (Маржа %)</Label>
              <span className="text-sm font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">
                {margin}%
              </span>
            </div>
            <Slider
              value={[margin]}
              onValueChange={([value]) => setMargin(value)}
              min={0}
              max={150}
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
            Детализация за тираж
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
              <span className="text-xs font-bold text-blue-700">Материалы ({materials.length})</span>
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
