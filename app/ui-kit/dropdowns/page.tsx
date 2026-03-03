"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    ArrowLeft, Check, ChevronDown, Plus,
    LayoutGrid, Palette, Tags, Box,
    Smile, Clock, CreditCard, GitBranch,
    Shirt, ShoppingBag, Package, Truck, Star, Zap, Heart, Globe,
    Sun, Sunset, Moon, Circle,
    Link2, Settings, Trash2, Hash, MoreHorizontal, User, Users, Shield, Search,
} from "lucide-react";

import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── Data ─────────────────────────────────────────────────────────────────────

const sizes = ["Kids", "S", "M", "L", "XL", "2XL", "3XL"];

const swatchColors = [
    { name: "Красный", hex: "#ef4444" },
    { name: "Оранжевый", hex: "#f97316" },
    { name: "Жёлтый", hex: "#eab308" },
    { name: "Зелёный", hex: "#22c55e" },
    { name: "Изумруд", hex: "#10b981" },
    { name: "Бирюза", hex: "#06b6d4" },
    { name: "Синий", hex: "#3b82f6" },
    { name: "Индиго", hex: "#6366f1" },
    { name: "Фиолет", hex: "#8b5cf6" },
    { name: "Розовый", hex: "#ec4899" },
    { name: "Белый", hex: "#ffffff", border: true },
    { name: "Серый", hex: "#64748b" },
    { name: "Чёрный", hex: "#0f172a" },
    { name: "Хаки", hex: "#854d0e" },
    { name: "Джинс", hex: "#1e3a8a" },
    { name: "Бордо", hex: "#9f1239" },
];

const deliveryMethods = [
    { id: "cdek", name: "СДЭК", desc: "Пункт выдачи, 2–3 дня", price: "от 350 ₽" },
    { id: "boxberry", name: "Boxberry", desc: "Пункт выдачи, 3–5 дней", price: "от 300 ₽" },
    { id: "russian_post", name: "Почта России", desc: "Отделение, 5–7 дней", price: "от 250 ₽" },
    { id: "courier", name: "Курьер", desc: "До двери", price: "от 500 ₽" },
];

const tags = ["Хлопок 100%", "Синтетика", "Унисекс", "Принт на спине", "Оверсайз", "Облегающее", "Без швов", "Вышивка", "DTF", "Шелкография"];

const iconOptions = [
    { id: "shirt", icon: Shirt, label: "Футболка" },
    { id: "bag", icon: ShoppingBag, label: "Сумка" },
    { id: "package", icon: Package, label: "Коробка" },
    { id: "truck", icon: Truck, label: "Доставка" },
    { id: "star", icon: Star, label: "Избранное" },
    { id: "zap", icon: Zap, label: "Срочно" },
    { id: "heart", icon: Heart, label: "Сохранено" },
    { id: "globe", icon: Globe, label: "Онлайн" },
    { id: "smile", icon: Smile, label: "Готово" },
];

const timeSlots = {
    morning: ["09:00", "10:00", "11:00"],
    afternoon: ["12:00", "13:00", "14:00", "15:00"],
    evening: ["16:00", "17:00", "18:00"],
};

const pricingTiers = [
    { id: "basic", name: "Базовый", price: "0 ₽", period: "бесплатно", features: ["До 10 заказов", "1 пользователь"] },
    { id: "pro", name: "Про", price: "1 990 ₽", period: "/ мес", features: ["До 500 заказов", "5 пользователей", "Аналитика"], highlight: true },
    { id: "enterprise", name: "Бизнес", price: "4 990 ₽", period: "/ мес", features: ["Неограничено", "Команда", "Приоритет"] },
];

const orderStatuses = [
    { id: "new", label: "Новый", desc: "Ожидает обработки" },
    { id: "production", label: "В производстве", desc: "Передан в печать" },
    { id: "ready", label: "Готов", desc: "Ожидает отправки" },
    { id: "shipped", label: "Отправлен", desc: "В пути к клиенту" },
    { id: "done", label: "Выполнен", desc: "Доставлен и закрыт" },
];

const menuStatuses = [
    { value: "active", label: "Активен", icon: Check, color: "text-emerald-500", bg: "bg-emerald-50" },
    { value: "paused", label: "На паузе", icon: Search, color: "text-amber-500", bg: "bg-amber-50" },
    { value: "archived", label: "В архиве", icon: Package, color: "text-slate-500", bg: "bg-slate-50" },
];

const roles = [
    { value: "admin", label: "Администратор", desc: "Полный доступ ко всем функциям", icon: Shield },
    { value: "manager", label: "Менеджер", desc: "Управление заказами и клиентами", icon: Users },
    { value: "employee", label: "Сотрудник", desc: "Просмотр задач и выполнение работ", icon: User },
];

// ── Shared bento card wrapper ─────────────────────────────────────────────────

function BentoCard({
    num, title, desc, accent, icon: Icon, children,
}: {
    num: number;
    title: string;
    desc: string;
    accent: string;         // e.g. "violet"
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col hover:shadow-lg transition-all relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-${accent}-500/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none`} />

            <div className="mb-8 relative z-10 flex items-start justify-between">
                <div>
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-${accent}-100 text-${accent}-600 font-bold text-xs mb-4`}>
                        {num}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{title}</h2>
                    <p className="text-sm text-slate-500">{desc}</p>
                </div>
                <Icon className="w-6 h-6 text-slate-300" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6 relative z-10">
                {children}
            </div>
        </div>
    );
}

// ── Section divider ───────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
    return (
        <div className="col-span-full flex items-center gap-4 pt-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 px-2">{label}</span>
            <div className="flex-1 h-px bg-slate-200" />
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DropdownsPage() {

    // --- List / Menu states ---
    const [menuStatus, setMenuStatus] = useState(menuStatuses[0]);
    const [selectedRole, setSelectedRole] = useState(roles[0]);

    // --- Grid / Popover states ---
    const [selectedSize, setSelectedSize] = useState("M");
    const [selectedColor, setSelectedColor] = useState(swatchColors[6]);
    const [selectedDelivery, setSelectedDelivery] = useState(deliveryMethods[0]);
    const [selectedTags, setSelectedTags] = useState<string[]>(["Оверсайз", "Хлопок 100%"]);
    const [selectedIcon, setSelectedIcon] = useState(iconOptions[0]);
    const [selectedTime, setSelectedTime] = useState("12:00");
    const [selectedTier, setSelectedTier] = useState(pricingTiers[1]);
    const [selectedStatus, setSelectedStatus] = useState(orderStatuses[1]);

    // Popover open/close
    const [sizeOpen, setSizeOpen] = useState(false);
    const [colorOpen, setColorOpen] = useState(false);
    const [deliveryOpen, setDeliveryOpen] = useState(false);
    const [iconOpen, setIconOpen] = useState(false);
    const [timeOpen, setTimeOpen] = useState(false);
    const [tierOpen, setTierOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);

    const toggleTag = (tag: string) =>
        setSelectedTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);

    // Helper: chevron trigger for popovers
    const triggerBase = (open: boolean, accentFocus: string) =>
        cn(
            "flex items-center justify-between w-full px-4 py-3 bg-white border rounded-2xl shadow-sm text-left transition-all focus:outline-none group/btn",
            open
                ? `border-${accentFocus}-500 ring-4 ring-${accentFocus}-500/10`
                : `border-slate-200 hover:border-${accentFocus}-300`
        );

    return (
        <div className="min-h-screen bg-slate-50 pb-24">

            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-4">
                    <a href="/ui-kit" className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dropdown Kit</h1>
                        <p className="text-sm font-medium text-slate-500">13 bento-style select &amp; menu variants</p>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 pt-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-[440px]">

                    {/* ══ SECTION 1: List / Menu dropdowns ══════════════════════════════════ */}
                    <SectionLabel label="List &amp; menu-style" />

                    {/* 1. Classic Status Select */}
                    <BentoCard num={1} title="Classic Status Select" desc="Standard inline select with status indicator" accent="blue" icon={LayoutGrid}>
                        <div className="w-full max-w-[260px] space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Статус</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center justify-between w-full px-4 py-3 bg-white border-2 border-slate-200/60 rounded-xl text-sm font-semibold text-slate-700 hover:border-blue-400 hover:ring-4 hover:ring-blue-400/10 transition-all focus:outline-none">
                                        <span className="flex items-center gap-2">
                                            <span className={cn("w-2.5 h-2.5 rounded-full", menuStatus.bg.replace("50", "500").replace("bg-", "bg-"))} />
                                            {menuStatus.label}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" className="w-[260px] p-2 rounded-2xl shadow-xl border-slate-100">
                                    {menuStatuses.map(s => (
                                        <DropdownMenuItem key={s.value} onClick={() => setMenuStatus(s)}
                                            className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold mb-1 last:mb-0",
                                                menuStatus.value === s.value ? "bg-slate-100" : "text-slate-600 focus:bg-slate-50"
                                            )}>
                                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", s.bg, s.color)}>
                                                <s.icon className="w-4 h-4" />
                                            </div>
                                            <span className="flex-1">{s.label}</span>
                                            {menuStatus.value === s.value && <Check className="w-4 h-4 text-slate-900" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </BentoCard>

                    {/* 2. Rich Description Select */}
                    <BentoCard num={2} title="Rich Description Select" desc="Complex choices: roles, access levels, etc." accent="violet" icon={Users}>
                        <div className="w-full max-w-[280px] space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Роль</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center justify-between w-full p-4 bg-white border border-slate-200 rounded-[20px] shadow-sm hover:border-violet-400 hover:ring-4 hover:ring-violet-400/10 transition-all focus:outline-none text-left group/btn">
                                        <span className="flex items-center gap-4">
                                            <span className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                                                <selectedRole.icon className="w-5 h-5" />
                                            </span>
                                            <span className="block">
                                                <span className="block text-sm font-bold text-slate-900">{selectedRole.label}</span>
                                                <span className="block text-xs font-medium text-slate-500 truncate max-w-[140px]">{selectedRole.desc}</span>
                                            </span>
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" className="w-[300px] p-3 rounded-3xl shadow-2xl border-slate-100">
                                    <div className="px-3 pb-2 pt-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Выберите роль</div>
                                    {roles.map(r => (
                                        <DropdownMenuItem key={r.value} onClick={() => setSelectedRole(r)}
                                            className={cn("flex items-start gap-4 p-3 rounded-2xl cursor-pointer transition-all",
                                                selectedRole.value === r.value ? "bg-violet-50" : "hover:bg-slate-50 focus:bg-slate-50"
                                            )}>
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", selectedRole.value === r.value ? "bg-white text-violet-600 shadow-sm" : "bg-slate-100 text-slate-500")}>
                                                <r.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 pt-0.5">
                                                <div className={cn("text-sm font-bold mb-0.5", selectedRole.value === r.value ? "text-violet-900" : "text-slate-900")}>{r.label}</div>
                                                <div className={cn("text-xs leading-snug", selectedRole.value === r.value ? "text-violet-600/80" : "text-slate-500")}>{r.desc}</div>
                                            </div>
                                            {selectedRole.value === r.value && (
                                                <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-2.5">
                                                    <Check className="w-3 h-3 text-white stroke-[3]" />
                                                </div>
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </BentoCard>

                    {/* 3. Ghost Inline Dropdown */}
                    <BentoCard num={3} title="Ghost Header Filter" desc="Subtle inline trigger for large typographic contexts" accent="emerald" icon={Search}>
                        <div className="flex items-center text-3xl font-black text-slate-300 tracking-tight flex-wrap justify-center gap-1">
                            <span>Все</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="mx-1 px-3 py-1 bg-transparent hover:bg-slate-200/50 text-slate-900 rounded-xl transition-all focus:outline-none flex items-center gap-1 group">
                                        заказы
                                        <ChevronDown className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" strokeWidth={3} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" className="w-[180px] p-2 rounded-2xl shadow-xl border-slate-100">
                                    {["заказы", "клиенты", "товары"].map((item, i) => (
                                        <DropdownMenuItem key={item}
                                            className={cn("px-4 py-3 rounded-xl cursor-pointer text-base font-bold transition-all",
                                                i === 0 ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 focus:bg-slate-100"
                                            )}>
                                            {item}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <span>сегодня</span>
                        </div>
                    </BentoCard>

                    {/* 4. Action Context Menu */}
                    <BentoCard num={4} title="Action Flow Menu" desc="Groups, shortcuts, sub-menus, destructive actions" accent="slate" icon={MoreHorizontal}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:shadow-sm transition-all focus:outline-none data-[state=open]:bg-slate-100">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-[240px] p-2 rounded-2xl shadow-xl border-slate-100">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="p-3 cursor-pointer rounded-xl font-semibold text-slate-700 focus:bg-slate-100">
                                        <Settings className="w-4 h-4 mr-3 text-slate-400" />Настройки
                                        <DropdownMenuShortcut className="ml-auto text-xs bg-slate-100 font-mono px-1.5 py-0.5 rounded text-slate-400">⌘S</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="p-3 cursor-pointer rounded-xl font-semibold text-slate-700 focus:bg-slate-100">
                                        <Link2 className="w-4 h-4 mr-3 text-slate-400" />Копировать ссылку
                                        <DropdownMenuShortcut className="ml-auto text-xs bg-slate-100 font-mono px-1.5 py-0.5 rounded text-slate-400">⌘C</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <div className="h-px bg-slate-100 my-1 mx-2" />
                                <DropdownMenuGroup>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="p-3 cursor-pointer rounded-xl font-semibold text-slate-700 focus:bg-slate-100 data-[state=open]:bg-slate-100">
                                            <Hash className="w-4 h-4 mr-3 text-slate-400" />Изменить тег
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent className="p-2 rounded-2xl shadow-xl border-slate-100">
                                                {["Важное", "В работе", "Отложено"].map(tag => (
                                                    <DropdownMenuItem key={tag} className="p-2.5 cursor-pointer rounded-xl font-medium text-slate-700 focus:bg-slate-100">{tag}</DropdownMenuItem>
                                                ))}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                </DropdownMenuGroup>
                                <div className="h-px bg-slate-100 my-1 mx-2" />
                                <DropdownMenuItem className="p-3 cursor-pointer rounded-xl font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700 mt-1">
                                    <Trash2 className="w-4 h-4 mr-3 opacity-80" />Удалить проект
                                    <DropdownMenuShortcut className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded text-rose-400">⌘⌫</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </BentoCard>

                    {/* 5. Assignee Combobox */}
                    <BentoCard num={5} title="Inline Assignee Search" desc="Popover combobox for picking from a long member list" accent="amber" icon={User}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 pr-3 pl-1 py-1 bg-white border border-slate-200 rounded-full shadow-sm hover:border-slate-300 hover:shadow transition-all focus:outline-none">
                                    <span className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center border border-white">
                                        <User className="w-3.5 h-3.5 text-slate-600" />
                                    </span>
                                    <span className="text-sm font-semibold text-slate-600">Назначить</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-[260px] p-0 overflow-hidden rounded-2xl shadow-xl border-slate-100">
                                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input autoFocus placeholder="Искать..." className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 placeholder:text-slate-400" />
                                    </div>
                                </div>
                                <div className="p-2 max-h-[160px] overflow-y-auto">
                                    {["Иван Иванов", "Пётр Сидоров", "Алексей Смирнов", "Анна Кюри"].map(name => (
                                        <DropdownMenuItem key={name} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer text-sm font-medium text-slate-700 hover:bg-slate-100 focus:bg-slate-100">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                                                {name.substring(0, 2)}
                                            </div>
                                            {name}
                                        </DropdownMenuItem>
                                    ))}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </BentoCard>

                    {/* ══ SECTION 2: Grid / Popover selectors ═══════════════════════════════ */}
                    <SectionLabel label="Grid &amp; popover-style" />

                    {/* 6. Size Grid */}
                    <BentoCard num={6} title="Grid Selector (3 cols)" desc="Uniform attributes like sizes or room types" accent="violet" icon={LayoutGrid}>
                        <div className="w-full max-w-[300px] space-y-2">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-sm font-bold text-slate-900">Размер</label>
                                <button className="text-[13px] font-semibold text-slate-400 hover:text-violet-600 transition-colors">Создать размер</button>
                            </div>
                            <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
                                <PopoverTrigger asChild>
                                    <button className={cn(triggerBase(sizeOpen, "violet"), "border-2")}>
                                        <span className="text-sm font-bold text-slate-900">{selectedSize}</span>
                                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", sizeOpen && "rotate-180")} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" sideOffset={8} className="w-[300px] p-4 rounded-3xl shadow-2xl border-slate-100">
                                    <div className="grid grid-cols-3 gap-2">
                                        {sizes.map(size => {
                                            const sel = size === selectedSize;
                                            return (
                                                <button key={size} onClick={() => { setSelectedSize(size); setSizeOpen(false); }}
                                                    className={cn("h-11 rounded-xl text-sm font-bold transition-all relative flex items-center justify-center",
                                                        sel ? "bg-violet-50 border-2 border-violet-200 text-violet-700" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50")}>
                                                    {size}
                                                    {sel && <Check className="absolute right-2 w-3.5 h-3.5 text-violet-600 stroke-[3]" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </BentoCard>

                    {/* 7. Color Swatches */}
                    <BentoCard num={7} title="Dense Swatch Grid" desc="Circular colour picker with custom colour support" accent="rose" icon={Palette}>
                        <div className="w-full max-w-[300px] space-y-2">
                            <label className="text-sm font-bold text-slate-900">Основной цвет</label>
                            <Popover open={colorOpen} onOpenChange={setColorOpen}>
                                <PopoverTrigger asChild>
                                    <button className={cn(triggerBase(colorOpen, "rose"))}>
                                        <span className="flex items-center gap-3">
                                            <span className={cn("w-5 h-5 rounded-full shadow-sm", selectedColor.border && "border border-slate-200")} style={{ backgroundColor: selectedColor.hex }} />
                                            <span className="text-sm font-semibold text-slate-700">{selectedColor.name}</span>
                                        </span>
                                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", colorOpen && "rotate-180")} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" sideOffset={8} className="w-[280px] p-4 rounded-3xl shadow-2xl border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Палитра</div>
                                    <div className="grid grid-cols-5 gap-3">
                                        {swatchColors.map(c => {
                                            const sel = c.hex === selectedColor.hex;
                                            return (
                                                <button key={c.hex} title={c.name} onClick={() => { setSelectedColor(c); setColorOpen(false); }}
                                                    className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all focus:outline-none",
                                                        sel ? "ring-2 ring-slate-900 ring-offset-2" : "hover:ring-2 hover:ring-slate-300 hover:ring-offset-1",
                                                        c.border && "border border-slate-200")}
                                                    style={{ backgroundColor: c.hex }}>
                                                    {sel && <Check className={cn("w-4 h-4 stroke-[3]", ["#ffffff", "#eab308"].includes(c.hex) ? "text-slate-900" : "text-white")} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
                                        <button className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
                                            <Plus className="w-3 h-3" />Свой цвет
                                        </button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </BentoCard>

                    {/* 8. Card Grid 2 cols */}
                    <BentoCard num={8} title="Card Grid (2 cols)" desc="Complex options with titles, descriptions, badges" accent="amber" icon={Box}>
                        <div className="w-full space-y-2">
                            <label className="text-sm font-bold text-slate-900">Метод доставки</label>
                            <Popover open={deliveryOpen} onOpenChange={setDeliveryOpen}>
                                <PopoverTrigger asChild>
                                    <button className={cn(triggerBase(deliveryOpen, "amber"))}>
                                        <span className="block">
                                            <span className="block text-sm font-bold text-slate-900">{selectedDelivery.name}</span>
                                            <span className="block text-xs text-slate-500">{selectedDelivery.price}</span>
                                        </span>
                                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", deliveryOpen && "rotate-180")} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" sideOffset={8} className="w-[420px] p-4 rounded-[28px] shadow-2xl border-slate-100">
                                    <div className="grid grid-cols-2 gap-3">
                                        {deliveryMethods.map(m => {
                                            const sel = m.id === selectedDelivery.id;
                                            return (
                                                <button key={m.id} onClick={() => { setSelectedDelivery(m); setDeliveryOpen(false); }}
                                                    className={cn("text-left p-4 rounded-[20px] border-2 transition-all relative",
                                                        sel ? "border-amber-400 bg-amber-50/30" : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm")}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-sm font-bold text-slate-900">{m.name}</span>
                                                        {sel && <Check className="w-4 h-4 text-amber-500 stroke-[3]" />}
                                                    </div>
                                                    <p className="text-[11px] font-medium text-slate-500 mb-3 leading-snug">{m.desc}</p>
                                                    <div className="text-xs font-bold text-slate-900 bg-white inline-flex px-2 py-1 rounded-md border border-slate-100">{m.price}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </BentoCard>

                    {/* 9. Tag Flow */}
                    <BentoCard num={9} title="Flex Tag Picker" desc="Variable-width tags in a flowing multi-select" accent="emerald" icon={Tags}>
                        <div className="w-full space-y-2">
                            <label className="text-sm font-bold text-slate-900">Особенности</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="flex items-center justify-between w-full p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-300 transition-all focus:outline-none data-[state=open]:border-emerald-500 data-[state=open]:ring-4 data-[state=open]:ring-emerald-500/10 text-left min-h-[52px]">
                                        <span className="flex flex-wrap gap-1.5 flex-1 pr-2">
                                            {selectedTags.length > 0 ? selectedTags.map(tag => (
                                                <span key={tag} className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200/60 leading-none">{tag}</span>
                                            )) : (
                                                <span className="text-sm font-medium text-slate-400 pl-1">Выберите теги...</span>
                                            )}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" sideOffset={8} className="w-[320px] p-5 rounded-3xl shadow-2xl border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Доступные теги</div>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => {
                                            const sel = selectedTags.includes(tag);
                                            return (
                                                <button key={tag} onClick={() => toggleTag(tag)}
                                                    className={cn("text-[13px] font-bold px-3 py-1.5 rounded-lg border transition-all focus:outline-none",
                                                        sel ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50")}>
                                                    {tag}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </BentoCard>

                    {/* 10. Icon Picker */}
                    <BentoCard num={10} title="Icon Picker Grid" desc="Dense icon grid — badges, avatars, categories" accent="sky" icon={Smile}>
                        <div className="w-full max-w-[260px] space-y-2">
                            <label className="text-sm font-bold text-slate-900">Иконка категории</label>
                            <Popover open={iconOpen} onOpenChange={setIconOpen}>
                                <PopoverTrigger asChild>
                                    <button className={cn(triggerBase(iconOpen, "sky"))}>
                                        <span className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                                                <selectedIcon.icon className="w-4 h-4" />
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700">{selectedIcon.label}</span>
                                        </span>
                                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", iconOpen && "rotate-180")} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" sideOffset={8} className="w-[260px] p-4 rounded-3xl shadow-2xl border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Выберите иконку</div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {iconOptions.map(opt => {
                                            const sel = opt.id === selectedIcon.id;
                                            return (
                                                <button key={opt.id} title={opt.label} onClick={() => { setSelectedIcon(opt); setIconOpen(false); }}
                                                    className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all focus:outline-none",
                                                        sel ? "bg-sky-500 text-white shadow-md shadow-sky-200" : "bg-slate-100 text-slate-500 hover:bg-sky-50 hover:text-sky-600")}>
                                                    <opt.icon className="w-4 h-4" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </BentoCard>

                    {/* 11. Time Slot */}
                    <BentoCard num={11} title="Time Slot Picker" desc="Columnar time grid grouped by morning / afternoon / evening" accent="indigo" icon={Clock}>
                        <div className="w-full space-y-2">
                            <label className="text-sm font-bold text-slate-900">Время доставки</label>
                            <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                                <PopoverTrigger asChild>
                                    <button className={cn(triggerBase(timeOpen, "indigo"))}>
                                        <span className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-bold text-slate-800">{selectedTime}</span>
                                        </span>
                                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", timeOpen && "rotate-180")} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" sideOffset={8} className="w-[360px] p-5 rounded-3xl shadow-2xl border-slate-100">
                                    <div className="grid grid-cols-3 gap-4">
                                        {([
                                            { key: "morning" as const, label: "Утро", icon: Sun, slots: timeSlots.morning },
                                            { key: "afternoon" as const, label: "День", icon: Sunset, slots: timeSlots.afternoon },
                                            { key: "evening" as const, label: "Вечер", icon: Moon, slots: timeSlots.evening },
                                        ]).map(({ key, label, icon: Icon, slots }) => (
                                            <div key={key}>
                                                <div className="flex items-center gap-1.5 mb-2 px-1">
                                                    <Icon className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    {slots.map(time => {
                                                        const sel = time === selectedTime;
                                                        return (
                                                            <button key={time} onClick={() => { setSelectedTime(time); setTimeOpen(false); }}
                                                                className={cn("h-9 rounded-xl text-sm font-bold transition-all focus:outline-none",
                                                                    sel ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-100")}>
                                                                {time}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </BentoCard>

                    {/* 12. Pricing Tier */}
                    <BentoCard num={12} title="Pricing Tier Grid" desc="3-column plan picker with feature highlights" accent="fuchsia" icon={CreditCard}>
                        <div className="w-full space-y-2">
                            <label className="text-sm font-bold text-slate-900">Тарифный план</label>
                            <Popover open={tierOpen} onOpenChange={setTierOpen}>
                                <PopoverTrigger asChild>
                                    <button className={cn(triggerBase(tierOpen, "fuchsia"))}>
                                        <span className="flex items-center gap-3">
                                            {selectedTier.highlight && <Zap className="w-4 h-4 text-fuchsia-500" />}
                                            <span className="block">
                                                <span className="block text-sm font-bold text-slate-900">{selectedTier.name}</span>
                                                <span className="block text-xs font-semibold text-slate-500">{selectedTier.price} {selectedTier.period}</span>
                                            </span>
                                        </span>
                                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", tierOpen && "rotate-180")} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" sideOffset={8} className="w-[420px] p-4 rounded-[28px] shadow-2xl border-slate-100">
                                    <div className="grid grid-cols-3 gap-3">
                                        {pricingTiers.map(tier => {
                                            const sel = tier.id === selectedTier.id;
                                            return (
                                                <button key={tier.id} onClick={() => { setSelectedTier(tier); setTierOpen(false); }}
                                                    className={cn("relative text-left p-4 rounded-[20px] border-2 transition-all flex flex-col focus:outline-none",
                                                        tier.highlight && !sel ? "border-fuchsia-200 bg-fuchsia-50/50 hover:bg-fuchsia-50" :
                                                            sel ? "border-fuchsia-500 bg-fuchsia-50" : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200")}>
                                                    <div className="text-xs font-black uppercase tracking-wider mb-1 text-slate-500">{tier.name}</div>
                                                    <div className={cn("text-lg font-black mb-3 leading-none", sel ? "text-fuchsia-700" : "text-slate-900")}>
                                                        {tier.price}<span className="text-xs font-medium text-slate-400 ml-0.5">{tier.period}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        {tier.features.map(f => (
                                                            <div key={f} className="flex items-center gap-1">
                                                                <Check className={cn("w-3 h-3 shrink-0 stroke-[3]", sel ? "text-fuchsia-500" : "text-slate-400")} />
                                                                <span className="text-[10px] font-semibold text-slate-500">{f}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {sel && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-fuchsia-500 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white stroke-[3]" /></div>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </BentoCard>

                    {/* 13. Status Progression  */}
                    <BentoCard num={13} title="Status Progression" desc="Visual timeline stepper for process state changes" accent="cyan" icon={GitBranch}>
                        <div className="w-full space-y-2">
                            <label className="text-sm font-bold text-slate-900">Статус заказа</label>
                            <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                                <PopoverTrigger asChild>
                                    <button className={cn(triggerBase(statusOpen, "cyan"))}>
                                        <span className="flex items-center gap-3">
                                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 ring-2 ring-cyan-200 shrink-0" />
                                            <span className="block text-left">
                                                <span className="block text-sm font-bold text-slate-900">{selectedStatus.label}</span>
                                                <span className="block text-xs font-medium text-slate-400">{selectedStatus.desc}</span>
                                            </span>
                                        </span>
                                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", statusOpen && "rotate-180")} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" sideOffset={8} className="w-[280px] p-4 rounded-3xl shadow-2xl border-slate-100">
                                    <div className="flex flex-col">
                                        {orderStatuses.map((s, idx) => {
                                            const sel = s.id === selectedStatus.id;
                                            const selIdx = orderStatuses.findIndex(x => x.id === selectedStatus.id);
                                            const isPast = idx < selIdx;
                                            const isLast = idx === orderStatuses.length - 1;
                                            return (
                                                <div key={s.id} className="flex gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <button onClick={() => { setSelectedStatus(s); setStatusOpen(false); }}
                                                            className={cn("w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shrink-0 focus:outline-none",
                                                                sel ? "border-cyan-500 bg-cyan-500 text-white" :
                                                                    isPast ? "border-cyan-300 bg-cyan-50 text-cyan-500" :
                                                                        "border-slate-200 bg-white text-slate-300 hover:border-slate-300")}>
                                                            {isPast || sel ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Circle className="w-2.5 h-2.5 fill-current" />}
                                                        </button>
                                                        {!isLast && <div className={cn("w-0.5 h-6 mt-1 rounded-full", isPast ? "bg-cyan-200" : "bg-slate-100")} />}
                                                    </div>
                                                    <button onClick={() => { setSelectedStatus(s); setStatusOpen(false); }}
                                                        className={cn("pb-6 pt-0.5 text-left flex flex-col focus:outline-none", isLast && "pb-0")}>
                                                        <span className={cn("text-sm font-bold", sel ? "text-cyan-700" : isPast ? "text-slate-700" : "text-slate-400")}>{s.label}</span>
                                                        <span className="text-xs font-medium text-slate-400">{s.desc}</span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </BentoCard>

                </div>
            </main>
        </div>
    );
}
