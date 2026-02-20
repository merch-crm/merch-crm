import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { formatCount } from "@/lib/pluralize";
import { getStorageDetails, deleteS3FileAction, createS3FolderAction, renameS3FileAction, deleteMultipleS3FilesAction, getS3FileUrlAction } from "@/app/(main)/admin-panel/actions";

import { StorageFile, StorageData } from "../types";

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'] as const;

export const isImageFile = (filename: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext as typeof IMAGE_EXTENSIONS[number]);
};

export function useS3StorageManager() {
    const { toast } = useToast();
    const [data, setData] = useState<StorageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPrefix, setCurrentPrefix] = useState("");
    const [deletingKey, setDeletingKey] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Grouped Modal and Process State
    const [modals, setModals] = useState({
        create: { open: false, name: "", processing: false },
        rename: { open: false, key: null as string | null, name: "", processing: false },
        multiDelete: { open: false, processing: false }
    });

    // Grouped Selection State
    const [selection, setSelection] = useState({
        keys: new Set<string>(),
        isMultiMode: false
    });

    // Grouped Preview State
    const [preview, setPreview] = useState({
        file: null as { name: string, url: string, type: 'image' | 'other' } | null,
        loading: false
    });

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
        if (!modals.create.name.trim()) return;
        setModals(prev => ({ ...prev, create: { ...prev.create, processing: true } }));
        try {
            const fullPath = currentPrefix + modals.create.name.trim() + "/";
            const res = await createS3FolderAction(fullPath);
            if ("success" in res && res.success) {
                toast("Папка создана", "success");
                setModals(prev => ({ ...prev, create: { open: false, name: "", processing: false } }));
                fetchData();
            } else {
                toast((res as { error?: string }).error || "Ошибка при создании папки", "error");
            }
        } catch (error) {
            console.error("Create folder error:", error);
            toast("Ошибка сети", "error");
        } finally {
            setModals(prev => ({ ...prev, create: { ...prev.create, processing: false } }));
        }
    };

    const handleRename = async () => {
        if (!modals.rename.key || !modals.rename.name.trim()) return;
        setModals(prev => ({ ...prev, rename: { ...prev.rename, processing: true } }));
        try {
            const oldKey = modals.rename.key;
            const isFolder = oldKey.endsWith("/");
            const newKey = currentPrefix + modals.rename.name.trim() + (isFolder ? "/" : "");

            const res = await renameS3FileAction(oldKey, newKey);
            if ("success" in res && res.success) {
                toast(isFolder ? "Папка переименована" : "Файл переименован", "success");
                setModals(prev => ({
                    ...prev,
                    rename: { ...prev.rename, open: false, key: null, name: "" }
                }));
                fetchData();
            } else {
                toast((res as { error?: string }).error || "Ошибка при переименовании", "error");
            }
        } catch (error) {
            console.error("Rename error:", error);
            toast("Ошибка сети", "error");
        } finally {
            setModals(prev => ({ ...prev, rename: { ...prev.rename, processing: false } }));
        }
    };

    const handleDeleteMultiple = async () => {
        if (selection.keys.size === 0) return;
        setModals(prev => ({ ...prev, multiDelete: { ...prev.multiDelete, processing: true } }));
        try {
            const keys = Array.from(selection.keys);
            const res = await deleteMultipleS3FilesAction(keys);
            if ("success" in res && res.success) {
                toast("Удалено " + formatCount(((res as { deleted?: number }).deleted || selection.keys.size), 'объект', 'объекта', 'объектов'), "success");
                setSelection({ keys: new Set(), isMultiMode: false });
                setModals(prev => ({ ...prev, multiDelete: { open: false, processing: false } }));
                fetchData();
            } else {
                toast((res as { error?: string }).error || "Ошибка при удалении", "error");
            }
        } catch (error) {
            console.error("Batch delete error:", error);
            toast("Ошибка сети", "error");
        } finally {
            setModals(prev => ({ ...prev, multiDelete: { ...prev.multiDelete, processing: false } }));
        }
    };

    const toggleSelection = (key: string) => {
        const newSet = new Set(selection.keys);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        setSelection(prev => ({ ...prev, keys: newSet }));
    };

    const selectAll = (filteredFolders: string[], filteredFiles: StorageFile[]) => {
        const allKeys = new Set<string>();
        filteredFolders.forEach(f => allKeys.add(f));
        filteredFiles.forEach(f => allKeys.add(f.key));
        setSelection(prev => ({ ...prev, keys: allKeys }));
    };

    const deselectAll = () => {
        setSelection(prev => ({ ...prev, keys: new Set() }));
    };

    const openInNewTab = (url: string) => {
        const win = window.open(url, '_blank');
        if (!win) {
            toast("Браузер заблокировал открытие файла. Разрешите всплывающие окна.", "error");
        }
    };

    const handleFileClick = async (file: StorageFile) => {
        if (selection.isMultiMode) {
            toggleSelection(file.key);
            return;
        }

        const name = file.key.replace(currentPrefix, "");
        const isImage = isImageFile(name);

        setPreview(prev => ({ ...prev, loading: true }));
        try {
            const res = await getS3FileUrlAction(file.key);
            if (res.success && res.data) {
                if (isImage) {
                    setPreview({ file: { name, url: res.data, type: 'image' }, loading: false });
                } else {
                    openInNewTab(res.data);
                    setPreview(prev => ({ ...prev, loading: false }));
                }
            } else {
                toast(res.error || "Ошибка при получении ссылки на файл", "error");
                setPreview(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error("Preview error:", error);
            toast("Ошибка сети", "error");
            setPreview(prev => ({ ...prev, loading: false }));
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
        setSelection({ keys: new Set(), isMultiMode: false });
    };

    const openRenameModal = (key: string) => {
        const name = key.replace(currentPrefix, "").replace("/", "");
        setModals(prev => ({
            ...prev,
            rename: { open: true, key, name, processing: false }
        }));
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
    const allItemsSelected = selection.keys.size === totalItems && totalItems > 0;

    return {
        data,
        loading,
        searchTerm, setSearchTerm,
        currentPrefix, setCurrentPrefix,
        deletingKey, setDeletingKey,
        isDeleting, setIsDeleting,
        modals, setModals,
        selection, setSelection,
        preview, setPreview,
        fetchData,
        handleDelete,
        handleCreateFolder,
        handleRename,
        handleDeleteMultiple,
        toggleSelection,
        selectAll,
        deselectAll,
        handleFileClick,
        formatSize,
        navigateTo,
        openRenameModal,
        openInNewTab,
        breadcrumbs,
        filteredFolders,
        filteredFiles,
        totalItems,
        allItemsSelected
    };
}
