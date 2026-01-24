"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, User, ShoppingCart, Package, Book, CheckCircle2, Command, Tag, Layout, MapPin, CreditCard, Folder, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { globalSearch } from "@/app/dashboard/search-actions";

import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
    id: string;
    type: "order" | "client" | "item" | "user" | "task" | "promocode" | "wiki" | "page" | "location" | "expense" | "category";
    title: string;
    subtitle?: string | null;
    href: string;
}

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleOpenEvent = () => setOpen(true);
        window.addEventListener("open-command-menu", handleOpenEvent);

        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", down);
        return () => {
            window.removeEventListener("open-command-menu", handleOpenEvent);
            document.removeEventListener("keydown", down);
        };
    }, []);

    const handleSearch = useCallback(async (val: string) => {
        setQuery(val);
        if (val.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        const res = await globalSearch(val);
        setResults(res.data || []);
        setLoading(false);
    }, []);

    const onSelect = (href: string) => {
        router.push(href);
        setOpen(false);
        setQuery("");
        setResults([]);
    };

    const icons = {
        client: <User className="w-4 h-4 text-emerald-500" />,
        order: <ShoppingCart className="w-4 h-4 text-amber-500" />,
        item: <Package className="w-4 h-4 text-[#5d00ff]" />,
        user: <User className="w-4 h-4 text-blue-500" />,
        task: <CheckCircle2 className="w-4 h-4 text-rose-500" />,
        wiki: <Book className="w-4 h-4 text-slate-500" />,
        promocode: <Tag className="w-4 h-4 text-orange-500" />,
        page: <Layout className="w-4 h-4 text-indigo-500" />,
        location: <MapPin className="w-4 h-4 text-rose-400" />,
        expense: <CreditCard className="w-4 h-4 text-red-500" />,
        category: <Folder className="w-4 h-4 text-amber-400" />
    };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden"
                        >
                            <div className="flex items-center px-6 py-4 border-b border-slate-100">
                                <Search className="w-5 h-5 text-slate-400 mr-4" />
                                <input
                                    autoFocus
                                    placeholder="Поиск по клиентам, заказам, складу..."
                                    className="flex-1 bg-transparent border-none outline-none text-slate-900 text-lg placeholder:text-slate-400"
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-[18px] bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-400">
                                        <Command className="w-3 h-3" />
                                        <span>K</span>
                                    </div>
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-2">
                                {loading && (
                                    <div className="px-6 py-12 text-center text-slate-400 text-sm">Поиск...</div>
                                )}

                                {!loading && results.length === 0 && query.length >= 2 && (
                                    <div className="px-6 py-12 text-center text-slate-400 text-sm">Ничего не найдено</div>
                                )}

                                {!loading && results.length === 0 && query.length < 2 && (
                                    <div className="p-4">
                                        <div className="text-[10px] font-bold text-slate-400 px-4 mb-2">Быстрый переход</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { label: 'Заказы', href: '/dashboard/orders', icon: icons.order },
                                                { label: 'Клиенты', href: '/dashboard/clients', icon: icons.client },
                                                { label: 'Склад', href: '/dashboard/warehouse', icon: icons.item },
                                                { label: 'База знаний', href: '/dashboard/knowledge-base', icon: icons.wiki },
                                            ].map(item => (
                                                <button
                                                    key={item.href}
                                                    onClick={() => onSelect(item.href)}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-[18px] hover:bg-slate-50 transition-all text-sm font-bold text-slate-700"
                                                >
                                                    {item.icon}
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    {results.map((res) => (
                                        <button
                                            key={`${res.type}-${res.id}`}
                                            onClick={() => onSelect(res.href)}
                                            className="w-full flex items-center justify-between px-4 py-3 rounded-[18px] hover:bg-slate-50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-[18px] bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
                                                    {icons[res.type as keyof typeof icons]}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-slate-900 leading-tight">{res.title}</div>
                                                    <div className="text-[11px] text-slate-400 font-medium">{res.subtitle}</div>
                                                </div>
                                            </div>
                                            <div className="px-2 py-1 rounded-lg bg-slate-100 text-[9px] font-bold text-slate-400 group-hover:bg-[#5d00ff]/5 group-hover:text-[#5d00ff] transition-colors">
                                                {res.type === 'item' ? 'Товар' :
                                                    res.type === 'order' ? 'Заказ' :
                                                        res.type === 'client' ? 'Клиент' :
                                                            res.type === 'user' ? 'Сотрудник' :
                                                                res.type === 'task' ? 'Задача' :
                                                                    res.type === 'promocode' ? 'Промокод' :
                                                                        res.type === 'wiki' ? 'База знаний' :
                                                                            res.type === 'location' ? 'Локация' :
                                                                                res.type === 'expense' ? 'Расход' :
                                                                                    res.type === 'category' ? 'Категория' : 'Раздел'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
