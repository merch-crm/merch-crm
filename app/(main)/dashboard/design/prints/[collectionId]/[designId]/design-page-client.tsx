"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { toast } from "sonner";
import { Plus, ArrowLeft, GripVertical } from "lucide-react";
import { DesignHeader } from "./components/design-header";
import { VersionCard } from "./components/version-card";
import { VersionFormDialog } from "./components/version-form-dialog";
import { VersionsEmptyState } from "./components/versions-empty-state";
import { DesignFormDialog } from "../components/design-form-dialog";
import {
  deleteDesign,
  updateVersionsOrder,
  deleteVersion,
  deleteFile,
  setDesignPreview,
} from "../../actions";

import { DesignWithFullData } from "@/lib/types";
import { formatCount } from "@/lib/pluralize";

interface DesignPageClientProps {
  design: DesignWithFullData;
}

export function DesignPageClient({ design }: DesignPageClientProps) {
  const router = useRouter();

  // Breadcrumbs
  const { setCustomTrail } = useBreadcrumbs();

  useEffect(() => {
    setCustomTrail([
      { label: "Дизайн", href: "/dashboard/design" },
      { label: "Коллекции принтов", href: "/dashboard/design/prints" },
      {
        label: design.collection.name,
        href: `/dashboard/design/prints/${design.collectionId}`,
      },
      { label: design.name, href: "" }, // Current page label
    ]);

    return () => setCustomTrail(null);
  }, [design, setCustomTrail]);

  // State
  const [versions, setVersions] = useState(design.versions);
  const [isSortMode, setIsSortMode] = useState(false);
  const [dialogs, setDialogs] = useState({ createVersion: false, editDesign: false, deleteDesign: false });
  const isCreateVersionDialogOpen = dialogs.createVersion;
  const isEditDesignDialogOpen = dialogs.editDesign;
  const isDeleteDesignDialogOpen = dialogs.deleteDesign;
  const setIsCreateVersionDialogOpen = (val: boolean) => setDialogs(d => ({ ...d, createVersion: val }));
  const setIsEditDesignDialogOpen = (val: boolean) => setDialogs(d => ({ ...d, editDesign: val }));
  const setIsDeleteDesignDialogOpen = (val: boolean) => setDialogs(d => ({ ...d, deleteDesign: val }));
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    new Set(versions.length > 0 ? [versions[0].id] : [])
  );

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Toggle version expansion
  const toggleVersion = (versionId: string) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(versionId)) {
        next.delete(versionId);
      } else {
        next.add(versionId);
      }
      return next;
    });
  };

  // Handle drag end for versions
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = versions.findIndex((v) => v.id === active.id);
        const newIndex = versions.findIndex((v) => v.id === over.id);

        const newVersions = arrayMove(versions, oldIndex, newIndex);
        setVersions(newVersions);

        const orderItems = newVersions.map((version, index) => ({
          id: version.id,
          sortOrder: index,
        }));

        const result = await updateVersionsOrder(design.id, orderItems);

        if (!result.success) {
          setVersions(versions);
          toast.error("Не удалось сохранить порядок");
        }
      }
    },
    [versions, design.id]
  );

  // Handle version created
  const handleVersionCreated = (versionId: string) => {
    setIsCreateVersionDialogOpen(false);
    setExpandedVersions((prev) => new Set(prev).add(versionId));
    router.refresh();
    toast.success("Версия создана");
  };

  // Handle design updated
  const handleDesignUpdated = () => {
    setIsEditDesignDialogOpen(false);
    router.refresh();
    toast.success("Принт обновлён");
  };

  // Handle delete design
  const handleDeleteDesign = async () => {
    if (design.linkedLines.length > 0) {
      toast.error(
        `Невозможно удалить: принт используется в ${design.linkedLines.length} линейках`
      );
      return;
    }

    if (versions.length > 0) {
      toast.error(
        `Невозможно удалить: у принта ${formatCount(versions.length, "версия", "версии", "версий")}. Сначала удалите все версии.`
      );
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteDesign(design.id);

      if (result.success) {
        toast.success("Принт удалён");
        router.push(`/dashboard/design/prints/${design.collectionId}`);
      } else {
        toast.error(result.error || "Не удалось удалить принт");
      }
    } catch (_error) {
      toast.error("Произошла ошибка при удалении");
    } finally {
      setIsDeleting(false);
      setIsDeleteDesignDialogOpen(false);
    }
  };

  // Handle delete version
  const handleDeleteVersion = async (versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (!version) return;

    if (version.files.length > 0) {
      toast.error(
        `Невозможно удалить: у версии ${formatCount(version.files.length, "файл", "файла", "файлов")}. Сначала удалите все файлы.`
      );
      return;
    }

    const result = await deleteVersion(versionId);

    if (result.success) {
      setVersions((prev) => prev.filter((v) => v.id !== versionId));
      toast.success("Версия удалена");
    } else {
      toast.error(result.error || "Не удалось удалить версию");
    }
  };

  // Handle file delete
  const handleFileDelete = async (fileId: string) => {
    const result = await deleteFile(fileId);

    if (result.success) {
      router.refresh();
      toast.success("Файл удалён");
    } else {
      toast.error(result.error || "Не удалось удалить файл");
    }
  };

  // Handle set as design preview
  const handleSetAsPreview = async (fileId: string) => {
    const result = await setDesignPreview(design.id, fileId);

    if (result.success) {
      router.refresh();
      toast.success("Превью принта обновлено");
    } else {
      toast.error(result.error || "Не удалось установить превью");
    }
  };

  // Check if can delete design
  const canDeleteDesign = design.linkedLines.length === 0 && versions.length === 0;

  // Calculate totals
  const totalFiles = versions.reduce((sum, v) => sum + v.files.length, 0);

  return (
    <div className="space-y-3">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push(`/dashboard/design/prints/${design.collectionId}`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {design.collection.name}
      </Button>

      {/* Header */}
      <DesignHeader design={design} versionsCount={versions.length} filesCount={totalFiles} onEdit={() => setIsEditDesignDialogOpen(true)}
        onDelete={() => setIsDeleteDesignDialogOpen(true)}
        canDelete={canDeleteDesign}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mt-8 mb-6">
        <h2 className="text-lg font-semibold">
          Версии ({versions.length})
        </h2>

        <div className="flex items-center gap-3">
          {versions.length > 1 && (
            <div className="flex items-center gap-2">
              <Switch id="sort-mode" checked={isSortMode} onCheckedChange={setIsSortMode} />
              <Label htmlFor="sort-mode" className="text-sm cursor-pointer">
                <GripVertical className="h-4 w-4 inline mr-1" />
                Сортировка
              </Label>
            </div>
          )}

          <Button onClick={() => setIsCreateVersionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить версию
          </Button>
        </div>
      </div>

      {/* Versions list */}
      {versions.length === 0 ? (
        <VersionsEmptyState onCreateClick={() => setIsCreateVersionDialogOpen(true)}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={versions.map((v) => v.id)}
            strategy={verticalListSortingStrategy}
            disabled={!isSortMode}
          >
            <div className="space-y-3">
              {versions.map((version) => (
                <VersionCard key={version.id} collectionId={design.collectionId} designId={design.id} version={version} isExpanded={expandedVersions.has(version.id)} isSortMode={isSortMode} onToggle={() => toggleVersion(version.id)}
                  onDelete={() => handleDeleteVersion(version.id)}
                  onUploadComplete={() => router.refresh()}
                  onFileDelete={handleFileDelete}
                  onSetAsPreview={handleSetAsPreview}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create version dialog */}
      <VersionFormDialog open={isCreateVersionDialogOpen} onOpenChange={setIsCreateVersionDialogOpen} designId={design.id} onSuccess={handleVersionCreated} />

      {/* Edit design dialog */}
      <DesignFormDialog open={isEditDesignDialogOpen} onOpenChange={setIsEditDesignDialogOpen} collectionId={design.collectionId} design={design} onSuccess={handleDesignUpdated} />

      {/* Delete design confirmation */}
      <AlertDialog open={isDeleteDesignDialogOpen} onOpenChange={setIsDeleteDesignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить принт?</AlertDialogTitle>
            <AlertDialogDescription>
              {canDeleteDesign ? (
                <>
                  Вы уверены, что хотите удалить принт &quot;{design.name}&quot;?
                  Это действие нельзя отменить.
                </>
              ) : (
                <>
                  Невозможно удалить принт &quot;{design.name}&quot;.
                  {design.linkedLines.length > 0 && (
                    <span className="block mt-2">
                      Принт используется в {design.linkedLines.length} линейках.
                    </span>
                  )}
                  {versions.length > 0 && (
                    <span className="block mt-2">
                      У принта {versions.length} версий. Сначала удалите все версии.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            {canDeleteDesign && (
              <AlertDialogAction onClick={handleDeleteDesign} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isDeleting ? "Удаление..." : "Удалить"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
