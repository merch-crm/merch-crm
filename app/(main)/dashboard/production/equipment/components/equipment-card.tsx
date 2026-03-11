"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { ru } from "date-fns/locale";
import {
    MoreVertical,
    Edit,
    Trash2,
    Wrench,
    Power,
    MapPin,
    Calendar,
    Gauge,
    LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { useToast } from "@/components/ui/toast";
import { EquipmentFormDialog } from "./equipment-form-dialog";
import { MaintenanceDialog } from "./maintenance-dialog";
import {
    updateEquipmentStatus,
    deleteEquipment,
} from "../../actions/equipment-actions";
import type { Equipment, ApplicationType } from "@/lib/schema/production";

interface CategoryConfigItem {
    label: string;
    icon: LucideIcon;
    color: string;
}

interface StatusConfigItem {
    label: string;
    icon: LucideIcon;
    color: string;
}

interface EquipmentCardProps {
    equipment: Equipment;
    applicationTypes: ApplicationType[];
    categoryConfig: Record<string, CategoryConfigItem>;
    statusConfig: Record<string, StatusConfigItem>;
    onUpdated: (equipment: Equipment) => void;
    onDeleted: (id: string) => void;
}

export function EquipmentCard({
    equipment,
    applicationTypes,
    categoryConfig,
    statusConfig,
    onUpdated,
    onDeleted,
}: EquipmentCardProps) {
    const { toast } = useToast();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const category = categoryConfig[equipment.category] || categoryConfig.other;
    const status = statusConfig[equipment.status] || statusConfig.inactive;
    const CategoryIcon = category.icon;
    const StatusIcon = status.icon;

    const linkedTypes = applicationTypes.filter((type) =>
        equipment.applicationTypeIds?.includes(type.id)
    );

    const handleStatusChange = async (newStatus: "active" | "maintenance" | "repair" | "inactive") => {
        const result = await updateEquipmentStatus(equipment.id, newStatus);
        if (result.success) {
            onUpdated({ ...equipment, status: newStatus });
            toast("Статус обновлён");
        } else {
            toast(`Ошибка: ${result.error}`);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteEquipment(equipment.id);
        if (result.success) {
            onDeleted(equipment.id);
        } else {
            toast(`Ошибка: ${result.error}`);
        }
        setIsDeleting(false);
        setIsDeleteOpen(false);
    };

    const isMaintenanceDue =
        equipment.nextMaintenanceAt &&
        new Date(equipment.nextMaintenanceAt) <= new Date();

    return (
        <>
            <Card className={isMaintenanceDue ? "border-yellow-500" : ""}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${category.color}`}>
                                <CategoryIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{equipment.name}</h3>
                                {equipment.code && (
                                    <p className="text-sm text-muted-foreground">{equipment.code}</p>
                                )}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Редактировать
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsMaintenanceOpen(true)}>
                                    <Wrench className="h-4 w-4 mr-2" />
                                    Обслуживание
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {equipment.status !== "active" && (
                                    <DropdownMenuItem onClick={() => handleStatusChange("active")}>
                                        <Power className="h-4 w-4 mr-2" />
                                        Активировать
                                    </DropdownMenuItem>
                                )}
                                {equipment.status !== "inactive" && (
                                    <DropdownMenuItem onClick={() => handleStatusChange("inactive")}>
                                        <Power className="h-4 w-4 mr-2" />
                                        Деактивировать
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
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${status.color}`} />
                        <span className={`text-sm font-medium ${status.color}`}>
                            {status.label}
                        </span>
                    </div>

                    {/* Brand & Model */}
                    {(equipment.brand || equipment.model) && (
                        <p className="text-sm text-muted-foreground">
                            {[equipment.brand, equipment.model].filter(Boolean).join(" ")}
                        </p>
                    )}

                    {/* Location */}
                    {equipment.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{equipment.location}</span>
                        </div>
                    )}

                    {/* Speed */}
                    {equipment.printSpeed && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Gauge className="h-4 w-4" />
                            <span>{equipment.printSpeed}</span>
                        </div>
                    )}

                    {/* Application Types */}
                    {linkedTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {linkedTypes.map((type) => (
                                <Badge key={type.id} variant="secondary" className="text-xs">
                                    {type.name}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Maintenance Info */}
                    {equipment.nextMaintenanceAt && (
                        <div
                            className={`flex items-center gap-2 text-sm ${isMaintenanceDue ? "text-yellow-600" : "text-muted-foreground"
                                }`}
                        >
                            <Calendar className="h-4 w-4" />
                            <span>
                                ТО:{" "}
                                {isMaintenanceDue
                                    ? "требуется"
                                    : formatDistanceToNow(new Date(equipment.nextMaintenanceAt), {
                                        addSuffix: true,
                                        locale: ru,
                                    })}
                            </span>
                        </div>
                    )}

                    {equipment.lastMaintenanceAt && (
                        <p className="text-xs text-muted-foreground">
                            Последнее ТО:{" "}
                            {format(new Date(equipment.lastMaintenanceAt), "dd.MM.yyyy", { locale: ru })}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <EquipmentFormDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                equipment={equipment}
                applicationTypes={applicationTypes}
                onSuccess={onUpdated}
            />

            {/* Maintenance Dialog */}
            <MaintenanceDialog
                open={isMaintenanceOpen}
                onOpenChange={setIsMaintenanceOpen}
                equipment={equipment}
                onSuccess={onUpdated}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить оборудование?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить «{equipment.name}»? Это действие
                            нельзя отменить.
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
