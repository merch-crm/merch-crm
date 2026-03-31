"use client";

import { useState } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    GripVertical,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { deleteMockup } from "@/app/(main)/dashboard/design/prints/actions/mockup-actions";
import type { PrintDesignMockup } from "@/lib/types";

interface MockupCardProps {
    mockup: PrintDesignMockup;
    isSorting?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleActive?: () => void;
}

export function MockupCard({
    mockup,
    isSorting,
    onEdit,
    onDelete,
    onToggleActive,
}: MockupCardProps) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: mockup.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteMockup(mockup.id);
        if (result.success) {
            onDelete?.();
        }
        setIsDeleting(false);
        setIsDeleteOpen(false);
    };

    return (
        <>
            <Card
                ref={setNodeRef}
                style={style}
                className={`group ${!mockup.isActive ? "opacity-60" : ""}`}
            >
                <CardContent className="p-0">
                    <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                        {mockup.imagePath ? (
                            <Image
                                src={mockup.imagePath}
                                alt={mockup.name || "Мокап"}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}

                        {/* Drag Handle */}
                        {isSorting && (
                            <div
                                {...attributes}
                                {...listeners}
                                className="absolute top-2 left-2 p-1 bg-background/80 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
                            >
                                <GripVertical className="h-4 w-4" />
                            </div>
                        )}

                        {/* Status Badge */}
                        {!mockup.isActive && (
                            <Badge
                                variant="secondary"
                                className="absolute top-2 right-2"
                            >
                                Скрыт
                            </Badge>
                        )}
                    </div>

                    <div className="p-3">
                        <div className="flex items-center justify-between">
                            <div className="truncate">
                                <p className="font-medium text-sm truncate">
                                    {mockup.name || "Без названия"}
                                </p>
                                {mockup.color && (
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div
                                            className="w-3 h-3 rounded-full border"
                                            style={{ backgroundColor: mockup.color }}
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            {mockup.color}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isSorting}>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {onEdit && (
                                        <DropdownMenuItem onClick={onEdit}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Редактировать
                                        </DropdownMenuItem>
                                    )}
                                    {onToggleActive && (
                                        <DropdownMenuItem onClick={onToggleActive}>
                                            {mockup.isActive ? (
                                                <>
                                                    <EyeOff className="h-4 w-4 mr-2" />
                                                    Скрыть
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Показать
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setIsDeleteOpen(true)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Удалить
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить мокап?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить этот мокап? Это действие нельзя
                            отменить.
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
