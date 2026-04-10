"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Clock,
  Palette,
  Ruler,
  Layers,
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
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "crm-card transition-all group relative overflow-hidden flex flex-col gap-3",
          isDragging && "shadow-2xl z-50 ring-2 ring-primary border-transparent",
          !type.isActive && "opacity-60 grayscale-[0.5]",
          "hover:shadow-xl hover:-translate-y-1"
        )}
      >
        {/* Header: Grip, Icon & Context Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {isSorting && (
              <div 
                {...attributes} 
                {...listeners} 
                className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-primary transition-colors"
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: type.color || "#64748b" }}
            >
              <Layers className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 truncate leading-tight">{type.name}</h3>
              <p className="text-xs font-black text-slate-400 mt-0.5 ">
                {type.slug}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 shrink-0">
                <MoreVertical className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl min-w-[180px]">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="rounded-lg gap-2 cursor-pointer">
                <Pencil className="h-4 w-4 text-slate-500" />
                <span className="font-medium">Редактировать</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleActive} className="rounded-lg gap-2 cursor-pointer">
                {type.isActive ? (
                  <>
                    <PowerOff className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">Деактивировать</span>
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium text-emerald-600">Активировать</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-50" />
              <DropdownMenuItem onClick={() => setIsDeleteOpen(true)}
                className="text-rose-600 rounded-lg gap-2 focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span className="font-bold">Удалить тип</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badge Row */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold ">
            {categoryLabels[type.category]}
          </div>
          {!type.isActive && (
            <div className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-500 text-xs font-bold border border-rose-100">
              Неактивен
            </div>
          )}
        </div>

        {/* Description */}
        {type.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed h-8">
            {type.description}
          </p>
        )}

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50">
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50/50">
            <Palette className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">{type.maxColors || "∞"}</span>
            <span className="text-xs text-slate-400 font-medium">цветов</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50/50">
            <Ruler className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 truncate w-full text-center">
              {type.maxPrintArea || "—"}
            </span>
            <span className="text-xs text-slate-400 font-medium">область</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50/50">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">{formatTime(type.estimatedTime)}</span>
            <span className="text-xs text-slate-400 font-medium">время</span>
          </div>
        </div>

        {/* Pricing Footer */}
        {(type.baseCost || type.costPerUnit) && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-400 ">Стоимость:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-900">{formatCost(type.baseCost)}</span>
              {type.costPerUnit && (
                <span className="text-xs font-bold text-slate-400">
                  + {formatCost(type.costPerUnit)}/шт
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <ApplicationTypeFormDialog open={isEditOpen} onOpenChange={setIsEditOpen} type={type} onSuccess={(updated) => {
          onUpdate(updated);
          setIsEditOpen(false);
          toast.success("Тип обновлён");
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl border-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить тип нанесения?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить &quot;{type.name}&quot;? Это действие нельзя отменить.
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
