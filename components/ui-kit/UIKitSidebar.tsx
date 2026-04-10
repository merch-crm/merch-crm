"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/library/custom/utils/cn";
import {
  Menu,
  X,
  Search,
  RectangleHorizontal,
  CreditCard,
  TextCursorInput,
  Compass,
  Table2,
  MessageCircle,
  Type,
  Image,
  AlertTriangle,
  Home,
  BarChart3,
  Palette,
  CalendarDays,
  Box,
  Database,
  SlidersHorizontal,
  Briefcase,
  Wand2,
  FoldVertical,
  Activity,
  Calculator,
  QrCode,
  UserCircle,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";

interface Category {
  name: string;
  href: string;
  icon: LucideIcon;
  count: number | null;
}

interface SidebarSection {
  title: string;
  items: Category[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: "Основы",
    items: [
      { name: "Обзор", href: "/ui-kit", icon: Home, count: null },
      { name: "Цвета и Палетки", href: "/ui-kit/colors", icon: Palette, count: 5 },
      { name: "Типографика", href: "/ui-kit/typography", icon: Type, count: 17 },
      { name: "Кнопки", href: "/ui-kit/buttons", icon: RectangleHorizontal, count: 7 },
      { name: "Статусы и Бейджи", href: "/ui-kit/statuses", icon: Activity, count: 6 },
    ]
  },
  {
    title: "Базовые UI",
    items: [
      { name: "Инпуты и Поиск", href: "/ui-kit/inputs", icon: TextCursorInput, count: 11 },
      { name: "Карточки", href: "/ui-kit/cards", icon: CreditCard, count: 2 },
      { name: "Контролы", href: "/ui-kit/controls", icon: SlidersHorizontal, count: 4 },
      { name: "Аккордеоны", href: "/ui-kit/accordions", icon: FoldVertical, count: 3 },
      { name: "Тултипы", href: "/ui-kit/tooltips", icon: MessageCircle, count: 3 },
    ]
  },
  {
    title: "Данные и Файлы",
    items: [
      { name: "Таблицы и Списки", href: "/ui-kit/data-display", icon: Table2, count: 1 },
      { name: "Медиа и Загрузки", href: "/ui-kit/uploads", icon: UploadCloud, count: 14 },
    ]
  },
  {
    title: "Аналитика и CRM",
    items: [
      { name: "Управление данными", href: "/ui-kit/data-management", icon: Database, count: 4 },
      { name: "Графики и диаграммы", href: "/ui-kit/charts", icon: BarChart3, count: 9 },
      { name: "Тарифы и Монетизация", href: "/ui-kit/pricing", icon: Calculator, count: 2 },
      { name: "Даты и время", href: "/ui-kit/dates", icon: CalendarDays, count: 13 },
      { name: "QR Коды", href: "/ui-kit/qr", icon: QrCode, count: 7 },
      { name: "Производство", href: "/ui-kit/merch", icon: Briefcase, count: 2 },
    ]
  },
  {
    title: "Оформление",
    items: [
      { name: "Аватары", href: "/ui-kit/avatars", icon: UserCircle, count: 3 },
      { name: "Навигация", href: "/ui-kit/navigation", icon: Compass, count: 7 },
      { name: "Системные уведомления", href: "/ui-kit/errors", icon: AlertTriangle, count: 15 },
    ]
  },
  {
    title: "Декоративные",
    items: [
      { name: "Фоны", href: "/ui-kit/backgrounds", icon: Image, count: 2 },
      { name: "Эффекты", href: "/ui-kit/effects", icon: Wand2, count: 6 },
    ]
  },
];

export function UIKitSidebar() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filter sections and items based on search
  const filteredSections = sidebarSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  const totalCategories = sidebarSections.reduce((acc, s) => acc + s.items.length, 0);
  const totalComponents = sidebarSections.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + (i.count || 0), 0), 0);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#5d00ff] text-white shadow-2xl lg:hidden ring-4 ring-white active:scale-90 transition-all"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md lg:hidden transition-all duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-slate-100 bg-[#f8f9fa]/80 backdrop-blur-2xl transition-all duration-500 z-50",
          "fixed inset-y-0 left-0 lg:relative",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="px-6 py-8">
          <Link href="/ui-kit" className="flex items-center gap-3 group">
             <div className="size-10 rounded-2xl bg-[#5d00ff] text-white flex items-center justify-center shadow-lg shadow-[#5d00ff]/20 group-hover:scale-110 transition-all duration-500 rotate-3 group-hover:-rotate-3">
                <Box size={24} fill="currentColor" className="opacity-80" />
             </div>
             <div>
                <h1 className="text-xl font-black leading-none text-slate-900">UI Kit</h1>
                <p className="mt-1 text-[11px] font-black tracking-wider text-slate-400">
                  Lumin-Apple Design
                </p>
             </div>
          </Link>
        </div>

        <div className="px-4 mb-4">
          <form autoComplete="off" action="javascript:void(0);" className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#5d00ff] transition-colors" />
            <input
              type="text"
              name="ui-kit-search-field-non-login"
              id="ui-kit-search-field-non-login"
              autoComplete="one-time-code"
              spellCheck={false}
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-100 bg-white pl-10 pr-4 text-sm font-bold outline-none transition-all focus:border-[#5d00ff]/20 focus:ring-4 focus:ring-[#5d00ff]/5 shadow-sm"
            />
          </form>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-8 scrollbar-none">
          <div className="space-y-3">
            {filteredSections.map((section) => (
              <div key={section.title}>
                <h2 className="px-3 mb-3 text-[11px] font-black tracking-wider text-slate-400">
                  {section.title}
                </h2>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive =
                      item.href === "/ui-kit"
                         ? pathname === "/ui-kit"
                         : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link href={item.href} onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition-all group relative overflow-hidden",
                            isActive
                               ? "bg-[#5d00ff] text-white shadow-lg shadow-[#5d00ff]/20 translate-x-1"
                               : "text-slate-600 hover:bg-white hover:text-[#5d00ff] hover:shadow-sm"
                          )}
                        >
                          <Icon className={cn( "h-4 w-4 shrink-0 transition-transform duration-500", isActive ? "scale-110" : "group-hover:scale-110" )} />
                          <span className="truncate">{item.name}</span>
                          {item.count !== null && (
                            <span
                              className={cn(
                                 "ml-auto text-[11px] font-black tabular-nums",
                                 isActive ? "opacity-60" : "text-slate-300"
                              )}
                            >
                              {item.count}
                            </span>
                          )}
                           {isActive && (
                             <div className="absolute right-0 top-0 w-1 h-full bg-white/20" />
                           )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="p-6 border-t border-slate-100 bg-white/40">
          <div className="flex items-center justify-between text-[11px] font-black text-slate-400">
            <span>{totalCategories} Категорий</span>
            <div className="size-1 rounded-full bg-slate-200" />
            <span>~{totalComponents} Комп.</span>
          </div>
        </div>
      </aside>
    </>
  );
}
