"use client";

import React from "react";
import { Search, CheckSquare, FolderPlus } from "lucide-react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StorageBrowserHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    isMultiMode: boolean;
    onToggleMultiMode: () => void;
    onCreateFolder: () => void;
}

export function StorageBrowserHeader({
    searchTerm,
    onSearchChange,
    isMultiMode,
    onToggleMultiMode,
    onCreateFolder
}: StorageBrowserHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="p-3.5 bg-emerald-600 text-white rounded-[24px] shadow-lg shadow-emerald-200">
                    <Search size={24} />
                </div>
                <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Локальное хранилище сервера</CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-400 mt-1">Управление файлами на диске</CardDescription>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                        type="text"
                        placeholder="Поиск..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 w-full sm:w-48 bg-slate-50 border-none focus-visible:ring-emerald-500"
                    />
                </div>
                <button
                    type="button"
                    onClick={onToggleMultiMode}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                        isMultiMode ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    )}
                >
                    <CheckSquare size={18} />
                    <span className="text-xs font-bold">Выбор</span>
                </button>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onCreateFolder}
                    className="gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none"
                >
                    <FolderPlus size={18} />
                    <span className="text-xs font-bold">Папка</span>
                </Button>
            </div>
        </div>
    );
}
