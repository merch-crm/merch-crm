"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ComponentShowcase } from "./components/ComponentShowcase";

// Импорт всех компонентов
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Progress, ProgressWithLabel } from "@/components/ui/progress";
import { ModernStatCard } from "@/components/ui/stat-card";

import {
    ShoppingCart, Settings,
    ChevronDown, Plus, Trash2, Edit, MoreHorizontal, Search,
    AlertCircle, Home, RefreshCcw, WifiOff, ServerCrash, XOctagon
} from "lucide-react";

// Определение секций
const sections = [
    { id: "cards", label: "Карточки", count: 6 },
    { id: "buttons", label: "Кнопки", count: 10 },
    { id: "inputs", label: "Поля ввода", count: 4 },
    { id: "badges", label: "Бейджи", count: 9 },
    { id: "switches", label: "Переключатели", count: 2 },
    { id: "tabs", label: "Вкладки", count: 3 },
    { id: "tables", label: "Таблицы", count: 4 },
    { id: "dialogs", label: "Модальные окна", count: 4 },
    { id: "system-modals", label: "Системные уведомления", count: 5 },
    { id: "tooltips", label: "Тултипы", count: 5 },
    { id: "dropdowns", label: "Дропдауны", count: 3 },
    { id: "popovers", label: "Поповеры", count: 2 },
    { id: "sliders", label: "Слайдеры", count: 6 },
    { id: "accordions", label: "Аккордеоны", count: 6 },
    { id: "radio", label: "Радио-кнопки", count: 5 },
    { id: "avatars", label: "Аватары", count: 4 },
    { id: "progress", label: "Прогресс", count: 5 },
    { id: "skeletons", label: "Скелетоны", count: 6 },
    { id: "stat-cards", label: "Статистика", count: 3 },
    { id: "scroll", label: "Скролл", count: 4 },
];

export default function UIKitPage() {
    const [activeSection, setActiveSection] = useState("cards");
    const [searchQuery, setSearchQuery] = useState("");

    const totalComponents = sections.reduce((acc, s) => acc + s.count, 0);

    const filteredSections = sections.filter(s =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: "-100px 0px -80% 0px" }
        );

        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
        window.history.pushState(null, '', `#${id}`);
    };

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-[1480px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">UI Kit</h1>
                            <p className="text-sm text-slate-500" suppressHydrationWarning>
                                MerchCRM • {totalComponents} компонентов • {sections.length} категорий
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3">
                                <a href="/ui-kit/headers" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">
                                    Варианты Хэдеров (10)
                                </a>
                                <a href="/ui-kit/footers" className="text-xs font-bold text-sky-500 hover:text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg transition-all">
                                    Варианты Футеров (10)
                                </a>
                                <a href="/ui-kit/category-variants" className="text-xs font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-lg transition-all">
                                    Карточки категорий (10 вариантов)
                                </a>
                                <a href="/ui-kit/dialog-variants" className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition-all">
                                    Модальные окна
                                </a>
                                <a href="/ui-kit/error-modals" className="text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg transition-all">
                                    Окна ошибок (5 вариантов)
                                </a>
                                <a href="/ui-kit/dropdowns" className="text-xs font-bold text-sky-500 hover:text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg transition-all">
                                    Дропдауны Kit (13 вариантов)
                                </a>
                                <a href="/ui-kit/pagination-variants" className="text-xs font-bold text-emerald-500 hover:text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg transition-all">
                                    Пагинация (30 вариантов)
                                </a>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Поиск компонентов..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-[1480px] mx-auto flex">
                {/* Sidebar */}
                <aside className="w-64 shrink-0 sticky top-[73px] h-[calc(100vh-73px)] border-r border-slate-200 bg-white overflow-y-auto hidden md:block">
                    <nav className="p-4 space-y-1">
                        {filteredSections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                onClick={(e) => scrollToSection(e, section.id)}
                                className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    activeSection === section.id
                                        ? "bg-primary/10 text-primary"
                                        : "text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                <span>{section.label}</span>
                                <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    activeSection === section.id ? "bg-primary/20" : "bg-slate-100"
                                )}>
                                    {section.count}
                                </span>
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 p-6 space-y-12">

                    {/* ==================== CARDS ==================== */}
                    <section id="cards" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4">
                            Карточки
                        </h2>

                        {/* Card Default */}
                        <ComponentShowcase
                            title="Card — Default"
                            description="Базовая карточка с использованием класса crm-card"
                            componentName="Card"
                            importPath="@/components/ui/card"
                            classes={[
                                {
                                    name: "crm-card",
                                    description: "Базовый класс карточки",
                                    properties: [
                                        { property: "padding", value: "16px (p-4) / var(--radius-padding)" },
                                        { property: "border-radius", value: "var(--radius-outer)" },
                                        { property: "background", value: "white" },
                                        { property: "border", value: "1px solid #e2e8f0" },
                                    ],
                                },
                            ]}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Заголовок карточки</CardTitle>
                                    <CardDescription>Описание карточки с дополнительной информацией</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600">Контент карточки размещается здесь.</p>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" size="sm">Отмена</Button>
                                    <Button size="sm" className="ml-2">Сохранить</Button>
                                </CardFooter>
                            </Card>
                        </ComponentShowcase>

                        {/* Card Body (для вложенных блоков) */}
                        <ComponentShowcase
                            title="Card Body — Вложенный контейнер"
                            description="Используется внутри crm-card для группировки без дополнительных отступов"
                            componentName="CardContent"
                            importPath="@/components/ui/card"
                            classes={[
                                {
                                    name: "crm-card-body",
                                    description: "Вложенный контейнер без padding",
                                    properties: [
                                        { property: "padding", value: "0" },
                                        { property: "background", value: "transparent" },
                                        { property: "border", value: "none" },
                                    ],
                                },
                            ]}
                        >
                            <div className="crm-card">
                                <h3 className="font-bold mb-3">Внешняя карточка</h3>
                                <div className="crm-card-body bg-slate-50 rounded-lg p-3">
                                    <p className="text-sm text-slate-600">Вложенный блок без умножения отступов</p>
                                </div>
                            </div>
                        </ComponentShowcase>

                        {/* Card Elevated */}
                        <ComponentShowcase
                            title="Card — Elevated"
                            description="Карточка с тенью для выделения важного контента"
                            componentName="Card"
                            importPath="@/components/ui/card"
                            classes={[
                                {
                                    name: "crm-card--elevated",
                                    description: "Модификатор с тенью",
                                    properties: [
                                        { property: "box-shadow", value: "var(--crm-shadow-lg)" },
                                        { property: "border", value: "none" },
                                    ],
                                },
                            ]}
                        >
                            <div className="crm-card crm-card--elevated w-full">
                                <h3 className="font-bold">Выделенная карточка</h3>
                                <p className="text-sm text-slate-500 mt-2">С тенью для привлечения внимания</p>
                            </div>
                        </ComponentShowcase>

                        {/* Card Ghost */}
                        <ComponentShowcase
                            title="Card — Ghost"
                            description="Прозрачная карточка с фоновым цветом"
                            componentName="Card"
                            importPath="@/components/ui/card"
                            classes={[
                                {
                                    name: "crm-card--ghost",
                                    description: "Модификатор без рамки",
                                    properties: [
                                        { property: "background", value: "var(--muted)" },
                                        { property: "border", value: "none" },
                                    ],
                                },
                            ]}
                        >
                            <div className="crm-card crm-card--ghost">
                                <h3 className="font-bold">Ghost карточка</h3>
                                <p className="text-sm text-slate-500 mt-2">Без рамки, с лёгким фоном</p>
                            </div>
                        </ComponentShowcase>

                        {/* Card Compact */}
                        <ComponentShowcase
                            title="Card — Compact"
                            description="Компактная карточка с уменьшенными отступами"
                            componentName="Card"
                            importPath="@/components/ui/card"
                            classes={[
                                {
                                    name: "crm-card--compact",
                                    description: "Уменьшенные отступы",
                                    properties: [
                                        { property: "padding", value: "16px" },
                                    ],
                                },
                            ]}
                        >
                            <div className="crm-card crm-card--compact">
                                <h3 className="font-bold text-sm">Компактная карточка</h3>
                                <p className="text-xs text-slate-500 mt-1">Меньше отступов</p>
                            </div>
                        </ComponentShowcase>

                        {/* Card Spacious */}
                        <ComponentShowcase
                            title="Card — Spacious"
                            description="Просторная карточка с увеличенными отступами"
                            componentName="Card"
                            importPath="@/components/ui/card"
                            classes={[
                                {
                                    name: "crm-card--spacious",
                                    description: "Увеличенные отступы",
                                    properties: [
                                        { property: "padding", value: "var(--padding-xl)" },
                                    ],
                                },
                            ]}
                        >
                            <div className="crm-card crm-card--spacious">
                                <h3 className="font-bold text-lg">Просторная карточка</h3>
                                <p className="text-sm text-slate-500 mt-2">Больше отступов для важного контента</p>
                            </div>
                        </ComponentShowcase>
                    </section>

                    {/* ==================== BUTTONS ==================== */}
                    <section id="buttons" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4">
                            Кнопки
                        </h2>

                        {/* Button Default */}
                        <ComponentShowcase
                            title="Button — Default (Primary)"
                            description="Основная кнопка для главных действий"
                            componentName="Button"
                            importPath="@/components/ui/button"
                            classes={[
                                {
                                    name: 'Button variant="default"',
                                    description: "Primary кнопка",
                                    properties: [
                                        { property: "background", value: "var(--primary)" },
                                        { property: "color", value: "white" },
                                        { property: "height", value: "44px (h-11)" },
                                        { property: "padding", value: "0 24px (px-6)" },
                                        { property: "border-radius", value: "var(--radius)" },
                                        { property: "font-weight", value: "700" },
                                    ],
                                },
                            ]}
                        >
                            <div className="flex flex-wrap gap-3">
                                <Button>Создать заказ</Button>
                                <Button disabled>Disabled</Button>
                            </div>
                        </ComponentShowcase>

                        {/* Button Variants */}
                        <ComponentShowcase
                            title="Button — All Variants"
                            description="Все варианты кнопок"
                            componentName="Button"
                            importPath="@/components/ui/button"
                            classes={[
                                { name: 'variant="default"', description: "Primary", properties: [] },
                                { name: 'variant="destructive"', description: "Красная", properties: [{ property: "background", value: "#ff463c" }] },
                                { name: 'variant="btn-dark"', description: "Тёмная", properties: [{ property: "background", value: "#1f1f1f" }] },
                                { name: 'variant="btn-black"', description: "Чёрная", properties: [{ property: "background", value: "#0f172a" }] },
                                { name: 'variant="outline"', description: "С рамкой", properties: [{ property: "border", value: "2px solid" }] },
                                { name: 'variant="secondary"', description: "Вторичная", properties: [] },
                                { name: 'variant="ghost"', description: "Прозрачная", properties: [] },
                                { name: 'variant="link"', description: "Ссылка", properties: [] },
                                { name: 'variant="action"', description: "Action", properties: [{ property: "background", value: "#f8fafc" }] },
                                { name: 'variant="action-destructive"', description: "Action Red", properties: [] },
                            ]}
                        >
                            <div className="flex flex-wrap gap-3">
                                <Button variant="default">Primary</Button>
                                <Button variant="destructive">Destructive</Button>
                                <Button variant="btn-dark">Dark</Button>
                                <Button variant="btn-black">Black</Button>
                                <Button variant="outline">Outline</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="ghost">Ghost</Button>
                                <Button variant="link">Link</Button>
                                <Button variant="action">Action</Button>
                                <Button variant="action-destructive">Action Red</Button>
                            </div>
                        </ComponentShowcase>

                        {/* Button Sizes */}
                        <ComponentShowcase
                            title="Button — Sizes"
                            description="Размеры кнопок"
                            componentName="Button"
                            importPath="@/components/ui/button"
                            classes={[]}
                        >
                            <div className="flex flex-wrap items-center gap-3">
                                <Button size="xs"><Plus className="w-4 h-4" /></Button>
                                <Button size="sm">Small</Button>
                                <Button size="default">Default</Button>
                                <Button size="lg">Large</Button>
                                <Button size="icon"><Settings className="w-4 h-4" /></Button>
                            </div>
                        </ComponentShowcase>

                        <ComponentShowcase
                            title="Button — With Icons"
                            description="Кнопки с иконками"
                            componentName="Button"
                            importPath="@/components/ui/button"
                            classes={[]}
                        >
                            <div className="flex flex-wrap items-center gap-3">
                                <Button><Plus className="w-4 h-4 mr-2" />Добавить</Button>
                                <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" />Удалить</Button>
                                <Button variant="outline"><Edit className="w-4 h-4 mr-2" />Редактировать</Button>
                                <Button variant="action" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                            </div>
                        </ComponentShowcase>
                    </section>

                    {/* ==================== INPUTS ==================== */}
                    <section id="inputs" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4">
                            Поля ввода
                        </h2>

                        <ComponentShowcase
                            title="Input — Default"
                            description="Стандартное поле ввода"
                            componentName="Input"
                            importPath="@/components/ui/input"
                            classes={[
                                {
                                    name: "Input",
                                    description: "Базовое поле",
                                    properties: [
                                        { property: "height", value: "48px (h-12)" },
                                        { property: "padding", value: "0 16px" },
                                        { property: "border-radius", value: "var(--radius) 12px" },
                                        { property: "font-weight", value: "500 (medium)" },
                                    ],
                                },
                            ]}
                        >
                            <div className="space-y-3 max-w-md">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" placeholder="email@example.com" className="mt-2" />
                                </div>
                                <div>
                                    <Label htmlFor="password">Пароль</Label>
                                    <Input id="password" type="password" placeholder="••••••••" className="mt-2" />
                                </div>
                            </div>
                        </ComponentShowcase>

                        <ComponentShowcase
                            title="Textarea"
                            description="Многострочное поле ввода"
                            componentName="Textarea"
                            importPath="@/components/ui/textarea"
                            classes={[]}
                        >
                            <div className="max-w-md">
                                <Label htmlFor="comment">Комментарий</Label>
                                <Textarea id="comment" placeholder="Введите комментарий..." className="mt-2" />
                            </div>
                        </ComponentShowcase>

                        <ComponentShowcase
                            title="Input States"
                            description="Состояния полей"
                            componentName="Input"
                            importPath="@/components/ui/input"
                            classes={[]}
                        >
                            <div className="space-y-3 max-w-md">
                                <Input placeholder="Default" />
                                <Input placeholder="Disabled" disabled />
                                <Input placeholder="With error" className="border-rose-500 focus-visible:ring-rose-500" />
                            </div>
                        </ComponentShowcase>
                    </section>

                    {/* ==================== BADGES ==================== */}
                    <section id="badges" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4">
                            Бейджи
                        </h2>

                        <ComponentShowcase
                            title="Badge — All Variants"
                            description="Все варианты бейджей для статусов"
                            componentName="Badge"
                            importPath="@/components/ui/badge"
                            classes={[]}
                        >
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="default">Default</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                                <Badge variant="destructive">Destructive</Badge>
                                <Badge variant="outline">Outline</Badge>
                                <Badge variant="success">Завершено</Badge>
                                <Badge variant="warning">В печати</Badge>
                                <Badge variant="info">Подготовка</Badge>
                                <Badge variant="purple">Контроль</Badge>
                                <Badge variant="gray">Упаковка</Badge>
                            </div>
                        </ComponentShowcase>
                    </section>

                    {/* ==================== SWITCHES ==================== */}
                    <section id="switches" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4">
                            Переключатели
                        </h2>

                        <ComponentShowcase
                            title="Switch — Variants"
                            description="Переключатели с разными цветовыми схемами"
                            componentName="Switch"
                            importPath="@/components/ui/switch"
                            classes={[]}
                        >
                            <div className="space-y-3 flex flex-col items-start gap-3">
                                <div className="flex items-center gap-3">
                                    <Switch variant="primary" defaultChecked />
                                    <span className="text-sm font-medium">Primary (checked)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Switch variant="success" defaultChecked />
                                    <span className="text-sm font-medium">Success (checked)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Switch variant="primary" />
                                    <span className="text-sm font-medium">Unchecked</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Switch variant="primary" disabled />
                                    <span className="text-sm text-slate-400">Disabled</span>
                                </div>
                            </div>
                        </ComponentShowcase>
                    </section>

                    {/* ==================== TABS ==================== */}
                    <section id="tabs" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4">
                            Вкладки
                        </h2>

                        <ComponentShowcase
                            title="Tabs"
                            description="Вкладки для переключения экранов"
                            componentName="Tabs"
                            importPath="@/components/ui/tabs"
                            classes={[]}
                        >
                            <Tabs defaultValue="orders" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="orders">Заказы</TabsTrigger>
                                    <TabsTrigger value="clients">Клиенты</TabsTrigger>
                                    <TabsTrigger value="products">Товары</TabsTrigger>
                                </TabsList>
                                <TabsContent value="orders" className="mt-4">
                                    <div className="crm-card bg-white p-4 text-sm text-slate-500 rounded-xl border border-slate-200">Контент вкладки &quot;Заказы&quot;</div>
                                </TabsContent>
                                <TabsContent value="clients" className="mt-4">
                                    <div className="crm-card bg-white p-4 text-sm text-slate-500 rounded-xl border border-slate-200">Контент вкладки &quot;Клиенты&quot;</div>
                                </TabsContent>
                                <TabsContent value="products" className="mt-4">
                                    <div className="crm-card bg-white p-4 text-sm text-slate-500 rounded-xl border border-slate-200">Контент вкладки &quot;Товары&quot;</div>
                                </TabsContent>
                            </Tabs>
                        </ComponentShowcase>
                    </section>

                    {/* ==================== DIALOGS ==================== */}
                    <section id="dialogs" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4">
                            Модальные окна
                        </h2>
                        <ComponentShowcase
                            title="Dialog"
                            description="Стандартное модальное окно"
                            componentName="Dialog"
                            importPath="@/components/ui/dialog"
                            classes={[]}
                        >
                            <div className="flex gap-3">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>Открыть диалог</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Заголовок модального окна</DialogTitle>
                                            <DialogDescription>Тут можно добавить описание модального окна подробнее.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-3 py-4">
                                            Контент диалога
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline">Отмена</Button>
                                            <Button>Создать</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </ComponentShowcase>
                    </section>

                    <section id="progress" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4"> Прогресс </h2>
                        <ComponentShowcase title="Progress" componentName="Progress" importPath="@/components/ui/progress" classes={[]} >
                            <div className="space-y-6 max-w-md w-full">
                                <Progress value={65} />
                                <Progress value={80} variant="success" />
                                <ProgressWithLabel label="Загрузка файла" value={72} description="Осталось 28%" />
                            </div>
                        </ComponentShowcase>
                    </section>

                    <section id="dropdowns" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4"> Дропдауны </h2>
                        <ComponentShowcase title="Dropdown Menu" componentName="DropdownMenu" importPath="@/components/ui/dropdown-menu" classes={[]}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Действия <ChevronDown className="w-4 h-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Edit className="w-4 h-4 mr-2" /> Редактировать
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </ComponentShowcase>
                    </section>

                    <section id="stat-cards" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4"> Статистика </h2>
                        <ComponentShowcase title="Modern Stat Card" componentName="ModernStatCard" importPath="@/components/ui/stat-card" classes={[]}>
                            <ModernStatCard
                                icon={ShoppingCart}
                                value={156}
                                label="Заказы"
                                badge={{ text: "+12%", variant: "success" }}
                                colorScheme="primary"
                            />
                        </ComponentShowcase>
                    </section>

                    <section id="tables" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4"> Таблицы </h2>
                        <ComponentShowcase title="Tables" componentName="Table" importPath="@/components/ui/table" classes={[]}>
                            <div className="p-4 text-slate-500 border border-dashed border-slate-300 rounded-lg bg-slate-50">Компонент таблицы находится в разработке.</div>
                        </ComponentShowcase>
                    </section>

                    <section id="system-modals" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4"> Системные уведомления </h2>
                        {/* Variant 1: Current Refined (Soft Light + Glow) */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 self-start">
                                <span className="font-bold text-slate-700">1. Current Refined (Soft Glow)</span>
                            </div>

                            <div className="relative overflow-hidden rounded-[42px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 p-10 flex flex-col items-center text-center max-w-[480px] w-full bg-white transition-all hover:shadow-3xl">
                                {/* Background Glow */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-15 bg-rose-500" />

                                {/* Error Icon */}
                                <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-rose-500/30 mb-8 transition-colors bg-rose-500 relative z-10">
                                    <AlertCircle className="w-12 h-12 stroke-[2]" />
                                </div>

                                <div className="flex-1 w-full flex flex-col items-center relative z-10">
                                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                                        Произошла ошибка
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-[320px]">
                                        Приложение столкнулось с неожиданной проблемой на стороне клиента.
                                    </p>

                                    <div className="w-full bg-slate-50 rounded-2xl border border-slate-100/80 p-5 mb-8 text-left shadow-inner">
                                        <div className="text-[13px] font-mono text-rose-500/90 break-all leading-relaxed font-semibold">
                                            Error: Failed to fetch data from the server. Connection timed out after 3000ms.
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex gap-3 relative z-10">
                                    <button type="button" className="flex-[0.7] flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 text-slate-600 hover:text-slate-900 font-bold rounded-[20px] hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm text-sm">
                                        <Home className="w-4 h-4" />
                                        На главную
                                    </button>
                                    <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-slate-900 text-white font-bold rounded-[20px] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 text-sm">
                                        <RefreshCcw className="w-4 h-4" />
                                        Попробовать снова
                                    </button>
                                </div>

                                <div className="w-[120px] h-px bg-slate-100 my-7 relative z-10" />

                                <div className="text-xs font-bold text-slate-300 tracking-widest  relative z-10">
                                    Merch CRM Recovery Mode
                                </div>
                            </div>
                        </div>

                        {/* Variant 2: 404 Not Found (Amber/Orange) */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 self-start">
                                <span className="font-bold text-slate-700">2. 404 Not Found (Amber)</span>
                            </div>

                            <div className="relative overflow-hidden rounded-[42px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 p-10 flex flex-col items-center text-center max-w-[480px] w-full bg-white transition-all hover:shadow-3xl">
                                {/* Background Glow */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-15 bg-amber-500" />

                                {/* Error Icon */}
                                <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-amber-500/30 mb-8 transition-colors bg-amber-500 relative z-10">
                                    <AlertCircle className="w-12 h-12 stroke-[2]" />
                                </div>

                                <div className="flex-1 w-full flex flex-col items-center relative z-10">
                                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                                        Страница не найдена
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-[320px]">
                                        Запрашиваемый ресурс был удален, перемещен или никогда не существовал.
                                    </p>

                                    <div className="w-full bg-slate-50 rounded-2xl border border-slate-100/80 p-5 mb-8 text-left shadow-inner">
                                        <div className="text-[13px] font-mono text-amber-600/90 break-all leading-relaxed font-semibold">
                                            Error 404: The route /dashboard/inventory/old-item could not be resolved.
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex gap-3 relative z-10">
                                    <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-slate-900 text-white font-bold rounded-[20px] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 text-sm">
                                        <Home className="w-4 h-4" />
                                        На главную
                                    </button>
                                    <button type="button" className="flex-[0.7] flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 text-slate-600 hover:text-slate-900 font-bold rounded-[20px] hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm text-sm">
                                        <RefreshCcw className="w-4 h-4" />
                                        Назад
                                    </button>
                                </div>

                                <div className="w-[120px] h-px bg-slate-100 my-7 relative z-10" />

                                <div className="text-xs font-bold text-slate-300 tracking-widest  relative z-10">
                                    Merch CRM Navigation Safe
                                </div>
                            </div>
                        </div>

                        {/* Variant 3: 403 Forbidden / Access Denied (Purple/Violet) */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 self-start">
                                <span className="font-bold text-slate-700">3. Access Denied (Violet)</span>
                            </div>

                            <div className="relative overflow-hidden rounded-[42px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 p-10 flex flex-col items-center text-center max-w-[480px] w-full bg-white transition-all hover:shadow-3xl">
                                {/* Background Glow */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-15 bg-violet-500" />

                                {/* Error Icon */}
                                <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-violet-500/30 mb-8 transition-colors bg-violet-500 relative z-10">
                                    <XOctagon className="w-12 h-12 stroke-[2]" />
                                </div>

                                <div className="flex-1 w-full flex flex-col items-center relative z-10">
                                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                                        Доступ запрещен
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-[320px]">
                                        У вашей роли недостаточно прав для просмотра этого раздела или выполнения действия.
                                    </p>

                                    <div className="w-full bg-slate-50 rounded-2xl border border-slate-100/80 p-5 mb-8 text-left shadow-inner">
                                        <div className="text-[13px] font-mono text-violet-600/90 break-all leading-relaxed font-semibold">
                                            Error 403: Missing required permission &apos;manage_inventory_settings&apos;.
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex gap-3 relative z-10">
                                    <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-violet-500 text-white font-bold rounded-[20px] hover:bg-violet-600 transition-all active:scale-[0.98] shadow-xl shadow-violet-500/20 text-sm">
                                        Запросить доступ
                                    </button>
                                    <button type="button" className="flex-[0.7] flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 text-slate-600 hover:text-slate-900 font-bold rounded-[20px] hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm text-sm">
                                        <Home className="w-4 h-4" />
                                        На главную
                                    </button>
                                </div>

                                <div className="w-[120px] h-px bg-slate-100 my-7 relative z-10" />

                                <div className="text-xs font-bold text-slate-300 tracking-widest  relative z-10">
                                    Merch CRM Security Policy
                                </div>
                            </div>
                        </div>

                        {/* Variant 4: Network Offline / No Connection (Blue/Sky) */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 self-start">
                                <span className="font-bold text-slate-700">4. Network Offline (Blue)</span>
                            </div>

                            <div className="relative overflow-hidden rounded-[42px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 p-10 flex flex-col items-center text-center max-w-[480px] w-full bg-white transition-all hover:shadow-3xl">
                                {/* Background Glow */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-15 bg-blue-500" />

                                {/* Error Icon */}
                                <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 mb-8 transition-colors bg-blue-500 relative z-10">
                                    <WifiOff className="w-12 h-12 stroke-[2]" />
                                </div>

                                <div className="flex-1 w-full flex flex-col items-center relative z-10">
                                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                                        Нет подключения
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-[320px]">
                                        Похоже, у вас пропал интернет. Пожалуйста, проверьте соединение, чтобы продолжить работу.
                                    </p>

                                    <div className="w-full bg-slate-50 rounded-2xl border border-slate-100/80 p-5 mb-8 text-left shadow-inner">
                                        <div className="text-[13px] font-mono text-blue-600/90 break-all leading-relaxed font-semibold">
                                            NetworkError: Failed to fetch. The user is currently offline.
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex gap-3 relative z-10">
                                    <button type="button" className="flex-[0.7] flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 text-slate-600 hover:text-slate-900 font-bold rounded-[20px] hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm text-sm">
                                        <Home className="w-4 h-4" />
                                        На главную
                                    </button>
                                    <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-slate-900 text-white font-bold rounded-[20px] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 text-sm">
                                        <RefreshCcw className="w-4 h-4" />
                                        Переподключиться
                                    </button>
                                </div>

                                <div className="w-[120px] h-px bg-slate-100 my-7 relative z-10" />

                                <div className="text-xs font-bold text-slate-300 tracking-widest  relative z-10">
                                    Merch CRM Offline Mode
                                </div>
                            </div>
                        </div>

                        {/* Variant 5: 503 Maintenance / Down (Teal/Emerald) */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 self-start">
                                <span className="font-bold text-slate-700">5. Maintenance (Teal)</span>
                            </div>

                            <div className="relative overflow-hidden rounded-[42px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 p-10 flex flex-col items-center text-center max-w-[480px] w-full bg-white transition-all hover:shadow-3xl">
                                {/* Background Glow */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-15 bg-teal-500" />

                                {/* Error Icon */}
                                <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-teal-500/30 mb-8 transition-colors bg-teal-500 relative z-10">
                                    <ServerCrash className="w-12 h-12 stroke-[2]" />
                                </div>

                                <div className="flex-1 w-full flex flex-col items-center relative z-10">
                                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                                        Ведутся работы
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-[320px]">
                                        Мы проводим плановое техническое обслуживание. Система будет доступна через несколько минут.
                                    </p>

                                    <div className="w-full bg-slate-50 rounded-2xl border border-slate-100/80 p-5 mb-8 text-left shadow-inner">
                                        <div className="text-[13px] font-mono text-teal-600/90 break-all leading-relaxed font-semibold">
                                            Status 503: Service Unavailable. Database migrations in progress.
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex gap-3 relative z-10">
                                    <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-teal-500 text-white font-bold rounded-[20px] hover:bg-teal-600 transition-all active:scale-[0.98] shadow-xl shadow-teal-500/20 text-sm">
                                        Проверить статус
                                    </button>
                                </div>

                                <div className="w-[120px] h-px bg-slate-100 my-7 relative z-10" />

                                <div className="text-xs font-bold text-slate-300 tracking-widest  relative z-10">
                                    Merch CRM Maintenance
                                </div>
                            </div>
                        </div>


                    </section>

                    <section id="tooltips" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4"> Тултипы </h2>
                        <ComponentShowcase title="Tooltips" componentName="Tooltip" importPath="@/components/ui/tooltip" classes={[]}>
                            <div className="p-4 text-slate-500 border border-dashed border-slate-300 rounded-lg bg-slate-50">Превью тултипов находится в разработке.</div>
                        </ComponentShowcase>
                    </section>

                    <section id="popovers" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4"> Поповеры </h2>
                        <ComponentShowcase title="Popover" componentName="Popover" importPath="@/components/ui/popover" classes={[]}>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline">Открыть поповер</Button>
                                </PopoverTrigger>
                                <PopoverContent>Содержимое поповера.</PopoverContent>
                            </Popover>
                        </ComponentShowcase>
                    </section>

                    <section id="sliders" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4"> Слайдеры </h2>
                        <ComponentShowcase title="Slider" componentName="Slider" importPath="@/components/ui/slider" classes={[]}>
                            <div className="p-4 text-slate-500 border border-dashed border-slate-300 rounded-lg bg-slate-50">Компоненты слайдера находятся в разработке.</div>
                        </ComponentShowcase>
                    </section>

                    <section id="accordions" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4"> Аккордеоны </h2>
                        <ComponentShowcase title="Accordion" componentName="Accordion" importPath="@/components/ui/accordion" classes={[]}>
                            <div className="p-4 text-slate-500 border border-dashed border-slate-300 rounded-lg bg-slate-50">Компоненты аккордеона находятся в разработке.</div>
                        </ComponentShowcase>
                    </section>

                    <section id="radio" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4"> Радио-кнопки </h2>
                        <ComponentShowcase title="RadioGroup" componentName="RadioGroup" importPath="@/components/ui/radio-group" classes={[]}>
                            <div className="p-4 text-slate-500 border border-dashed border-slate-300 rounded-lg bg-slate-50">Превью радио-кнопок находится в разработке.</div>
                        </ComponentShowcase>
                    </section>

                    <section id="avatars" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4"> Аватары </h2>
                        <ComponentShowcase title="Avatar" componentName="Avatar" importPath="@/components/ui/avatar" classes={[]}>
                            <div className="flex gap-3 p-4 text-slate-500 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                                <Avatar><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>CN</AvatarFallback></Avatar>
                                <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
                            </div>
                        </ComponentShowcase>
                    </section>

                    <section id="skeletons" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4"> Скелетоны </h2>
                        <ComponentShowcase title="Skeleton" componentName="Skeleton" importPath="@/components/ui/skeleton" classes={[]}>
                            <div className="p-4 text-slate-500 border border-dashed border-slate-300 rounded-lg bg-slate-50">Превью скелетонов находится в разработке.</div>
                        </ComponentShowcase>
                    </section>

                    <section id="scroll" className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-4"> Скролл </h2>
                        <ComponentShowcase title="ScrollArea" componentName="ScrollArea" importPath="@/components/ui/scroll-area" classes={[]}>
                            <div className="p-4 text-slate-500 border border-dashed border-slate-300 rounded-lg bg-slate-50">Компонент скролл-области находится в разработке.</div>
                        </ComponentShowcase>
                    </section>

                </main>
            </div>
        </div >
    );
}
