"use client";

import { useState } from "react";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Mail,
    Phone,
    Factory,
    Briefcase,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

import { StaffFormDialog } from "./staff-form-dialog";
import { updateProductionStaff, deleteProductionStaff, ProductionStaffWithStats } from "../../actions/staff-actions";
import { ProductionLine } from "../../actions/line-actions";
import { ProductionStaff, ApplicationType } from "@/lib/schema/production";

interface StaffCardProps {
    member: ProductionStaffWithStats;
    lines: ProductionLine[];
    applicationTypes: ApplicationType[];
    onUpdate: (member: ProductionStaff) => void;
    onDelete: (id: string) => void;
}

export function StaffCard({
    member,
    lines,
    applicationTypes,
    onUpdate,
    onDelete,
}: StaffCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleToggleActive = async () => {
        const result = await updateProductionStaff(member.id, {
            isActive: !member.isActive,
        });

        if (result.success && result.data) {
            onUpdate(result.data);
            toast.success(member.isActive ? "Сотрудник деактивирован" : "Сотрудник активирован");
        } else {
            toast.error(result.error || "Ошибка обновления статуса");
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteProductionStaff(member.id);

        if (result.success) {
            onDelete(member.id);
            toast.success("Сотрудник удален");
        } else {
            toast.error(result.error || "Ошибка удаления");
        }
        setIsDeleting(false);
        setIsDeleteOpen(false);
    };

    const memberLines = lines.filter((l) => (member.lineIds as string[] || []).includes(l.id));
    const memberSpecializations = applicationTypes.filter((t) => (member.specializationIds as string[] || []).includes(t.id));

    return (
        <>
            <Card className={`overflow-hidden transition-shadow hover:shadow-md ${!member.isActive ? "opacity-60" : ""}`}>
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={member.avatarPath || member.user?.avatar || undefined} />
                                <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <h3 className="font-medium truncate">{member.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">
                                    {member.position || "Сотрудник"}
                                </p>
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
                                    {member.isActive ? "Деактивировать" : "Активировать"}
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

                <CardContent className="p-4 pt-2 space-y-3">
                    {/* Workload Stats */}
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <div className="text-center flex-1 border-r">
                            <p className="text-sm font-semibold text-blue-600">{member.stats.active}</p>
                            <p className="text-xs text-muted-foreground">В работе</p>
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-sm font-semibold text-green-600">{member.stats.completed}</p>
                            <p className="text-xs text-muted-foreground">Готово</p>
                        </div>
                    </div>

                    {/* Assignments */}
                    <div className="space-y-2">
                        {memberLines.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                <Factory className="h-3 w-3 text-muted-foreground mr-1" />
                                {memberLines.map((line) => (
                                    <Badge key={line.id} variant="outline" className="text-xs py-0">
                                        {line.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {memberSpecializations.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                <Briefcase className="h-3 w-3 text-muted-foreground mr-1" />
                                {memberSpecializations.map((type) => (
                                    <Badge
                                        key={type.id}
                                        variant="secondary"
                                        className="text-xs py-0"
                                        style={{
                                            backgroundColor: type.color ? `${type.color}15` : undefined,
                                            color: type.color || undefined,
                                        }}
                                    >
                                        {type.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="pt-2 border-t space-y-1">
                        {member.phone && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {member.phone}
                            </div>
                        )}
                        {member.email && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{member.email}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <StaffFormDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                member={member}
                lines={lines}
                applicationTypes={applicationTypes}
                onSuccess={(updated) => {
                    onUpdate(updated);
                    setIsEditOpen(false);
                    toast.success("Данные сотрудника обновлены");
                }}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить сотрудника?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить {member.name}?
                            Данные о выполненных задачах останутся в истории, но сотрудник исчезнет из списка.
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
