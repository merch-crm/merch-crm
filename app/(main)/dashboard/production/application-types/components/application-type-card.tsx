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
    Clock,
    Palette,
    Ruler
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

import { ApplicationTypeFormDialog } from "./application-type-form-dialog";
import { updateApplicationType, deleteApplicationType } from "../../actions/application-type-actions";

type ApplicationType = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: "print" | "embroidery" | "engraving" | "transfer" | "other";
    icon: string | null;
    color: string | null;
    minQuantity: number | null;
    maxColors: number | null;
    maxPrintArea: string | null;
    baseCost: number | null;
    costPerUnit: number | null;
    setupCost: number | null;
    estimatedTime: number | null;
    setupTime: number | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
};

interface ApplicationTypeCardProps {
    type: ApplicationType;
    isSorting: boolean;
    onUpdate: (type: ApplicationType) => void;
    onDelete: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
    print: "Печать",
    embroidery: "Вышивка",
    engraving: "Гравировка",
    transfer: "Термоперенос",
    other: "Прочее",
};

export function ApplicationTypeCard({
    type,
    isSorting,
    onUpdate,
    onDelete,
}: ApplicationTypeCardProps) {
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
    } = useSortable({ id: type.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleToggleActive = async () => {
        const result = await updateApplicationType(type.id, {
            isActive: !type.isActive,
        });

        if (result.success && result.data) {
            onUpdate(result.data as ApplicationType);
            toast.success(type.isActive ? "Тип деактивирован" : "Тип активирован");
        } else {
            toast.error(result.error);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteApplicationType(type.id);

        if (result.success) {
            onDelete(type.id);
            toast.success("Тип удалён");
        } else {
            toast.error(result.error);
        }
        setIsDeleting(false);
        setIsDeleteOpen(false);
    };

    const formatCost = (value: number | null) => {
        if (!value) return "—";
        return `${(value / 100).toFixed(0)} ₽`;
    };

    const formatTime = (minutes: number | null) => {
        if (!minutes) return "—";
        if (minutes < 60) return `${minutes} мин`;
        return `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
    };

    return (
        <>
            <Card
                ref={setNodeRef}
                style={style}
                className={`relative transition-shadow ${isDragging ? "shadow-lg" : ""
                    } ${!type.isActive ? "opacity-60" : ""}`}
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

                            {/* Color indicator */}
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium"
                                style={{ backgroundColor: type.color || "#6B7280" }}
                            >
                                {type.name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <h3 className="font-medium leading-none">{type.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{type.slug}</p>
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
                                    {type.isActive ? (
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
                    {/* Category & Status */}
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{categoryLabels[type.category]}</Badge>
                        {!type.isActive && (
                            <Badge variant="outline" className="text-muted-foreground">
                                Неактивен
                            </Badge>
                        )}
                    </div>

                    {/* Description */}
                    {type.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {type.description}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <Palette className="h-3 w-3" />
                            </div>
                            <div className="text-sm font-medium">
                                {type.maxColors || "∞"}
                            </div>
                            <div className="text-xs text-muted-foreground">цветов</div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <Ruler className="h-3 w-3" />
                            </div>
                            <div className="text-sm font-medium">
                                {type.maxPrintArea || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground">область</div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <Clock className="h-3 w-3" />
                            </div>
                            <div className="text-sm font-medium">
                                {formatTime(type.estimatedTime)}
                            </div>
                            <div className="text-xs text-muted-foreground">время</div>
                        </div>
                    </div>

                    {/* Cost */}
                    {(type.baseCost || type.costPerUnit) && (
                        <div className="flex items-center justify-between pt-2 border-t text-sm">
                            <span className="text-muted-foreground">Стоимость:</span>
                            <span className="font-medium">
                                {formatCost(type.baseCost)}
                                {type.costPerUnit ? ` + ${formatCost(type.costPerUnit)}/шт` : ""}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <ApplicationTypeFormDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                type={type}
                onSuccess={(updated) => {
                    onUpdate(updated);
                    setIsEditOpen(false);
                    toast.success("Тип обновлён");
                }}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить тип нанесения?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить &quot;{type.name}&quot;? Это действие нельзя отменить.
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
