"use client";

import React, { useState } from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { 
 LayoutDashboard, Briefcase, Users, 
 MessageSquare, Bell
} from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SegmentedControl } from '@/components/ui/segmented-control';



export default function NavigationPage() {
 const [segmentedValue, setSegmentedValue] = useState('week');

 return (
  <CategoryPage
   title="Навигация и Меню"
   description="8 премиальных элементов навигации: от мобильных доков до командных палитр и Apple-стиля."
   count={6}
  >
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-16">
    

    {/* 4. Tabs Shadcn Custom */}
    <ComponentShowcase 
     title="Вкладки (Shadcn Custom)" 
     source="custom"
     description="Табы на базе Radix UI для переключения между разделами."
    >
     <div className="flex justify-center w-full py-4">
       <Tabs defaultValue="details">
        <TabsList>
         <TabsTrigger value="details">Детали</TabsTrigger>
         <TabsTrigger value="deals">Сделки</TabsTrigger>
         <TabsTrigger value="history">История</TabsTrigger>
         <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>
       </Tabs>
     </div>
    </ComponentShowcase>

    {/* 5. Breadcrumbs Custom */}
    <ComponentShowcase 
     title="Хлебные крошки (Breadcrumbs)" 
     source="custom" 
     description="Путь пользователя с поддержкой вложенности и иконок." 
    >
     <div className="flex items-center gap-2 text-xs font-bold py-4">
       <Breadcrumbs 
        items={[
         { label: 'Панель управления', href: '/dashboard' },
         { label: 'Сделки', href: '/deals' },
         { label: 'Альфа-Банк' }
        ]} 
       />
     </div>
    </ComponentShowcase>


    {/* 7. Sidebar Navigation */}
    <ComponentShowcase 
     title="Боковая панель (Sidebar)" 
     source="custom" 
     description="Вертикальная панель управления с поддержкой иконок и бейджей." 
    >
     <div className="h-[300px] w-60 rounded-2xl border border-border bg-card p-3 shadow-sm flex flex-col mx-auto overflow-hidden">
       <div className="p-3 flex items-center gap-3 border-b border-border mb-3">
        <div className="size-8 rounded-lg bg-primary-base flex items-center justify-center text-white text-lg font-bold">M</div>
        <span className="text-sm font-bold ">MerchCRM</span>
       </div>
       
       <div className="flex-1 space-y-1.5 px-1 overflow-y-auto">
        {[
         { icon: LayoutDashboard, label: 'Дашборд', active: true },
         { icon: Briefcase, label: 'Сделки' },
         { icon: Users, label: 'Контакты' },
         { icon: MessageSquare, label: 'Мессенджер', badge: '5' },
        ].map((link, i) => (
         <div key={i} className={cn('flex items-center justify-between rounded-xl px-3 py-2 transition-all cursor-pointer group', link.active ? 'bg-primary-base text-white shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
           <div className="flex items-center gap-3">
            <link.icon className="size-4" />
            <span className="text-xs font-medium">{link.label}</span>
           </div>
           {link.badge && <span className="rounded-full bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5">{link.badge}</span>}
         </div>
        ))}
       </div>
     </div>
    </ComponentShowcase>

    {/* 8. Segmented Control */}
    <ComponentShowcase 
     title="Переключатель (Segmented)" 
     source="custom" 
     description="Компактный переключатель для выбора одного значения из списка." 
    >
     <div className="flex flex-col gap-3 py-4">
       <div className="flex justify-center w-full">
        <SegmentedControl 
         options={[
          { label: 'День', value: 'day' },
          { label: 'Неделя', value: 'week' },
          { label: 'Месяц', value: 'month' },
          { label: 'Год', value: 'year' }
         ]} 
         value={segmentedValue}
         onChange={setSegmentedValue}
         layoutId="nav-segmented"
        />
       </div>
     </div>
    </ComponentShowcase>







    {/* 13. Notification Bell */}
    <ComponentShowcase 
     title="Колокольчик уведомлений" 
     source="custom" 
     description="Индикатор уведомлений с пульсирующим состоянием." 
    >
     <div className="flex justify-center items-center gap-3 py-8">
       <div className="relative group cursor-pointer">
        <div className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20 animate-pulse z-10" />
        <div className="p-3 rounded-2xl bg-white border border-border shadow-sm group-hover:shadow-md transition-all">
          <Bell className="size-6 text-slate-600" />
        </div>
       </div>
     </div>
    </ComponentShowcase>




    {/* 9. Animated List removed */}

   </div>
  </CategoryPage>
 );
}
