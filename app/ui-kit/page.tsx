'use client';

import React from 'react';
import Link from 'next/link';
import { 
 Palette, Type, RectangleHorizontal, TextCursorInput, 
 FoldVertical, MessageCircle, BarChart3, Calculator, CalendarDays, 
 UserCircle, Compass, AlertTriangle, Image, Wand2, UploadCloud, 
 QrCode, Activity, CreditCard, Table2, Briefcase, SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

// Categories grouped into logical sections
const categoryGroups = [
 {
  title: "Основы",
  description: "Фундаментальные элементы и стиль",
  items: [
   { slug: 'colors', label: 'Цвета', icon: Palette, count: 5, color: 'text-indigo-600', bg: 'bg-indigo-50' },
   { slug: 'typography', label: 'Типографика', icon: Type, count: 17, color: 'text-slate-600', bg: 'bg-slate-50' },
   { slug: 'buttons', label: 'Кнопки', icon: RectangleHorizontal, count: 7, color: 'text-blue-600', bg: 'bg-blue-50' },
   { slug: 'statuses', label: 'Бейджи и статусы', icon: Activity, count: 6, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ]
 },
 {
  title: "Базовые UI",
  description: "Строительные блоки интерфейса",
  items: [
   { slug: 'inputs', label: 'Поля ввода', icon: TextCursorInput, count: 12, color: 'text-orange-600', bg: 'bg-orange-50' },
   { slug: 'cards', label: 'Карточки', icon: CreditCard, count: 1, color: 'text-emerald-600', bg: 'bg-emerald-50' },
   { slug: 'controls', label: 'Переключатели', icon: SlidersHorizontal, count: 4, color: 'text-indigo-600', bg: 'bg-indigo-50' },
   { slug: 'accordions', label: 'Раскрытие', icon: FoldVertical, count: 3, color: 'text-violet-600', bg: 'bg-violet-50' },
   { slug: 'tooltips', label: 'Подсказки', icon: MessageCircle, count: 3, color: 'text-rose-600', bg: 'bg-rose-50' },
  ]
 },
 {
  title: "Данные и Файлы",
  description: "Инструменты для работы с контентом",
  items: [
   { slug: 'data-display', label: 'Таблицы и Списки', icon: Table2, count: 1, color: 'text-indigo-600', bg: 'bg-indigo-50' },
   { slug: 'uploads', label: 'Медиа и Загрузки', icon: UploadCloud, count: 14, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]
 },
 {
  title: "Аналитика и CRM",
  description: "Специфичные модули управления",
  items: [
   { slug: 'charts', label: 'Графики и визуализация', icon: BarChart3, count: 9, color: 'text-emerald-600', bg: 'bg-emerald-50' },
   { slug: 'pricing', label: 'Оплата', icon: Calculator, count: 2, color: 'text-amber-600', bg: 'bg-amber-50' },
   { slug: 'dates', label: 'Даты и время', icon: CalendarDays, count: 11, color: 'text-rose-600', bg: 'bg-rose-50' },
   { slug: 'qr', label: 'QR Коды', icon: QrCode, count: 7, color: 'text-slate-600', bg: 'bg-slate-50' },
   { slug: 'merch', label: 'Производство', icon: Briefcase, count: 2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]
 },
 {
  title: "Оформление",
  description: "Базовая стилистика",
  items: [
   { slug: 'avatars', label: 'Пользователи', icon: UserCircle, count: 4, color: 'text-teal-600', bg: 'bg-teal-50' },
   { slug: 'navigation', label: 'Навигация', icon: Compass, count: 7, color: 'text-cyan-600', bg: 'bg-cyan-50' },
   { slug: 'errors', label: 'Системные уведомления', icon: AlertTriangle, count: 15, color: 'text-red-500', bg: 'bg-red-50' },
  ]
 },
 {
  title: "Декоративные",
  description: "Эффекты и сетки",
  items: [
   { slug: 'backgrounds', label: 'Фоны', icon: Image, count: 2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
   { slug: 'effects', label: 'Эффекты', icon: Wand2, count: 6, color: 'text-pink-500', bg: 'bg-pink-50' },
  ]
 },
];

export default function UIKitHomePage() {
 const totalComponents = categoryGroups.reduce((acc, group) => {
  return acc + group.items.reduce((sum, item) => sum + item.count, 0);
 }, 0);

 return (
  <div className="mx-auto max-w-7xl px-6 py-12 animate-in fade-in duration-700">
   <div className="mb-16 relative">
    <div className="absolute -top-6 -left-6 size-24 bg-primary-base/10 blur-3xl rounded-full" />
    <h1 className="text-4xl font-black font-heading text-gray-950 flex items-center gap-3">
     UI Kit
     <span className="text-xs font-bold bg-primary-base text-white px-2 py-0.5 rounded-full  animate-pulse">v2.1</span>
    </h1>
    <p className="mt-4 text-lg text-gray-500 font-medium max-w-2xl">
     Каталог унифицированных компонентов MerchCRM с интеграцией базовых модулей, аналитики и бизнес-процессов.
    </p>
    <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-gray-400 ">
      <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
       <div className="size-2 rounded-full bg-blue-500" /> ~{totalComponents} элементов
      </span>
    </div>
   </div>

   <div className="flex flex-col gap-3">
    {categoryGroups.map((group) => (
     <div key={group.title} className="relative">
      <div className="mb-6 flex items-baseline gap-3">
        <h2 className="text-2xl font-bold font-heading text-gray-900">{group.title}</h2>
        <div className="h-px bg-gray-100 flex-1 hidden sm:block" />
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
       {group.items.map((c) => {
        const Icon = c.icon;
        return (
         <Link 
          key={c.slug} 
          href={`/ui-kit/${c.slug}`} 
          className="group relative flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-primary-base/20 overflow-hidden"
         >
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50 group-hover:from-white group-hover:to-primary-base/5 transition-all duration-500" />
          
          <div className="relative flex items-center justify-between z-10">
           <div className={cn('flex size-12 items-center justify-center rounded-xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md', c.bg, c.color)}>
            <Icon className="size-6" />
           </div>
           <span className="rounded-full bg-gray-50 border border-gray-100 px-3 py-1 text-xs font-bold text-gray-500 group-hover:bg-primary-base group-hover:text-white transition-colors duration-300">
            {c.count} компонентов
           </span>
          </div>
          
          <div className="relative z-10">
           <h3 className="text-base font-bold text-gray-950 font-heading group-hover:text-primary-base transition-colors duration-300">{c.label}</h3>
           <p className="text-xs text-gray-400 mt-1 font-medium italic opacity-0 group-hover:opacity-100 transition-opacity">Посмотреть компоненты →</p>
          </div>
          
          {/* Subtle accent line */}
          <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary-base transition-all duration-500 group-hover:w-full" />
         </Link>
        );
       })}
      </div>
     </div>
    ))}
   </div>
  </div>
 );
}
