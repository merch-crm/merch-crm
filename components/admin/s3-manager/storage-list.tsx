"use client";

import React from "react";
import {
    Folder,
    File,
    Eye,
    Edit2,
    Trash2,
    CheckSquare,
    Square,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { FolderRow } from "./folder-row";
import { FileRow } from "./file-row";
import { isImageFile } from "../hooks/use-s3-storage-manager";
import { StorageFile } from "../types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "---";
    try {
        return format(new Date(date), "dd.MM.yy HH:mm", { locale: ru });
    } catch {
        return "---";
    }
};

interface StorageListProps {
    loading: boolean;
    filteredFolders: string[];
    filteredFiles: StorageFile[];
    selection: {
        isMultiMode: boolean;
        keys: Set<string>;
    };
    currentPrefix: string;
    allItemsSelected: boolean;
    toggleSelection: (key: string) => void;
    selectAll: (folders: string[], files: StorageFile[]) => void;
    deselectAll: () => void;
    navigateTo: (path: string) => void;
    openRenameModal: (key: string) => void;
    handleFileClick: (file: StorageFile) => void;
    setDeletingKey: (key: string | null) => void;
    setModals: React.Dispatch<React.SetStateAction<{
        create: { open: boolean; name: string; processing: boolean; };
        rename: { open: boolean; key: string | null; name: string; processing: boolean; };
        multiDelete: { open: boolean; processing: boolean; };
    }>>;
    formatSize: (bytes: number) => string;
}

export const StorageList = ({
    loading,
    filteredFolders,
    filteredFiles,
    selection,
    currentPrefix,
    allItemsSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    navigateTo,
    openRenameModal,
    handleFileClick,
    setDeletingKey,
    setModals,
    formatSize
}: StorageListProps) => {
    return (
        <div className="h-[500px] overflow-y-auto">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300">
                    <RefreshCw className="animate-spin" size={48} />
                    <p className="text-xs font-bold ">Загрузка...</p>
                </div>
            ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300">
                    <div className="p-6 bg-slate-50 rounded-full">
                        <File size={48} className="opacity-20" />
                    </div>
                    <p className="text-xs font-bold ">Здесь пока пусто</p>
                </div>
            ) : (
                <ResponsiveDataView
                    data={[...filteredFolders, ...filteredFiles]}
                    renderTable={() => (
                        <div className="table-container">
                            <table className="crm-table">
                                <thead className="crm-thead">
                                    <tr>
                                        {selection.isMultiMode && (
                                            <th className="crm-th crm-td-selection text-center">
                                                <button type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (allItemsSelected) {
                                                            deselectAll();
                                                        } else {
                                                            selectAll(filteredFolders, filteredFiles);
                                                        }
                                                    }}
                                                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                                                    aria-label={allItemsSelected ? "Снять выделение со всех" : "Выбрать все"}
                                                    aria-pressed={allItemsSelected}
                                                >
                                                    {allItemsSelected ? (
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
                                            isSelected={selection.keys.has(folderPrefix)}
                                            isMultiSelectMode={selection.isMultiMode}
                                            onSelect={toggleSelection}
                                            onNavigate={navigateTo}
                                            onRename={openRenameModal}
                                            onDelete={(key) => setModals((prev) => ({ ...prev, rename: { ...prev.rename, key, open: true } }))}
                                        />
                                    ))}
                                    {filteredFiles.map((file) => (
                                        <FileRow
                                            key={file.key}
                                            file={file}
                                            currentPrefix={currentPrefix}
                                            isSelected={selection.keys.has(file.key)}
                                            isMultiSelectMode={selection.isMultiMode}
                                            onSelect={toggleSelection}
                                            onClick={handleFileClick}
                                            onRename={openRenameModal}
                                            onDelete={(key) => setModals((prev) => ({ ...prev, rename: { ...prev.rename, key, open: true } }))}
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
                        const isSelected = selection.keys.has(key);

                        if (isFolder) {
                            return (
                                <div key={key} className={cn("bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group", isSelected && "ring-2 ring-primary/20 bg-primary/5")}>
                                    <div role="button" tabIndex={0} className="flex items-center gap-3 overflow-hidden cursor-pointer" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={() => !selection.isMultiMode && navigateTo(key)}>
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                            <Folder size={20} fill="currentColor" fillOpacity={0.2} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                                            <p className="text-xs text-slate-400 font-bold">Папка</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {selection.isMultiMode ? (
                                            <button type="button"
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
                                                <Button variant="ghost" size="icon" onClick={() => setModals((prev) => ({ ...prev, rename: { ...prev.rename, key, open: true } }))} className="h-8 w-8 text-slate-300 hover:text-rose-500" aria-label="Удалить"><Trash2 size={16} /></Button>
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
                                    <div role="button" tabIndex={0} className="flex items-center gap-3 overflow-hidden cursor-pointer" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={() => handleFileClick(file)}>
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", isImage ? "bg-indigo-50 text-indigo-500" : "bg-slate-100 text-slate-400")}>
                                            {isImage ? <Eye size={20} /> : <File size={20} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                                            <p className="text-xs text-slate-400 font-medium">{formatSize(file.size)} • {formatDate(file.lastModified)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {selection.isMultiMode ? (
                                            <button type="button"
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
    );
};
