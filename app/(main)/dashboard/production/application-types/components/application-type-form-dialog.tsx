"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { createApplicationType, updateApplicationType } from "../../actions/application-type-actions";
import { type ApplicationType } from "@/lib/schema/production";
import { GeneralTab } from "./tabs/general-tab";
import { SpecsTab } from "./tabs/specs-tab";
import { PricingTab } from "./tabs/pricing-tab";

const formSchema = z.object({
  name: z.string().min(1, "Обязательное поле").max(255),
  slug: z
    .string()
    .min(1, "Обязательное поле")
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  description: z.string().optional(),
  category: z.enum(["print", "embroidery", "engraving", "transfer", "other"]),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Некорректный HEX")
    .optional()
    .or(z.literal("")),
  minQuantity: z.number().int().min(1).optional(),
  maxColors: z.number().int().min(1).optional().nullable(),
  maxPrintArea: z.string().optional(),
  baseCost: z.number().int().min(0).optional(),
  costPerUnit: z.number().int().min(0).optional(),
  setupCost: z.number().int().min(0).optional(),
  estimatedTime: z.number().int().min(0).optional().nullable(),
  setupTime: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean(),
});

export type ApplicationTypeFormValues = z.infer<typeof formSchema>;

interface ApplicationTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: ApplicationType | null;
  onSuccess: (type: ApplicationType) => void;
}

export function ApplicationTypeFormDialog({
  open,
  onOpenChange,
  type,
  onSuccess,
}: ApplicationTypeFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!type;

  const form = useForm<ApplicationTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      category: "print",
      color: "#3B82F6",
      minQuantity: 1,
      maxColors: null,
      maxPrintArea: "",
      baseCost: 0,
      costPerUnit: 0,
      setupCost: 0,
      estimatedTime: null,
      setupTime: null,
      isActive: true,
    },
  });

  useEffect(() => {
    if (type) {
      form.reset({
        ...type,
        description: type.description || "",
        color: type.color || "#3B82F6",
        minQuantity: type.minQuantity || 1,
        maxColors: type.maxColors ?? null,
        maxPrintArea: type.maxPrintArea || "",
        baseCost: type.baseCost || 0,
        costPerUnit: type.costPerUnit || 0,
        setupCost: type.setupCost || 0,
        estimatedTime: type.estimatedTime ?? null,
        setupTime: type.setupTime ?? null,
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
        category: "print",
        color: "#3B82F6",
        minQuantity: 1,
        maxColors: null,
        maxPrintArea: "",
        baseCost: 0,
        costPerUnit: 0,
        setupCost: 0,
        estimatedTime: null,
        setupTime: null,
        isActive: true,
      });
    }
  }, [type, form]);

  const watchName = form.watch("name");
  useEffect(() => {
    if (!isEditing && watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/[а-яё]/g, (char) => {
          const map: Record<string, string> = {
            а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
            ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
            н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
            ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
            ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
          };
          return map[char] || char;
        })
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      form.setValue("slug", slug);
    }
  }, [watchName, isEditing, form]);

  const onSubmit = async (values: ApplicationTypeFormValues) => {
    setIsSubmitting(true);
    try {
      const data = {
        ...values,
        maxColors: values.maxColors || null,
        estimatedTime: values.estimatedTime || null,
        setupTime: values.setupTime || null,
        color: values.color || null,
      };

      const result = isEditing && type
        ? await updateApplicationType(type.id, data)
        : await createApplicationType(data);

      if (result.success && result.data) {
        onSuccess(result.data);
        onOpenChange(false);
      } else {
        toast.error(result.error || "Ошибка при сохранении");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[90vw]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактировать тип нанесения" : "Новый тип нанесения"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Основное</TabsTrigger>
                <TabsTrigger value="specs">Характеристики</TabsTrigger>
                <TabsTrigger value="pricing">Стоимость</TabsTrigger>
              </TabsList>

              <TabsContent value="general"><GeneralTab form={form} /></TabsContent>
              <TabsContent value="specs"><SpecsTab form={form} /></TabsContent>
              <TabsContent value="pricing"><PricingTab form={form} /></TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение..." : isEditing ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
