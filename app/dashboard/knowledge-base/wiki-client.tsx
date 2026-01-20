"use client";

import { useState, useEffect } from "react";
import { WikiSidebar } from "./wiki-sidebar";
import { getWikiPageDetail, createWikiFolder, createWikiPage, updateWikiPage, deleteWikiPage } from "./actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Check, X, Search } from "lucide-react";

interface WikiClientProps {
    initialFolders: any[];
    initialPages: any[];
    userRole: string;
}

export function WikiClient({ initialFolders, initialPages, userRole }: WikiClientProps) {
    const router = useRouter();
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [pageContent, setPageContent] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editData, setEditData] = useState({ title: "", content: "" });

    const canEdit = ["Администратор", "Управляющий", "Дизайнер"].includes(userRole);

    useEffect(() => {
        if (selectedPageId) {
            fetchPageDetail(selectedPageId);
        }
    }, [selectedPageId]);

    const fetchPageDetail = async (id: string) => {
        setLoading(true);
        const page = await getWikiPageDetail(id);
        setPageContent(page);
        setEditData({ title: page?.title || "", content: page?.content || "" });
        setLoading(false);
    };

    const handleSave = async () => {
        if (!selectedPageId) return;
        setLoading(true);
        await updateWikiPage(selectedPageId, editData);
        setIsEditing(false);
        fetchPageDetail(selectedPageId);
        setLoading(false);
        router.refresh();
    };

    const handleCreateFolder = async (parentId: string | null) => {
        const name = prompt("Введите название папки:");
        if (name) {
            await createWikiFolder(name, parentId);
            router.refresh();
        }
    };

    const handleCreatePage = async (folderId: string | null) => {
        const title = prompt("Введите заголовок статьи:");
        if (title) {
            const res = await createWikiPage({ title, content: "", folderId });
            if (res.success && res.page) {
                setSelectedPageId(res.page.id);
                setIsEditing(true);
                router.refresh();
            }
        }
    };

    const handleDeletePage = async () => {
        if (!selectedPageId || !confirm("Вы уверены, что хотите удалить эту статью?")) return;
        setLoading(true);
        await deleteWikiPage(selectedPageId);
        setSelectedPageId(null);
        setPageContent(null);
        setLoading(false);
        router.refresh();
    };

    return (
        <div className="flex h-[calc(100vh-140px)] glass-panel overflow-hidden border-none shadow-crm-xl bg-white/40">
            <WikiSidebar
                folders={initialFolders}
                pages={initialPages}
                activePageId={selectedPageId || undefined}
                onSelectPage={setSelectedPageId}
                onAddFolder={handleCreateFolder}
                onAddPage={handleCreatePage}
                canEdit={canEdit}
            />

            <div className="flex-1 flex flex-col min-w-0 bg-white/20">
                {selectedPageId ? (
                    <>
                        {/* Toolbar */}
                        <div className="h-16 border-b border-slate-200/60 px-6 flex items-center justify-between bg-white/40">
                            <div className="flex-1 min-w-0">
                                {isEditing ? (
                                    <input
                                        value={editData.title}
                                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                        className="text-xl font-bold bg-transparent border-none focus:ring-0 text-slate-900 w-full"
                                        placeholder="Заголовок статьи"
                                    />
                                ) : (
                                    <h2 className="text-xl font-bold text-slate-900 truncate">{pageContent?.title}</h2>
                                )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                {isEditing ? (
                                    <>
                                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} disabled={loading}>
                                            <X className="w-4 h-4 text-slate-400" />
                                        </Button>
                                        <Button size="sm" onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold px-4 rounded-[10px]">
                                            <Check className="w-4 h-4" />
                                            Сохранить
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
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-8">
                            {isEditing ? (
                                <textarea
                                    value={editData.content}
                                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                                    className="w-full h-full bg-transparent border-none focus:ring-0 resize-none font-medium text-slate-700 leading-relaxed text-lg"
                                    placeholder="Начните писать здесь..."
                                />
                            ) : (
                                <div className="prose prose-slate max-w-none">
                                    {pageContent?.content ? (
                                        <div className="whitespace-pre-wrap text-slate-700 font-medium leading-relaxed text-lg">
                                            {pageContent.content}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 opacity-40">
                                            <p className="text-lg font-bold">Статья пуста</p>
                                            {canEdit && (
                                                <Button variant="link" onClick={() => setIsEditing(true)} className="text-indigo-600 font-bold">
                                                    Добавить текст
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        {!isEditing && pageContent && (
                            <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-white/20">
                                <span>Автор: {pageContent.author?.name || "Система"}</span>
                                <span>Обновлено: {new Date(pageContent.updatedAt).toLocaleString('ru-RU')}</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-40">
                        <div className="w-24 h-24 rounded-[32px] bg-slate-100 flex items-center justify-center mb-8">
                            <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Выберите статью</h2>
                        <p className="max-w-xs font-bold text-sm leading-tight">
                            Выберите статью из списка слева или создайте новую, чтобы начать.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
