"use client";

import React from "react";
import { File, Folder, ChevronRight, Edit2, Trash2, CheckSquare, Square } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { type LocalFile } from "../hooks/use-local-storage-manager";

interface StorageFilesListProps {
    data: {
        folders: string[];
        files: LocalFile[];
        currentPrefix: string;
    };
    selection: {
        isMultiMode: boolean;
        selectedPaths: Set<string>;
        onToggle: (path: string) => void;
    };
    actions: {
        onNavigate: (path: string) => void;
        onFileClick: (file: LocalFile) => void;
        onRename: (path: string) => void;
        onDelete: (path: string) => void;
    };
    utils: {
        formatSize: (size: number) => string;
    };
}

export function StorageFilesList({
    data: { folders, files, currentPrefix },
    selection: { isMultiMode, selectedPaths, onToggle },
    actions: { onNavigate, onFileClick, onRename, onDelete },
    utils: { formatSize }
}: StorageFilesListProps) {
    const items = [
        ...folders.map(path => ({
            path,
            isDirectory: true,
            name: path.replace(currentPrefix, "").replace("/", "")
        })),
        ...files
    ];

    return (
        <ResponsiveDataView
            data={items}
            renderTable={() => (
                <div className="table-container">
                    <table className="crm-table">
                        <thead className="crm-thead">
                            <tr>
                                {isMultiMode && <th className="crm-th crm-td-selection"></th>}
                                <th className="crm-th">Наименование</th>
                                <th className="crm-th text-right">Размер</th>
                                <th className="crm-th crm-td-actions text-center">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="crm-tbody">
                            {(items || []).map((item) => {
                                const path = item.path;
                                const isDirectory = 'isDirectory' in item && item.isDirectory;
                                const name = isDirectory ? (item as { name: string }).name : (item as LocalFile).name;
                                const isSelected = selectedPaths.has(path);

                                return (
                                    <tr
                                        key={path}
                                        className={cn(
                                            "crm-tr-clickable group",
                                            isSelected && "crm-tr-selected"
                                        )}
                                        onClick={() => !isMultiMode && (isDirectory ? onNavigate(path) : onFileClick(item as LocalFile))}
                                    >
                                        {isMultiMode && (
                                            <td className="crm-td crm-td-selection">
                                                <button type="button"
                                                    onClick={(e) => { e.stopPropagation(); onToggle(path); }}
                                                    className="p-1 hover:bg-emerald-100 rounded transition-colors"
                                                >
                                                    {isSelected ? <CheckSquare size={20} className="text-emerald-600" /> : <Square size={20} className="text-slate-300" />}
                                                </button>
                                            </td>
                                        )}
                                        <td className="crm-td">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "p-2.5 rounded-[12px] group-hover:scale-110 transition-transform shadow-sm",
                                                    isDirectory ? "bg-amber-50 text-amber-500" : (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(name.split('.').pop()?.toLowerCase() || '') ? "bg-emerald-50 text-emerald-500" : "bg-slate-100 text-slate-400")
                                                )}>
                                                    {isDirectory ? <Folder size={18} fill="currentColor" fillOpacity={0.2} /> : <File size={18} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">{name}</p>
                                                    <p className="text-xs text-slate-400 font-bold">
                                                        {isDirectory ? "Папка" : (item as LocalFile).lastModified ? format(new Date((item as LocalFile).lastModified), "dd.MM.yyyy HH:mm", { locale: ru }) : "---"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="crm-td text-right">
                                            <span className="text-xs font-mono font-bold text-slate-500">{isDirectory ? "---" : formatSize((item as LocalFile).size)}</span>
                                        </td>
                                        <td className="crm-td crm-td-actions">
                                            <div className="flex items-center justify-center gap-2">
                                                {!isMultiMode && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => { e.stopPropagation(); onRename(path); }}
                                                            className="h-8 w-8 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50"
                                                            title="Переименовать"
                                                        >
                                                            <Edit2 size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => { e.stopPropagation(); onDelete(path); }}
                                                            className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                                                            title="Удалить"
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
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
                </div>
            )}
            renderCard={(item) => {
                const path = item.path;
                const isDirectory = 'isDirectory' in item && item.isDirectory;
                const name = isDirectory ? (item as { name: string }).name : (item as LocalFile).name;
                const isSelected = selectedPaths.has(path);

                return (
                    <div role="button" tabIndex={0}
                        key={path}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                        onClick={() => !isMultiMode && (isDirectory ? onNavigate(path) : onFileClick(item as LocalFile))}
                        className={cn(
                            "p-4 rounded-[24px] border transition-all active:scale-[0.98] flex items-center justify-between gap-4",
                            isSelected ? "crm-tr-selected" : "bg-white border-slate-100 shadow-sm"
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
                                    <span className="text-xs font-bold text-slate-400">
                                        {isDirectory ? "Папка" : formatSize((item as LocalFile).size)}
                                    </span>
                                    {!isDirectory && (item as LocalFile).lastModified && (
                                        <>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <span className="text-xs font-bold text-slate-400">
                                                {format(new Date((item as LocalFile).lastModified), "dd.MM.yyyy", { locale: ru })}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {isMultiMode ? (
                                <button type="button" onClick={(e) => { e.stopPropagation(); onToggle(path); }} className="p-2">
                                    {isSelected ? <CheckSquare size={20} className="text-emerald-600" /> : <Square size={20} className="text-slate-300" />}
                                </button>
                            ) : (
                                <>
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onRename(path); }} className="h-8 w-8 text-slate-300 hover:text-emerald-600"><Edit2 size={16} /></Button>
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(path); }} className="h-8 w-8 text-slate-300 hover:text-rose-500"><Trash2 size={16} /></Button>
                                    {isDirectory && <ChevronRight size={16} className="text-slate-300" />}
                                </>
                            )}
                        </div>
                    </div>
                );
            }}
            mobileGridClassName="grid grid-cols-1 gap-3 p-4"
        />
    );
}
