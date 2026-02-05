"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Package, User, Database, Users, CheckCircle2, X, ArrowRight } from "lucide-react";
import { globalSearch, SearchResult } from "@/app/(main)/dashboard/search-actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function MobileSearchSheet() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleSearch = useCallback(async (val: string) => {
        if (val.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const res = await globalSearch(val);
        setResults(res.data);
        setLoading(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) handleSearch(query);
            else setResults([]);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, handleSearch]);

    useEffect(() => {
        const handleOpenSearch = () => {
            setIsOpen(true);
            // Focus input after animation
            setTimeout(() => inputRef.current?.focus(), 100);
        };
        window.addEventListener("open-global-search", handleOpenSearch);
        return () => window.removeEventListener("open-global-search", handleOpenSearch);
    }, []);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const getIcon = (type: SearchResult["type"]) => {
        switch (type) {
            case "order": return <Package className="w-5 h-5" />;
            case "client": return <User className="w-5 h-5" />;
            case "item": return <Database className="w-5 h-5" />;
            case "user": return <Users className="w-5 h-5" />;
            case "task": return <CheckCircle2 className="w-5 h-5" />;
        }
    };

    const getTypeLabel = (type: SearchResult["type"]) => {
        switch (type) {
            case "order": return "Заказ";
            case "client": return "Клиент";
            case "item": return "Товар";
            case "user": return "Сотрудник";
            case "task": return "Задача";
        }
    };

    const handleSelect = (result: SearchResult) => {
        router.push(result.href);
        setIsOpen(false);
        setQuery("");
        setResults([]);
    };

    const handleClose = () => {
        setIsOpen(false);
        setQuery("");
        setResults([]);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
                    />

                    {/* Search Curtain */}
                    <motion.div
                        initial={{ y: "-100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-100%", opacity: 0 }}
                        transition={{
                            duration: 0.5,
                            ease: [0.16, 1, 0.3, 1],
                            opacity: { duration: 0.2 }
                        }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 1, bottom: 0.1 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y < -50 || info.velocity.y < -300) {
                                handleClose();
                            }
                        }}
                        className="fixed top-0 left-0 w-full h-[70vh] rounded-b-[2.5rem] bg-white shadow-2xl z-[201] overflow-hidden flex flex-col"
                    >
                        {/* Pull Indicator */}
                        <div className="flex justify-center pt-4 pb-2">
                            <div className="w-12 h-1 bg-slate-100 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-6 pb-4 shrink-0">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Поиск</h2>
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-full bg-slate-100/50 text-slate-400 active:scale-95 transition-transform"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Поиск заказов, клиентов, товаров..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 bg-slate-100/50 border border-slate-200/50 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-white transition-all"
                                />
                                {query && (
                                    <button
                                        onClick={() => setQuery("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-200/50 text-slate-400"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results List */}
                        <div className="flex-1 overflow-y-auto px-4 pb-8">
                            {loading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
                                </div>
                            )}

                            {!loading && query.length < 2 && (
                                <div className="py-16 text-center flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-slate-100/50 rounded-full flex items-center justify-center mb-4">
                                        <Search className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h4 className="text-slate-900 font-black mb-2">Начните поиск</h4>
                                    <p className="text-sm text-slate-400 max-w-[240px] leading-relaxed">
                                        Введите минимум 2 символа для поиска по заказам, клиентам и товарам
                                    </p>
                                </div>
                            )}

                            {!loading && query.length >= 2 && results.length === 0 && (
                                <div className="py-16 text-center flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-slate-100/50 rounded-full flex items-center justify-center mb-4">
                                        <Search className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h4 className="text-slate-900 font-black mb-2">Ничего не найдено</h4>
                                    <p className="text-sm text-slate-400 max-w-[240px] leading-relaxed">
                                        Попробуйте изменить запрос
                                    </p>
                                </div>
                            )}

                            {!loading && results.length > 0 && (
                                <div className="space-y-2">
                                    {results.map((result) => (
                                        <button
                                            key={`${result.type}-${result.id}`}
                                            onClick={() => handleSelect(result)}
                                            className="w-full flex items-center gap-4 p-4 bg-slate-50/50 hover:bg-slate-100/50 active:scale-[0.98] rounded-2xl transition-all text-left"
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                                result.type === 'order' ? 'bg-indigo-100 text-indigo-600' :
                                                    result.type === 'client' ? 'bg-emerald-100 text-emerald-600' :
                                                        result.type === 'item' ? 'bg-amber-100 text-amber-600' :
                                                            result.type === 'user' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-rose-100 text-rose-600'
                                            )}>
                                                {getIcon(result.type)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-black text-slate-900 text-[15px] truncate">{result.title}</span>
                                                    <span className="text-[10px] font-bold tracking-normal text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md shrink-0">
                                                        {getTypeLabel(result.type)}
                                                    </span>
                                                </div>
                                                {result.subtitle && (
                                                    <p className="text-sm text-slate-500 truncate">{result.subtitle}</p>
                                                )}
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-slate-300 shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
