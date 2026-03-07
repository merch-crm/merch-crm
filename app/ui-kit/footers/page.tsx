"use client";

import React from "react";
import Link from "next/link";
import {
    Mail, Phone, MapPin,
    Twitter, Github, Linkedin, Instagram,
    Shield, Globe, CheckCircle2,
    ArrowRight, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FootersUIKit() {
    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <header className="bg-white border-b border-slate-200 py-4 px-6 mb-8 sticky top-0 z-50 shadow-sm">
                <div className="max-w-[1480px] mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Footer Variants UI Kit</h1>
                        <p className="text-sm text-slate-500">10 концептов для подвала CRM (Light Theme, Premium Apple/Linear Style)</p>
                    </div>
                    <Link href="/ui-kit">
                        <Button variant="outline">Вернуться в UI Kit</Button>
                    </Link>
                </div>
            </header>

            <div className="max-w-[1480px] mx-auto flex flex-col gap-12">

                {/* Variant 1 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">1. Minimalist Line</h2>
                    <div className="bg-white border-t border-slate-200 py-6 px-8 flex items-center justify-between shadow-sm">
                        <p className="text-sm font-medium text-slate-500">© 2026 MerchCRM. Все права защищены.</p>
                        <div className="flex items-center gap-6">
                            <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Политика конфиденциальности</Link>
                            <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Условия использования</Link>
                            <div className="w-px h-4 bg-slate-200"></div>
                            <Link href="#" className="text-sm font-bold flex items-center gap-2 text-slate-600 hover:text-primary transition-colors">
                                <Globe className="w-4 h-4" /> RU
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Variant 2 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">2. Centered Brand & Social</h2>
                    <div className="bg-white border-t border-slate-200 py-12 px-8 flex flex-col items-center justify-center shadow-sm">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-lg mb-6 shadow-md">M.</div>
                        <nav className="flex items-center gap-8 mb-8">
                            <Link href="#" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">О платформе</Link>
                            <Link href="#" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Тарифы</Link>
                            <Link href="#" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Документация</Link>
                            <Link href="#" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Поддержка</Link>
                        </nav>
                        <div className="flex items-center gap-4 mb-8">
                            <a href="#" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all"><Twitter className="w-5 h-5" /></a>
                            <a href="#" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all"><Github className="w-5 h-5" /></a>
                            <a href="#" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all"><Linkedin className="w-5 h-5" /></a>
                        </div>
                        <p className="text-sm text-slate-400 font-medium">Сделано с <Heart className="w-4 h-4 text-rose-500 inline-block mx-1" /> в Москве</p>
                    </div>
                </section>

                {/* Variant 3 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">3. System Status Integrated</h2>
                    <div className="bg-white border-y border-slate-200 py-4 px-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-bold text-emerald-700">Все системы работают (Uptime 99.9%)</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded-md">v 2.4.1</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <Link href="#" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider">Документация API</Link>
                            <Link href="#" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider">Поддержка</Link>
                            <Link href="#" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider">Changelog</Link>
                        </div>
                    </div>
                </section>

                {/* Variant 4 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">4. Corporate Multi-Column</h2>
                    <div className="bg-white border-t border-slate-200 pt-16 pb-8 px-12 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 mb-16">
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-2 mb-6 text-slate-900 font-black tracking-tighter text-2xl uppercase">Merch<span className="text-indigo-600">.</span></div>
                                <p className="text-slate-500 font-medium leading-relaxed mb-6 max-w-sm text-sm">Мы помогаем современным компаниям автоматизировать производство, склад и продажи через единую экосистему.</p>
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="icon" className="rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50"><Twitter className="w-4 h-4" /></Button>
                                    <Button variant="outline" size="icon" className="rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50"><Linkedin className="w-4 h-4" /></Button>
                                    <Button variant="outline" size="icon" className="rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50"><Instagram className="w-4 h-4" /></Button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 mb-5">Продукт</h4>
                                <ul className="space-y-3">
                                    <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">Возможности</Link></li>
                                    <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">Интеграции</Link></li>
                                    <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">Цены</Link></li>
                                    <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">Обновления (Changelog)</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-5">Ресурсы</h4>
                                <ul className="space-y-3">
                                    <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">Документация (Help)</Link></li>
                                    <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">API Reference</Link></li>
                                    <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">Блог</Link></li>
                                    <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">Сообщество</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-5">Контакты</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-slate-500 font-medium"><MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> 123456, г. Москва, ул. Примерная, 10, оф. 45</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-500 font-medium"><Mail className="w-4 h-4 text-slate-400 shrink-0" /> support@merchcrm.ru</li>
                                    <li className="flex items-center gap-3 text-sm text-slate-500 font-medium"><Phone className="w-4 h-4 text-slate-400 shrink-0" /> +7 (495) 123-45-67</li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-slate-400 font-medium">&copy; 2026 ООО &quot;Мерч Системс&quot;. Все права защищены.</p>
                            <div className="flex gap-6">
                                <Link href="#" className="text-sm text-slate-400 font-medium hover:text-slate-900">Политика конфиденциальности</Link>
                                <Link href="#" className="text-sm text-slate-400 font-medium hover:text-slate-900">Оферта</Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Variant 5 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">5. Action-Oriented (Lead Gen)</h2>
                    <div className="bg-white border-t border-slate-200 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.05)]">
                        {/* Top Action Area */}
                        <div className="py-16 px-12 bg-indigo-600 flex flex-col items-center text-center">
                            <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">Готовы масштабировать производство?</h3>
                            <p className="text-indigo-100 mb-8 max-w-xl text-sm md:text-base font-medium">Присоединяйтесь к тысячам компаний, которые уже используют MerchCRM для управления заказами и складом.</p>
                            <div className="flex items-center gap-3 flex-col sm:flex-row w-full justify-center">
                                <Input placeholder="Ваш Email адрес..." className="h-12 w-full sm:w-80 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/30 font-medium px-4" />
                                <Button size="lg" className="h-12 rounded-xl bg-white text-indigo-600 hover:bg-slate-50 font-bold px-8 shadow-sm whitespace-nowrap w-full sm:w-auto">Начать бесплатно</Button>
                            </div>
                        </div>

                        {/* Regular Footer */}
                        <div className="py-8 px-12 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xl tracking-tight">MerchCRM</div>
                            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2">
                                <Link href="#" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">О нас</Link>
                                <Link href="#" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Блог</Link>
                                <Link href="#" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Контакт</Link>
                                <Link href="#" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Партнерам</Link>
                            </nav>
                            <p className="text-sm text-slate-400 font-semibold">© 2026 Merch</p>
                        </div>
                    </div>
                </section>

                {/* Variant 6 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">6. Compact High-Density (Apple Style)</h2>
                    <div className="bg-[#FBFBFD] border-t border-slate-200 py-6 px-10">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-xs font-semibold text-[#86868B]">
                                <span>Защищенное соединение (SSL)</span>
                                <div className="w-px h-3 bg-[#D2D2D7]"></div>
                                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> ISO 27001 Сертифицировано</span>
                            </div>

                            <div className="flex items-center divide-x divide-[#D2D2D7] text-[#515154] text-xs font-semibold">
                                <Link href="#" className="px-3 hover:text-slate-900 transition-colors">Условия продажи</Link>
                                <Link href="#" className="px-3 hover:text-slate-900 transition-colors">Юридическая информация</Link>
                                <Link href="#" className="px-3 hover:text-slate-900 transition-colors">Карта сайта</Link>
                                <span className="pl-3 text-[#86868B] select-none">M-CRM 1.0.4</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Variant 7 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">7. Grid Layout Details</h2>
                    <div className="bg-white border-t border-b-4 border-b-indigo-500 border-x-0 border-t-slate-200 py-10 px-12">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <h5 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-4">Навигация</h5>
                                <ul className="space-y-2">
                                    <li><Link href="#" className="text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-900 px-2 py-1 -ml-2 rounded transition-colors inline-block font-medium">Главная панель</Link></li>
                                    <li><Link href="#" className="text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-900 px-2 py-1 -ml-2 rounded transition-colors inline-block font-medium">База заказов</Link></li>
                                    <li><Link href="#" className="text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-900 px-2 py-1 -ml-2 rounded transition-colors inline-block font-medium">Финансы</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-4">Система</h5>
                                <ul className="space-y-2">
                                    <li><Link href="#" className="text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-900 px-2 py-1 -ml-2 rounded transition-colors inline-block font-medium">Настройки компании</Link></li>
                                    <li><Link href="#" className="text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-900 px-2 py-1 -ml-2 rounded transition-colors inline-block font-medium">Сотрудники и права</Link></li>
                                    <li><Link href="#" className="text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-900 px-2 py-1 -ml-2 rounded transition-colors inline-block font-medium">Логи активности</Link></li>
                                </ul>
                            </div>
                            <div className="col-span-2 md:border-l md:border-slate-100 md:pl-8">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h5 className="font-black text-slate-900 mb-2">Нужна помощь с настройкой?</h5>
                                    <p className="text-sm text-slate-500 font-medium mb-4">Наша команда технической поддержки готова помочь вам интегрировать систему в ваши процессы.</p>
                                    <Button className="w-fit font-bold rounded-lg shadow-sm" variant="outline">Связаться с поддержкой <ArrowRight className="w-4 h-4 ml-2" /></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Variant 8 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">8. Dark Contrast Mode</h2>
                    <div className="bg-[#0A0A0A] text-white pt-16 pb-8 px-12 rounded-tr-3xl shrink-0 mt-8">
                        <div className="flex flex-col md:flex-row justify-between gap-12 border-b border-white/10 pb-12 mb-8">
                            <div className="max-w-md">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl"></div>
                                    <span className="text-2xl font-black tracking-tighter">NexusCRM</span>
                                </div>
                                <p className="text-[#888888] font-medium leading-relaxed">
                                    Мощная платформа для управления мерчем. От дизайна до доставки – все в одном месте.
                                </p>
                            </div>

                            <div className="flex gap-16 pr-8">
                                <div>
                                    <h5 className="font-bold text-white mb-4">Решения</h5>
                                    <ul className="space-y-3">
                                        <li><a href="#" className="text-[#888888] hover:text-white transition-colors text-sm font-medium">Агентствам</a></li>
                                        <li><a href="#" className="text-[#888888] hover:text-white transition-colors text-sm font-medium">Производствам</a></li>
                                        <li><a href="#" className="text-[#888888] hover:text-white transition-colors text-sm font-medium">Брендам</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-white mb-4">Компания</h5>
                                    <ul className="space-y-3">
                                        <li><a href="#" className="text-[#888888] hover:text-white transition-colors text-sm font-medium">О нас</a></li>
                                        <li><a href="#" className="text-[#888888] hover:text-white transition-colors text-sm font-medium">Карьера</a></li>
                                        <li><a href="#" className="text-[#888888] hover:text-white transition-colors text-sm font-medium">Контакты</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[#666666] text-xs font-medium">
                            <p>© 2026 Nexus Systems Inc.</p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                                <a href="#" className="hover:text-white transition-colors">Terms</a>
                                <a href="#" className="hover:text-white transition-colors">Cookies</a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Variant 9 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">9. Glassmorphism Floating (App Style)</h2>
                    <div className="relative h-[200px] bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center rounded-2xl mx-6 overflow-hidden flex items-end justify-center pb-6">
                        {/* Simulated Content Background */}
                        <div className="absolute inset-0 bg-slate-100/30 backdrop-blur-[2px]"></div>

                        {/* Floating Glass Footer */}
                        <div className="relative w-[90%] bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/80 rounded-xl shadow-sm flex items-center justify-center text-slate-800 font-black">A.</div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-bold text-slate-800">AquaSystem</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Internal Tool</p>
                                </div>
                            </div>

                            <nav className="flex items-center gap-2">
                                <button className="px-4 py-2 bg-white/50 hover:bg-white text-slate-700 font-bold text-xs rounded-lg transition-all shadow-sm">Help</button>
                                <button className="px-4 py-2 bg-white/50 hover:bg-white text-slate-700 font-bold text-xs rounded-lg transition-all shadow-sm">Report Bug</button>
                                <button className="w-10 h-10 bg-slate-800 text-white rounded-lg flex items-center justify-center hover:bg-slate-700 transition-all shadow-md"><ArrowRight className="w-4 h-4" /></button>
                            </nav>
                        </div>
                    </div>
                </section>

                {/* Variant 10 */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-6">10. Very Minimal Utility Bar</h2>
                    <div className="bg-slate-100 border-t border-slate-200 h-10 flex items-center justify-between px-6 mx-6 rounded-t-[10px] mt-6">
                        <div className="flex items-center gap-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                            <span>M-CRM VER. 4.0.0</span>
                            <div className="w-px h-3 bg-slate-300"></div>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> SYSTEM ONLINE</span>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                            <Link href="#" className="hover:text-slate-700 transition-colors">Privacy</Link>
                            <Link href="#" className="hover:text-slate-700 transition-colors">Terms</Link>
                            <Link href="#" className="hover:text-slate-700 transition-colors">Support</Link>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
