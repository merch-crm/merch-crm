"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    Copy,
    MoreVertical,
    Image as ImageIcon,
    DollarSign,
    Tag,
    Calendar,
    Eye,
    EyeOff,
    PenTool,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { MockupCard } from "./components/mockup-card";
import { MockupFormDialog } from "./components/mockup-form-dialog";
import { DesignFormDialog } from "../components/design-form-dialog";
import {
    deleteDesign,
    updateMockupsOrder,
    updateMockup,
} from "../../actions";
import type { DesignWithFullData, PrintDesignMockup } from "@/lib/types";
import type { ApplicationType } from "@/lib/schema/production";

interface DesignWithMockups extends DesignWithFullData {
    mockups: PrintDesignMockup[];
    sku?: string | null;
    previewPath?: string | null;
}

interface DesignDetailPageClientProps {
    design: DesignWithMockups;
    collectionId: string;
    applicationTypes: ApplicationType[];
}

export function DesignDetailPageClient({
    design: initialDesign,
    collectionId,
    applicationTypes,
}: DesignDetailPageClientProps) {
    const router = useRouter();

    const [design, setDesign] = useState(initialDesign);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isMockupOpen, setIsMockupOpen] = useState(false);
    const [editingMockup, setEditingMockup] = useState<PrintDesignMockup | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const applicationType = applicationTypes.find(
        (t) => t.id === design.applicationTypeId
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;

            if (over && active.id !== over.id) {
                const oldIndex = design.mockups.findIndex((m) => m.id === active.id);
                const newIndex = design.mockups.findIndex((m) => m.id === over.id);

                const newMockups = arrayMove(design.mockups, oldIndex, newIndex);
                setDesign({ ...design, mockups: newMockups });

                const updateItems = newMockups.map((m, index) => ({
                    id: m.id,
                    sortOrder: index,
                }));
                const result = await updateMockupsOrder(design.id, updateItems);

                if (!result.success) {
                    setDesign(initialDesign);
                    toast.error(result.error || "Ошибка обновления порядка");
                }
            }
        },
        [design, initialDesign]
    );

    const handleDesignUpdated = (updated: Partial<DesignWithMockups>) => {
        setDesign({ ...design, ...updated });
        setIsEditOpen(false);
        toast.success("Дизайн обновлён");
    };

    const handleMockupCreated = (mockup: PrintDesignMockup) => {
        setDesign({ ...design, mockups: [...design.mockups, mockup] });
        setIsMockupOpen(false);
        toast.success("Мокап добавлен");
    };

    const handleMockupUpdated = (mockup: PrintDesignMockup) => {
        setDesign({
            ...design,
            mockups: design.mockups.map((m) => (m.id === mockup.id ? mockup : m)),
        });
        setEditingMockup(null);
        toast.success("Мокап обновлён");
    };

    const handleMockupDeleted = (mockupId: string) => {
        setDesign({
            ...design,
            mockups: design.mockups.filter((m) => m.id !== mockupId),
        });
        toast.success("Мокап удалён");
    };

    const handleToggleMockupActive = async (mockup: PrintDesignMockup) => {
        const result = await updateMockup(mockup.id, { isActive: !mockup.isActive });
        if (result.success && result.data) {
            handleMockupUpdated(result.data);
        } else if (!result.success) {
            toast.error(result.error || "Ошибка");
        }
    };

    const handleDeleteDesign = async () => {
        setIsDeleting(true);
        const result = await deleteDesign(design.id);
        if (result.success) {
            toast.success("Дизайн удалён");
            router.push(`/dashboard/design/prints/${collectionId}`);
        } else {
            toast.error(result.error || "Ошибка");
        }
        setIsDeleting(false);
        setIsDeleteOpen(false);
    };

    const handleDuplicateDesign = async () => {
        // Implementation would create a copy
        toast("Функция в разработке");
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold">{design.name}</h1>
                            {!design.isActive && (
                                <Badge variant="secondary">Неактивен</Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground">
                            {design.sku && `SKU: ${design.sku}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/design/editor/new?designId=${design.id}`}>
                            <PenTool className="h-4 w-4 mr-2" />
                            Открыть в редакторе
                        </Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDuplicateDesign}>
                                <Copy className="h-4 w-4 mr-2" />
                                Дублировать
                            </DropdownMenuItem>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-3">
                    {/* Preview */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                                {design.previewPath ? (
                                    <Image
                                        src={design.previewPath}
                                        alt={design.name}
                                        fill
                                        className="object-contain"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    {design.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Описание</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{design.description}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Mockups */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                Мокапы ({design.mockups.length})
                            </CardTitle>
                            <Button size="sm" onClick={() => setIsMockupOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {design.mockups.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Мокапы не добавлены</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={() => setIsMockupOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Добавить мокап
                                    </Button>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={design.mockups.map((m) => m.id)}
                                        strategy={rectSortingStrategy}
                                    >
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {design.mockups.map((mockup) => (
                                                <MockupCard
                                                    key={mockup.id}
                                                    mockup={mockup}
                                                    onEdit={() => setEditingMockup(mockup)}
                                                    onDelete={() => handleMockupDeleted(mockup.id)}
                                                    onToggleActive={() => handleToggleMockupActive(mockup)}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-3">
                    {/* Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Информация</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Application Type */}
                            {applicationType && (
                                <div className="flex items-center gap-3">
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Тип нанесения</p>
                                        <div className="flex items-center gap-2">
                                            {applicationType.color && (
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: applicationType.color }}
                                                />
                                            )}
                                            <span className="text-sm font-medium">
                                                {applicationType.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div className="flex items-center gap-3">
                                {design.isActive ? (
                                    <Eye className="h-4 w-4 text-green-600" />
                                ) : (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground">Статус</p>
                                    <p className="text-sm font-medium">
                                        {design.isActive ? "Активен" : "Неактивен"}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Prices */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Себестоимость</p>
                                        <p className="text-sm font-medium">
                                            {design.costPrice
                                                ? `${design.costPrice} ₽`
                                                : "Не указана"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Розничная цена
                                        </p>
                                        <p className="text-sm font-medium">
                                            {design.retailPrice
                                                ? `${design.retailPrice} ₽`
                                                : "Не указана"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Dates */}
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Создан</p>
                                    <p className="text-sm font-medium">
                                        {format(new Date(design.createdAt), "dd MMMM yyyy", {
                                            locale: ru,
                                        })}
                                    </p>
                                </div>
                            </div>

                            {design.updatedAt && design.updatedAt !== design.createdAt && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Обновлён</p>
                                        <p className="text-sm font-medium">
                                            {format(new Date(design.updatedAt), "dd MMMM yyyy", {
                                                locale: ru,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Действия</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setIsEditOpen(true)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Редактировать
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setIsMockupOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить мокап
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleDuplicateDesign}
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Дублировать
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Design Dialog */}
            <DesignFormDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                design={design}
                collectionId={collectionId}
                applicationTypes={applicationTypes}
                onSuccess={(updated) => {
                    if (typeof updated !== "string") {
                        handleDesignUpdated(updated);
                    }
                }}
            />

            {/* Create/Edit Mockup Dialog */}
            <MockupFormDialog
                open={isMockupOpen || !!editingMockup}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsMockupOpen(false);
                        setEditingMockup(null);
                    }
                }}
                designId={design.id}
                mockup={editingMockup}
                onSuccess={editingMockup ? handleMockupUpdated : handleMockupCreated}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить дизайн?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить «{design.name}»? Все мокапы и файлы
                            будут удалены. Это действие нельзя отменить.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteDesign}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Удаление..." : "Удалить"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
