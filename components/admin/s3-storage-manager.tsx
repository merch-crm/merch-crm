"use client";

import NextImage from "next/image";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { getStorageDetails, deleteS3FileAction, createS3FolderAction, renameS3FileAction, deleteMultipleS3FilesAction, getS3FileUrlAction } from "@/app/(main)/admin-panel/actions";
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
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- Constants & Helpers ---

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'] as const;

const isImageFile = (filename: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext as typeof IMAGE_EXTENSIONS[number]);
};

const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "---";
    try {
        return format(new Date(date), "dd.MM.yy HH:mm");
    } catch {
        return "---";
    }
};

const Z_INDEX = {
    loadingOverlay: 50,
} as const;

// --- Types ---

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

// Type guard for runtime checks
function isStorageData(data: unknown): data is StorageData {
    return (
        typeof data === 'object' &&
        data !== null &&
        's3' in data &&
        'local' in data
    );
}

// --- Components ---

interface FolderRowProps {
    folderPrefix: string;
    currentPrefix: string;
    isSelected: boolean;
    isMultiSelectMode: boolean;
    onSelect: (prefix: string) => void;
    onNavigate: (prefix: string) => void;
    onRename: (prefix: string) => void;
    onDelete: (prefix: string) => void;
}

const FolderRow = ({ folderPrefix, currentPrefix, isSelected, isMultiSelectMode, onSelect, onNavigate, onRename, onDelete }: FolderRowProps) => {
    const name = folderPrefix.replace(currentPrefix, "").replace("/", "");

    return (
        <tr
            className={cn(
                "crm-tr-clickable group",
                isSelected && "crm-tr-selected"
            )}
        >
            {isMultiSelectMode && (
                <td className="crm-td crm-td-selection text-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(folderPrefix);
                        }}
                        className="p-1 hover:bg-indigo-100 rounded transition-colors"
                        aria-label={isSelected ? "Снять выделение" : "Выбрать папку"}
                        aria-pressed={isSelected}
                    >
                        {isSelected ? (
                            <CheckSquare size={20} className="text-primary" />
                        ) : (
                            <Square size={20} className="text-slate-300" />
                        )}
                    </button>
                </td>
            )}
            <td
                className="crm-td cursor-pointer"
                onClick={() => !isMultiSelectMode && onNavigate(folderPrefix)}
            >
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-amber-50 text-amber-500 rounded-[12px] group-hover:scale-110 transition-transform shadow-sm">
                        <Folder size={18} fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700">{name}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-normal">Папка</p>
                    </div>
                </div>
            </td>
            <td className="crm-td text-right">
                <span className="text-[10px] font-bold text-slate-400 ">---</span>
            </td>
            <td className="crm-td crm-td-actions">
                <div className="flex items-center justify-center gap-2">
                    {!isMultiSelectMode && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRename(folderPrefix);
                                }}
                                className="h-8 w-8 text-slate-300 hover:text-primary hover:bg-indigo-50"
                                aria-label="Переименовать"
                            >
                                <Edit2 size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(folderPrefix);
                                }}
                                className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                                aria-label="Удалить"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </>
                    )}
                    {!isMultiSelectMode && (
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                    )}
                </div>
            </td>
        </tr>
    );
};

interface FileRowProps {
    file: StorageFile;
    currentPrefix: string;
    isSelected: boolean;
    isMultiSelectMode: boolean;
    onSelect: (key: string) => void;
    onClick: (file: StorageFile) => void;
    onRename: (key: string) => void;
    onDelete: (key: string) => void;
    formatSize: (bytes: number) => string;
}

const FileRow = ({ file, currentPrefix, isSelected, isMultiSelectMode, onSelect, onClick, onRename, onDelete, formatSize }: FileRowProps) => {
    const name = file.key.replace(currentPrefix, "");
    const isImage = isImageFile(name);

    return (
        <tr
            className={cn(
                "crm-tr-clickable group",
                isSelected && "crm-tr-selected"
            )}
        >
            {isMultiSelectMode && (
                <td className="crm-td crm-td-selection text-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(file.key);
                        }}
                        className="p-1 hover:bg-indigo-100 rounded transition-colors"
                        aria-label={isSelected ? "Снять выделение" : "Выбрать файл"}
                        aria-pressed={isSelected}
                    >
                        {isSelected ? (
                            <CheckSquare size={20} className="text-primary" />
                        ) : (
                            <Square size={20} className="text-slate-300" />
                        )}
                    </button>
                </td>
            )}
            <td
                className="crm-td cursor-pointer"
                onClick={() => onClick(file)}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-2.5 rounded-[12px] group-hover:scale-110 transition-transform shadow-sm",
                        isImage ? "bg-indigo-50 text-indigo-500" : "bg-slate-100 text-slate-400"
                    )}>
                        {isImage ? <Eye size={18} /> : <File size={18} />}
                    </div>
                    <div className="max-w-[300px] sm:max-w-none">
                        <p className="text-sm font-bold text-slate-700 truncate">{name}</p>
                        <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                            {formatDate(file.lastModified)}
                        </p>
                    </div>
                </div>
            </td>
            <td className="crm-td text-right">
                <span className="text-xs font-mono font-bold text-slate-500">{formatSize(file.size)}</span>
            </td>
            <td className="crm-td crm-td-actions">
                <div className="flex items-center justify-center gap-2">
                    {!isMultiSelectMode && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClick(file);
                                }}
                                className="h-8 w-8 text-slate-300 hover:text-primary hover:bg-indigo-50"
                                aria-label="Просмотреть"
                            >
                                <Eye size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRename(file.key);
                                }}
                                className="h-8 w-8 text-slate-300 hover:text-primary hover:bg-indigo-50"
                                aria-label="Переименовать"
                            >
                                <Edit2 size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(file.key);
                                }}
                                className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                                aria-label="Удалить"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};

// --- Main Component ---

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
            if (res.success && res.data) {
                setData(res.data);
            } else if (!res.success) {
                toast(res.error || "Не удалось загрузить данные", "error");
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
        } catch (error) {
            console.error("Delete error:", error);
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
        } catch (error) {
            console.error("Create folder error:", error);
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
        } catch (error) {
            console.error("Rename error:", error);
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
        } catch (error) {
            console.error("Batch delete error:", error);
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

    const openInNewTab = (url: string) => {
        const win = window.open(url, '_blank');
        if (!win) {
            toast("Браузер заблокировал открытие файла. Разрешите всплывающие окна.", "error");
        }
    };

    const handleFileClick = async (file: StorageFile) => {
        if (isMultiSelectMode) {
            toggleSelection(file.key);
            return;
        }

        const name = file.key.replace(currentPrefix, "");
        const isImage = isImageFile(name);

        setIsPreviewLoading(true);
        try {
            const res = await getS3FileUrlAction(file.key);
            if (res.success && res.data) {
                if (isImage) {
                    setPreviewFile({ name, url: res.data, type: 'image' });
                } else {
                    openInNewTab(res.data);
                }
            } else {
                toast(res.error || "Ошибка при получении ссылки на файл", "error");
            }
        } catch (error) {
            console.error("Preview error:", error);
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

    const totalItems = filteredFolders.length + filteredFiles.length;
    const allSelected = selectedKeys.size === totalItems && totalItems > 0;

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-[18px]">
                                <Database size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold  tracking-normal">Всего в S3</p>
                                <h3 className="text-xl font-bold text-slate-900">{formatSize(data?.s3.size || 0)}</h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5">{data?.s3.fileCount || 0} объектов</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-[18px]">
                                <Server size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold  tracking-normal">Локальный диск</p>
                                <h3 className="text-xl font-bold text-slate-900">{formatSize(data?.local.used || 0)} / {formatSize(data?.local.total || 0)}</h3>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* S3 Storage Management */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-xl shadow-slate-200/40 bg-white rounded-[40px] border overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3.5 bg-primary text-white rounded-[24px] shadow-lg shadow-indigo-200">
                                            <CloudUpload size={24} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold text-slate-900">Облачное хранилище S3</CardTitle>
                                            <CardDescription className="text-xs font-bold  tracking-normal text-slate-400 mt-1">Управление структурой файлов</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <Input
                                                type="text"
                                                placeholder="Поиск..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 w-full sm:w-48 bg-slate-50 border-none focus-visible:ring-indigo-500"
                                            />
                                        </div>
                                        <Button
                                            variant={isMultiSelectMode ? "default" : "secondary"}
                                            size="sm"
                                            onClick={() => {
                                                setIsMultiSelectMode(!isMultiSelectMode);
                                                if (isMultiSelectMode) setSelectedKeys(new Set());
                                            }}
                                            className={cn(
                                                "gap-2",
                                                isMultiSelectMode ? "bg-primary hover:bg-primary/90" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-none"
                                            )}
                                        >
                                            <CheckSquare size={18} />
                                            <span className="text-[10px] font-bold">Выбор</span>
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="gap-2 bg-indigo-50 text-primary hover:bg-indigo-100 border-none"
                                        >
                                            <FolderPlus size={18} />
                                            <span className="text-[10px] font-bold">Папка</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Multi-select Actions Bar */}
                                {isMultiSelectMode && selectedKeys.size > 0 && (
                                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-[18px] border border-indigo-100">
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1.5 bg-primary text-white rounded-[18px] text-xs font-bold">
                                                {selectedKeys.size}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">выбрано</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={selectAll}
                                                className="bg-white text-slate-600 hover:bg-slate-50 text-[10px] h-8"
                                            >
                                                Выбрать все
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={deselectAll}
                                                className="bg-white text-slate-600 hover:bg-slate-50 text-[10px] h-8"
                                            >
                                                Снять выбор
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setShowDeleteMultipleConfirm(true)}
                                                className="gap-2 text-[10px] h-8"
                                            >
                                                <Trash2 size={14} />
                                                Удалить
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Breadcrumbs */}
                                <nav className="flex items-center gap-2 p-3 bg-slate-50/50 rounded-[18px] border border-slate-200 overflow-x-auto scrollbar-hide">
                                    <button
                                        onClick={() => navigateTo("")}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] transition-all font-bold text-[10px]  tracking-normal shrink-0",
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
                                                <button
                                                    onClick={() => navigateTo(path)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-[18px] transition-all font-bold text-[10px]  tracking-normal",
                                                        currentPrefix === path ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
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
                                        <p className="text-xs font-bold  tracking-normal">Загрузка...</p>
                                    </div>
                                ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300">
                                        <div className="p-6 bg-slate-50 rounded-full">
                                            <File size={48} className="opacity-20" />
                                        </div>
                                        <p className="text-xs font-bold  tracking-normal">Здесь пока пусто</p>
                                    </div>
                                ) : (
                                    <ResponsiveDataView
                                        data={[...filteredFolders, ...filteredFiles]}
                                        renderTable={() => (
                                            <div className="table-container">
                                                <table className="crm-table">
                                                    <thead className="crm-thead">
                                                        <tr>
                                                            {isMultiSelectMode && (
                                                                <th className="crm-th crm-td-selection text-center">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (allSelected) {
                                                                                setSelectedKeys(new Set());
                                                                            } else {
                                                                                const allKeys = new Set([...filteredFolders, ...filteredFiles.map(f => f.key)]);
                                                                                setSelectedKeys(allKeys);
                                                                            }
                                                                        }}
                                                                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                                                                        aria-label={allSelected ? "Снять выделение со всех" : "Выбрать все"}
                                                                        aria-pressed={allSelected}
                                                                    >
                                                                        {allSelected ? (
                                                                            <CheckSquare size={20} className="text-primary" />
                                                                        ) : (
                                                                            <Square size={20} className="text-slate-300" />
                                                                        )}
                                                                    </button>
                                                                </th>
                                                            )}
                                                            <th className="crm-th">Наименование</th>
                                                            <th className="crm-th text-right">Размер</th>
                                                            <th className="crm-th crm-td-actions text-center">Действия</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="crm-tbody">
                                                        {filteredFolders.map((folderPrefix) => (
                                                            <FolderRow
                                                                key={folderPrefix}
                                                                folderPrefix={folderPrefix}
                                                                currentPrefix={currentPrefix}
                                                                isSelected={selectedKeys.has(folderPrefix)}
                                                                isMultiSelectMode={isMultiSelectMode}
                                                                onSelect={toggleSelection}
                                                                onNavigate={navigateTo}
                                                                onRename={openRenameModal}
                                                                onDelete={setDeletingKey}
                                                            />
                                                        ))}
                                                        {filteredFiles.map((file) => (
                                                            <FileRow
                                                                key={file.key}
                                                                file={file}
                                                                currentPrefix={currentPrefix}
                                                                isSelected={selectedKeys.has(file.key)}
                                                                isMultiSelectMode={isMultiSelectMode}
                                                                onSelect={toggleSelection}
                                                                onClick={handleFileClick}
                                                                onRename={openRenameModal}
                                                                onDelete={setDeletingKey}
                                                                formatSize={formatSize}
                                                            />
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        renderCard={(item) => {
                                            const isFolder = typeof item === 'string';
                                            const key = isFolder ? item : item.key;
                                            const name = key.replace(currentPrefix, "").replace("/", "");
                                            const isSelected = selectedKeys.has(key);

                                            if (isFolder) {
                                                return (
                                                    <div key={key} className={cn("bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group", isSelected && "ring-2 ring-primary/20 bg-primary/5")}>
                                                        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => !isMultiSelectMode && navigateTo(key)}>
                                                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                                                <Folder size={20} fill="currentColor" fillOpacity={0.2} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Папка</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            {isMultiSelectMode ? (
                                                                <button
                                                                    onClick={() => toggleSelection(key)}
                                                                    className="p-2"
                                                                    aria-label={isSelected ? "Снять выделение" : "Выбрать"}
                                                                    aria-pressed={isSelected}
                                                                >
                                                                    {isSelected ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} className="text-slate-300" />}
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <Button variant="ghost" size="icon" onClick={() => openRenameModal(key)} className="h-8 w-8 text-slate-300 hover:text-primary" aria-label="Переименовать"><Edit2 size={16} /></Button>
                                                                    <Button variant="ghost" size="icon" onClick={() => setDeletingKey(key)} className="h-8 w-8 text-slate-300 hover:text-rose-500" aria-label="Удалить"><Trash2 size={16} /></Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            } else {
                                                const file = item as StorageFile;
                                                const isImage = isImageFile(name);
                                                return (
                                                    <div key={key} className={cn("bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group", isSelected && "ring-2 ring-primary/20 bg-primary/5")}>
                                                        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleFileClick(file)}>
                                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", isImage ? "bg-indigo-50 text-indigo-500" : "bg-slate-100 text-slate-400")}>
                                                                {isImage ? <Eye size={20} /> : <File size={20} />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium">{formatSize(file.size)} • {formatDate(file.lastModified)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            {isMultiSelectMode ? (
                                                                <button
                                                                    onClick={() => toggleSelection(key)}
                                                                    className="p-2"
                                                                    aria-label={isSelected ? "Снять выделение" : "Выбрать"}
                                                                    aria-pressed={isSelected}
                                                                >
                                                                    {isSelected ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} className="text-slate-300" />}
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <Button variant="ghost" size="icon" onClick={() => handleFileClick(file)} className="h-8 w-8 text-slate-300 hover:text-primary" aria-label="Просмотреть"><Eye size={16} /></Button>
                                                                    <Button variant="ghost" size="icon" onClick={() => openRenameModal(key)} className="h-8 w-8 text-slate-300 hover:text-primary" aria-label="Переименовать"><Edit2 size={16} /></Button>
                                                                    <Button variant="ghost" size="icon" onClick={() => setDeletingKey(key)} className="h-8 w-8 text-slate-300 hover:text-rose-500" aria-label="Удалить"><Trash2 size={16} /></Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        }}
                                        mobileGridClassName="grid grid-cols-1 gap-3 p-4"
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Local Storage Info & Actions */}
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 text-slate-600 rounded-[18px]">
                                    <HardDrive size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-900">Серверное хранилище</CardTitle>
                                    <p className="text-[10px] text-slate-400 font-bold  tracking-normal mt-0.5">Локальные данные</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="bg-slate-50 p-4 rounded-[18px] border border-slate-200 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-slate-500  tracking-tight">Путь системы</span>
                                    <code className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 max-w-[150px] truncate" title={data?.local.path}>
                                        {data?.local.path}
                                    </code>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-slate-500  tracking-tight">Доступно</span>
                                    <span className="text-sm font-bold text-emerald-600">{formatSize(data?.local.free || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-slate-500  tracking-tight">Использовано</span>
                                    <span className="text-sm font-bold text-slate-900">{formatSize(data?.local.used || 0)}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-[18px] border border-amber-100">
                                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                                <p className="text-[10px] text-amber-900 font-medium leading-relaxed">
                                    Локальное хранилище используется для кэша и временных файлов. Основные данные хранятся в S3.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-[18px]">
                                    <Info size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-900">Возможности</CardTitle>
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
            <ResponsiveModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Новая папка"
                description={`Введите имя папки. Она будет создана в: ${currentPrefix || "/"}`}
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400">Имя папки</label>
                        <Input
                            type="text"
                            placeholder="Название папки..."
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                            autoFocus
                            className="w-full text-lg font-bold"
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
                            className="bg-primary hover:bg-primary/90 text-white px-10 rounded-[18px] font-bold text-[10px] tracking-normal py-6 shadow-lg shadow-indigo-200"
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
                description={`Введите новое имя для ${renamingKey?.endsWith("/") ? "папки" : "файла"}`}
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400">Новое имя</label>
                        <Input
                            type="text"
                            placeholder="Новое имя..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                            autoFocus
                            className="w-full text-lg font-bold"
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
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => openInNewTab(previewFile.url)}
                                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl border-none h-10 w-10"
                                    aria-label="Открыть в новой вкладке"
                                >
                                    <ExternalLink size={18} />
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => openInNewTab(previewFile.url)}
                                className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl font-bold h-12"
                            >
                                <ExternalLink size={16} className="mr-2" />
                                Открыть
                            </Button>
                            <Button
                                onClick={() => setPreviewFile(null)}
                                className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold h-12 shadow-md shadow-primary/10"
                            >
                                Закрыть
                            </Button>
                        </div>
                    </div>
                )}
            </ResponsiveModal>

            {/* Loading Overlay for Preview */}
            {isPreviewLoading && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-white"
                    style={{ zIndex: Z_INDEX.loadingOverlay }}
                >
                    <RefreshCw className="animate-spin" size={48} />
                    <p className="text-xs font-bold  tracking-normal">Генерация ссылки...</p>
                </div>
            )}
        </div>
    );
}
