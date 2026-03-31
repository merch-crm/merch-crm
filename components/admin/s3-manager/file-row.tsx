"use client";

import { File, Eye } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { S3RowBase } from "./s3-row-base";
import { isImageFile } from "../hooks/use-s3-storage-manager";
import { StorageFile } from "../types";

const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "---";
    try {
        return format(new Date(date), "dd.MM.yy HH:mm", { locale: ru });
    } catch {
        return "---";
    }
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

export const FileRow = ({
    file,
    currentPrefix,
    isSelected,
    isMultiSelectMode,
    onSelect,
    onClick,
    onRename,
    onDelete,
    formatSize
}: FileRowProps) => {
    const name = file.key.replace(currentPrefix, "");
    const isImage = isImageFile(name);

    return (
        <S3RowBase
            isSelected={isSelected}
            isMultiSelectMode={isMultiSelectMode}
            onSelect={() => onSelect(file.key)}
            onClick={() => onClick(file)}
            onRename={() => onRename(file.key)}
            onDelete={() => onDelete(file.key)}
            icon={isImage ? <Eye size={18} /> : <File size={18} />}
            iconWrapperClass={isImage ? "bg-indigo-50 text-indigo-500" : "bg-slate-100 text-slate-400"}
            title={name}
            subtitle={formatDate(file.lastModified)}
            rightText={formatSize(file.size)}
            extraActions={
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
            }
        />
    );
};
