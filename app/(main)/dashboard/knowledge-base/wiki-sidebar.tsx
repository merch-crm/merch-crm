"use client";

import { useState } from "react";
import { Folder, FileText, ChevronRight, ChevronDown, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WikiFolder {
    id: string;
    name: string;
    parentId: string | null;
}

interface WikiPage {
    id: string;
    title: string;
    folderId: string | null;
}

interface WikiSidebarProps {
    folders: WikiFolder[];
    pages: WikiPage[];
    activePageId?: string;
    onSelectPage: (id: string) => void;
    onAddFolder: (parentId: string | null) => void;
    onAddPage: (folderId: string | null) => void;
    canEdit?: boolean;
}

export function WikiSidebar({
    folders,
    pages,
    activePageId,
    onSelectPage,
    onAddFolder,
    onAddPage,
    canEdit = false
}: WikiSidebarProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    const toggleFolder = (id: string) => {
        const next = new Set(expandedFolders);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedFolders(next);
    };

    const filteredPages = pages.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFolders = folders.filter(f => {
        if (!searchQuery) return true;
        const hasMatchingPage = pages.some(p =>
            p.folderId === f.id && p.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const nameMatches = f.name.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatches || hasMatchingPage;
    });

    const rootFolders = filteredFolders.filter(f => !f.parentId);
    const rootPages = filteredPages.filter(p => !p.folderId);

    const renderFolder = (folder: WikiFolder, depth = 0) => {
        const isExpanded = expandedFolders.has(folder.id) || searchQuery.length > 0;
        const childFolders = filteredFolders.filter(f => f.parentId === folder.id);
        const folderPages = filteredPages.filter(p => p.folderId === folder.id);

        if (searchQuery && childFolders.length === 0 && folderPages.length === 0 && !folder.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return null;
        }

        return (
            <div key={folder.id} className="space-y-1">
                <div
                    className={cn(
                        "group flex items-center gap-2 px-2 py-1.5 rounded-[8px] hover:bg-slate-50 transition-all cursor-pointer",
                        depth > 0 && "ml-4"
                    )}
                    onClick={() => toggleFolder(folder.id)}
                >
                    <div className="w-4 h-4 flex items-center justify-center text-slate-400">
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </div>
                    <Folder className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-bold text-slate-700 truncate">{folder.name}</span>
                    {canEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddPage(folder.id); }}
                            className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-[4px] transition-all"
                        >
                            <Plus className="w-3 h-3 text-slate-500" />
                        </button>
                    )}
                </div>

                {isExpanded && (
                    <div className="space-y-1">
                        {childFolders.map(f => renderFolder(f, depth + 1))}
                        {folderPages.map(page => (
                            <div
                                key={page.id}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded-[8px] hover:bg-slate-50 transition-all cursor-pointer ml-8 group",
                                    activePageId === page.id && "bg-primary/5 text-primary shadow-sm"
                                )}
                                onClick={() => onSelectPage(page.id)}
                            >
                                <FileText className={cn("w-3.5 h-3.5 shrink-0", activePageId === page.id ? "text-primary" : "text-slate-400")} />
                                <span className="text-sm font-semibold truncate">{page.title}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-72 bg-white/50 backdrop-blur-sm border-r border-slate-200/60 p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold text-slate-400  tracking-normal">Разделы</h3>
                {canEdit && (
                    <button
                        onClick={() => onAddFolder(null)}
                        className="p-1 hover:bg-slate-100 rounded-[6px] transition-all"
                        title="Создать папку"
                    >
                        <Plus className="w-4 h-4 text-slate-500" />
                    </button>
                )}
            </div>

            {/* Search Input */}
            <div className="px-2">
                <div className="relative group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск статей..."
                        className="w-full bg-slate-100/50 border-none rounded-[10px] pl-8 pr-3 py-2 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            <nav className="space-y-1 overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-slate-200">
                {rootFolders.map(f => renderFolder(f))}

                {rootPages.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        {rootPages.map(page => (
                            <div
                                key={page.id}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded-[8px] hover:bg-slate-50 transition-all cursor-pointer group",
                                    activePageId === page.id && "bg-primary/5 text-primary shadow-sm"
                                )}
                                onClick={() => onSelectPage(page.id)}
                            >
                                <FileText className={cn("w-3.5 h-3.5 shrink-0", activePageId === page.id ? "text-primary" : "text-slate-400")} />
                                <span className="text-sm font-semibold truncate">{page.title}</span>
                            </div>
                        ))}
                    </div>
                )}
            </nav>

            {canEdit && (
                <div className="mt-auto px-2">
                    <Button
                        className="w-full h-11 rounded-[12px] bg-primary hover:bg-primary/90 text-white gap-2 font-bold shadow-lg shadow-primary/20"
                        onClick={() => onAddPage(null)}
                    >
                        <Plus className="w-4 h-4" />
                        Создать статью
                    </Button>
                </div>
            )}
        </div>
    );
}
