"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createVersion, updateVersion } from "@/app/(main)/dashboard/design/prints/actions";

const versionFormSchema = z.object({
  name: z
    .string()
    .min(1, "Название обязательно")
    .max(255, "Название слишком длинное"),
});

type VersionFormValues = z.infer<typeof versionFormSchema>;

interface VersionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designId: string;
  version?: {
    id: string;
    name: string;
  } | null;
  onSuccess: (versionId: string) => void;
}

export function VersionFormDialog({
  open,
  onOpenChange,
  designId,
  version,
  onSuccess,
}: VersionFormDialogProps) {
  const isEditing = !!version;

  const form = useForm<VersionFormValues>({
    resolver: zodResolver(versionFormSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: version?.name || "",
      });
    }
  }, [open, version, form]);

  const onSubmit = async (values: VersionFormValues) => {
    try {
      if (isEditing) {
        const result = await updateVersion(version.id, {
          name: values.name,
        });

        if (!result.success) {
          toast.error(result.error || "Не удалось обновить версию");
        } else {
          onSuccess(version.id);
        }
      } else {
        const result = await createVersion({
          designId,
          name: values.name,
        });

        if (!result.success) {
          toast.error(result.error || "Не удалось создать версию");
        } else if (result.data?.id) {
          onSuccess(result.data.id);
        }
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактировать версию" : "Новая версия"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Измените название версии"
              : "Создайте версию принта для разных цветов ткани"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Название *</FormLabel>
                  <FormControl>
                    <Input placeholder="Например: Для светлой ткани" {...field} />
                  </FormControl>
                  <FormDescription>
                    Укажите, для какого цвета ткани предназначена версия
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isEditing ? "Сохранить" : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
