"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { CompactColorPicker } from '@/components/library/custom/components/colors/heroui-colors-demo';
import { CustomRenderFunction } from '@/components/library/custom/components/colors/heroui-colors-demo';
import { LuminColorPicker } from "@/components/ui/lumin-color-picker";

export default function ColorsPage() {
  return (
    <CategoryPage 
      title="Цветовая палитра" 
      description="Инструменты для выбора и управления цветом в CRM." 
      count={3}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-10">

        <ComponentShowcase 
          title="Пипетка и превью" 
          source="custom" 
          desc="Компактный инструмент для точного выбора цвета с поддержкой системного EyeDropper." 
          className="!overflow-visible relative z-50 [&>div:last-child]:!overflow-visible"
        >
           <CompactColorPicker />
        </ComponentShowcase>

        <ComponentShowcase title="Группы образцов" source="custom" desc="Пользовательский рендер с индикаторами выбора.">
           <div className="flex items-center justify-center py-4">
              <CustomRenderFunction />
           </div>
        </ComponentShowcase>

        <ComponentShowcase title="Полный пикер цвета" source="custom" desc="Расширенный интерфейс выбора цвета с палитрой, слайдерами и полем ввода." className="lg:col-span-2">
           <div className="flex flex-col items-center justify-center py-8 px-6">
              <LuminColorPicker />
           </div>
        </ComponentShowcase>

      </div>
    </CategoryPage>
  );
}
