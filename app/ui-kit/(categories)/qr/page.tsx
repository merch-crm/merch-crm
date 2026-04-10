"use client";

import React, { useState } from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { QRCode } from "@/components/ui/qr-code";
import { 
 Smartphone, 
 Printer, 
 Share2, 
 Download
} from 'lucide-react';

export default function QRPage() {
 const [qrValue, setQrValue] = useState("https://merchcrm.ru/order/12456");

 return (
  <CategoryPage
   title="QR-коды и сканеры"
   description="Генерация и сканирование QR-кодов для складского учета, авторизации и платежей."
  >
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-16">
    
    {/* 1. Standard QR Code */}
    <ComponentShowcase title="Стандартный QR (Order ID)" source="custom" className="col-span-1 md:col-span-1 lg:col-span-2">
     <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <QRCode value={qrValue} size={160} />
      <p className="text-[11px] font-black text-gray-400 ">ID: #12456</p>
     </div>
    </ComponentShowcase>

    {/* 2. QR with Interaction */}
    <ComponentShowcase title="QR с вводом данных" source="custom" className="col-span-1 md:col-span-1 lg:col-span-2">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-3 bg-gray-50 p-6 rounded-3xl">
       <input 
        value={qrValue}
        onChange={(e) => setQrValue(e.target.value)}
        className="w-full h-10 px-4 rounded-xl border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-primary-base/20 outline-none"
        placeholder="Введите текст или ссылку..."
       />
       <div className="flex justify-center bg-white p-4 rounded-2xl border border-gray-200">
        <QRCode value={qrValue || "empty"} size={120} />
       </div>
      </div>
    </ComponentShowcase>

    {/* 3. Small QR (Badge style) */}
    <ComponentShowcase title="Мини-QR (Label)" source="custom" className="col-span-1 md:col-span-1 lg:col-span-2">
     <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 w-fit mx-auto">
       <QRCode value="SKU-9921" size={60} />
       <div>
        <p className="text-xs font-black text-gray-900">SKU-9921</p>
        <p className="text-[11px] text-gray-400 font-bold">Худи &quot;Cosmos&quot; XL</p>
       </div>
     </div>
    </ComponentShowcase>

    {/* 4. Scanning Interface Concept */}
    <ComponentShowcase title="Интерфейс сканера" source="custom" className="col-span-1 md:col-span-1 lg:col-span-2">
      <div className="w-full max-w-[280px] mx-auto aspect-[9/16] bg-slate-50 rounded-[40px] border-8 border-slate-200 relative overflow-hidden flex flex-col shadow-inner">
       <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--primary-base)_0,transparent_100%)]" />
       <div className="mt-auto p-10 flex flex-col items-center gap-3 relative z-10">
         <div className="size-48 border-2 border-primary-base rounded-3xl relative bg-white/50 backdrop-blur-sm shadow-sm">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-base rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-base rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-base rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-base rounded-br-xl" />
          <div className="absolute inset-x-4 top-1/2 h-0.5 bg-primary-base shadow-[0_0_15px_var(--primary-base)] animate-scan-y" />
         </div>
         <p className="text-xs font-black text-slate-900 ">Наведите на код</p>
       </div>
      </div>
    </ComponentShowcase>

    {/* 5. Inventory QR List */}
    <ComponentShowcase title="Групповая генерация" source="custom" className="col-span-1 md:col-span-2 lg:col-span-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl mx-auto">
       {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-3">
          <QRCode value={`BOX-${i*100}`} size={80} />
          <div className="text-center">
           <p className="text-[11px] font-black text-gray-900 ">BOX-{i*100}</p>
           <p className="text-[8px] text-gray-400 font-bold">Стеллаж A-{i}</p>
          </div>
        </div>
       ))}
      </div>
    </ComponentShowcase>



    {/* 8. QR Actions (Print/Share) */}
    <ComponentShowcase title="Действия с кодом" source="custom" className="col-span-1 md:col-span-1 lg:col-span-2">
     <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
       <QRCode value="SHARE-LINK" size={140} />
       <div className="flex gap-2 w-full">
        <button className="flex-1 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 transition-colors">
          <Printer size={16} />
        </button>
        <button className="flex-1 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 transition-colors">
          <Download size={16} />
        </button>
        <button className="flex-1 h-10 bg-primary-base text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary-base/20 transition-all hover:scale-105">
          <Share2 size={16} />
        </button>
       </div>
     </div>
    </ComponentShowcase>



    {/* 11. SKU Label Mockup */}
    <ComponentShowcase title="Этикетка со штрих-кодом" source="custom" className="col-span-1 md:col-span-2 lg:col-span-4">
      <div className="w-full max-w-2xl mx-auto p-10 bg-[#f8f8f8] border-2 border-dashed border-gray-300 rounded-xl flex items-center gap-3">
       <div className="bg-white p-6 border border-gray-200 shadow-md flex-1 rounded-sm flex items-center gap-3">
         <QRCode value="PROD-AX-99" size={100} />
         <div className="flex-1 space-y-2">
          <h4 className="text-xl font-black text-black leading-none">Худи MerchPro</h4>
          <p className="text-xs font-bold text-gray-400">Цвет: Midnight Black | Размер: L</p>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[11px] font-black text-black">ПАРТИЯ: #2026-04-03</p>
            <p className="text-[11px] font-black text-black">ПРОИСХОЖДЕНИЕ: Москва, RU</p>
          </div>
         </div>
       </div>
       <div className="hidden sm:flex flex-col gap-3">
         <div className="size-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400"><Printer size={20} /></div>
         <div className="size-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400"><Smartphone size={20} /></div>
       </div>
      </div>
    </ComponentShowcase>



   </div>
  </CategoryPage>
 );
}
