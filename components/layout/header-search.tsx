"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Package, User, Database, Users, CheckCircle2, FileText, Tag, MapPin, CreditCard, Folder, Layout, BookOpen, Loader2 } from "lucide-react";
import { globalSearch, SearchResult } from "@/app/(main)/dashboard/search-actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { IconType } from "@/components/ui/stat-card";

const typeConfig: Record<string, { icon: IconType; label: string; color: string; bg: string }> = {
    order: { icon: Package, label: "Заказ", color: "text-white", bg: "bg-indigo-500" },
    client: { icon: User, label: "Клиент", color: "text-white", bg: "bg-emerald-500" },
    item: { icon: Database, label: "Товар", color: "text-white", bg: "bg-amber-500" },
    user: { icon: Users, label: "Сотрудник", color: "text-white", bg: "bg-blue-500" },
    task: { icon: CheckCircle2, label: "Задача", color: "text-white", bg: "bg-rose-500" },
    promocode: { icon: Tag, label: "Промокод", color: "text-white", bg: "bg-purple-500" },
    wiki: { icon: BookOpen, label: "Wiki", color: "text-white", bg: "bg-cyan-500" },
    page: { icon: Layout, label: "Раздел", color: "text-white", bg: "bg-slate-700" },
    location: { icon: MapPin, label: "Склад", color: "text-white", bg: "bg-orange-500" },
    expense: { icon: CreditCard, label: "Расход", color: "text-white", bg: "bg-red-500" },
    category: { icon: Folder, label: "Категория", color: "text-white", bg: "bg-teal-500" },
};

export function HeaderSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Debounced search
    const handleSearch = useCallback(async (val: string) => {
        if (val.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await globalSearch(val);
            if (res && res.success && res.data) {
                setResults(res.data);
            } else {
                setResults([]);
            }
        } catch {
            setResults([]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) handleSearch(query);
            else { setResults([]); setLoading(false); }
        }, 300);
        return () => clearTimeout(timer);
    }, [query, handleSearch]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || !results || results?.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : (results?.length ?? 0) - 1));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(results[activeIndex]);
        } else if (e.key === "Escape") {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    const handleSelect = (result: SearchResult) => {
        router.push(result.href);
        setIsOpen(false);
        setQuery("");
        setResults([]);
        setActiveIndex(-1);
    };

    // Group results by type
    const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
    }, {});

    let flatIndex = -1;

    return (
        <div ref={containerRef} className="relative hidden lg:block">
            {/* Search Input */}
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 z-10 pointer-events-none" />
            {loading && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />
            )}
            <input
                ref={inputRef}
                type="text"
                placeholder="Поиск..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                    setActiveIndex(-1);
                }}
                onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
                onKeyDown={handleKeyDown}
                className="h-9 w-80 pl-8 pr-8 text-xs font-semibold rounded-xl bg-slate-50 border-slate-200 hover:border-slate-300 focus:bg-white focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 text-slate-900 border"
            />

            {/* Results Dropdown */}
            {isOpen && query.length >= 2 && (
                <div className="absolute top-full mt-2 w-[420px] -left-5 bg-white rounded-2xl shadow-[0_16px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    {loading && (!results || results?.length === 0) ? (
                        <div className="p-6 flex flex-col items-center gap-3">
                            <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                            <p className="text-xs font-semibold text-slate-400">Ищем...</p>
                        </div>
                    ) : results && results.length > 0 ? (
                        <div className="max-h-[400px] overflow-y-auto py-2">
                            {Object.entries(groupedResults).map(([type, items]) => {
                                const config = typeConfig[type] || { icon: FileText, label: type, color: "text-slate-500", bg: "bg-slate-100" };
                                const itemsArray = items || [];
                                if (itemsArray.length === 0) return null;
                                return (
                                    <div key={type}>
                                        <div className="px-4 pt-3 pb-1">
                                            <span className="text-xs font-bold text-slate-400 tracking-wider">
                                                {config.label}
                                            </span>
                                        </div>
                                        {itemsArray.map((result) => {
                                            flatIndex++;
                                            const currentIndex = flatIndex;
                                            const Icon = config.icon;
                                            return (
                                                <button
                                                    key={`${result.type}-${result.id}`}
                                                    type="button"
                                                    onClick={() => handleSelect(result)}
                                                    onMouseEnter={() => setActiveIndex(currentIndex)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                                                        activeIndex === currentIndex
                                                            ? "bg-slate-50"
                                                            : "hover:bg-slate-50/50"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                        config.bg, config.color
                                                    )}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-sm font-bold text-slate-900 truncate">
                                                            {result.title}
                                                        </div>
                                                        {result.subtitle && (
                                                            <div className="text-xs text-slate-500 truncate mt-0.5">
                                                                {result.subtitle}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {result.status && (
                                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
                                                            {result.status}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 flex flex-col items-center gap-3">
                            <Search className="w-8 h-8 text-slate-200" />
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-900">Ничего не найдено</p>
                                <p className="text-xs text-slate-500 mt-1">Попробуйте изменить запрос</p>
                            </div>
                        </div>
                    )}

                    {/* Footer hint */}
                    <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-3 bg-slate-50/50">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono shadow-sm">↑↓</kbd>
                            навигация
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono shadow-sm">↵</kbd>
                            открыть
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono shadow-sm">Esc</kbd>
                            закрыть
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
