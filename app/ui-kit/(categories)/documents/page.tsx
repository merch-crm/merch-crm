
"use client";

import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { 
  Download, 
  Eye, 
  Share2,
  FolderOpen,
  FileMinus
} from 'lucide-react';

export default function DocumentsPage() {
  return (
    <CategoryPage title="Документы и E-Sign" description="15+ инструментов для работы с документами: превью счетов, шаблоны КП, подписание договоров и история версий." count={2}>
      


      {/* 6. Folder Browser */}
      <ComponentShowcase 
        title="Обозреватель иерархии" 
        source="custom" 
        desc="Компактная структура папок для навигации по архивам." 
      >
        <div className="grid grid-cols-2 gap-3 w-full max-w-lg mx-auto">
           {['Юр. документы', 'Материалы продаж', 'Фото команды', 'Архив 2024'].map((f, i) => (
             <div key={i} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-center gap-3 group hover:border-primary-base/20 transition-all">
                <FolderOpen className="size-6 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-gray-950  ">{f}</span>
             </div>
           ))}
        </div>
      </ComponentShowcase>


       {/* 10. Document Quick Actions */}
       <ComponentShowcase 
        title="Плавающие контекстные действия" 
        source="custom" 
        desc="Плавающая панель быстрых действий для выбранного документа." 
      >
        <div className="flex items-center justify-center py-12 relative">
           <div className="flex gap-3 p-3 bg-white border border-gray-100 shadow-2xl rounded-3xl animate-in zoom-in duration-500">
              <button className="size-11 rounded-xl bg-gray-50 text-gray-500 hover:bg-primary-base/10 hover:text-primary-base transition-all flex items-center justify-center"><Eye size={18} /></button>
              <button className="size-11 rounded-xl bg-gray-50 text-gray-500 hover:bg-primary-base/10 hover:text-primary-base transition-all flex items-center justify-center"><Download size={18} /></button>
              <button className="size-11 rounded-xl bg-gray-50 text-gray-500 hover:bg-primary-base/10 hover:text-primary-base transition-all flex items-center justify-center"><Share2 size={18} /></button>
              <div className="w-[1px] bg-gray-100 mx-1" />
              <button className="size-11 rounded-xl bg-gray-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"><FileMinus size={18} /></button>
           </div>
        </div>
      </ComponentShowcase>

    </CategoryPage>
  );
}
