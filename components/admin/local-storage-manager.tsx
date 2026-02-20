"use client";

import React from "react";
import { RefreshCw, Trash2, File } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCount } from "@/lib/pluralize";
import { useToast } from "@/components/ui/toast";
import { useLocalStorageManager } from "./hooks/use-local-storage-manager";

// Sub-components
import { StorageStats } from "./local-storage-manager/StorageStats";
import { StorageBrowserHeader } from "./local-storage-manager/StorageBrowserHeader";
import { StorageBreadcrumbs } from "./local-storage-manager/StorageBreadcrumbs";
import { StorageFilesList } from "./local-storage-manager/StorageFilesList";
import { CreateFolderModal } from "./local-storage-manager/modals/CreateFolderModal";
import { RenameModal } from "./local-storage-manager/modals/RenameModal";
import { PreviewModal } from "./local-storage-manager/modals/PreviewModal";

export function LocalStorageManager() {
    const {
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
    } = useLocalStorageManager();
    const { toast } = useToast();

    const handleExternalOpen = (url: string) => {
        const win = window.open(url, '_blank');
        if (!win) {
            toast("Браузер заблокировал открытие файла. Разрешите всплывающие окна.", "error");
        }
    };

    return (
        <div className="space-y-4">
            {/* Header Stats */}
            <StorageStats
                fileCount={data?.stats.fileCount || 0}
                folderCount={data?.stats.folderCount || 0}
                totalSize={formatSize(data?.stats.size || 0)}
                loading={uiState.loading}
                onRefresh={() => fetchData(true)}
            />

            {/* File Browser */}
            <Card className="border-slate-200 shadow-xl shadow-slate-200/40 bg-white rounded-[40px] border overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <div className="flex flex-col gap-4">
                        <StorageBrowserHeader
                            searchTerm={uiState.searchTerm}
                            onSearchChange={(val) => setUiState(prev => ({ ...prev, searchTerm: val }))}
                            isMultiMode={selection.isMultiMode}
                            onToggleMultiMode={() => setSelection(prev => ({
                                isMultiMode: !prev.isMultiMode,
                                paths: new Set()
                            }))}
                            onCreateFolder={() => setModals(prev => ({ ...prev, create: { ...prev.create, open: true } }))}
                        />

                        {/* Multi-select Actions Bar */}
                        {selection.isMultiMode && selection.paths.size > 0 && (
                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-[18px] border border-emerald-100">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1.5 bg-emerald-600 text-white rounded-[18px] text-xs font-bold">
                                        {selection.paths.size}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">выбрано</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => selectAll(filteredFolders, filteredFiles)}
                                        className="bg-white text-emerald-600 hover:bg-emerald-50 text-xs h-8"
                                    >
                                        Выбрать все
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setSelection(prev => ({ ...prev, paths: new Set() }))}
                                        className="bg-white text-slate-600 hover:bg-slate-50 text-xs h-8"
                                    >
                                        Снять выбор
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setModals(prev => ({ ...prev, multiDelete: { ...prev.multiDelete, open: true } }))}
                                        className="gap-2 text-xs h-8"
                                    >
                                        <Trash2 size={14} />
                                        Удалить
                                    </Button>
                                </div>
                            </div>
                        )}

                        <StorageBreadcrumbs
                            currentPrefix={uiState.currentPrefix}
                            breadcrumbs={breadcrumbs}
                            onNavigate={navigateTo}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="h-[500px] overflow-y-auto">
                        {uiState.loading ? (
                            <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-slate-300">
                                <RefreshCw className="animate-spin" size={48} />
                                <p className="text-xs font-bold">Загрузка...</p>
                            </div>
                        ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-slate-300">
                                <div className="p-6 bg-slate-50 rounded-full">
                                    <File size={48} className="opacity-20" />
                                </div>
                                <p className="text-xs font-bold">Здесь пока пусто</p>
                            </div>
                        ) : (
                            <StorageFilesList
                                data={{
                                    folders: filteredFolders,
                                    files: filteredFiles,
                                    currentPrefix: uiState.currentPrefix
                                }}
                                selection={{
                                    isMultiMode: selection.isMultiMode,
                                    selectedPaths: selection.paths,
                                    onToggle: toggleSelection
                                }}
                                actions={{
                                    onNavigate: navigateTo,
                                    onFileClick: handleFileClick,
                                    onRename: openRenameModal,
                                    onDelete: (path) => setModals(prev => ({ ...prev, delete: { path, processing: false } }))
                                }}
                                utils={{
                                    formatSize: formatSize
                                }}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            <CreateFolderModal
                isOpen={modals.create.open}
                onClose={() => setModals(prev => ({ ...prev, create: { ...prev.create, open: false } }))}
                currentPrefix={uiState.currentPrefix}
                name={modals.create.name}
                onNameChange={(name) => setModals(prev => ({ ...prev, create: { ...prev.create, name } }))}
                onConfirm={handleCreateFolder}
                processing={modals.create.processing}
            />

            <RenameModal
                isOpen={modals.rename.open}
                onClose={() => setModals(prev => ({ ...prev, rename: { ...prev.rename, open: false } }))}
                path={modals.rename.path}
                name={modals.rename.name}
                onNameChange={(name) => setModals(prev => ({ ...prev, rename: { ...prev.rename, name } }))}
                onConfirm={handleRename}
                processing={modals.rename.processing}
            />

            <ConfirmDialog
                isOpen={!!modals.delete.path}
                onClose={() => setModals(prev => ({ ...prev, delete: { path: null, processing: false } }))}
                onConfirm={handleDelete}
                title="Удалить с диска?"
                description={`Вы собираетесь удалить "${modals.delete.path?.split('/').pop()}". Это действие необратимо и файл будет удален с сервера.`}
                confirmText="Удалить"
                variant="destructive"
                isLoading={modals.delete.processing}
            />

            <ConfirmDialog
                isOpen={modals.multiDelete.open}
                onClose={() => setModals(prev => ({ ...prev, multiDelete: { ...prev.multiDelete, open: false } }))}
                onConfirm={handleDeleteMultiple}
                title="Массовое удаление"
                description={`Вы собираетесь удалить ${formatCount(selection.paths.size, 'объект', 'объекта', 'объектов')} с диска сервера. Это действие необратимо.`}
                confirmText={`Удалить ${formatCount(selection.paths.size, 'объект', 'объекта', 'объектов')}`}
                variant="destructive"
                isLoading={modals.multiDelete.processing}
            />

            <PreviewModal
                file={preview.file}
                onClose={() => setPreview({ file: null })}
                onExternalOpen={handleExternalOpen}
            />
        </div>
    );
}
