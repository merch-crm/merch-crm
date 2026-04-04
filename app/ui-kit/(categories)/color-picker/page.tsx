"use client";

import React, { useState, useMemo } from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { motion, AnimatePresence } from 'framer-motion';
import { Pipette, Copy, Check, Info, Palette } from 'lucide-react';

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

export default function ColorPickerPage() {
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
      title="Палитра и Брендинг"
      description="Инструменты для выбора фирменных цветов, генерации палитр и проверки контрастности."
      count={4}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-10">
        
        <ComponentShowcase title="Merch-Ready генератор" source="custom" desc="Генерация палитры на основе базового цвета.">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl w-full">
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
                    <span className="text-xl font-black text-gray-900  ">{baseHex}</span>
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
                          <span className="text-[11px] font-black  text-gray-600 ">{color.name}</span>
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

        <ComponentShowcase title="Индустриальные сватчи" source="custom">
           <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <Palette className="size-24 text-white/5 -rotate-12" />
              </div>
              
              <div className="grid grid-cols-3 gap-3 relative z-10">
                 {[
                    '#FF4F00', '#0070F3', '#00DFD8', 
                    '#7928CA', '#FF0080', '#F5A623',
                    '#3291FF', '#40C1AC', '#666666'
                 ].map((hex, i) => (
                    <motion.button 
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => copyToClipboard(hex)}
                      className="aspect-square rounded-[1.5rem] border border-white/10 p-1 bg-white/5 flex items-center justify-center relative group"
                    >
                       <div className="size-full rounded-[1.1rem] shadow-lg" style={{ backgroundColor: hex }} />
                       <AnimatePresence>
                          {copied === hex && (
                             <motion.div 
                               initial={{ opacity: 0, scale: 0.8 }}
                               animate={{ opacity: 1, scale: 1 }}
                               exit={{ opacity: 0 }}
                               className="absolute inset-0 bg-black/60 rounded-[1.5rem] flex items-center justify-center z-20"
                             >
                                <Check className="size-6 text-white" />
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </motion.button>
                 ))}
              </div>

              <div className="mt-8 flex flex-col gap-2 p-5 bg-white/5 border border-white/10 rounded-2xl">
                 <div className="flex items-center gap-2 text-white">
                    <Info className="size-4 text-primary-base" />
                    <span className="text-xs font-black   italic">Совет по дизайну</span>
                 </div>
                 <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                    Используйте насыщенные оранжевые и синие оттенки для элементов призыва к действию (CTA). Это создает ощущение энергии и профессионализма в Merch-индустрии.
                 </p>
              </div>
           </div>
        </ComponentShowcase>

      </div>
    </CategoryPage>
  );
}
