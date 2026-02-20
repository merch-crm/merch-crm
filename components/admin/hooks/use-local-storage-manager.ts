import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { formatCount } from "@/lib/pluralize";
import {
    getLocalStorageDetails,
    createLocalFolderAction,
    deleteLocalFileAction,
    renameLocalFileAction,
    deleteMultipleLocalFilesAction
} from "@/app/(main)/admin-panel/actions";

export interface LocalFile {
    name: string;
    path: string;
    size: number;
    isDirectory: boolean;
    lastModified: Date | string;
}

export interface LocalStorageData {
    stats: {
        size: number;
        fileCount: number;
        folderCount: number;
    };
    folders: string[];
    files: LocalFile[];
}

export function useLocalStorageManager() {
    const { toast } = useToast();
    const [data, setData] = useState<LocalStorageData | null>(null);
    const [uiState, setUiState] = useState({
        loading: true,
        searchTerm: "",
        currentPrefix: ""
    });

    const [modals, setModals] = useState({
        create: { open: false, name: "", processing: false },
        rename: { open: false, path: null as string | null, name: "", processing: false },
        delete: { path: null as string | null, processing: false },
        multiDelete: { open: false, processing: false }
    });

    const [selection, setSelection] = useState({
        paths: new Set<string>(),
        isMultiMode: false
    });

    const [preview, setPreview] = useState({
        file: null as { name: string, url: string, type: 'image' | 'other' } | null
    });

    const fetchData = useCallback(async (manual = false, prefix = uiState.currentPrefix) => {
        if (manual) setUiState(prev => ({ ...prev, loading: true }));
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
            setUiState(prev => ({ ...prev, loading: false }));
        }
    }, [toast, uiState.currentPrefix]);

    useEffect(() => {
        fetchData(false, uiState.currentPrefix);
    }, [uiState.currentPrefix, fetchData]);

    const handleDelete = async () => {
        if (!modals.delete.path) return;
        setModals(prev => ({ ...prev, delete: { ...prev.delete, processing: true } }));
        try {
            const res = await deleteLocalFileAction(modals.delete.path);
            if ("success" in res && res.success) {
                toast("Удалено успешно", "success");
                fetchData();
            } else {
                toast((res as { error?: string }).error || "Ошибка удаления", "error");
            }
        } catch {
            toast("Ошибка сети", "error");
        } finally {
            setModals(prev => ({ ...prev, delete: { path: null, processing: false } }));
        }
    };

    const handleCreateFolder = async () => {
        if (!modals.create.name.trim()) return;
        setModals(prev => ({ ...prev, create: { ...prev.create, processing: true } }));
        try {
            const fullPath = uiState.currentPrefix + modals.create.name.trim();
            const res = await createLocalFolderAction(fullPath);
            if ("success" in res && res.success) {
                toast("Папка создана", "success");
                setModals(prev => ({ ...prev, create: { open: false, name: "", processing: false } }));
                fetchData();
            } else {
                toast((res as { error?: string }).error || "Ошибка при создании папки", "error");
            }
        } catch {
            toast("Ошибка сети", "error");
        } finally {
            setModals(prev => ({ ...prev, create: { ...prev.create, processing: false } }));
        }
    };

    const handleRename = async () => {
        if (!modals.rename.path || !modals.rename.name.trim()) return;
        setModals(prev => ({ ...prev, rename: { ...prev.rename, processing: true } }));
        try {
            const oldPath = modals.rename.path;
            const parent = uiState.currentPrefix;
            const newPath = parent + modals.rename.name.trim();

            const res = await renameLocalFileAction(oldPath, newPath);
            if ("success" in res && res.success) {
                toast("Переименовано", "success");
                setModals(prev => ({ ...prev, rename: { open: false, path: null, name: "", processing: false } }));
                fetchData();
            } else {
                toast((res as { error?: string }).error || "Ошибка при переименовании", "error");
            }
        } catch {
            toast("Ошибка сети", "error");
        } finally {
            setModals(prev => ({ ...prev, rename: { ...prev.rename, processing: false } }));
        }
    };

    const handleDeleteMultiple = async () => {
        if (selection.paths.size === 0) return;
        setModals(prev => ({ ...prev, multiDelete: { ...prev.multiDelete, processing: true } }));
        try {
            const paths = Array.from(selection.paths);
            const res = await deleteMultipleLocalFilesAction(paths);
            if ("success" in res && res.success) {
                toast("Удалено " + formatCount(((res as { deleted?: number }).deleted || 0), 'объект', 'объекта', 'объектов'), "success");
                setSelection({ paths: new Set(), isMultiMode: false });
                setModals(prev => ({ ...prev, multiDelete: { open: false, processing: false } }));
                fetchData();
            } else {
                toast((res as { error?: string }).error || "Ошибка при удалении", "error");
            }
        } catch {
            toast("Ошибка сети", "error");
        } finally {
            setModals(prev => ({ ...prev, multiDelete: { ...prev.multiDelete, processing: false } }));
        }
    };

    const toggleSelection = (path: string) => {
        setSelection(prev => {
            const newSet = new Set(prev.paths);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return { ...prev, paths: newSet };
        });
    };

    const selectAll = (filteredFolders: string[], filteredFiles: LocalFile[]) => {
        const all = new Set<string>();
        filteredFolders.forEach(f => all.add(f));
        filteredFiles.forEach(f => all.add(f.path));
        setSelection(prev => ({ ...prev, paths: all }));
    };

    const handleFileClick = (file: LocalFile) => {
        if (selection.isMultiMode) {
            toggleSelection(file.path);
            return;
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext || '');
        const url = `/api/storage/local/${file.path}`;

        if (isImage) {
            setPreview({ file: { name: file.name, url, type: 'image' } });
        } else {
            const win = window.open(url, '_blank');
            if (!win) {
                toast("Браузер заблокировал открытие файла. Разрешите всплывающие окна.", "error");
            }
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
        setUiState(prev => ({ ...prev, currentPrefix: prefix, searchTerm: "" }));
        setSelection({ paths: new Set(), isMultiMode: false });
    };

    const openRenameModal = (path: string) => {
        const name = path.replace(uiState.currentPrefix, "").replace("/", "");
        setModals(prev => ({
            ...prev,
            rename: { open: true, path, name, processing: false }
        }));
    };

    const breadcrumbs = uiState.currentPrefix.split("/").filter(Boolean);

    const filteredFolders = data?.folders.filter(f => {
        const name = f.replace(uiState.currentPrefix, "").replace("/", "");
        return name.toLowerCase().includes(uiState.searchTerm.toLowerCase());
    }) || [];

    const filteredFiles = data?.files.filter(f => {
        const name = f.name;
        return name.toLowerCase().includes(uiState.searchTerm.toLowerCase());
    }) || [];

    return {
        data,
        uiState, setUiState,
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
        handleFileClick,
        formatSize,
        navigateTo,
        openRenameModal,
        breadcrumbs,
        filteredFolders,
        filteredFiles
    };
}
