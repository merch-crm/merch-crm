"use client";

import NextImage from "next/image";
import { useEffect, useState, useCallback } from "react";
import {
    getLocalStorageDetails,
    createLocalFolderAction,
    deleteLocalFileAction,
    renameLocalFileAction,
    deleteMultipleLocalFilesAction
} from "@/app/(main)/admin-panel/actions";
import {
    RefreshCw,
    Trash2,
    File,
    Search,
    Server,
    Folder,
    FolderPlus,
    ChevronRight,
    Home,
    HardDrive,
    Edit2,
    CheckSquare,
    Square,
    Eye,
    X,
    ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { Button } from "@/components/ui/button";

interface LocalFile {
    name: string;
    path: string;
    size: number;
    isDirectory: boolean;
    lastModified: Date | string;
}

interface LocalStorageData {
    stats: {
        size: number;
        fileCount: number;
        folderCount: number;
    };
    folders: string[];
    files: LocalFile[];
}

export function LocalStorageManager() {
    const { toast } = useToast();
    const [data, setData] = useState<LocalStorageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPrefix, setCurrentPrefix] = useState("");
    const [deletingPath, setDeletingPath] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Create Folder Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Rename Modal State
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renamingPath, setRenamingPath] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);

    // Multi-select State
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
    const [showDeleteMultipleConfirm, setShowDeleteMultipleConfirm] = useState(false);

    // Preview State
    const [previewFile, setPreviewFile] = useState<{ name: string, url: string, type: 'image' | 'other' } | null>(null);

    const fetchData = useCallback(async (manual = false, prefix = currentPrefix) => {
        if (manual) setLoading(true);
        try {
            const res = await getLocalStorageDetails(prefix);
            if ("error" in res) {
                toast(res.error as string, "error");
            } else {
                setData(res as unknown as LocalStorageData);
            }
        } catch (e) {
            console.error(e);
            toast("Ошибка подключения к серверу", "error");
        } finally {
            setLoading(false);
        }
    }, [toast, currentPrefix]);

    useEffect(() => {
        fetchData(false, currentPrefix);
    }, [currentPrefix, fetchData]);

    const handleDelete = async () => {
        if (!deletingPath) return;
        setIsDeleting(true);
        try {
            const res = await deleteLocalFileAction(deletingPath);
            if ("success" in res && res.success) {
                toast("Удалено успешно", "success");
                fetchData();
            } else {
                toast((res as { error?: string }).error || "Ошибка удаления", "error");
            }
        } catch {
            toast("Ошибка сети", "error");
        } finally {
            setIsDeleting(false);
            setDeletingPath(null);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setIsCreating(true);
        try {
            const fullPath = currentPrefix + newFolderName.trim();
            const res = await createLocalFolderAction(fullPath);
            if ("success" in res && res.success) {
                toast("Папка создана", "success");
                setIsCreateModalOpen(false);
                setNewFolderName("");
                fetchData();
            } else {
                toast((res as { error?: string }).error || "Ошибка при создании папки", "error");
            }
        } catch {
            toast("Ошибка сети", "error");
        } finally {
            setIsCreating(false);
        }
    };

    const handleRename = async () => {
        if (!renamingPath || !newName.trim()) return;
        setIsRenaming(true);
        try {
            const oldPath = renamingPath;
            // Ensure new path doesn't escape parent
            const parent = currentPrefix;
            const newPath = parent + newName.trim();

            const res = await renameLocalFileAction(oldPath, newPath);
            if ("success" in res && res.success) {
                toast("Переименовано", "success");
                setIsRenameModalOpen(false);
                setRenamingPath(null);
                setNewName("");
                fetchData();
            } else {
                toast((res as { error?: string }).error || "Ошибка при переименовании", "error");
            }
        } catch {
            toast("Ошибка сети", "error");
        } finally {
            setIsRenaming(false);
        }
    };

    const handleDeleteMultiple = async () => {
        if (selectedPaths.size === 0) return;
        setIsDeletingMultiple(true);
        try {
            const paths = Array.from(selectedPaths);
            const res = await deleteMultipleLocalFilesAction(paths);
            if ("success" in res && res.success) {
                toast(`Удалено ${(res as { deleted?: number }).deleted} объектов`, "success");
                setSelectedPaths(new Set());
                setIsMultiSelectMode(false);
                setShowDeleteMultipleConfirm(false);
                fetchData();
            } else {
                toast((res as { error?: string }).error || "Ошибка при удалении", "error");
            }
        } catch {
            toast("Ошибка сети", "error");
        } finally {
            setIsDeletingMultiple(false);
        }
    };

    const toggleSelection = (path: string) => {
        const newSet = new Set(selectedPaths);
        if (newSet.has(path)) {
            newSet.delete(path);
        } else {
            newSet.add(path);
        }
        setSelectedPaths(newSet);
    };

    const selectAll = () => {
        const all = new Set<string>();
        filteredFolders.forEach(f => all.add(f));
        filteredFiles.forEach(f => all.add(f.path));
        setSelectedPaths(all);
    };

    const handleFileClick = (file: LocalFile) => {
        if (isMultiSelectMode) {
            toggleSelection(file.path);
            return;
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext || '');
        const url = `/api/storage/local/${file.path}`;

        if (isImage) {
            setPreviewFile({ name: file.name, url, type: 'image' });
        } else {
            window.open(url, '_blank');
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const navigateTo = (prefix: string) => {
        setCurrentPrefix(prefix);
        setSearchTerm("");
        setSelectedPaths(new Set());
        setIsMultiSelectMode(false);
    };

    const openRenameModal = (path: string) => {
        setRenamingPath(path);
        const name = path.replace(currentPrefix, "").replace("/", "");
        setNewName(name);
        setIsRenameModalOpen(true);
    };

    const breadcrumbs = currentPrefix.split("/").filter(Boolean);

    const filteredFolders = data?.folders.filter(f => {
        const name = f.replace(currentPrefix, "").replace("/", "");
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

    const filteredFiles = data?.files.filter(f => {
        const name = f.name;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-[18px]">
                                <HardDrive size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold  tracking-normal">Всего файлов</p>
                                <h3 className="text-xl font-bold text-slate-900">{data?.stats.fileCount || 0}</h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5">{formatSize(data?.stats.size || 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-[18px]">
                                <Folder size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold  tracking-normal">Папок</p>
                                <h3 className="text-xl font-bold text-slate-900">{data?.stats.folderCount || 0}</h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5">в структуре</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white rounded-[32px] border overflow-hidden cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => fetchData(true)}>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 text-slate-600 rounded-[18px]">
                                <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold  tracking-normal">Статус</p>
                                <h3 className="text-sm font-bold text-slate-900">Данные актуальны</h3>
                                <p className="text-[9px] text-slate-500 font-bold mt-0.5  tracking-normal">Нажмите для обновления</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* File Browser */}
            <Card className="border-slate-200 shadow-xl shadow-slate-200/40 bg-white rounded-[40px] border overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3.5 bg-emerald-600 text-white rounded-[24px] shadow-lg shadow-emerald-200">
                                    <Server size={24} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-900">Локальное хранилище сервера</CardTitle>
                                    <CardDescription className="text-xs font-bold  tracking-normal text-slate-400 mt-1">Управление файлами на диске</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Поиск..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-[18px] text-sm font-bold focus:ring-2 focus:ring-emerald-500 w-full sm:w-48 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setIsMultiSelectMode(!isMultiSelectMode);
                                        if (isMultiSelectMode) setSelectedPaths(new Set());
                                    }}
                                    className={cn(
                                        "p-2.5 rounded-[18px] transition-all active:scale-95 shadow-sm flex items-center gap-2 px-4",
                                        isMultiSelectMode ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                    )}
                                >
                                    <CheckSquare size={18} />
                                    <span className="text-[10px] font-bold ">Выбор</span>
                                </button>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="p-2.5 bg-emerald-50 text-emerald-600 rounded-[18px] hover:bg-emerald-100 transition-all active:scale-95 shadow-sm flex items-center gap-2 px-4"
                                >
                                    <FolderPlus size={18} />
                                    <span className="text-[10px] font-bold ">Папка</span>
                                </button>
                            </div>
                        </div>

                        {/* Multi-select Actions Bar */}
                        {isMultiSelectMode && selectedPaths.size > 0 && (
                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-[18px] border border-emerald-100">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1.5 bg-emerald-600 text-white rounded-[18px] text-xs font-bold">
                                        {selectedPaths.size}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">выбрано</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={selectAll}
                                        className="px-4 py-2 bg-white text-emerald-600 rounded-[18px] text-[10px] font-bold  hover:bg-slate-50 transition-all"
                                    >
                                        Выбрать все
                                    </button>
                                    <button
                                        onClick={() => setSelectedPaths(new Set())}
                                        className="px-4 py-2 bg-white text-slate-600 rounded-[18px] text-[10px] font-bold  hover:bg-slate-50 transition-all"
                                    >
                                        Снять выбор
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteMultipleConfirm(true)}
                                        className="px-4 py-2 bg-rose-600 text-white rounded-[18px] text-[10px] font-bold  hover:bg-rose-700 transition-all flex items-center gap-2"
                                    >
                                        <Trash2 size={14} />
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Breadcrumbs */}
                        <nav className="flex items-center gap-2 p-3 bg-slate-50/50 rounded-[18px] border border-slate-200 overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => navigateTo("")}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] transition-all font-bold text-[10px]  tracking-normal",
                                    currentPrefix === "" ? "bg-white text-emerald-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
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
                                        <button
                                            onClick={() => navigateTo(path)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-[18px] transition-all font-bold text-[10px]  tracking-normal",
                                                currentPrefix === path ? "bg-white text-emerald-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            {crumb}
                                        </button>
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="h-[500px] overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-slate-300">
                                <RefreshCw className="animate-spin" size={48} />
                                <p className="text-xs font-bold tracking-normal">Загрузка...</p>
                            </div>
                        ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-slate-300">
                                <div className="p-6 bg-slate-50 rounded-full">
                                    <File size={48} className="opacity-20" />
                                </div>
                                <p className="text-xs font-bold tracking-normal">Здесь пока пусто</p>
                            </div>
                        ) : (
                            <ResponsiveDataView
                                data={[...filteredFolders.map(path => ({ path, isDirectory: true, name: path.replace(currentPrefix, "").replace("/", "") })), ...filteredFiles]}
                                renderTable={() => (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-200">
                                            <tr>
                                                {isMultiSelectMode && <th className="px-4 py-4 w-12"></th>}
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 tracking-normal uppercase">Наименование</th>
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 tracking-normal text-right uppercase">Размер</th>
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 tracking-normal text-center uppercase">Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {[...filteredFolders.map(path => ({ path, isDirectory: true, name: path.replace(currentPrefix, "").replace("/", "") })), ...filteredFiles].map((item: any) => {
                                                const path = item.path;
                                                const isDirectory = item.isDirectory;
                                                const name = isDirectory ? item.name : (item as LocalFile).name;
                                                const isSelected = selectedPaths.has(path);

                                                return (
                                                    <tr
                                                        key={path}
                                                        className={cn(
                                                            "transition-colors group cursor-pointer",
                                                            isSelected ? "bg-emerald-50" : "hover:bg-emerald-50/30"
                                                        )}
                                                        onClick={() => !isMultiSelectMode && (isDirectory ? navigateTo(path) : handleFileClick(item as LocalFile))}
                                                    >
                                                        {isMultiSelectMode && (
                                                            <td className="px-4 py-4">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); toggleSelection(path); }}
                                                                    className="p-1 hover:bg-emerald-100 rounded transition-colors"
                                                                >
                                                                    {isSelected ? <CheckSquare size={20} className="text-emerald-600" /> : <Square size={20} className="text-slate-300" />}
                                                                </button>
                                                            </td>
                                                        )}
                                                        <td className="px-8 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn(
                                                                    "p-2.5 rounded-[18px] group-hover:scale-110 transition-transform shadow-sm",
                                                                    isDirectory ? "bg-amber-50 text-amber-500" : (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(name.split('.').pop()?.toLowerCase() || '') ? "bg-emerald-50 text-emerald-500" : "bg-slate-100 text-slate-400")
                                                                )}>
                                                                    {isDirectory ? <Folder size={18} fill="currentColor" fillOpacity={0.2} /> : <File size={18} />}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-700">{name}</p>
                                                                    <p className="text-[10px] text-slate-400 font-bold tracking-normal">
                                                                        {isDirectory ? "Папка" : (item as LocalFile).lastModified ? format(new Date((item as LocalFile).lastModified), "dd.MM.yyyy HH:mm") : "---"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4 text-right">
                                                            <span className="text-xs font-mono font-bold text-slate-500">{isDirectory ? "---" : formatSize((item as LocalFile).size)}</span>
                                                        </td>
                                                        <td className="px-8 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {!isMultiSelectMode && (
                                                                    <>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); openRenameModal(path); }}
                                                                            className="p-2.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-[18px] transition-all active:scale-90"
                                                                            title="Переименовать"
                                                                        >
                                                                            <Edit2 size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setDeletingPath(path); }}
                                                                            className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-[18px] transition-all active:scale-90"
                                                                            title="Удалить"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {isDirectory && <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                                renderCard={(item: any) => {
                                    const path = item.path;
                                    const isDirectory = item.isDirectory;
                                    const name = isDirectory ? item.name : (item as LocalFile).name;
                                    const isSelected = selectedPaths.has(path);

                                    return (
                                        <div
                                            key={path}
                                            onClick={() => !isMultiSelectMode && (isDirectory ? navigateTo(path) : handleFileClick(item as LocalFile))}
                                            className={cn(
                                                "p-4 rounded-[24px] border transition-all active:scale-[0.98] flex items-center justify-between gap-4",
                                                isSelected ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-100 shadow-sm"
                                            )}
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={cn(
                                                    "p-3 rounded-[18px] flex-shrink-0",
                                                    isDirectory ? "bg-amber-50 text-amber-500" : (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(name.split('.').pop()?.toLowerCase() || '') ? "bg-emerald-50 text-emerald-500" : "bg-slate-100 text-slate-400")
                                                )}>
                                                    {isDirectory ? <Folder size={20} fill="currentColor" fillOpacity={0.2} /> : <File size={20} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                            {isDirectory ? "Папка" : formatSize((item as LocalFile).size)}
                                                        </span>
                                                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                        <span className="text-[10px] font-bold text-slate-400">
                                                            {!isDirectory && (item as LocalFile).lastModified ? format(new Date((item as LocalFile).lastModified), "dd.MM.yyyy") : "---"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {isMultiSelectMode ? (
                                                    <button onClick={(e) => { e.stopPropagation(); toggleSelection(path); }} className="p-2">
                                                        {isSelected ? <CheckSquare size={20} className="text-emerald-600" /> : <Square size={20} className="text-slate-300" />}
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button onClick={(e) => { e.stopPropagation(); openRenameModal(path); }} className="p-2 text-slate-300 hover:text-emerald-600"><Edit2 size={16} /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); setDeletingPath(path); }} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
                                                        {isDirectory && <ChevronRight size={16} className="text-slate-300" />}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }}
                                mobileGridClassName="grid grid-cols-1 gap-3 p-4"
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Create Folder Dialog */}
            <ResponsiveModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Новая папка"
                description={`Создание в: ${currentPrefix || "/"}`}
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400">Имя папки</label>
                        <input
                            type="text"
                            placeholder="Название папки..."
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                            autoFocus
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-[18px] text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-8 rounded-[18px] font-bold text-[10px] tracking-normal text-slate-400 py-6"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleCreateFolder}
                            disabled={isCreating || !newFolderName.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 rounded-[18px] font-bold text-[10px] tracking-normal py-6 shadow-lg shadow-emerald-200"
                        >
                            {isCreating ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : "Создать"}
                        </Button>
                    </div>
                </div>
            </ResponsiveModal>

            {/* Rename Dialog */}
            <ResponsiveModal
                isOpen={isRenameModalOpen}
                onClose={() => setIsRenameModalOpen(false)}
                title="Переименование"
                description={`Введите новое имя для ${renamingPath?.endsWith("/") ? "папки" : "файла"}`}
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400">Новое имя</label>
                        <input
                            type="text"
                            placeholder="Новое имя..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                            autoFocus
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-[18px] text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-amber-100 transition-all outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={() => setIsRenameModalOpen(false)}
                            className="px-8 rounded-[18px] font-bold text-[10px] tracking-normal text-slate-400 py-6"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleRename}
                            disabled={isRenaming || !newName.trim()}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-10 rounded-[18px] font-bold text-[10px] tracking-normal py-6 shadow-lg shadow-amber-200"
                        >
                            {isRenaming ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : "Переименовать"}
                        </Button>
                    </div>
                </div>
            </ResponsiveModal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingPath}
                onClose={() => setDeletingPath(null)}
                onConfirm={handleDelete}
                title="Удалить с диска?"
                description={`Вы собираетесь удалить "${deletingPath?.split('/').pop()}". Это действие необратимо и файл будет удален с сервера.`}
                confirmText="Удалить"
                variant="destructive"
                isLoading={isDeleting}
            />

            {/* Delete Multiple Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteMultipleConfirm}
                onClose={() => setShowDeleteMultipleConfirm(false)}
                onConfirm={handleDeleteMultiple}
                title="Массовое удаление"
                description={`Вы собираетесь удалить ${selectedPaths.size} объектов с диска сервера. Это действие необратимо.`}
                confirmText={`Удалить ${selectedPaths.size} объектов`}
                variant="destructive"
                isLoading={isDeletingMultiple}
            />

            {/* Preview Dialog */}
            <ResponsiveModal
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                title="Просмотр файла"
                description={previewFile?.name || "Информация о файле"}
            >
                {previewFile && (
                    <div className="space-y-6">
                        <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
                            {previewFile.type === 'image' ? (
                                <NextImage
                                    src={previewFile.url}
                                    alt={previewFile.name}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <File size={48} className="text-slate-700 mb-4" />
                                    <p className="text-sm font-bold text-slate-500">Предпросмотр недоступен</p>
                                </div>
                            )}
                            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => window.open(previewFile.url, '_blank')}
                                    className="p-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl transition-colors"
                                >
                                    <ExternalLink size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => window.open(previewFile.url, '_blank')}
                                className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl font-bold h-12"
                            >
                                <ExternalLink size={16} className="mr-2" />
                                Открыть
                            </Button>
                            <Button
                                onClick={() => setPreviewFile(null)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-12 shadow-md shadow-emerald-100"
                            >
                                Закрыть
                            </Button>
                        </div>
                    </div>
                )}
            </ResponsiveModal>
        </div>
    );
}
