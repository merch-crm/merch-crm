// app/(main)/dashboard/production/components/defect-dialog.tsx
"use client";

import { useState, useMemo } from "react";
import { 
 AlertTriangle, 
 Package 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
 FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { DEFECT_CATEGORIES } from "../types/bento-dashboard-types";
import { saveTaskDefect } from "../actions/defect-actions";

const defectFormSchema = z.object({
 taskId: z.string(),
 defectQuantity: z.number().min(1, "Минимум 1 шт."),
 category: z.enum(['print', 'material', 'application', 'other'] as const),
 comment: z.string().optional(),
});

type DefectFormValues = z.infer<typeof defectFormSchema>;

interface DefectDialogProps {
 isOpen: boolean;
 onOpenChange: (open: boolean) => void;
 task: {
  id: string;
  number: string;
  itemName: string;
  maxQuantity: number;
 } | null;
}

export function DefectDialog({ isOpen, onOpenChange, task }: DefectDialogProps) {
 const [isSubmitting, setIsSubmitting] = useState(false);

 // Преобразуем константы категорий в формат опций нашего Select
 const categoryOptions = useMemo(() => 
  DEFECT_CATEGORIES.map(cat => ({
   id: cat.id,
   title: cat.label,
   description: cat.description,
   color: cat.color
  })), 
 []);

 const form = useForm<DefectFormValues>({
  resolver: zodResolver(defectFormSchema),
  defaultValues: {
   taskId: task?.id || "",
   defectQuantity: 1,
   category: "print",
   comment: "",
  },
 });

 // Обновляем ID задачи при смене
 if (task && form.getValues("taskId") !== task.id) {
  form.setValue("taskId", task.id);
 }

 async function onSubmit(values: DefectFormValues) {
  if (!task) return;
  
  setIsSubmitting(true);
  try {
   const result = await saveTaskDefect(values);
   
   if (result.success) {
    toast.success("Данные о браке сохранены");
    onOpenChange(false);
    form.reset();
   } else {
    toast.error(result.error || "Ошибка при сохранении");
   }
  } catch (_error) {
   toast.error("Произошла непредвиденная ошибка");
  } finally {
   setIsSubmitting(false);
  }
 }

 if (!task) return null;

 return (
  <ResponsiveModal isOpen={isOpen} onClose={() => onOpenChange(false)}
   title="Регистрация брака"
   description={`Для задачи #${task.number}`}
   footer={
    <div className="flex w-full justify-end gap-3">
     <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
      disabled={isSubmitting}
     >
      Отмена
     </Button>
     <Button form="defect-form" type="submit" variant="solid" color="red" disabled={isSubmitting} className="gap-2">
      {isSubmitting ? (
       <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
       <AlertTriangle className="h-4 w-4" />
      )}
      Зафиксировать брак
     </Button>
    </div>
   }
  >
   <div className="px-6 py-4">
    <div className="mb-6 p-4 rounded-[16px] bg-slate-50/80 border border-slate-200 flex items-start gap-3">
     <div className="p-2 rounded-full bg-red-100 text-red-600">
      <Package className="h-5 w-5" />
     </div>
     <div>
      <p className="text-sm font-bold text-slate-900">{task.itemName}</p>
      <p className="text-xs font-semibold text-slate-500">Доступно для списания: {task.maxQuantity} шт.</p>
     </div>
    </div>

    <Form {...form}>
     <form id="defect-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
       <FormField control={form.control} name="defectQuantity" render={({ field }) => (
         <FormItem>
          <FormLabel>Количество брака</FormLabel>
          <FormControl>
           <Input type="number" min={1} max={task.maxQuantity} placeholder="0" className="h-12 bg-slate-50/80 rounded-[12px] font-semibold" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)}
           />
          </FormControl>
          <FormMessage />
         </FormItem>
        )}
       />

       <FormField control={form.control} name="category" render={({ field }) => (
         <FormItem>
          <FormLabel>Категория</FormLabel>
          <FormControl>
           <Select options={categoryOptions} value={field.value} onChange={field.onChange} placeholder="Категория" />
          </FormControl>
          <FormMessage />
         </FormItem>
        )}
       />
      </div>

      <FormField control={form.control} name="comment" render={({ field }) => (
        <FormItem>
         <FormLabel>Комментарий (опционально)</FormLabel>
         <FormControl>
          <Textarea placeholder="Опишите причину брака для анализа..." className="resize-none h-28 bg-slate-50/80 rounded-[12px] focus-visible:bg-white transition-colors" {...field} />
         </FormControl>
         <FormDescription className="text-xs font-medium text-slate-400">
          Поможет предотвратить повторение ошибки в будущем.
         </FormDescription>
         <FormMessage />
        </FormItem>
       )}
      />
     </form>
    </Form>
   </div>
  </ResponsiveModal>
 );
}
