"use client";

import { useEffect, useState, useCallback } from "react";
import {
    getLocalStorageDetails,
    createLocalFolderAction,
    deleteLocalFileAction
} from "@/app/dashboard/admin/actions";
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
    HardDrive
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
                toast("Файл успешно удален", "success");
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
                <Card className="border-slate-100 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <HardDrive size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Всего файлов</p>
                                <h3 className="text-xl font-black text-slate-900">{data?.stats.fileCount || 0}</h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5">{formatSize(data?.stats.size || 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                <Folder size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Папок</p>
                                <h3 className="text-xl font-black text-slate-900">{data?.stats.folderCount || 0}</h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5">в структуре</p>
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

            {/* File Browser */}
            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 bg-white rounded-[40px] border overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3.5 bg-emerald-600 text-white rounded-[24px] shadow-lg shadow-emerald-200">
                                    <Server size={24} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black text-slate-900">Локальное хранилище сервера</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Управление файлами на диске</CardDescription>
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
                                        className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 w-full sm:w-48 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all active:scale-95 shadow-sm flex items-center gap-2 px-4"
                                >
                                    <FolderPlus size={18} />
                                    <span className="text-[10px] font-black uppercase">Папка</span>
                                </button>
                            </div>
                        </div>

                        {/* Breadcrumbs */}
                        <nav className="flex items-center gap-2 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => navigateTo("")}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
                                    currentPrefix === "" ? "bg-white text-emerald-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
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
                                                currentPrefix === path ? "bg-white text-emerald-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
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
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Наименование</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Размер</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Действия</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {/* Render Folders */}
                                    {filteredFolders.map((folderPath) => {
                                        const name = folderPath.replace(currentPrefix, "").replace("/", "");
                                        return (
                                            <tr key={folderPath} className="hover:bg-emerald-50/30 transition-colors group cursor-pointer" onClick={() => navigateTo(folderPath)}>
                                                <td className="px-8 py-4">
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
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeletingPath(folderPath);
                                                            }}
                                                            className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                                                            title="Удалить"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {/* Render Files */}
                                    {filteredFiles.map((file) => {
                                        return (
                                            <tr key={file.path} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 bg-slate-100 text-slate-400 rounded-xl group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors shadow-sm">
                                                            <File size={18} />
                                                        </div>
                                                        <div className="max-w-[300px] sm:max-w-none">
                                                            <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
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
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeletingPath(file.path);
                                                            }}
                                                            className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                                                            title="Удалить"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
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

            {/* Create Folder Dialog */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl p-8 bg-white overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <FolderPlus size={24} />
                            </div>
                            Новая папка
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Введите имя папки. Она будет создана в текущем пути: <span className="font-bold text-emerald-600">{currentPrefix || "/"}</span>
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
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-black text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest py-6 shadow-lg shadow-emerald-200"
                        >
                            {isCreating ? "Создание..." : "Создать папку"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingPath}
                onClose={() => setDeletingPath(null)}
                onConfirm={handleDelete}
                title="Удалить из локального хранилища?"
                description={`Вы собираетесь удалить "${deletingPath?.split('/').pop()}". Это действие необратимо.`}
                confirmText="Удалить"
                variant="destructive"
                isLoading={isDeleting}
            />
        </div>
    );
}
