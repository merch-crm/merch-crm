"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { ColorPickerCompact, ColorPickerSwatchesGroup, ColorPickerSquare, ColorPickerCircle } from '@/components/ui/color-picker-variants';
import { ColorPicker } from "@/components/ui/color-picker";

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
     code='import { ColorPickerCompact } from "@/components/ui/color-picker-variants";'
    >
      <ColorPickerCompact />
    </ComponentShowcase>


    <ComponentShowcase title="Полный пикер цвета" source="custom" desc="Расширенный интерфейс выбора цвета с палитрой, слайдерами и полем ввода." code='import { ColorPicker } from "@/components/ui/color-picker";' className="col-span-1 md:col-span-1 lg:col-span-2">
      <div className="flex flex-col items-center justify-center py-8">
       <ColorPicker />
      </div>
    </ComponentShowcase>

    <ComponentShowcase title="Группы образцов" source="custom" desc="Пользовательский рендер с индикаторами выбора и кастомным цветом." code='import { ColorPickerSwatchesGroup } from "@/components/ui/color-picker-variants";' className="col-span-1 md:col-span-2 lg:col-span-4">
      <div className="flex items-center justify-center py-4">
       <ColorPickerSwatchesGroup />
      </div>
    </ComponentShowcase>

    <ComponentShowcase title="Квадрат" source="custom" desc="Компактный триггер выбора цвета в форме квадрата с попапом." code='import { ColorPickerSquare } from "@/components/ui/color-picker-variants";' className="col-span-1 md:col-span-1 lg:col-span-2 !overflow-visible relative z-40 [&>div:last-child]:!overflow-visible">
      <div className="flex items-center justify-center py-8">
       <ColorPickerSquare />
      </div>
    </ComponentShowcase>

    <ComponentShowcase title="Круг" source="custom" desc="Компактный триггер выбора цвета в форме круга с попапом." code='import { ColorPickerCircle } from "@/components/ui/color-picker-variants";' className="col-span-1 md:col-span-1 lg:col-span-2 !overflow-visible relative z-40 [&>div:last-child]:!overflow-visible">
      <div className="flex items-center justify-center py-8">
       <ColorPickerCircle />
      </div>
    </ComponentShowcase>

   </div>
  </CategoryPage>
 );
}
