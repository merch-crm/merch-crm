"use client";

import React, { useState } from "react";
import { 
 LayoutGrid, 
 Zap, 
 Activity 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Sub-modules ---
import * as Group1 from "./variants-group-1";
import * as Group2 from "./variants-group-2";
import * as Group3 from "./variants-group-3";
import * as Group4 from "./variants-group-4";

const variants = [
 { id: 1, name: "V01: Classic Solid Rounded", component: Group1.Variant1 },
 { id: 2, name: "V02: Centered Large Radius", component: Group1.Variant2 },
 { id: 3, name: "V03: Compact Centered", component: Group1.Variant3 },
 { id: 4, name: "V04: Nested Circular Icon", component: Group1.Variant4 },
 { id: 5, name: "V05: Stacked Buttons Minimal", component: Group1.Variant5 },
 { id: 6, name: "V06: Top Header Card", component: Group1.Variant6 },
 { id: 7, name: "V07: Detached Header Slabs", component: Group1.Variant7 },
 { id: 8, name: "V08: Half-color Header", component: Group1.Variant8 },
 { id: 9, name: "V09: Boxed Content", component: Group1.Variant9 },
 { id: 10, name: "V10: Bottom Button Bar", component: Group1.Variant10 },
 
 { id: 11, name: "V11: True Bento Grid 1", component: Group2.Variant11 },
 { id: 12, name: "V12: True Bento Grid 2", component: Group2.Variant12 },
 { id: 13, name: "V13: Asymmetric Bento", component: Group2.Variant13 },
 { id: 14, name: "V14: Outline Bento", component: Group2.Variant14 },
 { id: 15, name: "V15: Side-by-Side Bento", component: Group2.Variant15 },
 { id: 16, name: "V16: Linear-inspired Modal", component: Group2.Variant16 },
 { id: 17, name: "V17: Offset Icon Layout", component: Group2.Variant17 },
 { id: 18, name: "V18: Diagnostic Dashboard", component: Group2.Variant18 },
 { id: 19, name: "V19: Vertical Mobile-like", component: Group2.Variant19 },
 { id: 20, name: "V20: Dual-tone Enterprise", component: Group2.Variant20 },
 
 { id: 21, name: "V21: Timestamp & Metadata", component: Group3.Variant21 },
 { id: 22, name: "V22: Draggable Floating", component: Group3.Variant22 },
 { id: 23, name: "V23: SVG Path Animated", component: Group3.Variant23 },
 { id: 24, name: "V24: Receipt Ticket Dash", component: Group3.Variant24 },
 { id: 25, name: "V25: Connected Outer Icon", component: Group3.Variant25 },
 { id: 26, name: "V26: Warning Tape Marquee", component: Group3.Variant26 },
 { id: 27, name: "V27: Raw JSON Terminal", component: Group3.Variant27 },
 { id: 28, name: "V28: Loading Pulse Pill", component: Group3.Variant28 },
 { id: 29, name: "V29: Brutalist Sticker", component: Group3.Variant29 },
 { id: 30, name: "V30: Equalizer & Shortcuts", component: Group3.Variant30 },
 
 { id: 31, name: "V31: Padded Nested Block 1", component: Group4.Variant31 },
 { id: 32, name: "V32: Nested Horizontal", component: Group4.Variant32 },
 { id: 33, name: "V33: Tri-Block Vertical", component: Group4.Variant33 },
 { id: 34, name: "V34: Frosted Striped Shell", component: Group4.Variant34 },
 { id: 35, name: "V35: White Shell Inner Gray", component: Group4.Variant35 },
 { id: 36, name: "V36: Dark Inner Section", component: Group4.Variant36 },
 { id: 37, name: "V37: Splitted Inner Core", component: Group4.Variant37 },
 { id: 38, name: "V38: Russian Doll Triple", component: Group4.Variant38 },
 { id: 39, name: "V39: Asymmetric Masonry", component: Group4.Variant39 },
 { id: 40, name: "V40: Concentric Bubble Base", component: Group4.Variant40 },
];

export default function ErrorModalVariantsLightAnim() {
 const [activeTab, setActiveTab] = useState(0);
 
 const CurrentVariant = variants[activeTab].component;

 return (
  <div className="min-h-screen bg-[#FDFDFD] text-gray-900 p-6 lg:p-12 font-sans overflow-x-hidden selection:bg-red-200/50">
   <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-red-500/5 blur-[150px] rounded-full" />
    <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
   </div>

   <div className="max-w-[1400px] mx-auto relative z-10">
    <header className="mb-12 lg:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-3">
     <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white border border-gray-200 rounded-[16px] flex items-center justify-center shadow-sm">
         <LayoutGrid className="text-red-600" size={24} />
        </div>
        <span className="text-gray-500 font-bold tracking-[0.2em] text-[11px] bg-gray-100 px-3 py-1 rounded-full border border-gray-200 flex items-center gap-2">
         Light Theme Lab 
         <span className="flex w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </span>
      </div>
      <h1 className="text-5xl lg:text-7xl font-black mb-4 text-gray-900">
       Bento Modal <span className="text-gray-400">V4</span>
      </h1>
      <p className="text-gray-500 text-lg lg:text-xl font-medium max-w-2xl leading-relaxed">
       40 UI-вариантов в светлом стиле <span className="text-gray-900 font-semibold">Clean Industrial</span> с интегрированными пружинными (spring) анимациями. Теперь с Nested Layered Blocks.
      </p>
     </motion.div>
     
     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white border border-gray-200 rounded-3xl p-6 hidden lg:block max-w-sm shadow-sm">
       <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
         <Zap className="text-red-500 w-4 h-4" />
         <span className="text-gray-500 text-[11px] font-bold">Motion Engine Active</span>
        </div>
       </div>
       <p className="text-gray-500 text-xs leading-relaxed mb-4">
        Каждый вариант содержит сложную внутреннюю stagger-анимацию компонентов. Элементы модального окна (иконки, текст, кнопки) появляются каскадно.
       </p>
     </motion.div>
    </header>

    <div className="flex flex-col lg:flex-row gap-3 items-start">
     {/* Navigation Sidebar */}
     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="w-full lg:w-[320px] flex-shrink-0 bg-white border border-gray-200 rounded-[32px] p-3 h-[600px] overflow-y-auto shadow-sm no-scrollbar relative z-20">
      <h2 className="text-[11px] text-gray-400 font-bold mb-3 px-3 pt-2">Style Variations (40)</h2>
      <div className="flex flex-col gap-1.5">
       {variants.map((v, i) => (
        <button
         key={v.id}
         type="button"
         onClick={() => setActiveTab(i)}
         className={cn(
          "w-full text-left px-4 py-3 rounded-[20px] transition-all flex items-center justify-between group",
          activeTab === i 
           ? "bg-gray-100 text-gray-900 font-bold" 
           : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
         )}
        >
         <span className="text-[13px]">{v.name}</span>
         {activeTab === i && (
          <motion.div layoutId="activeInd" className="w-2 h-2 rounded-full bg-red-500" />
         )}
        </button>
       ))}
      </div>
     </motion.div>

     {/* Preview Canvas */}
     <div className="flex-1 w-full flex items-center justify-center min-h-[500px] lg:min-h-[600px] bg-gray-50 border border-gray-200 rounded-[48px] relative overflow-hidden group shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)]">
       <AnimatePresence mode="wait">
        <div key={activeTab} className="relative z-10 flex items-center justify-center">
         <CurrentVariant title="Сетевая ошибка" message="Не удалось синхронизировать данные с сервером производства. Проверьте соединение или обновите страницу." />
        </div>
       </AnimatePresence>
       
       <div className="absolute bottom-6 left-6 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-500 flex items-center gap-1.5 shadow-sm">
          <Activity size={12} className="text-red-500" /> Layout Engine: Staggered Spring
        </span>
       </div>
     </div>
    </div>
   </div>
   <style>{`
    .no-scrollbar::-webkit-scrollbar {
     display: none;
    }
    .no-scrollbar {
     -ms-overflow-style: none;
     scrollbar-width: none;
    }
   `}</style>
  </div>
 );
}
