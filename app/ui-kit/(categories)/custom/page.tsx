'use client';

import React from 'react';
import { 
  Target as TargetIcon
} from 'lucide-react';

import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { 
  KanbanBoard,
  KanbanColumn,
  DealCard,
} from '@/components/library/custom';

export default function CustomCRMShowcase() {
  return (
    <CategoryPage
      title="Custom CRM & Dashboard"
      description="Специализированная Канбан-доска для построения CRM-систем и аналитических дашбордов."
      count={1}
    >
      <div className="flex flex-col gap-3 pb-20">
        
        {/* Section: Pipeline & Deals */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-xl bg-primary-base/10 text-primary-base flex items-center justify-center">
                <TargetIcon size={24} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 ">Pipeline & Deals</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <ComponentShowcase title="Канбан-доска (Структура)" source="custom">
              <KanbanBoard>
                <KanbanColumn title="Новые" count={2} total="60 000 ₽" color="bg-primary-base">
                  <DealCard title="Разработка сайта" amount={45000} company="ООО Вектор" probability={80} dueDate="12 Окт" />
                  <DealCard title="Консультация" amount={15000} company="SelfEmployed" probability={95} dueDate="10 Окт" />
                </KanbanColumn>
                <KanbanColumn title="В работе" count={1} total="120 000 ₽" color="bg-indigo-500">
                  <DealCard title="Дизайн приложения" amount={120000} company="AppDev Studio" probability={60} dueDate="20 Окт" stage="Дизайн" stageColor="bg-indigo-500" />
                </KanbanColumn>
              </KanbanBoard>
            </ComponentShowcase>
          </div>
        </div>
      </div>
    </CategoryPage>
  );
}
