"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { createEquipment, updateEquipment } from "../../actions/equipment-actions";
import type { Equipment, ApplicationType } from "@/lib/schema/production";

const formSchema = z.object({
  name: z.string().min(1, "Введите название"),
  code: z.string().min(1, "Введите код (инвентарный номер)"),
  category: z.string().min(1, "Выберите категорию"),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  printWidth: z.number().optional().nullable(),
  printHeight: z.number().optional().nullable(),
  printSpeed: z.number().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  applicationTypeIds: z.array(z.string()),
});

type FormValues = {
  name: string;
  code: string;
  category: string;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  printWidth?: number | null;
  printHeight?: number | null;
  printSpeed?: number | null;
  location?: string | null;
  notes?: string | null;
  applicationTypeIds: string[];
};

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: Equipment;
  applicationTypes: ApplicationType[];
  onSuccess: (equipment: Equipment) => void;
}

export function EquipmentFormDialog({
  open,
  onOpenChange,
  equipment,
  applicationTypes,
  onSuccess,
}: EquipmentFormDialogProps) {
  const { toast } = useToast();
  const isEdit = !!equipment;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      category: "printer",
      brand: "",
      model: "",
      serialNumber: "",
      printWidth: 0,
      printHeight: 0,
      printSpeed: 0,
      location: "",
      notes: "",
      applicationTypeIds: [],
    } as FormValues,
  });

  useEffect(() => {
    if (equipment) {
      form.reset({
        name: equipment.name,
        code: equipment.code || "",
        category: equipment.category,
        brand: equipment.brand || "",
        model: equipment.model || "",
        serialNumber: equipment.serialNumber || "",
        printWidth: equipment.printWidth || 0,
        printHeight: equipment.printHeight || 0,
        printSpeed: equipment.printSpeed || 0,
        location: equipment.location || "",
        notes: equipment.notes || "",
        applicationTypeIds: equipment.applicationTypeIds || [],
      });
    } else {
      form.reset({
        name: "",
        code: "",
        category: "printer",
        brand: "",
        model: "",
        serialNumber: "",
        printWidth: 0,
        printHeight: 0,
        printSpeed: 0,
        location: "",
        notes: "",
        applicationTypeIds: [],
      });
    }
  }, [equipment, form, open]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const data = {
      ...values,
      printWidth: values.printWidth || null,
      printHeight: values.printHeight || null,
      printSpeed: values.printSpeed || null,
    };

    const result = isEdit
      ? await updateEquipment(equipment.id, data as Parameters<typeof updateEquipment>[1])
      : await createEquipment(data as Parameters<typeof createEquipment>[0]);

    if (result.success) {
      onSuccess(result.data!);
      onOpenChange(false);
    } else {
      toast(result.error || "Ошибка при сохранении", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Редактировать оборудование" : "Добавить оборудование"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название *</FormLabel>
                    <FormControl>
                      <Input placeholder="Epson SureColor F2100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Код</FormLabel>
                    <FormControl>
                      <Input placeholder="EQ-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория *</FormLabel>
                  <Select options={[ { id: "printer", title: "Принтер" }, { id: "cutter", title: "Резак" }, { id: "heat_press", title: "Термопресс" }, { id: "embroidery", title: "Вышивальная машина" }, { id: "laser", title: "Лазерное оборудование" }, { id: "other", title: "Прочее" }, ]} value={field.value} onChange={field.onChange} placeholder="Выберите категорию" />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brand & Model */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="brand" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бренд</FormLabel>
                    <FormControl>
                      <Input placeholder="Epson" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="model" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Модель</FormLabel>
                    <FormControl>
                      <Input placeholder="SureColor F2100" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField control={form.control} name="serialNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Серийный номер</FormLabel>
                  <FormControl>
                    <Input placeholder="SN123456789" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dimensions & Speed */}
            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="printWidth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ширина печати</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="400" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="printHeight" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Высота печати</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="500" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="printSpeed" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Скорость</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Расположение</FormLabel>
                  <FormControl>
                    <Input placeholder="Цех 1, Участок А" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Application Types */}
            <FormField control={form.control} name="applicationTypeIds" render={({ field }) => (
                <FormItem>
                  <FormLabel>Типы нанесения</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {applicationTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox id={type.id} checked={field.value.includes(type.id)} onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, type.id]);
                            } else {
                              field.onChange(
                                field.value.filter((id) => id !== type.id)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={type.id}
                          className="text-sm cursor-pointer"
                        >
                          {type.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Примечания</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Дополнительная информация об оборудовании..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Сохранение..."
                  : isEdit
                    ? "Сохранить"
                    : "Создать"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
