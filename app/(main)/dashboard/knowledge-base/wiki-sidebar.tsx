import { useState, useMemo, useCallback, memo } from "react";
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

const PageItem = memo(({
    page,
    isActive,
    onSelect
}: {
    page: WikiPage,
    isActive: boolean,
    onSelect: (id: string) => void
}) => (
    <div
        role="button"
        aria-current={isActive ? "page" : undefined}
        tabIndex={0}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(page.id);
            }
        }}
        className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-[8px] hover:bg-slate-50 transition-all cursor-pointer ml-8 group outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            isActive && "bg-primary/5 text-primary shadow-sm"
        )}
        onClick={() => onSelect(page.id)}
    >
        <FileText className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-primary" : "text-slate-400")} aria-hidden="true" />
        <span className="text-sm font-semibold truncate">{page.title}</span>
    </div>
));

PageItem.displayName = "PageItem";

const FolderItem = memo(({
    folder,
    depth,
    isExpanded,
    onToggle,
    onAddPage,
    canEdit,
    children
}: {
    folder: WikiFolder,
    depth: number,
    isExpanded: boolean,
    onToggle: (id: string) => void,
    onAddPage: (id: string) => void,
    canEdit: boolean,
    children: React.ReactNode
}) => (
    <div className="space-y-1">
        <div
            role="button"
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Свернуть' : 'Развернуть'} папку ${folder.name}`}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggle(folder.id);
                }
            }}
            className={cn(
                "group flex items-center gap-2 px-2 py-1.5 rounded-[8px] hover:bg-slate-50 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                depth > 0 && "ml-4"
            )}
            onClick={() => onToggle(folder.id)}
        >
            <div className="w-4 h-4 flex items-center justify-center text-slate-400" aria-hidden="true">
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </div>
            <Folder className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <span className="text-sm font-bold text-slate-700 truncate">{folder.name}</span>
            {canEdit && (
                <button type="button"
                    onClick={(e) => { e.stopPropagation(); onAddPage(folder.id); }}
                    aria-label={`Добавить статью в папку ${folder.name}`}
                    className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-[4px] transition-all"
                >
                    <Plus className="w-3 h-3 text-slate-500" />
                </button>
            )}
        </div>
        {isExpanded && children}
    </div>
));

FolderItem.displayName = "FolderItem";

export const WikiSidebar = memo(({
    folders = [],
    pages = [],
    activePageId,
    onSelectPage,
    onAddFolder,
    onAddPage,
    canEdit = false
}: WikiSidebarProps) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    const toggleFolder = useCallback((id: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const filteredPages = useMemo(() =>
        pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())),
        [pages, searchQuery]
    );

    const filteredFolders = useMemo(() =>
        folders.filter(f => {
            if (!searchQuery) return true;
            const hasMatchingPage = pages.some(p =>
                p.folderId === f.id && p.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            const nameMatches = f.name.toLowerCase().includes(searchQuery.toLowerCase());
            return nameMatches || hasMatchingPage;
        }),
        [folders, pages, searchQuery]
    );

    const rootFolders = useMemo(() => filteredFolders.filter(f => !f.parentId), [filteredFolders]);
    const rootPages = useMemo(() => filteredPages.filter(p => !p.folderId), [filteredPages]);

    function renderFolder(folder: WikiFolder, depth = 0) {
        const isExpanded = expandedFolders.has(folder.id) || searchQuery.length > 0;
        const childFolders = filteredFolders.filter(f => f.parentId === folder.id);
        const folderPages = filteredPages.filter(p => p.folderId === folder.id);

        if (searchQuery && childFolders.length === 0 && folderPages.length === 0 && !folder.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return null;
        }

        return (
            <FolderItem
                key={folder.id}
                folder={folder}
                depth={depth}
                isExpanded={isExpanded}
                onToggle={toggleFolder}
                onAddPage={onAddPage}
                canEdit={canEdit}
            >
                <div className="space-y-1">
                    {childFolders.map(f => renderFolder(f, depth + 1))}
                    {folderPages.map(page => (
                        <PageItem
                            key={page.id}
                            page={page}
                            isActive={activePageId === page.id}
                            onSelect={onSelectPage}
                        />
                    ))}
                </div>
            </FolderItem>
        );
    }

    return (
        <aside
            className="w-72 bg-white/50 backdrop-blur-sm border-r border-slate-200/60 p-4 flex flex-col gap-3"
            role="navigation"
            aria-label="Навигация по базе знаний"
        >
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-slate-400">Разделы</h3>
                {canEdit && (
                    <button type="button"
                        onClick={() => onAddFolder(null)}
                        className="p-1 hover:bg-slate-100 rounded-[6px] transition-all"
                        title="Создать папку"
                        aria-label="Создать папку"
                    >
                        <Plus className="w-4 h-4 text-slate-500" />
                    </button>
                )}
            </div>

            <div className="px-2">
                <div className="relative group/search">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-primary transition-all duration-300" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск статей..."
                        aria-label="Поиск по базе знаний"
                        className="w-full bg-slate-100/60 border border-transparent rounded-[14px] pl-10 pr-4 py-2.5 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all duration-300 outline-none"
                    />
                </div>
            </div>

            <nav className="space-y-1 overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-slate-200">
                {rootFolders.map(f => renderFolder(f))}

                {rootPages.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        {rootPages.map(page => (
                            <PageItem
                                key={page.id}
                                page={page}
                                isActive={activePageId === page.id}
                                onSelect={onSelectPage}
                            />
                        ))}
                    </div>
                )}
            </nav>

            {canEdit && (
                <div className="mt-auto px-2">
                    <Button
                        type="button"
                        className="w-full h-11 rounded-[12px] bg-primary hover:bg-primary/90 text-white gap-2 font-bold shadow-lg shadow-primary/20"
                        onClick={() => onAddPage(null)}
                    >
                        <Plus className="w-4 h-4" />
                        Создать статью
                    </Button>
                </div>
            )}
        </aside>
    );
});

WikiSidebar.displayName = "WikiSidebar";
