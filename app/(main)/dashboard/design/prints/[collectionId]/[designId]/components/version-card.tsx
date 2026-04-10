"use client";

import { useState } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Trash2,
  Image as ImageIcon,
  FileStack,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUploadZone } from "./file-upload-zone";
import { FileTable } from "./file-table";

import { VersionWithFiles } from "@/lib/types";

interface VersionCardProps {
  collectionId: string;
  designId: string;
  version: VersionWithFiles;
  isExpanded: boolean;
  isSortMode: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUploadComplete: () => void;
  onFileDelete: (fileId: string) => Promise<void>;
  onSetAsPreview: (fileId: string) => Promise<void>;
}

export function VersionCard({
  collectionId,
  designId,
  version,
  isExpanded,
  isSortMode,
  onToggle,
  onDelete,
  onUploadComplete,
  onFileDelete,
  onSetAsPreview,
}: VersionCardProps) {
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: version.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // File counts
  const previewFiles = version.files.filter((f) => f.fileType === "preview");
  const sourceFiles = version.files.filter((f) => f.fileType === "source");

  // Handle file delete confirmation
  const handleDeleteFile = async () => {
    if (deleteFileId) {
      await onFileDelete(deleteFileId);
      setDeleteFileId(null);
    }
  };

  const canDelete = version.files.length === 0;

  return (
    <Card ref={setNodeRef} style={style} className={cn( "transition-all", isDragging && "opacity-50 shadow-lg z-50", isSortMode && "ring-2 ring-primary/20" )}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CardHeader className="p-4">
          <div className="flex items-center gap-3">
            {/* Drag handle */}
            {isSortMode && (
              <div
                {...attributes}
                {...listeners}
                className="p-1 cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
            )}

            {/* Preview thumbnail */}
            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {version.preview ? (
                <Image src={version.preview} alt={version.name} width={48} height={48} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
              )}
            </div>

            {/* Title and stats */}
            <div className="flex-1 min-w-0">
              <CollapsibleTrigger asChild>
                <button type="button" className="flex items-center gap-2 text-left w-full group">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium truncate group-hover:text-primary transition-colors">
                    {version.name}
                  </span>
                </button>
              </CollapsibleTrigger>
              <div className="flex items-center gap-3 mt-1 ml-6">
                <Badge className="text-xs" color="neutral">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {previewFiles.length} превью
                </Badge>
                <Badge color="primary" variant="outline" className="text-xs">
                  <FileStack className="h-3 w-3 mr-1" />
                  {sourceFiles.length} исходников
                </Badge>
              </div>
            </div>

            {/* Delete button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" color="neutral" size="icon" className={cn( "h-8 w-8", canDelete ? "text-muted-foreground hover:text-destructive" : "text-muted-foreground/50 cursor-not-allowed" )} disabled={!canDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить версию?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {canDelete ? (
                      <>
                        Вы уверены, что хотите удалить версию &quot;{version.name}&quot;?
                        Это действие нельзя отменить.
                      </>
                    ) : (
                      <>
                        Невозможно удалить версию &quot;{version.name}&quot;.
                        У версии {version.files.length} файлов. Сначала удалите все файлы.
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  {canDelete && (
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Удалить
                    </AlertDialogAction>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="px-4 pb-4 pt-0">
            {/* File upload zone */}
            <FileUploadZone collectionId={collectionId} designId={designId} versionId={version.id} onUploadComplete={onUploadComplete} />

            {/* Files table */}
            {version.files.length > 0 && (
              <div className="mt-4">
                <FileTable files={version.files} onDelete={(fileId: string) => setDeleteFileId(fileId)}
                  onSetAsPreview={onSetAsPreview}
                />
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Delete file confirmation */}
      <AlertDialog open={!!deleteFileId} onOpenChange={(open: boolean) => !open && setDeleteFileId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить файл?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот файл? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
