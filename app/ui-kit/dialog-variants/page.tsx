"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Check, X, Box, Shirt, Hash, LayoutGrid, Palette, Type, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

// --- ВАРИАНТ 1: Bento Style ---
const Variant1 = () => {
    return (
        <div className="bg-white rounded-[24px] shadow-xl overflow-hidden w-full border border-slate-200/60 font-sans">
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                        <Shirt className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Новая категория</h2>
                        <p className="text-sm text-slate-500 font-medium">Настройка параметров раздела одежды</p>
                    </div>
                </div>

                {/* Main Info */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-2">
                        <Label className="text-xs font-bold text-slate-700 uppercase">Название категории</Label>
                        <Input placeholder="Напр. Футболки" className="h-12 bg-slate-50/50 border-slate-200" />
                    </div>
                    <div className="col-span-1 space-y-2">
                        <Label className="text-xs font-bold text-slate-700 uppercase">Артикул</Label>
                        <Input placeholder="TS" className="h-12 bg-slate-50/50 border-slate-200 font-mono uppercase" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700 uppercase">Описание категории</Label>
                    <Textarea
                        placeholder="Опциональное описание назначения этой категории..."
                        className="resize-none h-24 bg-slate-50/50 border-slate-200"
                    />
                </div>

                {/* Bento Grid Features */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/30 flex flex-col justify-between">
                        <Label className="text-sm font-bold text-slate-700 mb-3">Иконка</Label>
                        <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white cursor-pointer hover:border-primary/50 transition-colors py-4">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                                <Shirt className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/30 flex flex-col justify-between">
                        <Label className="text-sm font-bold text-slate-700 mb-3">Цвет</Label>
                        <div className="flex flex-wrap gap-2.5">
                            {[
                                { bg: 'bg-primary', border: 'border-primary' },
                                { bg: 'bg-rose-500', border: 'border-rose-500' },
                                { bg: 'bg-emerald-500', border: 'border-emerald-500' },
                                { bg: 'bg-amber-500', border: 'border-amber-500' },
                                { bg: 'bg-lime-500', border: 'border-lime-500' },
                                { bg: 'bg-blue-500', border: 'border-blue-500' },
                                { bg: 'bg-slate-500', border: 'border-slate-500' },
                                { bg: 'bg-orange-500', border: 'border-orange-500' },
                                { bg: 'bg-cyan-500', border: 'border-cyan-500' },
                                { bg: 'bg-fuchsia-500', border: 'border-fuchsia-500' },
                            ].map((color, i) => (
                                <button key={i} className={cn(
                                    "w-8 h-8 rounded-full transition-transform hover:scale-110",
                                    color.bg,
                                    i === 0 ? `ring-2 ring-offset-2 ring-primary` : ""
                                )}>
                                    {i === 0 && <Check className="w-4 h-4 text-white mx-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                        <div>
                            <p className="text-sm font-bold text-slate-900">В артикул</p>
                            <p className="text-xs text-slate-500">Добавить в SKU</p>
                        </div>
                        <Switch variant="primary" defaultChecked />
                    </div>
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                        <div>
                            <p className="text-sm font-bold text-slate-900">В название</p>
                            <p className="text-xs text-slate-500">Связка с именем</p>
                        </div>
                        <Switch variant="primary" defaultChecked />
                    </div>
                </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between mt-2">
                <Button variant="ghost" className="text-slate-500 hover:text-slate-900 hover:bg-slate-200">
                    Отмена
                </Button>
                <Button className="px-8 rounded-full shadow-md shadow-primary/20">
                    <Check className="w-4 h-4 mr-2" /> Сохранить
                </Button>
            </div>
        </div>
    );
};

// --- ВАРИАНТ 2: iOS Style ---
const Variant2 = () => {
    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full border border-slate-200">
            <div className="p-6 border-b border-slate-100 text-center relative">
                <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full hidden sm:flex">
                    <X className="w-5 h-5 text-slate-400" />
                </Button>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-3">
                    <LayoutGrid className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Новая категория</h2>
                <p className="text-sm text-slate-500 mt-1">Создание нового раздела для склада</p>
            </div>

            <div className="p-6 space-y-6 bg-slate-50/50">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-8 flex justify-center text-slate-400"><Type className="w-5 h-5" /></div>
                        <div className="flex-1">
                            <Input placeholder="Название (напр. Футболки)" className="border-0 bg-transparent p-0 h-auto rounded-none focus-visible:ring-0 text-base placeholder:text-slate-400 font-medium" />
                        </div>
                    </div>
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-8 flex justify-center text-slate-400"><Hash className="w-5 h-5" /></div>
                        <div className="flex-1">
                            <Input placeholder="Артикул (напр. TS)" className="border-0 bg-transparent p-0 h-auto rounded-none focus-visible:ring-0 text-base placeholder:text-slate-400 uppercase font-mono" />
                        </div>
                    </div>
                    <div className="p-4 flex gap-3">
                        <div className="w-8 flex justify-center mt-1 text-slate-400"><Fingerprint className="w-5 h-5" /></div>
                        <div className="flex-1">
                            <Textarea placeholder="Краткое описание категории..." className="border-0 bg-transparent p-0 flex-1 resize-none h-16 focus-visible:ring-0 text-base shadow-none" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Shirt className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-900">Иконка категории</span>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 rounded-full text-xs">Изменить</Button>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Palette className="w-5 h-5 text-slate-400" />
                            <span className="font-medium text-slate-900">Цвет маркера</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                            {['bg-primary', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-violet-500'].map((bg, i) => (
                                <button key={i} className={cn("w-10 h-10 rounded-full shrink-0", bg, i === 0 && "ring-4 ring-primary/20 flex items-center justify-center")}>
                                    {i === 0 && <Check className="w-5 h-5 text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <span className="font-medium text-slate-900 block">Включать в артикул</span>
                            <span className="text-sm text-slate-500">Авто-генерация SKU товаров</span>
                        </div>
                        <Switch variant="success" defaultChecked />
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <span className="font-medium text-slate-900 block">Включать в название</span>
                            <span className="text-sm text-slate-500">При генерации имен товаров</span>
                        </div>
                        <Switch variant="success" defaultChecked />
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600">Отмена</Button>
                <Button variant="default" className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/25">Создать категорию</Button>
            </div>
        </div>
    );
};

// --- ВАРИАНТ 3: Horizontal CRM Style ---
const Variant3 = () => {
    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-200 flex flex-row items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                        <Box className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">Создание категории</h2>
                        <p className="text-xs text-slate-500 font-medium">Заполните данные для новой товарной группы</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-slate-500">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="p-6 flex gap-8">
                <div className="flex-1 space-y-5">
                    <div className="flex gap-3">
                        <div className="flex-[2] space-y-1.5">
                            <Label className="text-sm font-semibold text-slate-700">Название *</Label>
                            <Input placeholder="Футболки" className="h-10" />
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <Label className="text-sm font-semibold text-slate-700">Артикул (Код) *</Label>
                            <Input placeholder="TS" className="h-10 font-mono uppercase" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700">Описание</Label>
                        <Textarea placeholder="Необязательное пояснение..." className="h-20 resize-none" />
                    </div>

                    <div className="flex flex-col gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-slate-400" />
                                <Label className="cursor-pointer font-medium text-slate-700">Добавлять код категории в артикул товара (SKU)</Label>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Type className="w-4 h-4 text-slate-400" />
                                <Label className="cursor-pointer font-medium text-slate-700">Учитывать категорию при авто-генерации названия</Label>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </div>

                <div className="w-64 shrink-0 space-y-6">
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Внешний вид</Label>
                        <div className="border border-slate-200 rounded-xl overflow-hidden pt-4 bg-slate-50/50">
                            <div className="flex flex-col items-center justify-center space-y-3 mb-6">
                                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-md shadow-primary/20 transition-all hover:scale-105 cursor-pointer ring-4 ring-white">
                                    <Shirt className="w-8 h-8" />
                                </div>
                                <Button variant="outline" size="sm" className="h-8 bg-white">Сменить иконку</Button>
                            </div>

                            <div className="p-4 bg-white border-t border-slate-200 space-y-3">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Цветовая метка</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {['bg-primary', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-orange-500', 'bg-slate-700', 'bg-pink-500', 'bg-lime-500'].map((bg, i) => (
                                        <button key={i} className={cn("aspect-square rounded-full transition-transform hover:scale-110 flex items-center justify-center", bg)}>
                                            {i === 0 && <Check className="w-3.5 h-3.5 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <Button variant="outline">Отменить</Button>
                <Button variant="default">Сохранить категорию</Button>
            </div>
        </div>
    );
};

export default function DialogVariantsPage() {
    return (
        <div className="min-h-screen bg-slate-100/50 p-8 md:p-12">
            <div className="max-w-[1400px] mx-auto space-y-24">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Варианты дизайна модального окна</h1>
                    <p className="text-slate-600">Три концептуальных подхода к созданию интерфейса модального окна для складской системы</p>
                </div>

                {/* Variant 1 */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                        <h2 className="text-xl font-bold text-slate-800">Вариант 1: Современный Bento</h2>
                    </div>
                    <p className="text-sm text-slate-500 max-w-2xl">
                        Этот вариант развивает идею из макета. Иконка перенесена в заголовок, а настройки распределены по аккуратным карточкам-блокам.
                    </p>
                    <div className="py-20 bg-slate-200/50 rounded-[48px] border-2 border-slate-300 border-dashed overflow-hidden">
                        <div className="max-w-[620px] mx-auto p-4 sm:p-8">
                            <Variant1 />
                        </div>
                    </div>
                </div>

                {/* Variant 2 */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                        <h2 className="text-xl font-bold text-slate-800">Вариант 2: Минималистичный iOS-стиль</h2>
                    </div>
                    <p className="text-sm text-slate-500 max-w-2xl">
                        Компактный вертикальный дизайн. Поля слиты со списком. Отлично подойдет для мобильных устройств.
                    </p>
                    <div className="py-20 bg-slate-200/50 rounded-[48px] border-2 border-slate-300 border-dashed overflow-hidden">
                        <div className="max-w-[460px] mx-auto p-4 sm:p-8">
                            <Variant2 />
                        </div>
                    </div>
                </div>

                {/* Variant 3 */}
                <div className="space-y-6 pb-32">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
                        <h2 className="text-xl font-bold text-slate-800">Вариант 3: Классический CRM-модуль</h2>
                    </div>
                    <p className="text-sm text-slate-500 max-w-2xl">
                        Более широкое и классическое окно. Текстовые поля сгруппированы слева, а визуальные настройки выведены в сайдбар справа.
                    </p>
                    <div className="py-20 bg-slate-200/50 rounded-[48px] border-2 border-slate-300 border-dashed overflow-hidden">
                        <div className="max-w-[920px] mx-auto p-4 sm:p-8">
                            <Variant3 />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
