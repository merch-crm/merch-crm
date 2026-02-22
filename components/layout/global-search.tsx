"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Package, User, Database, Users, CheckCircle2, X } from "lucide-react";
import { globalSearch, SearchResult } from "@/app/(main)/dashboard/search-actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function GlobalSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const handleSearch = useCallback(async (val: string) => {
        if (val.length < 2) {
            setResults([]);
            setLoading(false);
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

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) handleSearch(query);
            else setResults([]);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, handleSearch]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getIcon = (type: SearchResult["type"]) => {
        switch (type) {
            case "order": return <Package className="w-4 h-4" />;
            case "client": return <User className="w-4 h-4" />;
            case "item": return <Database className="w-4 h-4" />;
            case "user": return <Users className="w-4 h-4" />;
            case "task": return <CheckCircle2 className="w-4 h-4" />;
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
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-md mx-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    type="text"
                    placeholder="Быстрый поиск (cmd+k)..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full h-10 pl-10 pr-10 bg-slate-100/50 border border-slate-200/50 rounded-[18px] text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 focus-visible:bg-white transition-all shadow-none"
                />

            </div>

            <AnimatePresence>
                {isOpen && (query.length >= 2) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full mt-2 w-full bg-white rounded-[18px] shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto"
                    >
                        {Array.isArray(results) && results.length > 0 ? (
                            <div className="p-2 space-y-1">
                                {(results || []).map((result) => (
                                    <Button
                                        key={`${result.type}-${result.id}`}
                                        variant="ghost"
                                        onClick={() => handleSelect(result)}
                                        className="w-full flex items-center justify-start gap-3 p-3 hover:bg-slate-50 rounded-[18px] transition-all group text-left h-auto font-normal"
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-[18px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                            result.type === 'order' ? 'bg-indigo-50 text-[#5d00ff]' :
                                                result.type === 'client' ? 'bg-emerald-50 text-emerald-600' :
                                                    result.type === 'item' ? 'bg-amber-50 text-amber-600' :
                                                        result.type === 'user' ? 'bg-blue-50 text-blue-600' :
                                                            'bg-rose-50 text-rose-600'
                                        )}>
                                            {getIcon(result.type)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 text-sm truncate">{result.title}</span>
                                                <span className="text-xs font-bold text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded-md">
                                                    {getTypeLabel(result.type)}
                                                </span>
                                            </div>
                                            {result.subtitle && (
                                                <p className="text-xs text-slate-500 truncate mt-0.5">{result.subtitle}</p>
                                            )}
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                <X className="w-3 h-3 text-slate-400 rotate-45" />
                                            </div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        ) : !loading ? (
                            <div className="p-6 text-center">
                                <Search className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-900">Ничего не найдено</p>
                                <p className="text-xs text-slate-500 mt-1">Попробуйте изменить запрос</p>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
