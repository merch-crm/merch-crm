"use client";

import React, { useState } from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { 
  Home, LayoutDashboard, Briefcase, Users, 
  MessageSquare, Settings, Bell, 
  Command, ChevronRight, BellRing, Search
} from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { motion } from 'framer-motion';

// Bento Navigation Components
import { BentoFloatingDock } from "@/components/library/custom/components/navigation/bento-floating-dock";
import { BentoTabs } from "@/components/library/custom/components/navigation/bento-tabs";

export default function NavigationPage() {
  const [segmentedValue, setSegmentedValue] = useState('week');

  return (
    <CategoryPage
      title="Навигация и Меню"
      description="8 премиальных элементов навигации: от мобильных доков до командных палитр и Apple-стиля."
      count={9}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-16">
        
        {/* 1. Bento Floating Dock */}
        <ComponentShowcase title="Плавающий док (Bento)" source="custom">
          <div className="flex justify-center w-full py-4">
             <BentoFloatingDock items={[
               { icon: <Home className="size-5" />, label: 'Главная', color: 'bg-indigo-500' },
               { icon: <LayoutDashboard className="size-5" />, label: 'Панель', color: 'bg-emerald-500' },
               { icon: <MessageSquare className="size-5" />, label: 'Сообщения', color: 'bg-rose-500', badge: 3 },
               { icon: <Settings className="size-5" />, label: 'Настройки', color: 'bg-slate-700' }
             ]} />
          </div>
        </ComponentShowcase>

        {/* 2. Bento Navigation (Tabs) */}
        <ComponentShowcase title="Навигация (Bento Tabs)" source="custom">
           <div className="flex justify-center w-full py-4 scale-90 origin-center">
              <BentoTabs 
                tabs={[
                  { id: '1', label: 'Обзор', count: 12 },
                  { id: '2', label: 'Задачи', count: 5 },
                  { id: '3', label: 'Профиль' }
                ]} 
                defaultValue="1"
                onChange={() => {}}
              />
           </div>
        </ComponentShowcase>

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

        {/* 10. Command Palette (Mock) */}
        <ComponentShowcase 
          title="Командная палитра" 
          source="custom" 
          description="Быстрый поиск и управление командами через горячие клавиши." 
        >
          <div className="w-full max-w-sm mx-auto border border-border rounded-xl bg-card shadow-lg p-2 overflow-hidden">
             <div className="flex items-center gap-3 px-3 py-2 border-b border-border mb-2">
                <Command className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Введите команду или поиск...</span>
                <span className="ml-auto text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border">⌘K</span>
             </div>
             <div className="space-y-1">
                {[
                  { label: 'Поиск сделок...', icon: Search },
                  { label: 'Создать контакт', icon: Users },
                  { label: 'Настройки', icon: Settings }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                     <item.icon className="size-4 text-muted-foreground" />
                     <span className="text-xs font-medium">{item.label}</span>
                     <ChevronRight className="ml-auto size-3 text-muted-foreground/50" />
                  </div>
                ))}
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
             
             <div className="relative group cursor-pointer scale-110">
                <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-primary-base rounded-full border-2 border-white text-[8px] font-black text-white shadow-lg shadow-primary-base/30 z-10">12</div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl group-hover:scale-110 transition-all active:scale-95">
                   <BellRing className="size-6 text-white" />
                </div>
             </div>
          </div>
        </ComponentShowcase>




        {/* 9. Staggered Entrance (Framer) */}
        <ComponentShowcase title="Список с анимацией" source="custom" desc="Последовательное появление элементов списка.">
           <div className="space-y-3 w-full max-w-sm mx-auto">
              {[1, 2, 3, 4].map(i => (
                <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 hover:border-primary-base/30 transition-colors cursor-pointer"
                >
                   <div className="size-8 rounded-xl bg-gray-50 flex items-center justify-center text-[11px] font-black">{i}</div>
                   <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
                </motion.div>
              ))}
           </div>
        </ComponentShowcase>
      </div>
    </CategoryPage>
  );
}
