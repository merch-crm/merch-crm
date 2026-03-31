"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
    MoreVertical,
    Pencil,
    Trash2,
    Wrench,
    Power,
    PowerOff,
    MapPin,
    Calendar,
    Gauge,
    LucideIcon,
    AlertCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
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
            toast.success("Статус обновлён");
        } else {
            toast.error(`Ошибка: ${result.error}`);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteEquipment(equipment.id);
        if (result.success) {
            onDeleted(equipment.id);
            toast.success("Оборудование удалено");
        } else {
            toast.error(`Ошибка: ${result.error}`);
        }
        setIsDeleting(false);
        setIsDeleteOpen(false);
    };

    const isMaintenanceDue =
        equipment.nextMaintenanceAt &&
        new Date(equipment.nextMaintenanceAt) <= new Date();

    return (
        <>
            <div className={cn(
                "crm-card transition-all group relative overflow-hidden flex flex-col gap-3",
                equipment.status === "inactive" && "opacity-60 grayscale-[0.5]",
                isMaintenanceDue && "border-amber-400 ring-1 ring-amber-400/20",
                "hover:shadow-xl hover:-translate-y-1"
            )}>
                {/* Header: Category Icon, Name & Context Menu */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm",
                            category.color
                        )}>
                            <CategoryIcon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 truncate leading-tight">{equipment.name}</h3>
                            <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-tight">
                                {equipment.code || "Без кода"}
                            </p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                                <MoreVertical className="h-4 w-4 text-slate-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl">
                            <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="rounded-lg gap-2">
                                <Pencil className="h-4 w-4 text-slate-500" />
                                <span>Редактировать</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsMaintenanceOpen(true)} className="rounded-lg gap-2">
                                <Wrench className="h-4 w-4 text-amber-500" />
                                <span>Обслуживание</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem onClick={() => handleStatusChange("active")} disabled={equipment.status === "active"} className="rounded-lg gap-2">
                                <Power className="h-4 w-4 text-emerald-500" />
                                <span>Активировать</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange("inactive")} disabled={equipment.status === "inactive"} className="rounded-lg gap-2">
                                <PowerOff className="h-4 w-4 text-slate-500" />
                                <span>Деактивировать</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem
                                onClick={() => setIsDeleteOpen(true)}
                                className="text-rose-600 rounded-lg gap-2 focus:bg-rose-50 focus:text-rose-600"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Удалить оборудование</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Status Indicator */}
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl border w-fit",
                    equipment.status === "active" ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                    equipment.status === "maintenance" ? "bg-amber-50 border-amber-100 text-amber-600" :
                    equipment.status === "repair" ? "bg-rose-50 border-rose-100 text-rose-600" :
                    "bg-slate-100 border-slate-200 text-slate-400"
                )}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-xs font-bold tracking-tight">{status.label}</span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                         <span className="text-xs font-bold text-slate-400 tracking-wider">Локация</span>
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs font-bold truncate">{equipment.location || "—"}</span>
                        </div>
                    </div>
                    {equipment.printSpeed && (
                        <div className="flex flex-col gap-1">
                             <span className="text-xs font-bold text-slate-400 tracking-wider">Скорость</span>
                            <div className="flex items-center gap-1.5 text-slate-600">
                                <Gauge className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-xs font-bold truncate">{equipment.printSpeed}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Maintenance Section */}
                <div className={cn(
                    "mt-auto pt-3 border-t border-slate-50 space-y-2",
                    isMaintenanceDue && "border-amber-100"
                )}>
                    {equipment.nextMaintenanceAt && (
                        <div className={cn(
                            "flex items-center justify-between p-2 rounded-xl",
                            isMaintenanceDue ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500"
                        )}>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="text-xs font-bold">ТО: {format(new Date(equipment.nextMaintenanceAt), "dd.MM.yyyy", { locale: ru })}</span>
                            </div>
                            {isMaintenanceDue && <AlertCircle className="h-3.5 w-3.5 animate-pulse" />}
                        </div>
                    )}
                    
                    {linkedTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {linkedTypes.map((type) => (
                                <div 
                                    key={type.id} 
                                    className="px-2 py-0.5 rounded-lg border bg-white text-xs font-bold"
                                    style={{
                                        borderColor: type.color ? `${type.color}30` : "#e2e8f0",
                                        color: type.color || "#64748b",
                                    }}
                                >
                                    {type.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

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
                <AlertDialogContent className="rounded-2xl border-slate-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить оборудование?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить «{equipment.name}»? Это действие
                            нельзя отменить.
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
