"use client";

import { useState, useEffect, useCallback } from "react";
import { WikiSidebar } from "./wiki-sidebar";
import { getWikiPageDetail, createWikiFolder, createWikiPage, updateWikiPage, deleteWikiPage } from "./actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Check, X, Search, Menu, Eye, EyeOff, Bold, Italic, Heading1, Heading2, List, Link as LinkIcon } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PromptDialog } from "@/components/ui/prompt-dialog";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface WikiFolder {
    id: string;
    name: string;
    parentId: string | null;
}

interface WikiPage {
    id: string;
    title: string;
    content: string | null;
    folderId: string | null;
    updatedAt: string | Date;
    author?: { name: string } | null;
}

interface WikiClientProps {
    initialFolders: WikiFolder[];
    initialPages: WikiPage[];
    userRole: string;
}

export function WikiClient({ initialFolders = [], initialPages = [], userRole }: WikiClientProps) {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    // Consolidated UI & View state
    const [uiState, setUiState] = useState({
        selectedPageId: null as string | null,
        isSidebarOpen: false
    });

    // Consolidated page content state
    const [pageState, setPageState] = useState({
        content: null as WikiPage | null,
        isEditing: false,
        isPreview: false,
        isLoading: false,
        editData: { title: "", content: "" }
    });

    // Consolidated dialog state
    const [dialogs, setDialogs] = useState({
        folder: { isOpen: false, parentId: null as string | null },
        page: { isOpen: false, folderId: null as string | null },
        delete: { isOpen: false }
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const canEdit = ["Администратор", "Управляющий", "Дизайнер"].includes(userRole);

    const fetchPageDetail = useCallback(async (id: string) => {
        setPageState(prev => ({ ...prev, isLoading: true }));
        try {
            const res = await getWikiPageDetail(id);
            if (res.success && res.data) {
                const data = res.data;
                setPageState(prev => ({
                    ...prev,
                    content: data as WikiPage,
                    editData: { title: data.title || "", content: data.content || "" }
                }));
            }
        } finally {
            setPageState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        if (uiState.selectedPageId) {
            fetchPageDetail(uiState.selectedPageId);
        }
    }, [uiState.selectedPageId, fetchPageDetail]);

    const handleSave = useCallback(async () => {
        if (!uiState.selectedPageId || !pageState.editData.title) return;
        setPageState(prev => ({ ...prev, isLoading: true }));
        try {
            const res = await updateWikiPage(uiState.selectedPageId, pageState.editData);
            if (res.success) {
                setPageState(prev => ({ ...prev, isEditing: false }));
                await fetchPageDetail(uiState.selectedPageId);
                router.refresh();
            }
        } finally {
            setPageState(prev => ({ ...prev, isLoading: false }));
        }
    }, [uiState.selectedPageId, pageState.editData, fetchPageDetail, router]);

    const insertMarkdown = (prefix: string, suffix: string = "") => {
        const textarea = document.querySelector('textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = pageState.editData.content || "";
        const before = text.substring(0, start);
        const selected = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + prefix + selected + suffix + after;

        setPageState(prev => ({
            ...prev,
            editData: { ...prev.editData, content: newText }
        }));

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's' && pageState.isEditing) {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pageState.isEditing, handleSave]);

    const handleSelectPage = (id: string | null) => {
        if (id && id !== uiState.selectedPageId) {
            setPageState(prev => ({ ...prev, isLoading: true }));
        }
        setUiState({
            selectedPageId: id,
            isSidebarOpen: false
        });
    };

    const handleCreateFolder = (parentId: string | null) => {
        setDialogs(prev => ({ ...prev, folder: { isOpen: true, parentId } }));
    };

    const confirmCreateFolder = async (name: string) => {
        setDialogs(prev => ({ ...prev, folder: { ...prev.folder, isOpen: false } }));
        const res = await createWikiFolder(name, dialogs.folder.parentId);
        if (res.success) {
            router.refresh();
        }
    };

    const handleCreatePage = (folderId: string | null) => {
        setDialogs(prev => ({ ...prev, page: { isOpen: true, folderId } }));
    };

    const confirmCreatePage = async (title: string) => {
        setDialogs(prev => ({ ...prev, page: { ...prev.page, isOpen: false } }));
        const res = await createWikiPage({ title, content: "", folderId: dialogs.page.folderId });
        if (res.success && res.data) {
            const newId = res.data.id;
            setPageState(prev => ({
                ...prev,
                isLoading: true,
                isEditing: true
            }));
            setUiState(prev => ({ ...prev, selectedPageId: newId }));
            router.refresh();
        }
    };

    const handleDeletePage = () => {
        if (!uiState.selectedPageId) return;
        setDialogs(prev => ({ ...prev, delete: { isOpen: true } }));
    };

    const confirmDeletePage = async () => {
        if (!uiState.selectedPageId) return;
        setPageState(prev => ({ ...prev, isLoading: true }));
        setDialogs(prev => ({ ...prev, delete: { isOpen: false } }));
        try {
            const res = await deleteWikiPage(uiState.selectedPageId);
            if (res.success) {
                setUiState(prev => ({ ...prev, selectedPageId: null }));
                setPageState(prev => ({ ...prev, content: null, isLoading: false }));
                router.refresh();
            }
        } finally {
            setPageState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const sidebarProps = {
        folders: initialFolders,
        pages: initialPages,
        activePageId: uiState.selectedPageId || undefined,
        onSelectPage: handleSelectPage,
        onAddFolder: handleCreateFolder,
        onAddPage: handleCreatePage,
        canEdit: canEdit
    };

    return (
        <div className="crm-card flex h-[calc(100vh-140px)] !p-0 !border-none !shadow-crm-xl !bg-white/40">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex shrink-0">
                <WikiSidebar {...sidebarProps} />
            </div>

            {/* Mobile Sidebar (ResponsiveModal) */}
            <ResponsiveModal
                isOpen={uiState.isSidebarOpen}
                onClose={() => setUiState(prev => ({ ...prev, isSidebarOpen: false }))}
                showVisualTitle={false}
                className="p-0"
            >
                <div className="h-[80vh] flex">
                    <WikiSidebar {...sidebarProps} />
                </div>
            </ResponsiveModal>

            <div className="flex-1 flex flex-col min-w-0 bg-white/20">
                {/* Custom Toolbar with Hamburger for Mobile */}
                <div className="h-16 border-b border-slate-200/60 px-4 md:px-6 flex items-center justify-between bg-white/40">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="md:hidden shrink-0"
                            onClick={() => setUiState(prev => ({ ...prev, isSidebarOpen: true }))}
                            aria-label="Открыть меню базы знаний"
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </Button>

                        {pageState.isEditing ? (
                            <input
                                value={pageState.editData.title}
                                onChange={(e) => setPageState(prev => ({ ...prev, editData: { ...prev.editData, title: e.target.value } }))}
                                className="text-lg md:text-xl font-bold bg-transparent border-none focus:ring-0 text-slate-900 w-full outline-none"
                                placeholder="Заголовок статьи"
                                aria-label="Заголовок статьи"
                                autoFocus
                            />
                        ) : (
                            <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">
                                {pageState.content?.title || "Выберите статью"}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                        {uiState.selectedPageId && (
                            <>
                                {pageState.isEditing ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            onClick={() => setPageState(prev => ({ ...prev, isEditing: false }))}
                                            disabled={pageState.isLoading}
                                            aria-label="Отменить редактирование"
                                        >
                                            <X className="w-4 h-4 text-slate-400" />
                                        </Button>
                                        <Button
                                            variant="btn-dark"
                                            size="sm"
                                            type="button"
                                            onClick={handleSave}
                                            disabled={pageState.isLoading}
                                            className="text-white gap-2 font-bold px-3 md:px-5 h-9 rounded-[var(--radius-inner)] border-none"
                                            aria-label="Сохранить изменения"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span className="hidden sm:inline">Сохранить</span>
                                        </Button>
                                    </>
                                ) : canEdit ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            onClick={() => setPageState(prev => ({ ...prev, isEditing: true }))}
                                            aria-label="Редактировать статью"
                                        >
                                            <Edit2 className="w-4 h-4 text-slate-400" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            onClick={() => setPageState(prev => ({ ...prev, isPreview: !prev.isPreview }))}
                                            aria-label={pageState.isPreview ? "Выключить предпросмотр" : "Предпросмотр"}
                                            className={cn(pageState.isPreview && "text-primary bg-primary/5")}
                                        >
                                            {pageState.isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            onClick={handleDeletePage}
                                            className="hover:text-rose-600 hover:bg-rose-50"
                                            aria-label="Удалить статью"
                                        >
                                            <Trash2 className="w-4 h-4 text-slate-400" />
                                        </Button>
                                    </>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {uiState.selectedPageId ? (
                        <>
                            {pageState.isEditing ? (
                                <div className="flex flex-col h-full gap-3">
                                    <div className="flex items-center justify-between gap-2 mb-2 p-2 bg-slate-50/50 rounded-xl border border-slate-200/60">
                                        <div className="flex items-center gap-0.5">
                                            <Button variant="ghost" size="sm" onClick={() => insertMarkdown('**', '**')} className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900" title="Жирный"><Bold className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => insertMarkdown('_', '_')} className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900" title="Курсив"><Italic className="w-4 h-4" /></Button>
                                            <div className="w-px h-4 bg-slate-200 mx-1.5" />
                                            <Button variant="ghost" size="sm" onClick={() => insertMarkdown('# ', '')} className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900" title="Заголовок 1"><Heading1 className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => insertMarkdown('## ', '')} className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900" title="Заголовок 2"><Heading2 className="w-4 h-4" /></Button>
                                            <div className="w-px h-4 bg-slate-200 mx-1.5" />
                                            <Button variant="ghost" size="sm" onClick={() => insertMarkdown('- ', '')} className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900" title="Список"><List className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => insertMarkdown('[', '](url)')} className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900" title="Ссылка"><LinkIcon className="w-4 h-4" /></Button>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            type="button"
                                            onClick={() => setPageState(prev => ({ ...prev, isPreview: !prev.isPreview }))}
                                            className={cn("h-8 gap-2 font-bold text-xs", pageState.isPreview && "bg-white shadow-sm border border-slate-200 text-primary")}
                                        >
                                            {pageState.isPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            {pageState.isPreview ? "Редактор" : "Просмотр"}
                                        </Button>
                                    </div>

                                    {pageState.isPreview ? (
                                        <div className="prose prose-premium prose-slate max-w-none flex-1 overflow-y-auto">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {pageState.editData.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <textarea
                                            value={pageState.editData.content}
                                            onChange={(e) => setPageState(prev => ({ ...prev, editData: { ...prev.editData, content: e.target.value } }))}
                                            className="w-full flex-1 bg-transparent border-none focus:ring-0 resize-none font-medium text-slate-700 leading-relaxed text-base md:text-lg outline-none"
                                            placeholder="Начните писать здесь..."
                                            aria-label="Содержание статьи"
                                            autoFocus
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="prose prose-premium prose-slate max-w-none animate-in fade-in duration-500">
                                    {pageState.content?.content ? (
                                        <div className="text-slate-800 font-medium leading-[1.75] text-base md:text-[17px] tracking-tight">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {pageState.content.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                            <p className="text-lg font-bold text-slate-400">Статья пуста</p>
                                            {canEdit && (
                                                <Button
                                                    variant="link"
                                                    type="button"
                                                    onClick={() => setPageState(prev => ({ ...prev, isEditing: true }))}
                                                    className="text-primary font-bold mt-2"
                                                >
                                                    Добавить содержание
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 h-full flex flex-col items-center justify-center text-center p-6 md:p-[--padding-xl]">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[28px] md:rounded-[32px] bg-slate-100 flex items-center justify-center mb-6 md:mb-8 animate-bounce transition-all duration-1000">
                                <Search className="w-8 h-8 md:w-10 md:h-10 text-slate-300" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Знания — это сила</h2>
                            <p className="max-w-xs font-bold text-sm text-slate-400 leading-tight">
                                Выберите статью из списка слева или создайте новую, чтобы пополнить базу знаний.
                            </p>
                            <Button
                                variant="outline"
                                type="button"
                                className="md:hidden mt-6 font-bold h-11 px-6 rounded-2xl"
                                onClick={() => setUiState(prev => ({ ...prev, isSidebarOpen: true }))}
                            >
                                Открыть список статей
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                {!pageState.isEditing && pageState.content && uiState.selectedPageId && (
                    <div className="px-4 md:px-8 py-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-bold text-slate-400 bg-white/40">
                        <div className="flex items-center gap-2">
                            <span className="opacity-60">Автор:</span>
                            <span className="text-slate-600">{pageState.content.author?.name || "Система"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="opacity-60">Обновлено:</span>
                            <span className="text-slate-600">
                                {isMounted ? new Date(pageState.content.updatedAt).toLocaleString('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : "..."}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <PromptDialog
                isOpen={dialogs.folder.isOpen}
                onClose={() => setDialogs(prev => ({ ...prev, folder: { ...prev.folder, isOpen: false } }))}
                onConfirm={confirmCreateFolder}
                title="Создать папку"
                label="Название папки"
                placeholder="Введите название..."
                confirmText="Создать"
            />

            <PromptDialog
                isOpen={dialogs.page.isOpen}
                onClose={() => setDialogs(prev => ({ ...prev, page: { ...prev.page, isOpen: false } }))}
                onConfirm={confirmCreatePage}
                title="Новая статья"
                label="Заголовок статьи"
                placeholder="Введите заголовок..."
                confirmText="Создать"
            />

            <ConfirmDialog
                isOpen={dialogs.delete.isOpen}
                onClose={() => setDialogs(prev => ({ ...prev, delete: { isOpen: false } }))}
                onConfirm={confirmDeletePage}
                title="Удалить статью?"
                description={`Вы уверены, что хотите удалить статью «${pageState.content?.title}»? Это действие необратимо.`}
                confirmText="Удалить"
                variant="destructive"
            />
        </div>
    );
}
