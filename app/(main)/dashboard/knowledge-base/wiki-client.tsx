"use client";

import { useState, useEffect } from "react";
import { WikiSidebar } from "./wiki-sidebar";
import { getWikiPageDetail, createWikiFolder, createWikiPage, updateWikiPage, deleteWikiPage } from "./actions";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Check, X, Search, Menu } from "lucide-react";

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

export function WikiClient({ initialFolders, initialPages, userRole }: WikiClientProps) {
    const router = useRouter();
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [pageContent, setPageContent] = useState<WikiPage | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editData, setEditData] = useState({ title: "", content: "" });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Dialog states
    const [createFolderDialog, setCreateFolderDialog] = useState<{ open: boolean, parentId: string | null }>({ open: false, parentId: null });
    const [createPageDialog, setCreatePageDialog] = useState<{ open: boolean, folderId: string | null }>({ open: false, folderId: null });
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const canEdit = ["Администратор", "Управляющий", "Дизайнер"].includes(userRole);

    useEffect(() => {
        let isCancelled = false;
        if (selectedPageId) {
            const load = async () => {
                const page = await getWikiPageDetail(selectedPageId);
                if (!isCancelled) {
                    setPageContent(page as unknown as WikiPage);
                    setEditData({ title: page?.title || "", content: page?.content || "" });
                    setLoading(false);
                }
            };
            load();
        }
        return () => {
            isCancelled = true;
        };
    }, [selectedPageId]);

    const handleSave = async () => {
        if (!selectedPageId) return;
        setLoading(true);
        await updateWikiPage(selectedPageId, editData);
        setIsEditing(false);
        const page = await getWikiPageDetail(selectedPageId);
        setPageContent(page as unknown as WikiPage);
        setEditData({ title: page?.title || "", content: page?.content || "" });
        setLoading(false);
        router.refresh();
    };

    const handleSelectPage = (id: string | null) => {
        if (id && id !== selectedPageId) {
            setLoading(true);
        }
        setSelectedPageId(id);
        setIsSidebarOpen(false); // Close sidebar on mobile after selection
    };

    const handleCreateFolder = (parentId: string | null) => {
        setCreateFolderDialog({ open: true, parentId });
    };

    const confirmCreateFolder = async (name: string) => {
        setCreateFolderDialog(prev => ({ ...prev, open: false }));
        await createWikiFolder(name, createFolderDialog.parentId);
        router.refresh();
    };

    const handleCreatePage = (folderId: string | null) => {
        setCreatePageDialog({ open: true, folderId });
    };

    const confirmCreatePage = async (title: string) => {
        setCreatePageDialog(prev => ({ ...prev, open: false }));
        const res = await createWikiPage({ title, content: "", folderId: createPageDialog.folderId });
        if (res.success && res.page) {
            setLoading(true);
            setSelectedPageId(res.page.id);
            setIsEditing(true);
            router.refresh();
        }
    };

    const handleDeletePage = () => {
        if (!selectedPageId) return;
        setDeleteConfirmOpen(true);
    };

    const confirmDeletePage = async () => {
        if (!selectedPageId) return;
        setLoading(true);
        setDeleteConfirmOpen(false);
        await deleteWikiPage(selectedPageId);
        setSelectedPageId(null);
        setPageContent(null);
        setLoading(false);
        router.refresh();
    };

    const sidebarProps = {
        folders: initialFolders,
        pages: initialPages,
        activePageId: selectedPageId || undefined,
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
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
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
                            className="md:hidden shrink-0"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </Button>

                        {isEditing ? (
                            <input
                                value={editData.title}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                className="text-lg md:text-xl font-bold bg-transparent border-none focus:ring-0 text-slate-900 w-full"
                                placeholder="Заголовок статьи"
                            />
                        ) : (
                            <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate">{pageContent?.title || "Выберите статью"}</h2>
                        )}
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                        {selectedPageId && (
                            <>
                                {isEditing ? (
                                    <>
                                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} disabled={loading}>
                                            <X className="w-4 h-4 text-slate-400" />
                                        </Button>
                                        <Button variant="btn-dark" size="sm" onClick={handleSave} disabled={loading} className="text-white gap-2 font-bold px-3 md:px-5 h-9 rounded-[var(--radius-inner)] border-none">
                                            <Check className="w-4 h-4" />
                                            <span className="hidden sm:inline">Сохранить</span>
                                        </Button>
                                    </>
                                ) : canEdit ? (
                                    <>
                                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                                            <Edit2 className="w-4 h-4 text-slate-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={handleDeletePage} className="hover:text-rose-600 hover:bg-rose-50">
                                            <Trash2 className="w-4 h-4 text-slate-400" />
                                        </Button>
                                    </>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {selectedPageId ? (
                        <>
                            {isEditing ? (
                                <textarea
                                    value={editData.content}
                                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                                    className="w-full h-full bg-transparent border-none focus:ring-0 resize-none font-medium text-slate-700 leading-relaxed text-base md:text-lg"
                                    placeholder="Начните писать здесь..."
                                />
                            ) : (
                                <div className="prose prose-slate max-w-none">
                                    {pageContent?.content ? (
                                        <div className="whitespace-pre-wrap text-slate-700 font-medium leading-relaxed text-base md:text-lg">
                                            {pageContent.content}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 opacity-40">
                                            <p className="text-lg font-bold">Статья пуста</p>
                                            {canEdit && (
                                                <Button variant="link" onClick={() => setIsEditing(true)} className="text-primary font-bold">
                                                    Добавить текст
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-12 opacity-40">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[28px] md:rounded-[32px] bg-slate-100 flex items-center justify-center mb-6 md:mb-8">
                                <Search className="w-8 h-8 md:w-10 md:h-10 text-slate-300" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-normal mb-2">Выберите статью</h2>
                            <p className="max-w-xs font-bold text-xs md:text-sm leading-tight">
                                Выберите статью из списка слева или создайте новую, чтобы начать.
                            </p>
                            <Button
                                variant="outline"
                                className="md:hidden mt-6 font-bold"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                Открыть список статей
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                {!isEditing && pageContent && selectedPageId && (
                    <div className="px-4 md:px-8 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[10px] md:text-[11px] font-bold text-slate-400 tracking-normal bg-white/20">
                        <span>Автор: {pageContent.author?.name || "Система"}</span>
                        <span>Обновлено: {new Date(pageContent.updatedAt).toLocaleString('ru-RU')}</span>
                    </div>
                )}
            </div>

            <PromptDialog
                isOpen={createFolderDialog.open}
                onClose={() => setCreateFolderDialog(prev => ({ ...prev, open: false }))}
                onConfirm={confirmCreateFolder}
                title="Создать папку"
                label="Название папки"
                placeholder="Введите название..."
                confirmText="Создать"
            />

            <PromptDialog
                isOpen={createPageDialog.open}
                onClose={() => setCreatePageDialog(prev => ({ ...prev, open: false }))}
                onConfirm={confirmCreatePage}
                title="Новая статья"
                label="Заголовок статьи"
                placeholder="Введите заголовок..."
                confirmText="Создать"
            />

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDeletePage}
                title="Удалить статью?"
                description={`Вы уверены, что хотите удалить статью «${pageContent?.title}»? Это действие необратимо.`}
                confirmText="Удалить"
                variant="destructive"
            />
        </div>
    );
}
