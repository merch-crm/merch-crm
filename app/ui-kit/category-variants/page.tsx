import React from "react";
import { Shirt, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const category = {
    name: "Одежда",
    itemCount: 42,
    totalQuantity: 1250,
    color: "pink",
    children: [
        { id: "1", name: "Футболки" },
        { id: "2", name: "Худи" },
        { id: "3", name: "Кепки" },
    ]
};

const IconComponent = Shirt;

export default function CategoryVariantsPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 sm:p-12 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900  mb-4">UI Kit: Category Card Variants</h1>
                    <p className="text-lg text-slate-500">10 different design directions for the warehouse category cards.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

                    {/* Variant 1: Current Refined (Glass Soft) */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">1. Current Refined</span>
                        </div>
                        <div className="group relative overflow-hidden rounded-[42px] border border-slate-100 shadow-sm p-8 flex flex-col items-center text-center min-h-[400px] transition-all hover:shadow-2xl cursor-pointer bg-gradient-to-b via-white via-35% to-white from-pink-100/20 bg-white">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[60px] -mt-24 pointer-events-none opacity-15 bg-pink-500/10" />
                            <div className="w-20 h-20 rounded-[28px] flex items-center justify-center text-white shadow-xl mb-7 transition-colors bg-pink-500 shadow-pink-500/30">
                                <IconComponent className="w-10 h-10 stroke-[1.5]" />
                            </div>
                            <div className="flex-1 w-full flex flex-col items-center">
                                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900  mb-2">{category.name}</h3>
                                <p className="text-sm font-semibold text-slate-400 mb-6">{category.itemCount} активных SKU на складе</p>
                                <div className="w-[120px] h-px bg-slate-100 mb-4" />
                                <div className="flex flex-wrap justify-center gap-1.5 max-w-[240px] mb-2">
                                    {category.children.map(child => (
                                        <span key={child.id} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[10px] font-bold text-slate-400 uppercase">{child.name}</span>
                                    ))}
                                </div>
                                <div className="mt-8 flex flex-col items-center">
                                    <span className="text-6xl font-black text-slate-900 tabular-nums ">{category.totalQuantity.toLocaleString()}</span>
                                    <span className="text-[11px] font-black uppercase mt-2 text-pink-500">единиц в наличии</span>
                                </div>
                            </div>
                            <div className="mt-8 flex items-center justify-center">
                                <div className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-50 border border-slate-100/50 text-slate-900 transition-all group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-lg group-hover:shadow-slate-900/10">
                                    <span className="text-[11px] font-black uppercase ">Перейти</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 2: Solid Minimal */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">2. Solid Minimal</span>
                        </div>
                        <div className="group bg-white rounded-[32px] border border-slate-200 p-8 flex flex-col items-center text-center min-h-[400px] transition-all hover:border-pink-500/50 hover:shadow-lg cursor-pointer">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-pink-50 text-pink-600 transition-colors group-hover:bg-pink-500 group-hover:text-white">
                                <IconComponent className="w-8 h-8 stroke-2" />
                            </div>
                            <div className="flex-1 w-full flex flex-col items-center">
                                <h3 className="text-2xl font-bold text-slate-900 mb-1">{category.name}</h3>
                                <p className="text-sm text-slate-500 mb-6">{category.itemCount} видов товаров</p>
                                <div className="flex flex-wrap justify-center gap-2 mb-2">
                                    {category.children.map(child => (
                                        <span key={child.id} className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{child.name}</span>
                                    ))}
                                </div>
                                <div className="mt-auto pt-8 flex flex-col items-center w-full border-t border-slate-100">
                                    <span className="text-5xl font-bold text-slate-900">{category.totalQuantity.toLocaleString()}</span>
                                    <span className="text-xs font-semibold uppercase  mt-1 text-slate-400">В наличии</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 3: Tinted Soft */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">3. Tinted Soft</span>
                        </div>
                        <div className="group bg-pink-50/50 rounded-[40px] border border-pink-100 p-8 flex flex-col items-center text-center min-h-[400px] transition-all hover:bg-pink-50 cursor-pointer">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white shadow-sm mb-6 text-pink-500">
                                <IconComponent className="w-10 h-10 stroke-[1.5]" />
                            </div>
                            <div className="flex-1 w-full flex flex-col items-center">
                                <h3 className="text-3xl font-extrabold text-pink-950 mb-2">{category.name}</h3>
                                <p className="text-sm font-medium text-pink-700/60 mb-6">{category.itemCount} позиций SKU</p>
                                <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                                    {category.children.map(child => (
                                        <span key={child.id} className="px-3 py-1 bg-white/60 border border-white rounded-full text-[11px] font-bold text-pink-800">{child.name}</span>
                                    ))}
                                </div>
                                <div className="mt-8 flex flex-col items-center">
                                    <span className="text-6xl font-black text-pink-600 ">{category.totalQuantity.toLocaleString()}</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] mt-2 text-pink-400">Штук на складе</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 4: Left-Aligned Focus */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">4. Left-Aligned Focus</span>
                        </div>
                        <div className="group bg-white rounded-[24px] shadow-sm border border-slate-200/60 p-6 flex flex-col min-h-[400px] transition-all hover:shadow-md cursor-pointer relative overflow-hidden">
                            <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center text-white mb-6">
                                <IconComponent className="w-6 h-6 stroke-2" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-1">{category.name}</h3>
                            <p className="text-sm text-slate-500 mb-6">{category.itemCount} активных карточек товара</p>

                            <div className="flex flex-col gap-2 mb-8">
                                {category.children.map(child => (
                                    <div key={child.id} className="flex items-center gap-2 text-sm text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                                        {child.name}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto flex items-end justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase  mb-1">Остаток</p>
                                    <span className="text-4xl font-black text-slate-900 tabular-nums">{category.totalQuantity.toLocaleString()}</span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 5: Top Accent Line */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">5. Top Accent Line</span>
                        </div>
                        <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 border-t-[6px] border-t-pink-500 p-8 flex flex-col items-center text-center min-h-[400px] transition-all hover:shadow-lg cursor-pointer">
                            <div className="w-16 h-16 flex items-center justify-center text-pink-500 mb-4">
                                <IconComponent className="w-12 h-12 stroke-[1.5]" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{category.name}</h3>
                            <div className="flex items-center gap-2 mb-8 text-sm text-slate-500">
                                <span>{category.itemCount} SKU</span>
                            </div>

                            <div className="w-full bg-slate-50 rounded-xl p-4 mb-6">
                                <div className="flex flex-wrap justify-center gap-2">
                                    {category.children.map(child => (
                                        <span key={child.id} className="text-[13px] text-slate-600">{child.name},</span>
                                    ))}
                                    <span className="text-[13px] text-slate-400">и др.</span>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <span className="block text-5xl font-black text-slate-800">{category.totalQuantity.toLocaleString()}</span>
                                <span className="block text-sm font-medium text-slate-400 mt-1">Всего единиц</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 6: Ghost Card */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">6. Ghost / Flat</span>
                        </div>
                        <div className="group bg-transparent rounded-[32px] p-8 flex flex-col items-center text-center min-h-[400px] transition-all hover:bg-white hover:shadow-xl cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-600 mb-6 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors duration-500">
                                <IconComponent className="w-10 h-10 stroke-[1.5]" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">{category.name}</h3>
                            <p className="text-sm text-slate-500 mb-6">{category.itemCount} артикулов</p>

                            <div className="flex flex-wrap justify-center gap-2 mb-8 opacity-60 group-hover:opacity-100 transition-opacity">
                                {category.children.map(child => (
                                    <span key={child.id} className="text-xs text-slate-500 border-b border-slate-300 pb-0.5">{child.name}</span>
                                ))}
                            </div>

                            <div className="mt-auto flex flex-col items-center gap-1">
                                <span className="text-sm text-slate-400 uppercase  font-semibold">Запасы</span>
                                <span className="text-5xl font-light text-slate-700">{category.totalQuantity.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 7: Elevated Neumorphic */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">7. Elevated Neumorphic</span>
                        </div>
                        <div className="group bg-white rounded-[40px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white p-8 flex flex-col items-center text-center min-h-[400px] transition-all hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(236,72,153,0.15)] cursor-pointer">
                            <div className="w-20 h-20 rounded-[24px] bg-slate-50 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.05),0_8px_16px_rgba(0,0,0,0.05)] flex items-center justify-center text-pink-500 mb-8 border border-white">
                                <IconComponent className="w-8 h-8 stroke-2" />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-2 drop-shadow-sm">{category.name}</h3>

                            <div className="flex gap-2 my-6">
                                <div className="px-4 py-2 rounded-2xl bg-slate-50 shadow-inner flex flex-col items-center">
                                    <span className="text-xs text-slate-400 font-medium">SKU</span>
                                    <span className="text-lg font-bold text-slate-700">{category.itemCount}</span>
                                </div>
                                <div className="px-4 py-2 rounded-2xl bg-slate-50 shadow-inner flex flex-col items-center">
                                    <span className="text-xs text-slate-400 font-medium">Шт</span>
                                    <span className="text-lg font-bold text-pink-600">{category.totalQuantity}</span>
                                </div>
                            </div>

                            <div className="mt-auto w-full">
                                <div className="h-12 w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white flex items-center justify-center gap-2 font-bold shadow-lg shadow-pink-500/30 opacity-90 group-hover:opacity-100">
                                    Войти в раздел <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 8: Outline Minimal */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">8. Outline Minimal</span>
                        </div>
                        <div className="group bg-transparent rounded-[32px] border-2 border-slate-200 p-8 flex flex-col min-h-[400px] transition-all hover:border-pink-500 cursor-pointer">
                            <div className="flex justify-between items-start mb-8">
                                <h3 className="text-3xl font-black text-slate-900 group-hover:text-pink-600 transition-colors">{category.name}</h3>
                                <IconComponent className="w-10 h-10 text-slate-300 group-hover:text-pink-500 transition-colors" />
                            </div>

                            <p className="text-sm font-medium text-slate-500 mb-4">{category.itemCount} SKU Active</p>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {category.children.map(child => (
                                    <span key={child.id} className="px-3 py-1 border border-slate-200 rounded-full text-xs font-semibold text-slate-600">{child.name}</span>
                                ))}
                            </div>

                            <div className="mt-auto border-t-2 border-slate-100 pt-6 flex justify-between items-end group-hover:border-pink-100">
                                <div>
                                    <span className="block text-xs font-bold text-slate-400 uppercase  mb-1">Total Stock</span>
                                    <span className="block text-4xl font-black text-slate-900">{category.totalQuantity.toLocaleString()}</span>
                                </div>
                                <div className="w-12 h-12 border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-400 group-hover:border-pink-500 group-hover:text-pink-500 transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 9: Compact Horizontal */}
                    <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-1">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">9. Compact Horizontal</span>
                        </div>
                        <div className="group bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-6 h-[180px] xl:h-[400px] xl:flex-col xl:items-start transition-all hover:shadow-xl cursor-pointer">
                            <div className="w-20 h-20 xl:w-16 xl:h-16 shrink-0 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                                <IconComponent className="w-10 h-10 xl:w-8 xl:h-8 stroke-2" />
                            </div>
                            <div className="flex-1 flex flex-col xl:w-full">
                                <h3 className="text-2xl font-bold text-slate-900">{category.name}</h3>
                                <p className="text-sm text-slate-500 mt-1">{category.itemCount} активных видов</p>
                                <div className="hidden xl:flex flex-wrap gap-1.5 mt-4">
                                    {category.children.map(child => (
                                        <span key={child.id} className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600">{child.name}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right xl:text-left xl:mt-auto xl:w-full xl:border-t xl:border-slate-100 xl:pt-4">
                                <span className="block text-sm text-slate-400 uppercase font-bold  mb-1">Остаток</span>
                                <span className="block text-4xl xl:text-5xl font-black text-slate-900">{category.totalQuantity.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 10: Bold Accent (Dark) */}
                    <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">10. Bold Accent (Dark)</span>
                        </div>
                        <div className="group bg-slate-900 rounded-[32px] p-8 flex flex-col sm:flex-row items-center justify-between min-h-[200px] transition-all hover:bg-slate-950 hover:shadow-2xl hover:shadow-pink-500/20 cursor-pointer overflow-hidden relative">
                            {/* Accent Glow */}
                            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-pink-500/20 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-center gap-8 relative z-10 w-full sm:w-auto">
                                <div className="w-24 h-24 rounded-[32px] bg-slate-800 text-pink-500 flex items-center justify-center border border-slate-700/50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    <IconComponent className="w-12 h-12 stroke-[1.5]" />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-white  mb-2">{category.name}</h3>
                                    <div className="flex gap-3">
                                        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">{category.itemCount} SKU</span>
                                        {category.children.slice(0, 2).map(child => (
                                            <span key={child.id} className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-semibold hidden sm:block">{child.name}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-end gap-8 mt-8 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="text-left sm:text-right">
                                    <span className="block text-xs font-bold text-slate-400 uppercase  mb-2 shadow-sm">Количество на складе</span>
                                    <span className="block text-6xl font-black text-white tabular-nums">{category.totalQuantity.toLocaleString()}</span>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-pink-500 text-white flex items-center justify-center group-hover:bg-pink-400 transition-colors">
                                    <ChevronRight className="w-8 h-8" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 11: Apple Glass */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">11. Apple Glass</span>
                        </div>
                        <div className="group relative rounded-[40px] p-8 flex flex-col items-center text-center min-h-[400px] transition-all cursor-pointer overflow-hidden backdrop-blur-2xl bg-white/40 border border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]">
                            {/* Abstract colorful blob behind glass */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10 w-20 h-20 rounded-full bg-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.05)] border border-white flex items-center justify-center text-pink-500 mb-6 backdrop-blur-md">
                                <IconComponent className="w-10 h-10 stroke-[1.5]" />
                            </div>
                            <h3 className="relative z-10 text-3xl font-semibold text-slate-800  mb-2">{category.name}</h3>
                            <p className="relative z-10 text-sm font-medium text-slate-500 mb-6">{category.itemCount} SKU Active</p>

                            <div className="relative z-10 flex flex-wrap justify-center gap-2 mb-8">
                                {category.children.map(child => (
                                    <span key={child.id} className="px-3 py-1 bg-white/50 border border-white rounded-full text-xs font-medium text-slate-600 backdrop-blur-sm">{child.name}</span>
                                ))}
                            </div>

                            <div className="relative z-10 mt-auto flex flex-col items-center">
                                <span className="text-6xl font-light text-slate-900 ">{category.totalQuantity.toLocaleString()}</span>
                                <span className="text-xs font-semibold uppercase  text-slate-400 mt-2">Inventory</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 12: Cyberpunk Neon */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">12. Cyberpunk Neon</span>
                        </div>
                        <div className="group bg-slate-950 rounded-none border border-slate-800 p-8 flex flex-col min-h-[400px] transition-all hover:border-pink-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-slate-800 group-hover:bg-pink-500 transition-colors shadow-[0_0_15px_rgba(236,72,153,0)] group-hover:shadow-[0_0_15px_rgba(236,72,153,0.8)]" />

                            <div className="pl-6">
                                <div className="text-pink-500 mb-6 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] opacity-70 group-hover:opacity-100 transition-opacity">
                                    <IconComponent className="w-12 h-12 stroke-[1.5]" />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase  mb-2 font-mono drop-shadow-md">{category.name}</h3>
                                <p className="text-xs text-pink-400/70 font-mono mb-8">&gt; SYS.SKU_COUNT: {category.itemCount}</p>

                                <div className="flex flex-col gap-3 mb-8">
                                    {category.children.map(child => (
                                        <div key={child.id} className="text-xs font-mono text-slate-400 flex items-center gap-3">
                                            <span className="w-4 h-px bg-pink-500/50" />
                                            {child.name}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-auto border-t border-slate-800/50 pt-6 group-hover:border-pink-500/30 transition-colors">
                                    <span className="block text/[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-2">QTY.DATA_STREAM</span>
                                    <span className="block text-5xl font-black text-white font-mono drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">{category.totalQuantity.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 13: Eco Organic */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">13. Eco Organic</span>
                        </div>
                        <div className="group bg-[#F4F1EA] rounded-[60px] p-8 flex flex-col items-center text-center min-h-[400px] transition-all hover:bg-[#EBE7DF] cursor-pointer">
                            <div className="w-20 h-20 rounded-[30px] bg-[#E1DCCF] flex items-center justify-center text-[#5C6B5D] mb-6 shadow-sm">
                                <IconComponent className="w-9 h-9 stroke-[1.5]" />
                            </div>
                            <h3 className="text-3xl font-serif text-[#3E4A3F] mb-3">{category.name}</h3>
                            <p className="text-sm text-[#8A857A] mb-8 italic">{category.itemCount} items curated</p>

                            <div className="flex flex-wrap justify-center gap-2 mb-8">
                                {category.children.map(child => (
                                    <span key={child.id} className="px-4 py-1.5 bg-white/50 rounded-full text-xs font-medium text-[#5C6B5D]">{child.name}</span>
                                ))}
                            </div>

                            <div className="mt-auto flex flex-col items-center relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[#D5D0C3] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700 ease-out" />
                                <span className="text-sm font-medium text-[#8A857A] uppercase  mb-2 relative z-10">Stock</span>
                                <span className="text-5xl font-light text-[#3E4A3F] relative z-10">{category.totalQuantity.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 14: Brutalist Retro */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">14. Brutalist Retro</span>
                        </div>
                        <div className="group bg-white border-4 border-black shadow-[8px_8px_0_0_#000000] p-6 flex flex-col min-h-[400px] transition-all hover:shadow-[12px_12px_0_0_#ec4899] hover:-translate-y-1 hover:-translate-x-1 cursor-pointer">
                            <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-6">
                                <h3 className="text-4xl font-black text-black uppercase">{category.name}</h3>
                                <div className="w-14 h-14 bg-pink-400 border-4 border-black flex items-center justify-center text-black shadow-[4px_4px_0_0_#000000]">
                                    <IconComponent className="w-7 h-7 stroke-[2]" />
                                </div>
                            </div>

                            <div className="bg-yellow-300 border-4 border-black p-3 font-bold text-black uppercase text-sm mb-6 inline-block self-start shadow-[4px_4px_0_0_#000000]">
                                {category.itemCount} SKU Active
                            </div>

                            <div className="flex flex-col gap-2 mb-8">
                                {category.children.map(child => (
                                    <div key={child.id} className="border-2 border-black p-2 font-bold text-xs uppercase hover:bg-black hover:text-white transition-colors cursor-pointer">
                                        + {child.name}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto bg-black p-4 text-white">
                                <span className="block text-xs font-bold uppercase  mb-1 text-pink-400">Total Count</span>
                                <span className="block text-5xl font-black tabular-nums">{category.totalQuantity.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 15: Soft Clay / Inner Shadow */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">15. Soft Clay</span>
                        </div>
                        <div className="group bg-[#f2f4f8] rounded-[48px] p-8 flex flex-col items-center text-center min-h-[400px] transition-all shadow-[8px_8px_16px_rgba(165,177,198,0.4),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[inset_4px_4px_8px_rgba(165,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,1)] cursor-pointer border border-[#ffffff]">
                            <div className="w-24 h-24 rounded-[32px] bg-[#f2f4f8] shadow-[8px_8px_16px_rgba(165,177,198,0.4),-8px_-8px_16px_rgba(255,255,255,1)] flex items-center justify-center text-pink-500 mb-8 border border-[#ffffff] group-hover:shadow-[inset_4px_4px_8px_rgba(165,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,1)] transition-all">
                                <IconComponent className="w-10 h-10 stroke-[2]" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-700 mb-3">{category.name}</h3>
                            <div className="px-4 py-1.5 rounded-full bg-[#f2f4f8] shadow-[inset_2px_2px_4px_rgba(165,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,1)] text-sm font-semibold text-slate-500 mb-8">
                                {category.itemCount} SKU
                            </div>

                            <div className="mt-auto w-full">
                                <div className="h-4 w-full bg-[#f2f4f8] shadow-[inset_2px_2px_4px_rgba(165,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,1)] rounded-full mb-6 overflow-hidden">
                                    <div className="h-full bg-pink-400 w-1/2 rounded-full shadow-[2px_0_4px_rgba(0,0,0,0.1)]" />
                                </div>
                                <span className="block text-4xl font-extrabold text-slate-700">{category.totalQuantity.toLocaleString()} <span className="text-base text-slate-400 font-medium">шт.</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 16: Blueprint / Wireframe */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">16. Blueprint / Wireframe</span>
                        </div>
                        <div className="group bg-[#F4F7FF] rounded-2xl border-2 border-dashed border-[#8BA7F0] p-8 flex flex-col min-h-[400px] transition-all hover:bg-[#EDF2FF] hover:border-[#5A85ED] cursor-pointer font-mono text-[#4266C3]">
                            <div className="flex justify-between items-start mb-6">
                                <div className="border border-[#8BA7F0] p-3 text-[#5A85ED]">
                                    <IconComponent className="w-8 h-8 stroke-[1.5]" />
                                </div>
                                <div className="text-right text-xs opacity-70">
                                    <p>OBJ: CATEGORY</p>
                                    <p>ID: {category.name.toUpperCase()}</p>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold uppercase  mb-6 border-b border-[#8BA7F0] pb-2 inline-block self-start">{category.name}</h3>

                            <div className="grid grid-cols-2 gap-4 border-l pl-4 border-[#8BA7F0]">
                                {category.children.map(child => (
                                    <div key={child.id} className="text-xs flex items-center gap-2">
                                        <div className="w-1 h-1 bg-[#5A85ED]" />
                                        {child.name.toUpperCase()}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto pt-8 flex justify-between items-end">
                                <div className="border border-[#8BA7F0] p-4 bg-white/50 w-full flex justify-between items-center group-hover:bg-white transition-colors">
                                    <span className="text-xs uppercase font-bold ">Data: QTY</span>
                                    <span className="text-3xl font-light tabular-nums">{category.totalQuantity.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 17: Full Gradient Cover */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">17. Full Gradient Cover</span>
                        </div>
                        <div className="group bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 rounded-[36px] p-8 flex flex-col items-center text-center min-h-[400px] transition-all hover:shadow-[0_20px_40px_-10px_rgba(244,63,94,0.4)] hover:-translate-y-1 cursor-pointer text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                                <IconComponent className="w-64 h-64 -mt-16 -mr-16 stroke-1" />
                            </div>

                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/30 relative z-10">
                                <IconComponent className="w-8 h-8 stroke-2 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold mb-2 relative z-10 text-white drop-shadow-sm">{category.name}</h3>
                            <p className="text-sm font-medium text-white/80 mb-8 relative z-10">{category.itemCount} SKU Active</p>

                            <div className="flex flex-wrap justify-center gap-2 mt-auto mb-8 relative z-10">
                                {category.children.map(child => (
                                    <span key={child.id} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/20">{child.name}</span>
                                ))}
                            </div>

                            <div className="border-t border-white/20 w-full pt-6 relative z-10 flex flex-col items-center">
                                <span className="text-5xl font-black tabular-nums">{category.totalQuantity.toLocaleString()}</span>
                                <span className="text-xs font-semibold uppercase  text-white/70 mt-2">Units in Stock</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 18: Split Color Block */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">18. Split Color Block</span>
                        </div>
                        <div className="group bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-200 flex flex-col min-h-[400px] transition-all hover:shadow-lg cursor-pointer">
                            <div className="h-48 bg-pink-100 flex flex-col items-center justify-center p-8 relative pt-12 group-hover:bg-pink-200 transition-colors">
                                <div className="absolute top-4 left-4 text-xs font-bold text-pink-400 uppercase  bg-pink-50 px-2 py-1 rounded-md">Category</div>
                                <IconComponent className="w-12 h-12 text-pink-500 mb-2 stroke-2" />
                                <h3 className="text-3xl font-black text-pink-900">{category.name}</h3>
                            </div>

                            <div className="flex-1 p-8 flex flex-col bg-white">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-sm text-slate-500 font-medium">Active Items</span>
                                    <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">{category.itemCount}</span>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {category.children.map(child => (
                                        <div key={child.id} className="flex items-center gap-3 text-sm text-slate-600">
                                            <ChevronRight className="w-3 h-3 text-pink-400" />
                                            {child.name}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-4">
                                    <span className="text-sm font-bold text-slate-400">Total Stock</span>
                                    <span className="text-4xl font-extrabold text-slate-900">{category.totalQuantity.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 19: Floating Badge */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">19. Floating Badge</span>
                        </div>
                        <div className="p-4 pt-10 min-h-[400px] flex items-stretch">
                            <div className="group bg-white rounded-3xl w-full border border-slate-200 p-8 pt-12 flex flex-col min-h-full transition-all hover:border-pink-300 cursor-pointer relative shadow-sm hover:shadow-md">
                                {/* Floating Badge Component */}
                                <div className="absolute -top-6 left-8 bg-pink-500 text-white px-6 py-3 rounded-2xl shadow-[0_8px_16px_rgba(236,72,153,0.3)] flex items-center gap-3 group-hover:-translate-y-1 transition-transform">
                                    <IconComponent className="w-5 h-5 stroke-2" />
                                    <span className="font-bold text-lg">{category.name}</span>
                                </div>

                                <div className="mt-4 mb-8">
                                    <div className="flex gap-2">
                                        <span className="text-4xl font-light text-slate-800 tabular-nums">{category.itemCount}</span>
                                        <span className="text-sm text-slate-400 mt-auto pb-1 font-medium leading-tight">Активных<br />SKU</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-8">
                                    {category.children.map(child => (
                                        <div key={child.id} className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-xs text-slate-600 text-center font-medium">
                                            {child.name}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100 group-hover:bg-pink-50 group-hover:border-pink-100 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase  mb-1 group-hover:text-pink-400">В наличии</span>
                                        <span className="text-3xl font-black text-slate-800 group-hover:text-pink-600">{category.totalQuantity.toLocaleString()}</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm group-hover:text-pink-500">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 20: Dark Mode Minimal */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">20. Dark Mode Minimal</span>
                        </div>
                        <div className="group bg-[#0B0F19] rounded-[32px] border border-slate-800 p-8 flex flex-col min-h-[400px] transition-all hover:border-pink-500/50 hover:bg-[#0F1423] cursor-pointer">
                            <div className="flex justify-between items-center mb-8">
                                <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300 group-hover:text-pink-400 group-hover:border-pink-500/30 group-hover:bg-pink-500/10 transition-all">
                                    <IconComponent className="w-6 h-6 stroke-2" />
                                </div>
                                <div className="text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">{category.itemCount} Items</div>
                            </div>

                            <h3 className="text-2xl font-semibold text-slate-100 mb-6 group-hover:text-white transition-colors">{category.name}</h3>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {category.children.map(child => (
                                    <span key={child.id} className="text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">{child.name}</span>
                                ))}
                            </div>

                            <div className="mt-auto border-t border-slate-800 pt-6 flex justify-between items-end">
                                <div>
                                    <span className="block text-sm text-slate-500 mb-1">Total Quantity</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-light text-white tabular-nums ">{category.totalQuantity.toLocaleString()}</span>
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 21: Neo brutalism (Pop Art) */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">21. Neo-brutalism Pop</span>
                        </div>
                        <div className="bg-[#f0f0f0] border-4 border-black p-8 flex flex-col items-center text-center min-h-[400px] transition-all hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0_0_#000] shadow-[8px_8px_0_0_#000] cursor-pointer group">
                            <div className="w-24 h-24 rounded-full bg-pink-400 border-4 border-black flex items-center justify-center text-black mb-6 shadow-[4px_4px_0_0_#000] group-hover:bg-yellow-400 transition-colors">
                                <IconComponent className="w-12 h-12 stroke-[2.5]" />
                            </div>
                            <h3 className="text-4xl font-black text-black uppercase  mb-2">{category.name}</h3>
                            <div className="bg-white border-2 border-black px-4 py-1 text-sm font-bold uppercase shadow-[2px_2px_0_0_#000] mb-8">
                                {category.itemCount} SKU Active
                            </div>

                            <div className="flex flex-wrap justify-center gap-2 mb-8">
                                {category.children.map(child => (
                                    <span key={child.id} className="px-3 py-1 bg-cyan-300 border-2 border-black text-xs font-black uppercase text-black shadow-[2px_2px_0_0_#000]">{child.name}</span>
                                ))}
                            </div>

                            <div className="mt-auto w-full bg-white border-4 border-black p-4 flex flex-col items-center shadow-[4px_4px_0_0_#000]">
                                <span className="text-xl font-black uppercase text-pink-500 mb-1">Stock</span>
                                <span className="text-6xl font-black text-black">{category.totalQuantity.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 22: Frosted Metallic */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">22. Frosted Metallic</span>
                        </div>
                        <div className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-[32px] p-8 flex flex-col items-center text-center min-h-[400px] transition-all hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] cursor-pointer border border-slate-700 shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />

                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_8px_16px_rgba(0,0,0,0.4)] flex items-center justify-center text-pink-400 mb-6 relative z-10 group-hover:text-pink-300 transition-colors">
                                <IconComponent className="w-10 h-10 stroke-[1.5]" />
                            </div>
                            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-2 relative z-10">{category.name}</h3>
                            <p className="text-sm text-slate-400 mb-8 relative z-10 font-medium">{category.itemCount} Items</p>

                            <div className="flex flex-wrap justify-center gap-2 mb-8 relative z-10">
                                {category.children.map(child => (
                                    <span key={child.id} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">{child.name}</span>
                                ))}
                            </div>

                            <div className="mt-auto flex flex-col items-center relative z-10 w-full pt-6 border-t border-slate-700/50">
                                <span className="text-5xl font-light text-white drop-shadow-md">{category.totalQuantity.toLocaleString()}</span>
                                <span className="text-[10px] font-bold uppercase  text-slate-500 mt-2">Inventory Count</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 23: Classic OS (Windows 95 style) */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">23. Classic OS / Win95</span>
                        </div>
                        <div className="group bg-[#c0c0c0] p-1 flex flex-col min-h-[400px] border-t-white border-l-white border-b-[#808080] border-r-[#808080] border-2 cursor-default">
                            {/* Title Bar */}
                            <div className="bg-[#000080] text-white px-2 py-1 flex items-center gap-2 font-bold text-sm">
                                <IconComponent className="w-4 h-4" />
                                Category_{category.name}.exe
                            </div>

                            <div className="p-4 flex flex-col flex-1 border-t-[#808080] border-l-[#808080] border-b-white border-r-white border-2 mt-2 bg-white">
                                <div className="flex items-start gap-4 mb-6">
                                    <IconComponent className="w-12 h-12 text-[#ff0080]" />
                                    <div>
                                        <h3 className="text-2xl font-bold text-black font-sans">{category.name}</h3>
                                        <p className="text-sm text-black font-sans">{category.itemCount} items installed</p>
                                    </div>
                                </div>

                                <div className="border border-black p-2 bg-[#c0c0c0] mb-6 shadow-[inset_-1px_-1px_#fff,inset_1px_1px_#808080]">
                                    <p className="text-xs mb-2">Sub-directories:</p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        {category.children.map(child => (
                                            <li key={child.id}>{child.name}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-auto flex justify-between items-center">
                                    <span className="text-sm font-sans">Total Size:</span>
                                    <span className="border border-black px-4 py-1 bg-[#c0c0c0] shadow-[inset_-1px_-1px_#fff,inset_1px_1px_#808080] text-xl font-bold font-mono">
                                        {category.totalQuantity.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 24: B&W Typography Focus */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">24. B&amp;W Typography</span>
                        </div>
                        <div className="group bg-white p-8 flex flex-col min-h-[400px] transition-all hover:bg-black hover:text-white cursor-pointer border border-black">
                            <div className="flex justify-between items-baseline mb-8 border-b-4 border-black group-hover:border-white pb-4 transition-colors">
                                <h3 className="text-4xl font-black uppercase ">{category.name}</h3>
                                <span className="text-2xl font-black">.{category.itemCount}</span>
                            </div>

                            <div className="flex flex-col gap-1 mb-12">
                                {category.children.map(child => (
                                    <div key={child.id} className="text-lg font-bold uppercase overflow-hidden">
                                        <div className="translate-y-0 group-hover:translate-y-0 transition-transform">{child.name}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <span className="block text-sm font-bold uppercase  mb-2 opacity-50">Stock Volume</span>
                                <span className="block text-8xl font-black  tabular-nums leading-none">{category.totalQuantity.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 25: Depth / 3D Bevel */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">25. 3D Bevel Depth</span>
                        </div>
                        <div className="group bg-slate-100 rounded-3xl p-8 flex flex-col items-center text-center min-h-[400px] transition-all cursor-pointer shadow-[inset_0_-8px_16px_rgba(0,0,0,0.1),0_16px_32px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_-4px_8px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] hover:translate-y-1">
                            <div className="w-24 h-24 rounded-full bg-white shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_-4px_8px_rgba(0,0,0,0.05)] flex items-center justify-center text-pink-500 mb-8 mt-2 group-hover:scale-95 transition-transform">
                                <IconComponent className="w-12 h-12 stroke-[2]" />
                            </div>

                            <div className="bg-white px-8 py-4 rounded-2xl shadow-[0_4px_8px_rgba(0,0,0,0.05)] w-full mb-6">
                                <h3 className="text-3xl font-extrabold text-slate-800 mb-1">{category.name}</h3>
                                <p className="text-sm font-bold text-slate-400">{category.itemCount} SKU Active</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2 mb-auto">
                                {category.children.map(child => (
                                    <span key={child.id} className="px-3 py-1.5 bg-slate-200 rounded-lg shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.05)] text-xs font-bold text-slate-600">{child.name}</span>
                                ))}
                            </div>

                            <div className="mt-8 bg-gradient-to-b from-white to-slate-50 w-full rounded-2xl p-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_8px_16px_rgba(0,0,0,0.05)]">
                                <span className="block text-xs font-black uppercase text-pink-400  mb-1">Total Stock</span>
                                <span className="block text-5xl font-black text-slate-800">{category.totalQuantity.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 26: Paper Cutout */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">26. Paper Cutout</span>
                        </div>
                        <div className="group bg-[#FAF9F6] rounded-[40px] p-8 flex flex-col items-center text-center min-h-[400px] transition-all cursor-pointer shadow-sm border border-slate-200 overflow-hidden relative">
                            {/* Layer 1 */}
                            <div className="absolute top-0 right-0 w-full h-full bg-pink-50 rounded-bl-[100px] shadow-[inset_4px_-4px_12px_rgba(0,0,0,0.05)] transition-transform group-hover:scale-105" />
                            {/* Layer 2 */}
                            <div className="absolute top-0 right-0 w-4/5 h-4/5 bg-pink-100 rounded-bl-[100px] shadow-[inset_4px_-4px_12px_rgba(0,0,0,0.05)] transition-transform group-hover:scale-110" />
                            {/* Layer 3 */}
                            <div className="absolute top-0 right-0 w-3/5 h-3/5 bg-pink-500 rounded-bl-[100px] shadow-[inset_4px_-4px_12px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-110" />

                            <div className="relative z-10 w-20 h-20 rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex items-center justify-center text-pink-500 mb-8 self-start ml-4 mt-4">
                                <IconComponent className="w-10 h-10 stroke-2" />
                            </div>

                            <div className="relative z-10 w-full text-left pl-6 mt-8">
                                <h3 className="text-4xl font-black text-slate-800 mb-2">{category.name}</h3>
                                <p className="text-sm font-bold text-slate-400 mb-6">{category.itemCount} SKU Active</p>

                                <div className="flex flex-col gap-2 mb-8">
                                    {category.children.map(child => (
                                        <span key={child.id} className="text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-xl self-start shadow-[0_2px_8px_rgba(0,0,0,0.04)]">{child.name}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto relative z-10 bg-white w-[calc(100%+64px)] -mx-8 -mb-8 p-6 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] flex justify-between items-end border-t border-slate-100">
                                <div className="text-left">
                                    <span className="block text-xs font-bold text-slate-400 uppercase  mb-1">Inventory</span>
                                    <span className="block text-4xl font-black text-slate-800">{category.totalQuantity.toLocaleString()}</span>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center">
                                    <ChevronRight className="w-6 h-6 stroke-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 27: Glass Floating (Vibrant) */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">27. Glass Floating</span>
                        </div>
                        <div className="group bg-slate-50 rounded-[48px] p-8 flex flex-col items-center text-center min-h-[400px] transition-all cursor-pointer relative overflow-hidden flex items-center justify-center border border-slate-200/60">
                            {/* Inner glowing orb */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-400 rounded-full blur-[40px] opacity-40 group-hover:scale-150 transition-transform duration-700 group-hover:opacity-60" />

                            {/* Glass Card */}
                            <div className="relative z-10 w-full bg-white/60 backdrop-blur-xl border border-white rounded-[32px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.05)] group-hover:shadow-[0_16px_48px_rgba(236,72,153,0.15)] group-hover:-translate-y-2 transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-pink-500 mx-auto mb-4 border border-white/80">
                                    <IconComponent className="w-8 h-8 stroke-2" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-1">{category.name}</h3>
                                <p className="text-xs font-bold bg-white/50 text-slate-500 px-3 py-1 rounded-full inline-block mb-4">{category.itemCount} Items</p>

                                <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                                    {category.children.map(child => (
                                        <span key={child.id} className="text-[10px] font-bold text-slate-600 bg-white/40 px-2 py-1 rounded-md">{child.name}</span>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-slate-200/50">
                                    <span className="block text-4xl font-black text-slate-800">{category.totalQuantity.toLocaleString()}</span>
                                    <span className="block text-[10px] font-bold uppercase  text-slate-400 mt-1">Total Stock</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 28: Isometric Grid */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">28. Isometric Grid</span>
                        </div>
                        <div className="group bg-white border border-slate-200 p-8 flex flex-col min-h-[400px] transition-all cursor-pointer relative overflow-hidden"
                            style={{ backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                        >
                            <div className="relative z-10 bg-white/90 p-4 border border-slate-200 shadow-md inline-flex self-start mb-8 group-hover:scale-105 transition-transform group-hover:border-pink-300">
                                <IconComponent className="w-10 h-10 text-pink-500" />
                            </div>

                            <div className="relative z-10 bg-white border border-slate-200 p-4 shadow-sm mb-4 group-hover:shadow-md transition-shadow">
                                <h3 className="text-3xl font-black text-slate-900 mb-1">{category.name}</h3>
                                <p className="text-sm font-mono text-slate-500">Vol: {category.itemCount} SKU</p>
                            </div>

                            <div className="relative z-10 grid grid-cols-2 gap-2 mb-auto">
                                {category.children.map(child => (
                                    <div key={child.id} className="bg-slate-50 border border-slate-200 p-2 text-xs font-medium text-slate-600">
                                        {child.name}
                                    </div>
                                ))}
                            </div>

                            <div className="relative z-10 bg-pink-500 text-white p-6 border-b-4 border-pink-700 mt-8 shadow-lg group-hover:-translate-y-1 transition-transform">
                                <span className="block text-xs font-mono opacity-80 mb-2">OUTPUT_QTY</span>
                                <span className="block text-5xl font-black ">{category.totalQuantity.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 29: Sunset Gradient Blur */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">29. Sunset Gradient</span>
                        </div>
                        <div className="group rounded-[32px] p-8 flex flex-col items-center text-center min-h-[400px] transition-all cursor-pointer relative overflow-hidden text-white shadow-lg bg-orange-400">
                            {/* Animated Gradients */}
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_0%,_#f43f5e_0%,_transparent_50%),radial-gradient(circle_at_100%_100%,_#ec4899_0%,_transparent_50%),radial-gradient(circle_at_0%_100%,_#f97316_0%,_transparent_50%)] opacity-80 group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 backdrop-blur-[2px]" />

                            <div className="relative z-10 w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6 border border-white/30 shadow-[0_8px_16px_rgba(0,0,0,0.1)]">
                                <IconComponent className="w-10 h-10 stroke-[2]" />
                            </div>

                            <h3 className="relative z-10 text-4xl font-bold mb-2  drop-shadow-sm">{category.name}</h3>
                            <p className="relative z-10 text-sm font-medium text-white/90 mb-8">{category.itemCount} SKU Active</p>

                            <div className="relative z-10 flex flex-col w-full gap-2 mb-auto">
                                {category.children.map(child => (
                                    <div key={child.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-sm font-medium flex justify-between items-center group-hover:bg-white/20 transition-colors">
                                        {child.name}
                                        <ChevronRight className="w-4 h-4 opacity-50" />
                                    </div>
                                ))}
                            </div>

                            <div className="relative z-10 mt-8 w-full">
                                <span className="block text-6xl font-black  drop-shadow-md">{category.totalQuantity.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 30: Holographic Foil */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">30. Holographic Foil</span>
                        </div>
                        <div className="group rounded-[40px] p-[2px] min-h-[400px] transition-all cursor-pointer relative overflow-hidden bg-gradient-to-br from-purple-400 via-pink-300 to-cyan-300 shadow-md hover:shadow-xl hover:-translate-y-1">
                            {/* Holographic inner content */}
                            <div className="bg-white/90 backdrop-blur-3xl w-full h-full rounded-[38px] p-8 flex flex-col">
                                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-300/20 via-pink-300/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[38px]" />

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white shadow-lg overflow-hidden relative">
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite]" />
                                        <IconComponent className="w-8 h-8 stroke-2 relative z-10" />
                                    </div>
                                    <div className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">{category.itemCount} Items</div>
                                </div>

                                <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-6 relative z-10">{category.name}</h3>

                                <div className="flex flex-wrap gap-2 mb-auto relative z-10">
                                    {category.children.map(child => (
                                        <span key={child.id} className="text-xs font-bold text-slate-700 bg-slate-100/80 px-3 py-1.5 rounded-[10px]">{child.name}</span>
                                    ))}
                                </div>

                                <div className="mt-8 relative z-10 flex items-end justify-between">
                                    <div>
                                        <span className="block text-[11px] font-black uppercase text-slate-400  mb-1">Stock</span>
                                        <span className="block text-5xl font-black text-slate-800 tabular-nums">{category.totalQuantity.toLocaleString()}</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-gradient-to-br group-hover:from-pink-400 group-hover:to-purple-500 group-hover:text-white transition-all shadow-sm">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 31: Bento Grid Minimal */}
                    <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-2">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">31. Bento Minimal</span>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 group cursor-pointer h-[400px]">
                            {/* Main Info */}
                            <div className="col-span-2 bg-white rounded-[32px] p-6 border border-slate-200 flex flex-col justify-between transition-all hover:border-pink-300 hover:shadow-md h-full">
                                <div className="flex justify-between items-start">
                                    <div className="w-16 h-16 rounded-[20px] bg-pink-50 text-pink-500 flex items-center justify-center">
                                        <IconComponent className="w-8 h-8 stroke-2" />
                                    </div>
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500">Category</span>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-900 mb-1">{category.name}</h3>
                                    <p className="text-slate-500 font-medium">{category.itemCount} SKU Active</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="col-span-1 flex flex-col gap-4 h-full">
                                <div className="bg-pink-500 rounded-[32px] p-6 text-white flex-1 flex flex-col justify-end transition-all hover:bg-pink-400 hover:shadow-lg hover:-translate-y-1">
                                    <span className="text-xs font-bold uppercase  opacity-80 mb-1">Stock</span>
                                    <span className="text-4xl lg:text-5xl font-black leading-none">{category.totalQuantity.toLocaleString()}</span>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-6 flex items-center justify-center transition-all hover:bg-slate-100 group-hover:border-slate-300">
                                    <ChevronRight className="w-8 h-8 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                </div>
                            </div>

                            {/* Subcategories (spanning bottom if needed, currently fits in 3x2 grid if we adjusted rows) */}
                        </div>
                    </div>

                    {/* Variant 32: Bento Dark Mode Accent */}
                    <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-2">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">32. Bento Dark Accent</span>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 group cursor-pointer h-[400px]">
                            <div className="col-span-2 bg-slate-900 rounded-3xl p-8 flex flex-col justify-between border border-slate-800 transition-all hover:border-pink-500/50 hover:bg-slate-950">
                                <h3 className="text-4xl font-black text-white">{category.name}</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {category.children.map(child => (
                                        <span key={child.id} className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs">{child.name}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-1 bg-pink-100 rounded-3xl p-6 flex flex-col items-center justify-center text-pink-600 transition-all hover:bg-pink-200">
                                <IconComponent className="w-16 h-16 stroke-2 mb-4" />
                                <span className="font-bold">{category.itemCount} SKU</span>
                            </div>
                            <div className="col-span-3 bg-white border border-slate-200 rounded-3xl p-6 flex justify-between items-center transition-all hover:border-slate-300">
                                <div>
                                    <span className="text-xs text-slate-400 uppercase font-bold ">Total Inventory</span>
                                    <div className="text-4xl font-black text-slate-900">{category.totalQuantity.toLocaleString()}</div>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <ChevronRight className="w-5 h-5 text-slate-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 33: Bento Asymmetric */}
                    <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-2">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">33. Bento Asymmetric</span>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-4 group cursor-pointer h-auto lg:h-[400px]">
                            {/* Left Pillar */}
                            <div className="w-full lg:w-1/3 flex flex-col gap-4">
                                <div className="bg-pink-50 text-pink-600 rounded-[32px] p-8 flex-1 flex flex-col items-center justify-center border border-pink-100 transition-all hover:bg-pink-100 hover:scale-[1.02]">
                                    <IconComponent className="w-16 h-16 stroke-[1.5]" />
                                </div>
                                <div className="bg-slate-900 text-white rounded-[32px] p-6 transition-all hover:bg-slate-800">
                                    <span className="text-sm font-medium text-slate-400">Items</span>
                                    <div className="text-3xl font-bold">{category.itemCount}</div>
                                </div>
                            </div>
                            {/* Right Pillar */}
                            <div className="w-full lg:w-2/3 bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col justify-between transition-all hover:shadow-lg">
                                <div>
                                    <h3 className="text-5xl font-black text-slate-900 mb-4 ">{category.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {category.children.map(child => (
                                            <span key={child.id} className="text-sm font-semibold text-slate-500 bg-slate-100 px-4 py-1.5 rounded-xl">{child.name}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-end mt-12 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-black  mb-1">In Stock</p>
                                        <p className="text-5xl font-black text-pink-500 leading-none">{category.totalQuantity.toLocaleString()}</p>
                                    </div>
                                    <ChevronRight className="w-8 h-8 text-slate-300 group-hover:text-pink-500 transition-colors group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 34: Bento Glassmorphism */}
                    <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">34. Bento Glassmorphism</span>
                        </div>
                        <div className="group relative rounded-[40px] p-4 flex flex-col sm:flex-row gap-4 h-auto min-h-[300px] cursor-pointer bg-slate-100/50 border border-slate-200/50 backdrop-blur-3xl overflow-hidden">
                            <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-br from-pink-300/30 via-transparent to-purple-300/30 blur-3xl opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="w-full sm:w-1/3 bg-white/70 backdrop-blur-xl border border-white rounded-[32px] p-6 shadow-sm flex flex-col justify-center items-center text-center relative z-10 transition-transform group-hover:scale-[1.02]">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-pink-500/20">
                                    <IconComponent className="w-10 h-10 stroke-2" />
                                </div>
                                <h3 className="text-3xl font-extrabold text-slate-800">{category.name}</h3>
                            </div>

                            <div className="w-full sm:w-2/3 flex flex-col gap-4 relative z-10">
                                <div className="flex gap-4 h-1/2">
                                    <div className="w-1/2 bg-white/60 backdrop-blur-xl border border-white rounded-[32px] p-6 shadow-sm flex flex-col justify-end transition-all hover:bg-white/80">
                                        <span className="text-xs text-slate-500 uppercase font-black mb-1">SKU Types</span>
                                        <span className="text-4xl font-black text-slate-800">{category.itemCount}</span>
                                    </div>
                                    <div className="w-1/2 bg-white/60 backdrop-blur-xl border border-white rounded-[32px] p-6 shadow-sm flex flex-col justify-end transition-all hover:bg-white/80">
                                        <span className="text-xs text-slate-500 uppercase font-black mb-1">Total Stock</span>
                                        <span className="text-4xl font-black text-pink-500">{category.totalQuantity.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="h-1/2 bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-[32px] p-6 flex items-center justify-between text-white transition-all hover:bg-slate-900">
                                    <div className="flex gap-2 flex-wrap">
                                        {category.children.map(child => (
                                            <span key={child.id} className="text-sm font-medium bg-slate-800 px-3 py-1 rounded-full">{child.name}</span>
                                        ))}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <ChevronRight className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 35: Bento Soft Pastel */}
                    <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-2">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">35. Bento Soft Pastel</span>
                        </div>
                        <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[400px] group cursor-pointer bg-white p-3 rounded-[40px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(236,72,153,0.1)] transition-shadow">
                            <div className="bg-pink-50 rounded-[28px] p-6 flex flex-col items-start justify-between border border-pink-100/50 transition-colors group-hover:bg-pink-100/50">
                                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center text-pink-500 shadow-sm">
                                    <IconComponent className="w-7 h-7 stroke-[2]" />
                                </div>
                                <div>
                                    <span className="text-sm text-pink-400 font-bold uppercase ">Category</span>
                                    <h3 className="text-3xl font-black text-pink-900 leading-tight">{category.name}</h3>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-[28px] p-6 flex flex-col justify-end border border-slate-100 transition-colors group-hover:bg-slate-100/50">
                                <span className="text-xs text-slate-400 font-bold uppercase mb-1">SKU Count</span>
                                <span className="text-5xl font-extrabold text-slate-700">{category.itemCount}</span>
                            </div>
                            <div className="col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-[28px] p-8 flex justify-between items-center text-white relative overflow-hidden group-hover:-translate-y-1 transition-transform">
                                {/* Soft glow inside dark card */}
                                <div className="absolute right-0 top-0 w-32 h-32 bg-pink-500/20 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />

                                <div>
                                    <span className="text-xs text-slate-400 font-bold uppercase  mb-2 block">Available Inventory</span>
                                    <span className="text-5xl font-black tabular-nums">{category.totalQuantity.toLocaleString()}</span>
                                </div>
                                <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-colors">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 36: Bento Outline / Brutalist */}
                    <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-1">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">36. Bento Outline</span>
                        </div>
                        <div className="flex flex-col gap-4 h-[400px] group cursor-pointer w-full">
                            <div className="flex gap-4 h-1/2">
                                <div className="w-1/2 bg-white border-2 border-slate-900 rounded-3xl p-6 flex flex-col items-center justify-center transition-all hover:bg-slate-900 hover:text-white hover:shadow-[4px_4px_0_0_#ec4899]">
                                    <IconComponent className="w-12 h-12 stroke-[1.5] mb-2" />
                                    <h3 className="text-2xl font-black uppercase ">{category.name}</h3>
                                </div>
                                <div className="w-1/2 bg-pink-400 border-2 border-slate-900 rounded-3xl p-6 flex flex-col justify-center text-slate-900 transition-all shadow-[4px_4px_0_0_#0f172a] hover:translate-y-1 hover:shadow-none">
                                    <span className="text-xs font-black uppercase border-b-2 border-slate-900/20 pb-1 mb-2">Active SKU</span>
                                    <span className="text-4xl font-black text-slate-900">{category.itemCount}</span>
                                </div>
                            </div>
                            <div className="h-1/2 bg-white border-2 border-slate-900 rounded-3xl p-6 flex flex-col justify-between transition-all hover:border-pink-500">
                                <div className="flex flex-wrap gap-2">
                                    {category.children.map(child => (
                                        <span key={child.id} className="border border-dashed border-slate-400 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{child.name}</span>
                                    ))}
                                </div>
                                <div className="flex justify-between items-end border-t-2 border-slate-900 pt-4">
                                    <div>
                                        <span className="text-xs font-black text-slate-500 uppercase">Stock</span>
                                        <div className="text-4xl font-black">{category.totalQuantity.toLocaleString()}</div>
                                    </div>
                                    <ChevronRight className="w-8 h-8 text-black group-hover:text-pink-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 37: Bento Neo-Corporate */}
                    <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-2">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">37. Bento Corporate</span>
                        </div>
                        <div className="p-2 bg-slate-100 rounded-[32px] border border-slate-200/60 shadow-inner group cursor-pointer min-h-[400px] flex gap-2 w-full transition-all hover:shadow-[inset_0_4px_12px_rgba(0,0,0,0.05)]">
                            <div className="w-[45%] bg-white rounded-[28px] p-8 flex flex-col justify-between shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow">
                                <div>
                                    <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 mb-6">
                                        <IconComponent className="w-6 h-6 stroke-[1.5]" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-slate-900 mb-2">{category.name}</h3>
                                    <p className="text-sm font-medium text-slate-500">Inventory Classification</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/60">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-slate-500">Utilization</span>
                                        <span className="text-xs font-bold text-slate-900">84%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="w-[84%] h-full bg-slate-800 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-2">
                                <div className="h-1/2 flex gap-2">
                                    <div className="flex-1 bg-white rounded-[28px] p-6 shadow-sm border border-slate-100 flex flex-col justify-center items-center group-hover:bg-slate-900 group-hover:text-white transition-colors duration-500">
                                        <span className="text-sm font-semibold opacity-70 mb-1">SKUs</span>
                                        <span className="text-4xl font-bold tabular-nums">{category.itemCount}</span>
                                    </div>
                                    <div className="flex-1 bg-pink-50 rounded-[28px] p-6 shadow-sm border border-pink-100/50 flex flex-col justify-center items-center text-pink-700 group-hover:bg-pink-100 transition-colors">
                                        <span className="text-sm font-semibold opacity-70 mb-1">Stock</span>
                                        <span className="text-4xl font-bold tabular-nums">{category.totalQuantity}</span>
                                    </div>
                                </div>
                                <div className="h-1/2 bg-white rounded-[28px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between group-hover:shadow-md transition-shadow">
                                    <span className="text-xs font-semibold uppercase  text-slate-400">Sub-categories</span>
                                    <div className="flex flex-wrap gap-2">
                                        {category.children.map(child => (
                                            <span key={child.id} className="text-sm text-slate-700 bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">{child.name}</span>
                                        ))}
                                    </div>
                                    <span className="text-xs text-pink-500 font-semibold cursor-pointer flex items-center gap-1 mt-2">
                                        View Details <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 38: Bento Pure White Layers */}
                    <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-1">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">38. Bento Pure White</span>
                        </div>
                        <div className="group h-[400px] flex flex-col gap-4 cursor-pointer">
                            <div className="h-[45%] bg-white rounded-[32px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-center transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-800 mb-3 group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                                    <IconComponent className="w-6 h-6 stroke-2" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">{category.name}</h3>
                            </div>
                            <div className="h-[55%] flex gap-4">
                                <div className="w-1/2 bg-white rounded-[32px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 delay-75">
                                    <span className="text-xs font-semibold text-slate-400">SKU</span>
                                    <span className="text-4xl font-light text-slate-800">{category.itemCount}</span>
                                </div>
                                <div className="w-1/2 bg-slate-900 rounded-[32px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col justify-between text-white transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:bg-black delay-150">
                                    <span className="text-xs font-semibold text-slate-400">STOCK</span>
                                    <span className="text-4xl font-bold">{category.totalQuantity}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant 39: Bento Monochromatic Tech */}
                    <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-2">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">39. Bento Monochrome Tech</span>
                        </div>
                        <div className="h-[400px] p-2 bg-slate-900 rounded-[32px] font-mono grid grid-cols-5 gap-2 group cursor-pointer hover:bg-black transition-colors">
                            {/* Main Title Block */}
                            <div className="col-span-3 bg-slate-800 rounded-[24px] p-6 flex flex-col justify-between border border-slate-700 group-hover:border-slate-600 transition-colors">
                                <div className="flex justify-between items-start text-emerald-400">
                                    <IconComponent className="w-8 h-8 stroke-1" />
                                    <span className="text-xs border border-emerald-400/30 px-2 py-0.5 rounded-full">ACTIVE</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">ID: CTG_{category.name.toUpperCase()}</p>
                                    <h3 className="text-4xl font-bold text-slate-100 ">{category.name}</h3>
                                </div>
                            </div>

                            {/* SKU Block */}
                            <div className="col-span-2 bg-slate-800/80 rounded-[24px] p-6 flex flex-col justify-end border border-slate-700 relative overflow-hidden group-hover:bg-slate-800 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <IconComponent className="w-24 h-24" />
                                </div>
                                <span className="text-xs text-slate-400 mb-2">MODELS_FOUND</span>
                                <span className="text-5xl font-light text-slate-200">{category.itemCount}</span>
                            </div>

                            {/* Subcategories (spanning 3 cols) */}
                            <div className="col-span-3 bg-slate-800/50 rounded-[24px] p-6 border border-slate-700 flex flex-col justify-center">
                                <span className="text-[10px] text-slate-500 mb-3 uppercase">Available partitions</span>
                                <div className="flex gap-2 flex-wrap">
                                    {category.children.map(child => (
                                        <span key={child.id} className="text-xs text-slate-300 bg-slate-700/50 px-3 py-1.5 rounded-md border border-slate-600">{child.name}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Total Stock */}
                            <div className="col-span-2 bg-emerald-900/30 rounded-[24px] py-4 px-6 border border-emerald-900 flex flex-col justify-center items-center text-center group-hover:bg-emerald-900/50 group-hover:border-emerald-500/50 transition-colors">
                                <span className="text-xs text-emerald-500 mb-2 block w-full border-b border-emerald-900/50 pb-2">TOTAL_UNITS</span>
                                <span className="text-4xl font-bold text-emerald-400">{category.totalQuantity}</span>
                            </div>
                        </div>
                    </div>

                    {/* Variant 40: Bento Interactive Tiles */}
                    <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 inline-flex self-start">
                            <span className="font-bold text-slate-700">40. Bento Interactive Tiles</span>
                        </div>
                        <div className="bg-white p-4 rounded-[40px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] min-h-[400px] flex flex-col md:flex-row gap-4 w-full group cursor-pointer">
                            {/* Focus Tile */}
                            <div className="flex-1 md:w-1/2 bg-slate-900 rounded-[32px] p-8 flex flex-col justify-between text-white transition-all duration-500 hover:w-[55%] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-slate-950 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-6 relative z-10">
                                    <IconComponent className="w-8 h-8 stroke-2" />
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-5xl font-black mb-4 ">{category.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium border border-white/10 backdrop-blur-sm">{category.itemCount} SKU Active</span>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Tiles */}
                            <div className="flex-1 md:w-1/2 grid grid-cols-2 grid-rows-2 gap-4 transition-all duration-500">
                                {/* Top Left */}
                                <div className="bg-pink-50 rounded-[32px] p-6 flex flex-col justify-center items-center text-center transition-all hover:bg-pink-100 hover:scale-[1.03] border border-pink-100/50">
                                    <span className="text-xs font-bold text-pink-400 uppercase  mb-2">Total</span>
                                    <span className="text-4xl lg:text-5xl font-black text-pink-600 tabular-nums leading-none">{category.totalQuantity}</span>
                                </div>
                                {/* Top Right */}
                                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 flex flex-col justify-center transition-all hover:bg-slate-100 hover:scale-[1.03]">
                                    <span className="text-xs font-bold text-slate-400 uppercase  mb-3">Types</span>
                                    <div className="flex flex-col gap-2">
                                        {category.children.slice(0, 2).map((child, i) => (
                                            <div key={child.id} className="text-sm font-semibold text-slate-700 w-full truncate">
                                                {i + 1}. {child.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Bottom Row Spanning */}
                                <div className="col-span-2 bg-white border border-slate-200 shadow-sm rounded-[32px] p-6 flex justify-between items-center transition-all hover:shadow-md hover:border-slate-300 group/btn">
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg">Manage Category</p>
                                        <p className="text-sm text-slate-500">View detailed analytics</p>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center transition-transform group-hover/btn:scale-110 shadow-lg shadow-slate-900/20">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
