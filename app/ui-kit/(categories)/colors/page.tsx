"use client";

import React, { useState, useMemo } from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { CompactColorPicker } from '@/components/library/custom/components/colors/custom-colors-demo';
import { CustomRenderFunction } from '@/components/library/custom/components/colors/custom-colors-demo';
import { LuminColorPicker } from "@/components/ui/lumin-color-picker";
import { motion } from 'framer-motion';
import { Pipette, Copy, Check } from 'lucide-react';

// Simple palette generation logic
const generatePalette = (baseColor: string) => {
 return [
  { name: 'Primary', hex: baseColor, desc: 'Основной цвет бренда' },
  { name: 'Secondary', hex: '#6366f1', desc: 'Для акцентов и ссылок' },
  { name: 'Surface', hex: '#f8fafc', desc: 'Фон карточек и блоков' },
  { name: 'Muted', hex: '#64748b', desc: 'Вспомогательный текст' },
  { name: 'Brand-Base', hex: '#0f172a', desc: 'Темный индустриальный' },
 ];
};

export default function ColorsPage() {
 const [baseHex, setBaseHex] = useState('#7c3aed');
 const [copied, setCopied] = useState<string | null>(null);

 const palette = useMemo(() => generatePalette(baseHex), [baseHex]);

 const copyToClipboard = (hex: string) => {
  navigator.clipboard.writeText(hex);
  setCopied(hex);
  setTimeout(() => setCopied(null), 2000);
 };

 return (
  <CategoryPage 
   title="Цветовая палитра" 
   description="Инструменты для выбора фирменных цветов, генерации палитр и проверки контрастности в CRM." 
   count={4}
  >
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-16">

    <ComponentShowcase 
     title="Пипетка и превью" 
     source="custom" 
     desc="Компактный инструмент для точного выбора цвета с поддержкой системного EyeDropper." 
     className="!overflow-visible relative z-50 [&>div:last-child]:!overflow-visible"
    >
      <CompactColorPicker />
    </ComponentShowcase>

    <ComponentShowcase title="Merch-Ready генератор" source="custom" desc="Генерация палитры на основе базового цвета.">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl w-full translate-y-2">
       <div className="flex items-center gap-3 mb-10">
         <div className="relative group">
          <input 
           type="color" 
           value={baseHex}
           onChange={(e) => setBaseHex(e.target.value)}
           className="size-16 rounded-2xl border-4 border-gray-50 cursor-pointer shadow-sm appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-xl"
          />
          <div className="absolute -top-2 -right-2 size-6 bg-primary-base text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white pointer-events-none">
            <Pipette className="size-3" />
          </div>
         </div>
         <div className="flex flex-col">
          <span className="text-xl font-black text-gray-900 ">{baseHex}</span>
          <span className="text-[11px] font-bold text-gray-400 italic">Базовый HEX вашего бренда</span>
         </div>
       </div>

       <div className="flex flex-col gap-2">
         {palette.map((color, i) => (
          <motion.div 
           key={color.name}
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: i * 0.05 }}
           className="flex items-center gap-3 p-2 pl-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary-base/20 transition-colors group"
          >
            <div 
             className="size-10 rounded-xl shadow-inner border border-black/5 shrink-0" 
             style={{ backgroundColor: color.hex }}
            />
            <div className="flex flex-col flex-1 min-w-0">
             <span className="text-[11px] font-black text-gray-600 ">{color.name}</span>
             <span className="text-xs font-bold text-gray-400 truncate">{color.desc}</span>
            </div>
            <button 
             onClick={() => copyToClipboard(color.hex)}
             className="size-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary-base hover:shadow-md transition-all active:scale-95"
            >
             {copied === color.hex ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            </button>
          </motion.div>
         ))}
       </div>
      </div>
    </ComponentShowcase>



    <ComponentShowcase title="Полный пикер цвета" source="custom" desc="Расширенный интерфейс выбора цвета с палитрой, слайдерами и полем ввода." className="lg:col-span-1">
      <div className="flex flex-col items-center justify-center py-8">
       <LuminColorPicker />
      </div>
    </ComponentShowcase>

    <ComponentShowcase title="Группы образцов" source="custom" desc="Пользовательский рендер с индикаторами выбора.">
      <div className="flex items-center justify-center py-4">
       <CustomRenderFunction />
      </div>
    </ComponentShowcase>

   </div>
  </CategoryPage>
 );
}
