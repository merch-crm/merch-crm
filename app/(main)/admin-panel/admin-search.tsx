"use client";

import { Search } from "lucide-react";

export function AdminSearch() {
    return (
        <div
            role="button"
            tabIndex={0}
            className="relative w-full max-w-md hidden md:block group cursor-text outline-none"
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-menu"))}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("open-command-menu"));
                }
            }}
            aria-label="Открыть меню команд"
        >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            <div className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium flex items-center text-slate-500 hover:border-primary/50 hover:bg-white transition-all shadow-sm">
                Быстрый поиск...
            </div>

        </div>
    );
}
