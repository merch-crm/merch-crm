"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import {
    GripVertical,
    MoreHorizontal,
    Pencil,
    Trash2,
    Power,
    PowerOff,
    Factory,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    "crm-card transition-all group relative overflow-hidden",
                    isDragging ? "shadow-2xl scale-[1.02] z-10" : "hover:shadow-xl hover:-translate-y-1",
                    !line.isActive && "opacity-60 grayscale-[0.5]"
                )}
            >
                {/* Visual Accent Bar */}
                <div 
                    className="absolute top-0 left-0 w-full h-1.5 opacity-80"
                    style={{ backgroundColor: line.color || "#6B7280" }}
                />

                <div className="pt-2 flex flex-col gap-3">
                    {/* Header: Name, Code & Context Menu */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            {isSorting && (
                                <button
                                    type="button"
                                    {...attributes}
                                    {...listeners}
                                    className="cursor-grab active:cursor-grabbing p-1.5 -ml-1.5 text-slate-400 hover:text-primary transition-colors bg-slate-50 rounded-lg border border-slate-100"
                                >
                                    <GripVertical className="h-4 w-4" />
                                </button>
                            )}

                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 truncate leading-tight">{line.name}</h3>
                                <p className="text-xs font-bold text-slate-400 mt-0.5 ">{line.code}</p>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl">
                                <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="rounded-lg gap-2">
                                    <Pencil className="h-4 w-4 text-slate-500" />
                                    <span>Редактировать</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleToggleActive} className="rounded-lg gap-2">
                                    {line.isActive ? (
                                        <>
                                            <PowerOff className="h-4 w-4 text-amber-500" />
                                            <span>Деактивировать</span>
                                        </>
                                    ) : (
                                        <>
                                            <Power className="h-4 w-4 text-emerald-500" />
                                            <span>Активировать</span>
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-50" />
                                <DropdownMenuItem
                                    onClick={() => setIsDeleteOpen(true)}
                                    className="text-rose-600 rounded-lg gap-2 focus:bg-rose-50 focus:text-rose-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Удалить линию</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Tags Section */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {line.applicationType && (
                            <div
                                className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                                style={{
                                    backgroundColor: line.applicationType.color
                                        ? `${line.applicationType.color}10`
                                        : "#f8fafc",
                                    borderColor: line.applicationType.color
                                        ? `${line.applicationType.color}30`
                                        : "#e2e8f0",
                                    color: line.applicationType.color || "#64748b",
                                }}
                            >
                                {line.applicationType.name}
                            </div>
                        )}
                        {!line.isActive && (
                            <div className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200">
                                Неактивна
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center group/stat">
                            <span className="text-xl font-bold text-slate-900">{line.stats.pending}</span>
                            <span className="text-xs font-bold text-slate-400 mt-0.5 ">Ожидают</span>
                        </div>
                        <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex flex-col items-center">
                            <span className="text-xl font-bold text-blue-600">{line.stats.inProgress}</span>
                            <span className="text-xs font-bold text-blue-400 mt-0.5 ">В работе</span>
                        </div>
                        <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex flex-col items-center">
                            <span className="text-xl font-bold text-emerald-600">{line.stats.completed}</span>
                            <span className="text-xs font-bold text-emerald-400 mt-0.5 ">Готово</span>
                        </div>
                    </div>

                    {/* Capacity and Progress */}
                    {line.capacity && (
                        <div className="pt-2">
                            <div className="flex items-center justify-between text-xs font-bold mb-2">
                                <span className="text-slate-500 ">Загрузка линии</span>
                                <span className={cn(
                                    utilizationPercent > 80 ? "text-rose-500" : 
                                    utilizationPercent > 50 ? "text-amber-500" : "text-emerald-500"
                                )}>
                                    {utilizationPercent}%
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                <div 
                                    className={cn(
                                        "h-full transition-all duration-1000",
                                        utilizationPercent > 80 ? "bg-rose-500" : 
                                        utilizationPercent > 50 ? "bg-amber-500" : "bg-emerald-500"
                                    )}
                                    style={{ width: `${utilizationPercent}%` }}
                                />
                            </div>
                            <div className="flex items-center gap-1.5 mt-2.5 text-slate-400">
                                <Factory className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Мощность: {line.capacity} ед/день</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Dialog */}
            <LineFormDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                line={line}
                applicationTypes={applicationTypes}
                onSuccess={(updated) => {
                    onUpdate({ ...line, ...updated });
                    setIsEditOpen(false);
                    toast.success("Линия обновлена");
                }}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent className="rounded-2xl border-slate-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить линию?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить &quot;{line.name}&quot;? Это действие нельзя отменить.
                            {line.stats.inProgress > 0 && (
                                <span className="block mt-2 text-rose-600 font-bold saturate-[0.8]">
                                    Внимание: на линии есть активные задачи!
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl border-slate-200">Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-rose-600 text-white hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-200 border-none"
                        >
                            {isDeleting ? "Удаление..." : "Удалить"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
