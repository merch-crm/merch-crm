"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    GripVertical,
    MoreHorizontal,
    Pencil,
    Trash2,
    Power,
    PowerOff,
    Play,
    Clock,
    CheckCircle2,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";

import { LineFormDialog } from "./line-form-dialog";
import { updateProductionLine, deleteProductionLine, ProductionLineWithStats } from "../../actions/line-actions";
import { ApplicationType } from "@/lib/schema/production";

interface LineCardProps {
    line: ProductionLineWithStats;
    applicationTypes: ApplicationType[];
    isSorting: boolean;
    onUpdate: (line: ProductionLineWithStats) => void;
    onDelete: (id: string) => void;
}

export function LineCard({
    line,
    applicationTypes,
    isSorting,
    onUpdate,
    onDelete,
}: LineCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: line.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleToggleActive = async () => {
        const result = await updateProductionLine(line.id, {
            isActive: !line.isActive,
        });

        if (result.success && result.data) {
            onUpdate({
                ...result.data,
                stats: line.stats,
                applicationType: line.applicationType
            });
            toast.success(line.isActive ? "Линия деактивирована" : "Линия активирована");
        } else {
            toast.error(result.error || "Ошибка обновления статуса");
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteProductionLine(line.id);

        if (result.success) {
            onDelete(line.id);
            toast.success("Линия удалена");
        } else {
            toast.error(result.error || "Ошибка удаления");
        }
        setIsDeleting(false);
        setIsDeleteOpen(false);
    };

    const utilizationPercent = line.capacity && line.stats.inProgress > 0
        ? Math.min(Math.round((line.stats.inProgress / line.capacity) * 100), 100)
        : 0;

    return (
        <>
            <Card
                ref={setNodeRef}
                style={style}
                className={`transition-shadow ${isDragging ? "shadow-lg" : ""} ${!line.isActive ? "opacity-60" : ""}`}
            >
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            {isSorting && (
                                <button
                                    type="button"
                                    {...attributes}
                                    {...listeners}
                                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground"
                                >
                                    <GripVertical className="h-4 w-4" />
                                </button>
                            )}

                            <div
                                className="w-4 h-12 rounded"
                                style={{ backgroundColor: line.color || "#6B7280" }}
                            />

                            <div>
                                <h3 className="font-medium">{line.name}</h3>
                                <p className="text-sm text-muted-foreground font-mono">{line.code}</p>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Редактировать
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleToggleActive}>
                                    {line.isActive ? (
                                        <>
                                            <PowerOff className="mr-2 h-4 w-4" />
                                            Деактивировать
                                        </>
                                    ) : (
                                        <>
                                            <Power className="mr-2 h-4 w-4" />
                                            Активировать
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setIsDeleteOpen(true)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Удалить
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* Type & Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {line.applicationType && (
                            <Badge
                                variant="secondary"
                                style={{
                                    backgroundColor: line.applicationType.color
                                        ? `${line.applicationType.color}20`
                                        : undefined,
                                    color: line.applicationType.color || undefined,
                                }}
                            >
                                {line.applicationType.name}
                            </Badge>
                        )}
                        {!line.isActive && (
                            <Badge variant="outline" className="text-muted-foreground">
                                Неактивна
                            </Badge>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-muted/50 rounded">
                            <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                                <Clock className="h-3 w-3" />
                            </div>
                            <p className="text-lg font-semibold">{line.stats.pending}</p>
                            <p className="text-xs text-muted-foreground">Ожидает</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                                <Play className="h-3 w-3" />
                            </div>
                            <p className="text-lg font-semibold">{line.stats.inProgress}</p>
                            <p className="text-xs text-muted-foreground">В работе</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                                <CheckCircle2 className="h-3 w-3" />
                            </div>
                            <p className="text-lg font-semibold">{line.stats.completed}</p>
                            <p className="text-xs text-muted-foreground">Завершено</p>
                        </div>
                    </div>

                    {/* Capacity */}
                    {line.capacity && (
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Загрузка</span>
                                <span>{utilizationPercent}%</span>
                            </div>
                            <Progress value={utilizationPercent} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                                Мощность: {line.capacity} ед/день
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <LineFormDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                line={line}
                applicationTypes={applicationTypes}
                onSuccess={(updated) => {
                    onUpdate(updated);
                    setIsEditOpen(false);
                    toast.success("Линия обновлена");
                }}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить линию?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить &quot;{line.name}&quot;? Это действие нельзя отменить.
                            {line.stats.inProgress > 0 && (
                                <span className="block mt-2 text-destructive">
                                    Внимание: на линии есть активные задачи!
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Удаление..." : "Удалить"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
