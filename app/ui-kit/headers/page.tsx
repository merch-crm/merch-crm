"use client";

import React from "react";
import Link from "next/link";
import {
    Search, Bell, User, ChevronDown, Plus, Sun,
    MapPin, Command, Home, Box, CreditCard, Settings, LayoutDashboard
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HeadersUIKit() {
    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <header className="bg-white border-b border-slate-200 py-4 px-6 mb-8 sticky top-0 z-50 shadow-sm">
                <div className="max-w-[1480px] mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Header Variants UI Kit</h1>
                        <p className="text-sm text-slate-500">10 концептов для шапки CRM системы (Light Theme, Premium Apple/Linear Style)</p>
                    </div>
                    <Link href="/ui-kit">
                        <Button variant="outline">Вернуться в UI Kit</Button>
                    </Link>
                </div>
            </header>

            <div className="max-w-[1480px] mx-auto flex flex-col gap-3">

                {/* Variant 1 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">1. Minimalist Centered</h2>
                    <div className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
                        <div className="flex items-center gap-2 w-1/3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs">M</div>
                            <span className="font-extrabold text-lg tracking-tight">MerchCRM</span>
                        </div>

                        <nav className="flex items-center justify-center gap-1 w-1/3">
                            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-bold">Дашборд</Button>
                            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-bold">Заказы</Button>
                            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-bold">Финансы</Button>
                            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-bold">Склад</Button>
                        </nav>

                        <div className="flex items-center justify-end gap-3 w-1/3">
                            <Button variant="ghost" size="icon" className="text-slate-500 rounded-full"><Search className="w-5 h-5" /></Button>
                            <div className="relative">
                                <Button variant="ghost" size="icon" className="text-slate-500 rounded-full"><Bell className="w-5 h-5" /></Button>
                                <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                            </div>
                            <div className="w-px h-6 bg-slate-200 mx-2"></div>
                            <Avatar className="w-9 h-9 border border-slate-200 cursor-pointer">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">AM</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </section>

                {/* Variant 2 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">2. Action-Oriented</h2>
                    <div className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs">M</div>
                            </div>
                            <nav className="flex items-center gap-1">
                                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-bold">Главная</Button>
                                <Button variant="ghost" className="text-primary bg-primary/5 hover:bg-primary/10 font-bold">Каталог</Button>
                                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-bold">Отчеты</Button>
                            </nav>
                        </div>

                        <div className="flex-1 max-w-md px-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input placeholder="Поиск клиентов, заказов..." className="w-full pl-9 rounded-full bg-slate-100 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 h-10 transition-all font-medium" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button className="rounded-full shadow-md shadow-primary/20 bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" /> Создать заказ</Button>
                            <div className="w-px h-6 bg-slate-200"></div>
                            <Button variant="ghost" size="icon" className="text-slate-500"><Bell className="w-5 h-5" /></Button>
                            <Avatar className="w-9 h-9 cursor-pointer">
                                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </section>

                {/* Variant 3 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">3. Segmented Navigation</h2>
                    <div className="bg-white border-b border-slate-200 h-16 flex items-center px-6">
                        <div className="flex items-center gap-2 mr-8">
                            <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm">M</div>
                            <span className="font-extrabold text-lg text-slate-800 tracking-tight">Merch</span>
                        </div>

                        <div className="bg-slate-100/80 p-1 rounded-xl flex items-center shadow-inner">
                            <button className="px-4 py-1.5 rounded-lg text-sm font-bold bg-white shadow-sm text-slate-900">Обзор</button>
                            <button className="px-4 py-1.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Операции</button>
                            <button className="px-4 py-1.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Аналитика</button>
                        </div>

                        <div className="flex-1"></div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input placeholder="Поиск..." className="w-52 pl-9 h-9 text-sm rounded-lg border-slate-200 bg-slate-50 focus:bg-white" />
                            </div>

                            <div className="flex flex-col items-end">
                                <span className="text-xs  tracking-wider font-bold text-slate-400">Баланс</span>
                                <span className="text-sm font-black text-slate-900">450 200 ₽</span>
                            </div>

                            <div className="bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors">
                                <User className="w-5 h-5 text-slate-600" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Variant 4 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">4. Breadcrumb Integrated</h2>
                    <div className="bg-white border-b border-slate-200 flex flex-col">
                        <div className="h-14 flex items-center justify-between px-6">
                            <div className="flex items-center gap-3">
                                <div className="font-black text-xl text-slate-900 tracking-tighter  flex items-center gap-1">
                                    <Box className="text-primary w-5 h-5" /> MRCH.
                                </div>
                                <nav className="flex items-center gap-3 border-l border-slate-200 pl-6 h-6">
                                    <span className="text-sm font-bold text-slate-900 cursor-pointer">Дашборд</span>
                                    <span className="text-sm font-bold text-slate-500 hover:text-slate-900 cursor-pointer">Склад</span>
                                    <span className="text-sm font-bold text-slate-500 hover:text-slate-900 cursor-pointer">Заказы</span>
                                </nav>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary rounded-full"><Search className="w-5 h-5" /></Button>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary rounded-full"><Bell className="w-5 h-5" /></Button>
                                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-md flex items-center justify-center font-bold text-xs ml-2 shadow-sm cursor-pointer">LS</div>
                            </div>
                        </div>

                        {/* Secondary Bar / Breadcrumbs */}
                        <div className="h-10 border-t border-slate-100 bg-slate-50/50 flex items-center px-6 gap-2 text-sm text-slate-500">
                            <Home className="w-4 h-4 hover:text-primary cursor-pointer" />
                            <span className="text-slate-300">/</span>
                            <span className="hover:text-slate-900 cursor-pointer font-medium">Склад</span>
                            <span className="text-slate-300">/</span>
                            <span className="font-bold text-slate-900">Управление остатками</span>
                        </div>
                    </div>
                </section>

                {/* Variant 5 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">5. Utility Focused</h2>
                    <div className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-md">
                                    <Box className="w-4 h-4" />
                                </div>
                            </div>

                            <nav className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="font-bold text-slate-600 rounded-full"><LayoutDashboard className="w-4 h-4 mr-2 opacity-50" />Обзор</Button>
                                <Button variant="ghost" size="sm" className="font-bold text-slate-600 rounded-full bg-slate-100/80"><CreditCard className="w-4 h-4 mr-2 opacity-50" />Платежи</Button>
                                <Button variant="ghost" size="sm" className="font-bold text-slate-600 rounded-full"><Settings className="w-4 h-4 mr-2 opacity-50" />Настройки</Button>
                            </nav>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors shadow-sm mr-2">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-bold text-slate-700">Офис Москва</span>
                                <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
                            </div>

                            <div className="w-px h-6 bg-slate-200 mx-1"></div>

                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700 rounded-lg"><Search className="w-5 h-5" /></Button>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700 rounded-lg"><Sun className="w-5 h-5" /></Button>

                            <div className="relative cursor-pointer w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                                <Bell className="w-5 h-5" />
                                <div className="absolute top-2 right-2 flex items-center justify-center min-w-4 h-4 px-1 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-sm">3</div>
                            </div>

                            <Avatar className="w-9 h-9 border border-slate-200 ml-2 shadow-sm">
                                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e" />
                            </Avatar>
                        </div>
                    </div>
                </section>

                {/* Variant 6 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">6. Maximum White Space</h2>
                    <div className="bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] h-20 flex items-center px-8 rounded-b-xl z-10 relative mb-2">
                        <div className="flex-1 flex items-center gap-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-sm transform rotate-45"></div>
                            <span className="font-extrabold text-lg text-slate-900 ml-2 tracking-tighter">CloudCRM</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <nav className="flex gap-3">
                                <span className="text-sm font-bold text-indigo-600 cursor-pointer">Рабочее место</span>
                                <span className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">Задачи</span>
                                <span className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">Команда</span>
                            </nav>

                            <div className="relative group">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                <input type="text" placeholder="Умный поиск..." className="pl-8 py-2 border-b-2 border-slate-100 focus:border-indigo-500 outline-none text-sm font-bold transition-all w-48 focus:w-64 bg-transparent placeholder:text-slate-300 placeholder:font-medium" />
                            </div>

                            <div className="relative">
                                <Avatar className="w-11 h-11 border-[3px] border-white shadow-md cursor-pointer">
                                    <AvatarImage src="https://i.pravatar.cc/150?u=1" />
                                </Avatar>
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Variant 7 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">7. Blue Tinted / Glassmorphism</h2>
                    <div className="bg-sky-50/90 backdrop-blur-2xl border border-sky-100/50 h-16 flex items-center justify-between px-6 shadow-[0_4px_20px_-5px_rgba(14,165,233,0.1)] rounded-2xl mx-6 mt-2">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white shadow-inner"><Box className="w-5 h-5" /></div>
                            <span className="font-black text-xl text-sky-900 drop-shadow-sm">AquaBase</span>
                        </div>

                        <nav className="flex gap-2">
                            <button className="px-5 py-2.5 text-sm font-bold text-sky-900 bg-white/70 shadow-sm rounded-full transition-all border border-sky-100/50">Обзор</button>
                            <button className="px-5 py-2.5 text-sm font-bold text-sky-700 hover:bg-white/50 hover:text-sky-900 rounded-full transition-all border border-transparent hover:border-sky-100/30">Показатели</button>
                            <button className="px-5 py-2.5 text-sm font-bold text-sky-700 hover:bg-white/50 hover:text-sky-900 rounded-full transition-all border border-transparent hover:border-sky-100/30">Сотрудники</button>
                            <button className="px-5 py-2.5 text-sm font-bold text-sky-700 hover:bg-white/50 hover:text-sky-900 rounded-full transition-all border border-transparent hover:border-sky-100/30">Настройки</button>
                        </nav>

                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 rounded-full bg-white text-sky-600 flex items-center justify-center transition-all shadow-sm border border-sky-100 hover:shadow-md hover:scale-105">
                                <Search className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-white text-sky-600 flex items-center justify-center transition-all shadow-sm border border-sky-100 relative hover:shadow-md hover:scale-105">
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                            </button>
                            <div className="h-10 px-3 pr-4 bg-white border border-sky-100 rounded-full flex items-center gap-2 cursor-pointer hover:shadow-sm transition-all ml-2 hover:scale-105">
                                <div className="w-6 h-6 rounded-full bg-sky-100 overflow-hidden ring-1 ring-sky-200 relative">
                                    <Image src="https://i.pravatar.cc/150?u=a" alt="Avatar" fill className="object-cover" />
                                </div>
                                <ChevronDown className="w-3 h-3 text-sky-600" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Variant 8 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6 mt-6">8. Search-Centric</h2>
                    <div className="bg-white border-b border-slate-200 h-16 flex items-center px-6">
                        <div className="flex items-center gap-3 w-1/4">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-md"><Command className="w-4 h-4" /></div>
                            <span className="font-extrabold text-slate-800 tracking-tight">K-SYSTEM</span>
                        </div>

                        <div className="flex-1 flex justify-center flex-col relative w-full items-center">
                            <div className="relative w-full max-w-xl group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <Input
                                    placeholder="Найти заказ, клиента или товар..."
                                    className="w-full pl-11 pr-16 bg-slate-100 hover:bg-slate-50 focus:bg-white border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 h-11 transition-all font-semibold rounded-2xl shadow-inner text-sm"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
                                    <kbd className="px-1.5 py-0.5 border border-slate-200 rounded-md text-xs font-bold font-mono text-slate-500 bg-white shadow-sm">⌘</kbd>
                                    <kbd className="px-1.5 py-0.5 border border-slate-200 rounded-md text-xs font-bold font-mono text-slate-500 bg-white shadow-sm">K</kbd>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-shrink-0 items-center justify-end gap-3 w-1/4">
                            <nav className="flex items-center gap-3 text-sm font-bold mr-4">
                                <span className="text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">Помощь</span>
                            </nav>
                            <div className="w-px h-6 bg-slate-200"></div>
                            <Button variant="ghost" size="icon" className="text-slate-400 rounded-full hover:bg-slate-100"><Bell className="w-5 h-5" /></Button>
                            <Avatar className="w-9 h-9 cursor-pointer border border-slate-200 shadow-sm">
                                <AvatarImage src="https://i.pravatar.cc/150?img=11" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </section>

                {/* Variant 9 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">9. Split Navigation</h2>
                    <div className="bg-white border-b border-slate-200 h-16 flex items-center px-4">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center gap-2 text-slate-900 font-black tracking-tight text-xl ml-2 ">Core.</div>
                            <nav className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                                <button className="px-3 py-1.5 bg-white text-slate-900 rounded-lg shadow-sm font-bold text-sm border border-slate-200/50">Дашборд</button>
                                <button className="px-3 py-1.5 text-slate-500 hover:text-slate-900 rounded-lg font-bold text-sm transition-colors">Заказы</button>
                                <button className="px-3 py-1.5 text-slate-500 hover:text-slate-900 rounded-lg font-bold text-sm transition-colors">Клиенты</button>
                            </nav>
                        </div>

                        <div className="relative mx-4 shadow-sm border border-slate-200 rounded-full h-10 w-48 flex items-center bg-white overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary focus-within:w-72 transition-all duration-300">
                            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Поиск..." className="w-full pl-9 pr-3 h-full outline-none text-sm font-medium bg-transparent" />
                        </div>

                        <div className="flex items-center justify-end flex-1 gap-3">
                            <nav className="flex gap-3">
                                <span className="text-sm font-bold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">Финансы</span>
                                <span className="text-sm font-bold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">Склад</span>
                                <span className="text-sm font-bold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors flex items-center gap-1"><Settings className="w-4 h-4" /> Настройки</span>
                            </nav>
                            <div className="w-px h-6 bg-slate-200"></div>
                            <Avatar className="w-9 h-9 shadow-sm cursor-pointer border border-slate-100">
                                <AvatarImage src="https://i.pravatar.cc/150?img=33" />
                            </Avatar>
                        </div>
                    </div>
                </section>

                {/* Variant 10 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">10. Compact High-Density</h2>
                    <div className="bg-white border-b border-slate-200 h-12 flex items-center justify-between px-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            {/* Favicon style logo */}
                            <div className="w-6 h-6 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-md border-b-2 border-slate-950 flex items-center justify-center text-white text-xs font-black shadow-inner tracking-tighter shadow-slate-900/50">M.</div>

                            <nav className="flex items-center gap-3 text-[12px] font-extrabold tracking-widest ">
                                <span className="text-indigo-600 cursor-pointer">Dashboard</span>
                                <span className="text-slate-400 hover:text-slate-900 cursor-pointer transition-colors">Orders</span>
                                <span className="text-slate-400 hover:text-slate-900 cursor-pointer transition-colors">Inventory</span>
                                <span className="text-slate-400 hover:text-slate-900 cursor-pointer transition-colors">Finance</span>
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    placeholder="Search..."
                                    className="h-7 w-48 pl-8 pr-2 text-xs font-semibold rounded-md bg-slate-100 border-transparent focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                                />
                            </div>

                            <div className="w-px h-5 bg-slate-200"></div>

                            <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 py-1 px-2 rounded-md transition-colors">
                                <Avatar className="w-6 h-6 rounded-md shadow-sm border border-slate-200">
                                    <AvatarImage src="https://i.pravatar.cc/150?img=12" />
                                    <AvatarFallback className="text-xs rounded-md font-bold bg-indigo-50 text-indigo-700">AL</AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-bold text-slate-700">Alex Newman</span>
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
