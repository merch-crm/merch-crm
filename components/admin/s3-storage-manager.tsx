"use client";

import NextImage from "next/image";
import { useEffect, useState, useCallback } from "react";
import { getStorageDetails, deleteS3FileAction, createS3FolderAction, renameS3FileAction, deleteMultipleS3FilesAction, getS3FileUrlAction } from "@/app/dashboard/admin/actions";
import {
    HardDrive,
    RefreshCw,
    Trash2,
    File,
    Search,
    AlertTriangle,
    Info,
    Server,
    CloudUpload,
    Database,
    Folder,
    FolderPlus,
    ChevronRight,
    Home,
    Edit2,
    CheckSquare,
    Square,
    Eye,
    X,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StorageFile {
    key: string;
    size: number;
    lastModified: Date | string | undefined;
}

interface StorageData {
    s3: {
        size: number;
        fileCount: number;
        folders: string[];
        files: StorageFile[];
    };
    local: {
        total: number;
        free: number;
        used: number;
        path: string;
    };
}

export function S3StorageManager() {
    const { toast } = useToast();
    const [data, setData] = useState<StorageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPrefix, setCurrentPrefix] = useState("");
    const [deletingKey, setDeletingKey] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Create Folder Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Rename Modal State
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renamingKey, setRenamingKey] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);

    // Multi-select State
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
    const [showDeleteMultipleConfirm, setShowDeleteMultipleConfirm] = useState(false);

    // Preview State
    const [previewFile, setPreviewFile] = useState<{ name: string, url: string, type: 'image' | 'other' } | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const fetchData = useCallback(async (manual = false, prefix = currentPrefix) => {
        if (manual) setLoading(true);
        try {
            const res = await getStorageDetails(prefix);
            if ("error" in res) {
                toast(res.error as string, "error");
            } else {
                setData(res as unknown as StorageData);
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
        if (!deletingKey) return;
        setIsDeleting(true);
        try {
            const res = await deleteS3FileAction(deletingKey);
            if ("success" in res && res.success) {
                toast("Файл успешно удален", "success");
                fetchData();
            } else {
                toast((res as { error?: string }).error || "Ошибка удаления", "error");
            }
        } catch {
            toast("Ошибка сети", "error");
        } finally {
            setIsDeleting(false);
            setDeletingKey(null);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setIsCreating(true);
        try {
            const fullPath = currentPrefix + newFolderName.trim() + "/";
            const res = await createS3FolderAction(fullPath);
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
        if (!renamingKey || !newName.trim()) return;
        setIsRenaming(true);
        try {
            const oldKey = renamingKey;
            const isFolder = oldKey.endsWith("/");
            const newKey = currentPrefix + newName.trim() + (isFolder ? "/" : "");

            const res = await renameS3FileAction(oldKey, newKey);
            if ("success" in res && res.success) {
                toast(isFolder ? "Папка переименована" : "Файл переименован", "success");
                setIsRenameModalOpen(false);
                setRenamingKey(null);
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
        if (selectedKeys.size === 0) return;
        setIsDeletingMultiple(true);
        try {
            const keys = Array.from(selectedKeys);
            const res = await deleteMultipleS3FilesAction(keys);
            if ("success" in res && res.success) {
                toast(`Удалено ${(res as { deleted?: number }).deleted || selectedKeys.size} объектов`, "success");
                setSelectedKeys(new Set());
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

    const toggleSelection = (key: string) => {
        const newSet = new Set(selectedKeys);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        setSelectedKeys(newSet);
    };

    const selectAll = () => {
        const allKeys = new Set<string>();
        filteredFolders.forEach(f => allKeys.add(f));
        filteredFiles.forEach(f => allKeys.add(f.key));
        setSelectedKeys(allKeys);
    };

    const deselectAll = () => {
        setSelectedKeys(new Set());
    };

    const handleFileClick = async (file: StorageFile) => {
        if (isMultiSelectMode) {
            toggleSelection(file.key);
            return;
        }

        const name = file.key.replace(currentPrefix, "");
        const ext = name.split('.').pop()?.toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext || '');

        setIsPreviewLoading(true);
        try {
            const res = await getS3FileUrlAction(file.key);
            if (res.success && res.url) {
                if (isImage) {
                    setPreviewFile({ name, url: res.url, type: 'image' });
                } else {
                    window.open(res.url, '_blank');
                }
            } else {
                toast(res.error || "Ошибка при получении ссылки на файл", "error");
            }
        } catch {
            toast("Ошибка сети", "error");
        } finally {
            setIsPreviewLoading(false);
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
        setSelectedKeys(new Set());
        setIsMultiSelectMode(false);
    };

    const openRenameModal = (key: string) => {
        setRenamingKey(key);
        const name = key.replace(currentPrefix, "").replace("/", "");
        setNewName(name);
        setIsRenameModalOpen(true);
    };

    const breadcrumbs = currentPrefix.split("/").filter(Boolean);

    const filteredFolders = data?.s3.folders.filter(f => {
        const name = f.replace(currentPrefix, "").replace("/", "");
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

    const filteredFiles = data?.s3.files.filter(f => {
        const name = f.key.replace(currentPrefix, "");
        return name.toLowerCase().includes(searchTerm.toLowerCase()) && !name.endsWith("/");
    }) || [];

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-100 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <Database size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Всего в S3</p>
                                <h3 className="text-xl font-black text-slate-900">{formatSize(data?.s3.size || 0)}</h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5">{data?.s3.fileCount || 0} объектов</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Server size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Локальный диск</p>
                                <h3 className="text-xl font-black text-slate-900">{formatSize(data?.local.used || 0)} / {formatSize(data?.local.total || 0)}</h3>
                                <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${((data?.local.used || 0) / (data?.local.total || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm bg-white rounded-[32px] border overflow-hidden cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => fetchData(true)}>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl">
                                <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Статус</p>
                                <h3 className="text-sm font-black text-slate-900">Данные актуальны</h3>
                                <p className="text-[9px] text-slate-500 font-bold mt-0.5 uppercase tracking-tighter">Нажмите для обновления</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* S3 Storage Management */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-100 shadow-xl shadow-slate-200/40 bg-white rounded-[40px] border overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3.5 bg-indigo-600 text-white rounded-[24px] shadow-lg shadow-indigo-200">
                                            <CloudUpload size={24} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black text-slate-900">Облачное хранилище S3</CardTitle>
                                            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Управление структурой файлов</CardDescription>
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
                                                className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 w-full sm:w-48 transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsMultiSelectMode(!isMultiSelectMode);
                                                if (isMultiSelectMode) setSelectedKeys(new Set());
                                            }}
                                            className={cn(
                                                "p-2.5 rounded-2xl transition-all active:scale-95 shadow-sm flex items-center gap-2 px-4",
                                                isMultiSelectMode ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                            )}
                                        >
                                            <CheckSquare size={18} />
                                            <span className="text-[10px] font-black uppercase">Выбор</span>
                                        </button>
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all active:scale-95 shadow-sm flex items-center gap-2 px-4"
                                        >
                                            <FolderPlus size={18} />
                                            <span className="text-[10px] font-black uppercase">Папка</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Multi-select Actions Bar */}
                                {isMultiSelectMode && selectedKeys.size > 0 && (
                                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-black">
                                                {selectedKeys.size}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">выбрано</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={selectAll}
                                                className="px-4 py-2 bg-white text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all"
                                            >
                                                Выбрать все
                                            </button>
                                            <button
                                                onClick={deselectAll}
                                                className="px-4 py-2 bg-white text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all"
                                            >
                                                Снять выбор
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteMultipleConfirm(true)}
                                                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-rose-700 transition-all flex items-center gap-2"
                                            >
                                                <Trash2 size={14} />
                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Breadcrumbs */}
                                <nav className="flex items-center gap-2 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-x-auto scrollbar-hide">
                                    <button
                                        onClick={() => navigateTo("")}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shrink-0",
                                            currentPrefix === "" ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
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
                                                        "px-3 py-1.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
                                                        currentPrefix === path ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
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
                                    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300">
                                        <RefreshCw className="animate-spin" size={48} />
                                        <p className="text-xs font-black uppercase tracking-widest">Загрузка...</p>
                                    </div>
                                ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300">
                                        <div className="p-6 bg-slate-50 rounded-full">
                                            <File size={48} className="opacity-20" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest">Здесь пока пусто</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-50">
                                            <tr>
                                                {isMultiSelectMode && (
                                                    <th className="px-4 py-4 w-12"></th>
                                                )}
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Наименование</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Размер</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {/* Render Folders */}
                                            {filteredFolders.map((folderPrefix) => {
                                                const name = folderPrefix.replace(currentPrefix, "").replace("/", "");
                                                const isSelected = selectedKeys.has(folderPrefix);
                                                return (
                                                    <tr
                                                        key={folderPrefix}
                                                        className={cn(
                                                            "transition-colors group",
                                                            isSelected ? "bg-indigo-50" : "hover:bg-indigo-50/30"
                                                        )}
                                                    >
                                                        {isMultiSelectMode && (
                                                            <td className="px-4 py-4">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleSelection(folderPrefix);
                                                                    }}
                                                                    className="p-1 hover:bg-indigo-100 rounded transition-colors"
                                                                >
                                                                    {isSelected ? (
                                                                        <CheckSquare size={20} className="text-indigo-600" />
                                                                    ) : (
                                                                        <Square size={20} className="text-slate-300" />
                                                                    )}
                                                                </button>
                                                            </td>
                                                        )}
                                                        <td
                                                            className="px-8 py-4 cursor-pointer"
                                                            onClick={() => !isMultiSelectMode && navigateTo(folderPrefix)}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                                                                    <Folder size={18} fill="currentColor" fillOpacity={0.2} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-slate-700">{name}</p>
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Папка</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4 text-right">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase">---</span>
                                                        </td>
                                                        <td className="px-8 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {!isMultiSelectMode && (
                                                                    <>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openRenameModal(folderPrefix);
                                                                            }}
                                                                            className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
                                                                            title="Переименовать"
                                                                        >
                                                                            <Edit2 size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setDeletingKey(folderPrefix);
                                                                            }}
                                                                            className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                                                                            title="Удалить"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {!isMultiSelectMode && (
                                                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {/* Render Files */}
                                            {filteredFiles.map((file) => {
                                                const name = file.key.replace(currentPrefix, "");
                                                const isSelected = selectedKeys.has(file.key);
                                                const ext = name.split('.').pop()?.toLowerCase();
                                                const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext || '');

                                                return (
                                                    <tr
                                                        key={file.key}
                                                        className={cn(
                                                            "transition-colors group",
                                                            isSelected ? "bg-indigo-50" : "hover:bg-slate-50/50"
                                                        )}
                                                    >
                                                        {isMultiSelectMode && (
                                                            <td className="px-4 py-4">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleSelection(file.key);
                                                                    }}
                                                                    className="p-1 hover:bg-indigo-100 rounded transition-colors"
                                                                >
                                                                    {isSelected ? (
                                                                        <CheckSquare size={20} className="text-indigo-600" />
                                                                    ) : (
                                                                        <Square size={20} className="text-slate-300" />
                                                                    )}
                                                                </button>
                                                            </td>
                                                        )}
                                                        <td
                                                            className="px-8 py-4 cursor-pointer"
                                                            onClick={() => handleFileClick(file)}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn(
                                                                    "p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-sm",
                                                                    isImage ? "bg-indigo-50 text-indigo-500" : "bg-slate-100 text-slate-400"
                                                                )}>
                                                                    <File size={18} />
                                                                </div>
                                                                <div className="max-w-[300px] sm:max-w-none">
                                                                    <p className="text-sm font-bold text-slate-700 truncate">{name}</p>
                                                                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                                                                        {file.lastModified ? new Date(file.lastModified).toLocaleString() : "---"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4 text-right">
                                                            <span className="text-xs font-mono font-bold text-slate-500">{formatSize(file.size)}</span>
                                                        </td>
                                                        <td className="px-8 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {!isMultiSelectMode && (
                                                                    <>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleFileClick(file);
                                                                            }}
                                                                            className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
                                                                            title="Просмотреть"
                                                                        >
                                                                            <Eye size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openRenameModal(file.key);
                                                                            }}
                                                                            className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
                                                                            title="Переименовать"
                                                                        >
                                                                            <Edit2 size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setDeletingKey(file.key);
                                                                            }}
                                                                            className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                                                                            title="Удалить"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Local Storage Info & Actions */}
                <div className="space-y-6">
                    <Card className="border-slate-100 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                                    <HardDrive size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-black text-slate-900">Серверное хранилище</CardTitle>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Локальные данные</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Путь системы</span>
                                    <code className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 max-w-[150px] truncate" title={data?.local.path}>
                                        {data?.local.path}
                                    </code>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Доступно</span>
                                    <span className="text-sm font-black text-emerald-600">{formatSize(data?.local.free || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Использовано</span>
                                    <span className="text-sm font-black text-slate-900">{formatSize(data?.local.used || 0)}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                                <p className="text-[10px] text-amber-900 font-medium leading-relaxed">
                                    Локальное хранилище используется для кэша и временных файлов. Основные данные хранятся в S3.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-100 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Info size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-black text-slate-900">Возможности</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <ul className="space-y-2">
                                {[
                                    "Создание папок для организации",
                                    "Переименование файлов и папок",
                                    "Массовое удаление объектов",
                                    "Навигация по структуре"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                        <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create Folder Dialog */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl p-8 bg-white overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <FolderPlus size={24} />
                            </div>
                            Новая папка
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Введите имя папки. Она будет создана в текущем пути: <span className="font-bold text-indigo-600">{currentPrefix || "/"}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <input
                            type="text"
                            placeholder="Название папки..."
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                            autoFocus
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-black text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                        />
                    </div>
                    <DialogFooter className="sm:justify-between gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 py-6"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleCreateFolder}
                            disabled={isCreating || !newFolderName.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest py-6 shadow-lg shadow-indigo-200"
                        >
                            {isCreating ? "Создание..." : "Создать папку"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rename Dialog */}
            <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl p-8 bg-white overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                <Edit2 size={24} />
                            </div>
                            Переименовать
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Введите новое имя для {renamingKey?.endsWith("/") ? "папки" : "файла"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <input
                            type="text"
                            placeholder="Новое имя..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                            autoFocus
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-black text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-amber-100 transition-all outline-none"
                        />
                    </div>
                    <DialogFooter className="sm:justify-between gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setIsRenameModalOpen(false)}
                            className="px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 py-6"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleRename}
                            disabled={isRenaming || !newName.trim()}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest py-6 shadow-lg shadow-amber-200"
                        >
                            {isRenaming ? "Переименование..." : "Переименовать"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingKey}
                onClose={() => setDeletingKey(null)}
                onConfirm={handleDelete}
                title="Удалить из облака?"
                description={`Вы собираетесь удалить "${deletingKey?.split('/').pop() || deletingKey}". Это действие необратимо.`}
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
                description={`Вы собираетесь удалить ${selectedKeys.size} объектов. Это действие необратимо и все выбранные файлы и папки будут удалены навсегда.`}
                confirmText={`Удалить ${selectedKeys.size} объектов`}
                variant="destructive"
                isLoading={isDeletingMultiple}
            />

            {/* Preview Dialog */}
            <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
                <DialogContent className="sm:max-w-4xl rounded-[40px] border-none shadow-2xl p-0 bg-white overflow-hidden [&>button]:hidden">
                    <div className="relative">
                        <div className="absolute top-6 right-6 z-50 flex gap-2">
                            <button
                                onClick={() => window.open(previewFile?.url, '_blank')}
                                className="p-3 bg-white/80 backdrop-blur-md hover:bg-white text-slate-900 rounded-2xl shadow-xl transition-all active:scale-95"
                                title="Открыть в новой вкладке"
                            >
                                <ExternalLink size={20} />
                            </button>
                            <button
                                onClick={() => setPreviewFile(null)}
                                className="p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl shadow-xl transition-all active:scale-95 shadow-rose-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                                    <File size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 truncate max-w-md">{previewFile?.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Предпросмотр файла</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900 flex items-center justify-center min-h-[400px] max-h-[70vh]">
                            {previewFile?.type === 'image' && (
                                <NextImage
                                    src={previewFile.url}
                                    alt={previewFile.name}
                                    width={1000}
                                    height={800}
                                    className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-lg w-auto h-auto"
                                    unoptimized
                                />
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Loading Overlay for Preview */}
            {isPreviewLoading && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-4 text-white">
                    <RefreshCw className="animate-spin" size={48} />
                    <p className="text-xs font-black uppercase tracking-widest">Генерация ссылки...</p>
                </div>
            )}
        </div>
    );
}
