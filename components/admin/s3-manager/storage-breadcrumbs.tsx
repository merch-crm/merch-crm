"use client";

import { Home, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StorageBreadcrumbsProps {
    currentPrefix: string;
    breadcrumbs: string[];
    navigateTo: (path: string) => void;
}

export const StorageBreadcrumbs = ({ currentPrefix, breadcrumbs, navigateTo }: StorageBreadcrumbsProps) => {
    return (
        <nav className="flex items-center gap-2 p-3 bg-slate-50/50 rounded-[18px] border border-slate-200 overflow-x-auto scrollbar-hide">
            <button type="button"
                onClick={() => navigateTo("")}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] transition-all font-bold text-xs  shrink-0",
                    currentPrefix === "" ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <Home size={12} />
                Корень
            </button>
            {breadcrumbs.map((crumb, idx) => {
                const path = breadcrumbs.slice(0, idx + 1).join("/") + "/";
                return (
                    <div key={path} className="flex items-center gap-2 shrink-0">
                        <ChevronRight size={14} className="text-slate-300" />
                        <button type="button"
                            onClick={() => navigateTo(path)}
                            className={cn(
                                "px-3 py-1.5 rounded-[18px] transition-all font-bold text-xs ",
                                currentPrefix === path ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {crumb}
                        </button>
                    </div>
                );
            })}
        </nav>
    );
};
