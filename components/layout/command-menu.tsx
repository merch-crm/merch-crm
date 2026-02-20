"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, User, ShoppingCart, Package, Book, CheckCircle2, Tag, Layout, MapPin, CreditCard, Folder, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { globalSearch } from "@/app/(main)/dashboard/search-actions";
import { Button } from "@/components/ui/button";

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
        if (res.success && res.data) {
            setResults(res.data);
        } else {
            setResults([]);
        }
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
        item: <Package className="w-4 h-4 text-primary" />,
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" data-dialog-open="true">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: -20 }}
                            transition={{
                                duration: 0.4,
                                ease: [0.23, 1, 0.32, 1]
                            }}
                            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.3)] border border-slate-200 overflow-hidden"
                        >
                            <div className="flex items-center px-6 py-5 border-b border-slate-200 bg-slate-50/30">
                                <Search className="w-5 h-5 text-slate-400 mr-4" />
                                <input
                                    autoFocus
                                    placeholder="Поиск по клиентам, заказам, складу..."
                                    className="flex-1 bg-transparent border-none outline-none text-slate-900 text-lg placeholder:text-slate-400 font-medium"
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                <div className="flex items-center gap-2">

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setOpen(false)}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 h-9 w-9"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-3 custom-scrollbar">
                                {loading && (
                                    <div className="px-6 py-12 text-center text-slate-400 text-sm font-bold animate-pulse">Поиск...</div>
                                )}

                                {!loading && (results || []).length === 0 && query.length >= 2 && (
                                    <div className="px-6 py-12 text-center text-slate-400 text-sm font-bold">Ничего не найдено</div>
                                )}

                                {!loading && (results || []).length === 0 && query.length < 2 && (
                                    <div className="p-2">
                                        <div className="text-xs font-black text-slate-400 px-4 mb-3">Быстрый переход</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: 'Заказы', href: '/dashboard/orders', icon: icons.order },
                                                { label: 'Клиенты', href: '/dashboard/clients', icon: icons.client },
                                                { label: 'Склад', href: '/dashboard/warehouse', icon: icons.item },
                                                { label: 'База знаний', href: '/dashboard/knowledge-base', icon: icons.wiki },
                                            ].map(item => (
                                                <Button
                                                    key={item.href}
                                                    variant="ghost"
                                                    onClick={() => onSelect(item.href)}
                                                    className="flex items-center justify-start gap-4 px-5 py-4 h-auto rounded-[20px] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 transition-all text-sm font-bold text-slate-700 hover:shadow-md hover:scale-[1.02] active:scale-95 group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                        {item.icon}
                                                    </div>
                                                    {item.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5 pt-1">
                                    {(results || []).map((res) => (
                                        <Button
                                            key={`${res.type}-${res.id}`}
                                            variant="ghost"
                                            onClick={() => onSelect(res.href)}
                                            className="w-full flex items-center justify-between px-4 py-3.5 h-auto rounded-[22px] hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[18px] bg-white border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                                                    {icons[res.type as keyof typeof icons]}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-slate-900 leading-tight whitespace-normal">{res.title}</div>
                                                    <div className="text-[11px] text-slate-400 font-bold mt-0.5">{res.subtitle}</div>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-slate-100 text-xs font-black text-slate-500 tracking-tight group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
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
                                        </Button>
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
