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
  Power,
  PowerOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
      <div className={cn(
        "crm-card transition-all group relative overflow-hidden flex flex-col gap-3",
        !member.isActive && "opacity-60 grayscale-[0.5]",
        "hover:shadow-xl hover:-translate-y-1"
      )}>
        {/* Header: Avatar, Info & Context Menu */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <Avatar className="h-12 w-12 rounded-2xl border-2 border-white shadow-sm">
                <AvatarImage src={member.avatarPath || member.user?.image || undefined} />
                <AvatarFallback className="rounded-2xl bg-slate-100 text-slate-600 font-bold">
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {member.isActive && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 truncate leading-tight">{member.name}</h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5 ">{member.position || "Производство"}</p>
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
                {member.isActive ? (
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
              <DropdownMenuItem onClick={() => setIsDeleteOpen(true)}
                className="text-rose-600 rounded-lg gap-2 focus:bg-rose-50 focus:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
                <span>Удалить сотрудника</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex flex-col items-center">
            <span className="text-xl font-bold text-blue-600">{member.stats.active}</span>
            <span className="text-xs font-bold text-blue-400 mt-0.5 ">В работе</span>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex flex-col items-center">
            <span className="text-xl font-bold text-emerald-600">{member.stats.completed}</span>
            <span className="text-xs font-bold text-emerald-400 mt-0.5 ">Готово</span>
          </div>
        </div>

        {/* Details (Lines & Specializations) */}
        <div className="space-y-3 pt-1">
          {memberLines.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {memberLines.map((line) => (
                <div key={line.id} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                  <Factory className="h-3 w-3 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600 ">{line.name}</span>
                </div>
              ))}
            </div>
          )}
          
          {memberSpecializations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {memberSpecializations.map((type) => (
                <div 
                  key={type.id} 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg border"
                  style={{
                    backgroundColor: type.color ? `${type.color}10` : "#f8fafc",
                    borderColor: type.color ? `${type.color}30` : "#e2e8f0",
                    color: type.color || "#64748b",
                  }}
                >
                  <Briefcase className="h-3 w-3" />
                  <span className="text-xs font-bold ">{type.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Info (Compact) */}
        {(member.phone || member.email) && (
          <div className="mt-auto pt-3 border-t border-slate-50 flex flex-col gap-1.5">
            {member.phone && (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Phone className="h-3.5 w-3.5" />
                <span>{member.phone}</span>
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 min-w-0">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{member.email}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <StaffFormDialog open={isEditOpen} onOpenChange={setIsEditOpen} member={member} lines={lines} applicationTypes={applicationTypes} onSuccess={(updated) => {
          onUpdate(updated);
          setIsEditOpen(false);
          toast.success("Данные сотрудника обновлены");
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl border-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить сотрудника?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить &quot;{member.name}&quot;?
              Данные о выполненных задачах останутся в истории, но сотрудник исчезнет из списка.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-200">Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-rose-600 text-white hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-200 border-none">
              {isDeleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
