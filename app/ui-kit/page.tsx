'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Layers, Palette, Sparkles, Package, LayoutGrid } from 'lucide-react';
import { componentRegistry, categories, getComponentsByCategory } from './lib/component-registry';
import { ComponentSection } from './components/ComponentSection';
import { Input } from '@/components/ui/input';

const categoryIcons: Record<string, React.ReactNode> = {
    layout: <LayoutGrid className="w-3.5 h-3.5" />,
    primitives: <Sparkles className="w-3.5 h-3.5" />,
    forms: <Package className="w-3.5 h-3.5" />,
    navigation: <Layers className="w-3.5 h-3.5" />,
    'data-display': <Palette className="w-3.5 h-3.5" />,
    feedback: <Sparkles className="w-3.5 h-3.5" />,
};

export default function UIKitPage() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filteredComponents = useMemo(() => {
        let list = componentRegistry;

        if (activeCategory) {
            list = list.filter(c => c.category === activeCategory);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q) ||
                c.variants.some(v =>
                    v.name.toLowerCase().includes(q) ||
                    (v.description ?? '').toLowerCase().includes(q)
                )
            );
        }

        return list;
    }, [search, activeCategory]);

    const totalVariants = componentRegistry.reduce((acc, c) => acc + c.variants.length, 0);

    return (
        <div className="min-h-screen bg-slate-50/80">
            {/* ============================
                Header
            ============================ */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-5 py-3.5">
                    <div className="flex items-center justify-between gap-4">
                        {/* Logo + Title */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <div className="w-px h-5 bg-slate-200" />
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center">
                                    <Palette className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-sm font-black text-slate-900 leading-none">MerchCRM UI Kit</h1>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                                        {componentRegistry.length} компонентов · {totalVariants} вариантов
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Поиск..."
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex max-w-[1600px] mx-auto">
                {/* ============================
                    Sidebar
                ============================ */}
                <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 min-h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
                    <nav className="p-4 space-y-1">
                        {/* All */}
                        <button
                            onClick={() => { setActiveCategory(null); setSearch(''); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeCategory === null && !search
                                    ? 'bg-primary/8 text-primary'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5" />
                                <span>Все компоненты</span>
                            </div>
                            <span className="text-xs text-slate-400">{componentRegistry.length}</span>
                        </button>

                        <div className="h-px bg-slate-100 my-3" />

                        {/* Categories */}
                        {categories.map((category) => {
                            const components = getComponentsByCategory(category.id);
                            if (components.length === 0) return null;
                            const isActive = activeCategory === category.id;

                            return (
                                <div key={category.id}>
                                    <button
                                        onClick={() => setActiveCategory(isActive ? null : category.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-colors mb-1 ${isActive
                                                ? 'bg-primary/8 text-primary'
                                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {categoryIcons[category.id]}
                                            <span>{category.name}</span>
                                        </div>
                                        <span className="text-xs text-slate-400">{components.length}</span>
                                    </button>

                                    {/* Component links */}
                                    {isActive && (
                                        <div className="pl-5 space-y-0.5 mb-2">
                                            {components.map((comp) => (
                                                <a
                                                    key={comp.id}
                                                    href={`#${comp.id}`}
                                                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-primary transition-colors"
                                                >
                                                    <span>{comp.name}</span>
                                                    <span className="text-slate-300">{comp.variants.length}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 mt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Design System · MerchCRM<br />
                            <span className="text-slate-300">Автоматически синхронизирован с кодом</span>
                        </p>
                    </div>
                </aside>

                {/* ============================
                    Main Content
                ============================ */}
                <main className="flex-1 min-w-0 p-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Hero stats (only when not filtering) */}
                        {!activeCategory && !search && (
                            <div className="mb-10">
                                <div className="mb-4">
                                    <h2 className="text-3xl font-black text-slate-900 leading-tight">Design System</h2>
                                    <p className="text-slate-400 mt-1">Компоненты MerchCRM — синхронизированы с реальным кодом</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                                    {[
                                        { label: 'Компонентов', value: componentRegistry.length, color: 'bg-primary/10 text-primary' },
                                        { label: 'Вариантов', value: totalVariants, color: 'bg-emerald-100 text-emerald-700' },
                                        { label: 'Категорий', value: categories.length, color: 'bg-amber-100 text-amber-700' },
                                        {
                                            label: 'CSS vars',
                                            value: componentRegistry.reduce((a, c) => a + c.variants.reduce((b, v) => b + v.cssProperties.length, 0), 0),
                                            color: 'bg-violet-100 text-violet-700',
                                        },
                                    ].map((stat) => (
                                        <div key={stat.label} className="crm-card crm-card--compact">
                                            <div className={`text-3xl font-black mb-1 ${stat.color.split(' ')[1]}`}>{stat.value}</div>
                                            <div className="text-xs font-medium text-slate-500">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-px bg-gradient-to-r from-primary/20 via-slate-200 to-slate-100" />
                            </div>
                        )}

                        {/* Search result info */}
                        {(search || activeCategory) && (
                            <div className="mb-6 flex items-center gap-3">
                                <span className="text-sm text-slate-500">
                                    {search && <><strong className="text-slate-700">&ldquo;{search}&rdquo;</strong> · </>}
                                    {filteredComponents.length} компонентов
                                </span>
                                <button
                                    onClick={() => { setSearch(''); setActiveCategory(null); }}
                                    className="text-xs text-primary hover:underline font-medium"
                                >
                                    Сбросить
                                </button>
                            </div>
                        )}

                        {/* Components */}
                        {filteredComponents.length > 0 ? (
                            filteredComponents.map((component) => (
                                <ComponentSection key={component.id} component={component} />
                            ))
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-slate-500 font-medium">Компоненты не найдены</p>
                                <p className="text-slate-400 text-sm mt-1">Попробуйте другой запрос</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
