"use client";

import { Folder, ChevronRight } from "lucide-react";
import { S3RowBase } from "./s3-row-base";

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

export const FolderRow = ({
    folderPrefix,
    currentPrefix,
    isSelected,
    isMultiSelectMode,
    onSelect,
    onNavigate,
    onRename,
    onDelete
}: FolderRowProps) => {
    const name = folderPrefix.replace(currentPrefix, "").replace("/", "");

    return (
        <S3RowBase
            isSelected={isSelected}
            isMultiSelectMode={isMultiSelectMode}
            onSelect={() => onSelect(folderPrefix)}
            onClick={() => !isMultiSelectMode && onNavigate(folderPrefix)}
            onRename={() => onRename(folderPrefix)}
            onDelete={() => onDelete(folderPrefix)}
            icon={<Folder size={18} fill="currentColor" fillOpacity={0.2} />}
            iconWrapperClass="bg-amber-50 text-amber-500"
            title={name}
            subtitle="Папка"
            extraActions={
                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors ml-1" />
            }
        />
    );
};
