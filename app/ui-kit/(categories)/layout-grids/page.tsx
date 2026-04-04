
"use client";

import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";


import { cn } from '@/components/library/custom/utils/cn';

// Bento Structural Imports
import { BentoMainDashboardGrid } from "@/components/library/custom/components/grids/bento-main-dashboard-grid";
import { BentoSplitActionLayout } from "@/components/library/custom/components/grids/bento-split-action-layout";
import { BentoDualPanelSettings } from "@/components/library/custom/components/grids/bento-dual-panel-settings";
import { BentoContentFocusGrid } from "@/components/library/custom/components/grids/bento-content-focus-grid";
import { BentoTabbedWorkspace } from "@/components/library/custom/components/grids/bento-tabbed-workspace";
import { BentoModalOverlayGrid } from "@/components/library/custom/components/grids/bento-modal-overlay-grid";
import { BentoFeatureMasonry } from "@/components/library/custom/components/grids/bento-feature-masonry";
import { BentoNavigationShelf } from "@/components/library/custom/components/grids/bento-navigation-shelf";
import { BentoThreeColumnFeed } from "@/components/library/custom/components/grids/bento-three-column-feed";
import { BentoHeroProductGrid } from "@/components/library/custom/components/grids/bento-hero-product-grid";


export default function LayoutGridsPage() {
  return (
    <CategoryPage 
      title="Сетки и Макеты" 
      description="27+ архитектурных макетов и структурных сеток для построения интерфейсов CRM любой сложности: от классических оболочек до инновационных Bento-матриц." 
      count={14}
    >
      
      {/* --- Section 1: Bento Architecture (from Grids) --- */}
      <div className="mt-12 mb-12 w-full border-t border-border pt-20">
        <h2 className="text-3xl font-black font-heading  mb-4  text-primary-base">Bento Structural Architecture</h2>
        <p className="text-muted-foreground font-medium max-w-2xl">Фундаментальные паттерны для построения сложных CRM-интерфейсов. Сетки с интеллектуальным фокусом и премиальной геометрией.</p>
      </div>

      <div className="flex flex-col gap-3 pb-32">
        <ComponentShowcase title="Гетерогенная матрица дашборда" source="custom" desc="Главная матрица дашборда для комплексного обзора данных.">
          <div className="w-full flex justify-center">
            <BentoMainDashboardGrid />
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Бинарный макет действий" source="custom" desc="Двойной макет для сравнения или раздельных действий.">
          <div className="w-full flex justify-center">
            <BentoSplitActionLayout />
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Фокус на контенте" source="custom" desc="Макет с центральным фокусом на контенте.">
          <div className="w-full flex justify-center">
            <BentoContentFocusGrid />
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Матрица конфигурации панелей" source="custom" desc="Сложная панель настроек с группировкой по категориям.">
          <div className="w-full flex justify-center">
            <BentoDualPanelSettings />
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Интегрированное рабочее пространство" source="custom" desc="Таббированное рабочее пространство со всеми инструментами под рукой.">
           <div className="w-full flex justify-center">
              <BentoTabbedWorkspace />
           </div>
        </ComponentShowcase>

        <ComponentShowcase title="Матрица Feature Masonry" source="custom" desc="Интеллектуальная сетка функций с динамическими размерами.">
           <div className="w-full flex justify-center">
              <BentoFeatureMasonry />
           </div>
        </ComponentShowcase>

        <ComponentShowcase title="Архитектурная полка навигации" source="custom" desc="Вертикальная полка навигации для сложных систем.">
           <div className="w-full flex justify-center">
              <BentoNavigationShelf />
           </div>
        </ComponentShowcase>

        <ComponentShowcase title="Трехколоночная лента активности" source="custom" desc="Трехколоночная лента активности с приоритетами.">
           <div className="w-full flex justify-center">
              <BentoThreeColumnFeed />
           </div>
        </ComponentShowcase>

        <ComponentShowcase title="Герой-сетка продуктов" source="custom" desc="Главная сетка продукта с акцентами на KPI.">
           <div className="w-full flex justify-center">
              <BentoHeroProductGrid />
           </div>
        </ComponentShowcase>

        <ComponentShowcase title="Матрица модальных окон" source="custom" desc="Сетка для модальных окон и быстрых действий.">
           <div className="w-full flex justify-center">
              <BentoModalOverlayGrid />
           </div>
        </ComponentShowcase>

      </div>

      {/* --- Section 2: Standard Layouts --- */}
      <div className="mt-12 mb-12 w-full border-t border-border pt-20">
        <h2 className="text-3xl font-black font-heading  mb-4 ">Стандартные CRM Оболочки</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ComponentShowcase 
          title="Стандартная CRM-оболочка" 
          source="custom" 
          desc="Классический макет: боковая навигация и основная область контента." 
        >
          <div className="w-full h-[300px] border border-gray-200 rounded-[2.5rem] overflow-hidden flex bg-white shadow-sm">
             <div className="w-16 sm:w-48 bg-slate-50 border-r border-gray-100 p-4 flex flex-col gap-3">
                <div className="h-8 w-full bg-gray-200 rounded-xl mb-4" />
                {[1,2,3,4].map(i => <div key={i} className="h-10 w-full bg-white border border-gray-100 rounded-xl" />)}
             </div>
             <div className="flex-1 p-6 flex flex-col gap-3">
                <div className="h-12 w-full bg-gray-50 rounded-2xl border border-gray-100 flex items-center px-4">
                   <div className="h-4 w-32 bg-gray-200 rounded-full" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                   <div className="bg-primary-base/5 rounded-[2rem] border border-primary-base/10" />
                   <div className="bg-gray-50 rounded-[2rem] border border-gray-100" />
                </div>
             </div>
          </div>
        </ComponentShowcase>

        <ComponentShowcase 
          title="Комплексный дашборд" 
          source="custom" 
          desc="Комплексный макет с хедером, сайдбарами и футером." 
        >
          <div className="w-full h-[400px] border border-gray-200 rounded-[2.5rem] overflow-hidden flex flex-col bg-slate-50 shadow-inner">
             <div className="h-14 bg-white border-b border-gray-100 flex items-center px-6 justify-between">
                <div className="flex gap-2">
                   {[1,2,3].map(i => <div key={i} className="size-3 rounded-full bg-gray-100" />)}
                </div>
                <div className="h-6 w-32 bg-gray-100 rounded-full" />
             </div>
             <div className="flex-1 flex">
                <div className="w-40 border-r border-gray-100 bg-white/50 p-4" />
                <div className="flex-1 p-6 flex flex-col gap-3 overflow-y-auto">
                   <div className="h-32 bg-white rounded-3xl border border-gray-100 shadow-sm" />
                   <div className="grid grid-cols-2 gap-3">
                      <div className="h-20 bg-white rounded-2xl border border-gray-100" />
                      <div className="h-20 bg-white rounded-2xl border border-gray-100" />
                   </div>
                </div>
             </div>
          </div>
        </ComponentShowcase>

        <ComponentShowcase 
          title="Master-Detail макет" 
          source="custom" 
          desc="Классический вид CRM: список слева, детальная информация справа." 
        >
          <div className="w-full h-[400px] border border-gray-200 rounded-[2.5rem] overflow-hidden flex bg-white">
             <div className="w-48 border-r border-gray-100 bg-slate-50 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100">
                   <div className="h-9 w-full bg-white border border-gray-200 rounded-xl" />
                </div>
                <div className="flex-1 p-3 space-y-2">
                   {[1,2,3,4].map(i => (
                      <div key={i} className={cn('p-3 rounded-2xl flex gap-3 items-center', i === 1 ? 'bg-white shadow-md' : 'opacity-50')}>
                         <div className="size-8 rounded-full bg-gray-200" />
                      </div>
                   ))}
                </div>
             </div>
             <div className="flex-1 flex flex-col p-8 gap-3 overflow-y-auto">
                <div className="flex justify-between items-start">
                   <div className="flex gap-3 items-center">
                      <div className="size-16 rounded-[2rem] bg-gray-100" />
                   </div>
                </div>
                <div className="flex-1 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-6" />
             </div>
          </div>
        </ComponentShowcase>

        <ComponentShowcase 
          title="Канбан-доска" 
          source="custom" 
          desc="Структура для досок управления задачами." 
        >
          <div className="w-full h-[300px] flex gap-3 overflow-x-auto p-2 scrollbar-none">
             {[
               { title: 'Лид', color: 'bg-primary-base' },
               { title: 'В работе', color: 'bg-amber-500' },
               { title: 'Готово', color: 'bg-emerald-500' }
             ].map((c, i) => (
               <div key={i} className="w-48 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col p-4">
                  <div className="flex-1 space-y-3">
                     {[1,2].map(j => (
                        <div key={j} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                           <div className="h-2 w-full bg-gray-100 rounded-full" />
                        </div>
                     ))}
                  </div>
               </div>
             ))}
          </div>
        </ComponentShowcase>
      </div>

    </CategoryPage>
  );
}
