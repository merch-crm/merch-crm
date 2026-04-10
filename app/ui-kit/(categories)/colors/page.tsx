"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { CompactColorPicker } from '@/components/library/custom/components/colors/custom-colors-demo';
import { CustomRenderFunction } from '@/components/library/custom/components/colors/custom-colors-demo';
import { LuminColorPicker } from "@/components/ui/lumin-color-picker";

export default function ColorsPage() {
 return (
  <CategoryPage 
   title="Цветовая палитра" 
   description="Инструменты для выбора фирменных цветов, генерации палитр и проверки контрастности в CRM." 
  >
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-16">

    <ComponentShowcase 
     title="Пипетка и превью" 
     source="custom" 
     desc="Компактный инструмент для точного выбора цвета с поддержкой системного EyeDropper." 
     className="col-span-1 md:col-span-1 lg:col-span-2 !overflow-visible relative z-50 [&>div:last-child]:!overflow-visible"
    >
      <CompactColorPicker />
    </ComponentShowcase>


    <ComponentShowcase title="Полный пикер цвета" source="custom" desc="Расширенный интерфейс выбора цвета с палитрой, слайдерами и полем ввода." className="col-span-1 md:col-span-1 lg:col-span-2">
      <div className="flex flex-col items-center justify-center py-8">
       <LuminColorPicker />
      </div>
    </ComponentShowcase>

    <ComponentShowcase title="Группы образцов" source="custom" desc="Пользовательский рендер с индикаторами выбора." className="col-span-1 md:col-span-2 lg:col-span-4">
      <div className="flex items-center justify-center py-4">
       <CustomRenderFunction />
      </div>
    </ComponentShowcase>

   </div>
  </CategoryPage>
 );
}
