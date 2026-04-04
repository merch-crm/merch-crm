import Link from 'next/link';
import {
  RectangleHorizontal, CreditCard, TextCursorInput, ListFilter, Compass, Table2, UserCircle,
  MessageCircle, Type, Image, LayoutGrid, FileText,
  AlertTriangle, Wand2, Briefcase, BarChart3, Puzzle, ToggleLeft, FoldVertical, Database,
  Calculator, MessageSquareText, Activity,
  CalendarDays, UploadCloud, QrCode, Palette
} from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

// Categories grouped into logical sections
const categoryGroups = [
  {
    title: "Основы",
    description: "Фундаментальные элементы и стиль",
    items: [
      { slug: 'colors', label: 'Цвета', icon: Palette, count: 3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { slug: 'typography', label: 'Типографика', icon: Type, count: 11, color: 'text-slate-600', bg: 'bg-slate-50' },
    ]
  },
  {
    title: "Базовые UI",
    description: "Строительные блоки интерфейса",
    items: [
      { slug: 'buttons', label: 'Кнопки', icon: RectangleHorizontal, count: 1, color: 'text-blue-600', bg: 'bg-blue-50' },
      { slug: 'cards', label: 'Карточки', icon: CreditCard, count: 3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { slug: 'inputs', label: 'Поля ввода', icon: TextCursorInput, count: 10, color: 'text-orange-600', bg: 'bg-orange-50' },
      { slug: 'selects', label: 'Выпадающие списки', icon: ListFilter, count: 4, color: 'text-pink-600', bg: 'bg-pink-50' },
      { slug: 'controls', label: 'Переключатели', icon: ToggleLeft, count: 14, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { slug: 'accordions', label: 'Раскрытие', icon: FoldVertical, count: 3, color: 'text-violet-600', bg: 'bg-violet-50' },
      { slug: 'tooltips', label: 'Подсказки', icon: MessageCircle, count: 4, color: 'text-rose-600', bg: 'bg-rose-50' },
    ]
  },
  {
    title: "Данные и аналитика",
    description: "Инструменты для таблиц и графиков",
    items: [
      { slug: 'data-management', label: 'Управление данными', icon: Database, count: 4, color: 'text-teal-600', bg: 'bg-teal-50' },
      { slug: 'tables', label: 'Таблицы', icon: Table2, count: 1, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { slug: 'charts', label: 'Графики и диаграммы', icon: BarChart3, count: 8, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { slug: 'pricing', label: 'Ценообразование', icon: Calculator, count: 2, color: 'text-amber-600', bg: 'bg-amber-50' },
    ]
  },
  {
    title: "CRM-компоненты",
    description: "Специфичные модули",
    items: [
      { slug: 'communications', label: 'Коммуникации', icon: MessageSquareText, count: 10, color: 'text-sky-600', bg: 'bg-sky-50' },
      { slug: 'statuses', label: 'Бейджи и статусы', icon: Activity, count: 5, color: 'text-indigo-500', bg: 'bg-indigo-50' },
      { slug: 'dates', label: 'Даты и время', icon: CalendarDays, count: 16, color: 'text-rose-600', bg: 'bg-rose-50' },
      { slug: 'uploads', label: 'Медиа и Загрузки', icon: UploadCloud, count: 12, color: 'text-purple-600', bg: 'bg-purple-50' },
      { slug: 'qr', label: 'QR Коды', icon: QrCode, count: 7, color: 'text-slate-600', bg: 'bg-slate-50' },
      { slug: 'business', label: 'Бизнес-разное', icon: Briefcase, count: 1, color: 'text-primary-base', bg: 'bg-primary-base/5' },
      { slug: 'custom', label: 'Custom CRM', icon: Puzzle, count: 1, color: 'text-primary-base', bg: 'bg-primary-base/10' },
    ]
  },
  {
    title: "Оформление",
    description: "Базовая стилистика",
    items: [
      { slug: 'avatars', label: 'Аватары', icon: UserCircle, count: 1, color: 'text-teal-600', bg: 'bg-teal-50' },
      { slug: 'navigation', label: 'Навигация', icon: Compass, count: 9, color: 'text-cyan-600', bg: 'bg-cyan-50' },
      { slug: 'forms', label: 'Формы', icon: FileText, count: 7, color: 'text-violet-500', bg: 'bg-violet-50' },
      { slug: 'errors', label: 'Системные уведомления', icon: AlertTriangle, count: 14, color: 'text-red-500', bg: 'bg-red-50' },
    ]
  },
  {
    title: "Декоративные",
    description: "Эффекты и сетки",
    items: [
      { slug: 'layout-grids', label: 'Сетки и макеты', icon: LayoutGrid, count: 14, color: 'text-orange-500', bg: 'bg-orange-50' },
      { slug: 'backgrounds', label: 'Фоны', icon: Image, count: 2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
      { slug: 'effects', label: 'Эффекты', icon: Wand2, count: 14, color: 'text-pink-500', bg: 'bg-pink-50' },
      { slug: 'documents', label: 'Документы', icon: FileText, count: 2, color: 'text-rose-500', bg: 'bg-rose-50' },
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
        <h1 className="text-4xl font-black font-heading text-gray-950  flex items-center gap-3">
          UI Kit
          <span className="text-xs font-bold bg-primary-base text-white px-2 py-0.5 rounded-full   animate-pulse">v2.1</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 font-medium max-w-2xl">
          Каталог унифицированных компонентов MerchCRM с интеграцией базовых модулей, аналитики и бизнес-процессов.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-gray-400  ">
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
