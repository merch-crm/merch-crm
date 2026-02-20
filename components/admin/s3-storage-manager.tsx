"use client";

import NextImage from "next/image";
import { formatCount } from "@/lib/pluralize";
import {
    RefreshCw,
    Trash2,
    File,
    Search,
    CloudUpload,
    FolderPlus,
    CheckSquare,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useS3StorageManager } from "./hooks/use-s3-storage-manager";
import { StorageStats } from "./s3-manager/storage-stats";
import { StorageBreadcrumbs } from "./s3-manager/storage-breadcrumbs";
import { StorageInfo } from "./s3-manager/storage-info";
import { StorageList } from "./s3-manager/storage-list";

// --- Constants & Helpers ---

const Z_INDEX = {
    loadingOverlay: 50,
} as const;


// --- Components ---



export function S3StorageManager() {
    const {
        data,
        loading,
        searchTerm, setSearchTerm,
        currentPrefix,
        deletingKey, setDeletingKey,
        isDeleting,
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
        allItemsSelected
    } = useS3StorageManager();

    return (
        <div className="space-y-4">
            {/* Header Info */}
            <StorageStats
                data={data}
                loading={loading}
                formatSize={formatSize}
                fetchData={fetchData}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* S3 Storage Management */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="border-slate-200 shadow-xl shadow-slate-200/40 bg-white rounded-[40px] border overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3.5 bg-primary text-white rounded-[24px] shadow-lg shadow-indigo-200">
                                            <CloudUpload size={24} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold text-slate-900">Облачное хранилище S3</CardTitle>
                                            <CardDescription className="text-xs font-bold  text-slate-400 mt-1">Управление структурой файлов</CardDescription>
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
                                            variant={selection.isMultiMode ? "default" : "secondary"}
                                            size="sm"
                                            onClick={() => {
                                                setSelection(prev => ({
                                                    isMultiMode: !prev.isMultiMode,
                                                    keys: new Set()
                                                }));
                                            }}
                                            className={cn(
                                                "gap-2",
                                                selection.isMultiMode ? "bg-primary hover:bg-primary/90" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-none"
                                            )}
                                        >
                                            <CheckSquare size={18} />
                                            <span className="text-xs font-bold">Выбор</span>
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setModals(prev => ({ ...prev, create: { ...prev.create, open: true } }))}
                                            className="gap-2 bg-indigo-50 text-primary hover:bg-indigo-100 border-none"
                                        >
                                            <FolderPlus size={18} />
                                            <span className="text-xs font-bold">Папка</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Multi-select Actions Bar */}
                                {selection.isMultiMode && selection.keys.size > 0 && (
                                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-[18px] border border-indigo-100">
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1.5 bg-primary text-white rounded-[18px] text-xs font-bold">
                                                {selection.keys.size}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">выбрано</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => selectAll(filteredFolders, filteredFiles)}
                                                className="bg-white text-slate-600 hover:bg-slate-50 text-xs h-8"
                                            >
                                                Выбрать все
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={deselectAll}
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

                                {/* Breadcrumbs */}
                                <StorageBreadcrumbs
                                    currentPrefix={currentPrefix}
                                    breadcrumbs={breadcrumbs}
                                    navigateTo={navigateTo}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <StorageList
                                loading={loading}
                                filteredFolders={filteredFolders}
                                filteredFiles={filteredFiles}
                                selection={selection}
                                currentPrefix={currentPrefix}
                                allItemsSelected={allItemsSelected}
                                toggleSelection={toggleSelection}
                                selectAll={selectAll}
                                deselectAll={deselectAll}
                                navigateTo={navigateTo}
                                openRenameModal={openRenameModal}
                                handleFileClick={handleFileClick}
                                setDeletingKey={setDeletingKey}
                                setModals={setModals}
                                formatSize={formatSize}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Local Storage Info & Actions */}
                <StorageInfo data={data} formatSize={formatSize} />
            </div>

            {/* Create Folder Dialog */}
            <ResponsiveModal
                isOpen={modals.create.open}
                onClose={() => setModals(prev => ({ ...prev, create: { ...prev.create, open: false } }))}
                title="Новая папка"
                description={`Введите имя папки. Она будет создана в: ${currentPrefix || "/"}`}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400">Имя папки</label>
                        <Input
                            type="text"
                            placeholder="Название папки..."
                            value={modals.create.name}
                            onChange={(e) => setModals(prev => ({ ...prev, create: { ...prev.create, name: e.target.value } }))}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                            autoFocus
                            className="w-full text-lg font-bold"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={() => setModals(prev => ({ ...prev, create: { ...prev.create, open: false } }))}
                            className="px-8 rounded-[18px] font-bold text-xs text-slate-400 py-6"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleCreateFolder}
                            disabled={modals.create.processing || !modals.create.name.trim()}
                            className="bg-primary hover:bg-primary/90 text-white px-10 rounded-[18px] font-bold text-xs py-6 shadow-lg shadow-indigo-200"
                        >
                            {modals.create.processing ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : "Создать"}
                        </Button>
                    </div>
                </div>
            </ResponsiveModal>

            {/* Rename Dialog */}
            <ResponsiveModal
                isOpen={modals.rename.open}
                onClose={() => setModals(prev => ({ ...prev, rename: { ...prev.rename, open: false } }))}
                title="Переименование"
                description={`Введите новое имя для ${modals.rename.key?.endsWith("/") ? "папки" : "файла"}`}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400">Новое имя</label>
                        <Input
                            type="text"
                            placeholder="Новое имя..."
                            value={modals.rename.name}
                            onChange={(e) => setModals(prev => ({ ...prev, rename: { ...prev.rename, name: e.target.value } }))}
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                            autoFocus
                            className="w-full text-lg font-bold"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={() => setModals(prev => ({ ...prev, rename: { ...prev.rename, open: false } }))}
                            className="px-8 rounded-[18px] font-bold text-xs text-slate-400 py-6"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleRename}
                            disabled={modals.rename.processing || !modals.rename.name.trim()}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-10 rounded-[18px] font-bold text-xs py-6 shadow-lg shadow-amber-200"
                        >
                            {modals.rename.processing ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : "Переименовать"}
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
                isOpen={modals.multiDelete.open}
                onClose={() => setModals(prev => ({ ...prev, multiDelete: { ...prev.multiDelete, open: false } }))}
                onConfirm={handleDeleteMultiple}
                title="Массовое удаление"
                description={`Вы собираетесь удалить ${formatCount(selection.keys.size, 'объект', 'объекта', 'объектов')}. Это действие необратимо и все выбранные файлы и папки будут удалены навсегда.`}
                confirmText={`Удалить ${formatCount(selection.keys.size, 'объект', 'объекта', 'объектов')}`}
                variant="destructive"
                isLoading={modals.multiDelete.processing}
            />

            {/* Preview Dialog */}
            <ResponsiveModal
                isOpen={!!preview.file}
                onClose={() => setPreview(prev => ({ ...prev, file: null }))}
                title="Просмотр файла"
                description={preview.file?.name || "Информация о файле"}
            >
                {preview.file && (
                    <div className="space-y-4">
                        <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
                            {preview.file.type === 'image' ? (
                                <NextImage
                                    src={preview.file.url}
                                    alt={preview.file.name}
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
                                    onClick={() => openInNewTab(preview.file!.url)}
                                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl border-none h-10 w-10"
                                    aria-label="Открыть в новой вкладке"
                                >
                                    <ExternalLink size={18} />
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => openInNewTab(preview.file!.url)}
                                className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl font-bold h-12"
                            >
                                <ExternalLink size={16} className="mr-2" />
                                Открыть
                            </Button>
                            <Button
                                onClick={() => setPreview(prev => ({ ...prev, file: null }))}
                                className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold h-12 shadow-md shadow-primary/10"
                            >
                                Закрыть
                            </Button>
                        </div>
                    </div>
                )}
            </ResponsiveModal>

            {/* Loading Overlay for Preview */}
            {preview.loading && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-white"
                    style={{ zIndex: Z_INDEX.loadingOverlay }}
                >
                    <RefreshCw className="animate-spin" size={48} />
                    <p className="text-xs font-bold ">Генерация ссылки...</p>
                </div>
            )}
        </div>
    );
}
