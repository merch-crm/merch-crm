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
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { createApplicationType, updateApplicationType } from "../../actions/application-type-actions";
import { type ApplicationType } from "@/lib/schema/production";

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

type FormValues = z.infer<typeof formSchema>;

interface ApplicationTypeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type?: ApplicationType | null;
    onSuccess: (type: ApplicationType) => void;
}

const categoryOptions = [
    { value: "print", label: "Печать" },
    { value: "embroidery", label: "Вышивка" },
    { value: "engraving", label: "Гравировка" },
    { value: "transfer", label: "Термоперенос" },
    { value: "other", label: "Прочее" },
] as const;

const colorPresets = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // amber
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#6366F1", // indigo
    "#F97316", // orange
    "#14B8A6", // teal
];

export function ApplicationTypeFormDialog({
    open,
    onOpenChange,
    type,
    onSuccess,
}: ApplicationTypeFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!type;

    const form = useForm<FormValues>({
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
                name: type.name,
                slug: type.slug,
                description: type.description || "",
                category: type.category,
                color: type.color || "#3B82F6",
                minQuantity: type.minQuantity || 1,
                maxColors: type.maxColors ?? null,
                maxPrintArea: type.maxPrintArea || "",
                baseCost: type.baseCost || 0,
                costPerUnit: type.costPerUnit || 0,
                setupCost: type.setupCost || 0,
                estimatedTime: type.estimatedTime ?? null,
                setupTime: type.setupTime ?? null,
                isActive: type.isActive,
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

    // Auto-generate slug from name
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

    const onSubmit = async (values: FormValues) => {
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

                            {/* General Tab */}
                            <TabsContent value="general" className="space-y-3 mt-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Название *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="DTF печать" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="dtf" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Уникальный идентификатор (латиница, цифры, дефис)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Категория *</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value}
                                                    onChange={(val) => field.onChange(val)}
                                                    options={categoryOptions.map(opt => ({ id: opt.value, title: opt.label }))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Описание</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Краткое описание метода нанесения..."
                                                    rows={3}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="color"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Цвет</FormLabel>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    {colorPresets.map((color) => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            className={`w-6 h-6 rounded border-2 ${field.value === color
                                                                ? "border-foreground"
                                                                : "border-transparent"
                                                                }`}
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => field.onChange(color)}
                                                        />
                                                    ))}
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="#3B82F6"
                                                        className="w-24"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel>Активен</FormLabel>
                                                <FormDescription>
                                                    Неактивные типы не отображаются в списке выбора
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            {/* Specs Tab */}
                            <TabsContent value="specs" className="space-y-3 mt-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="minQuantity"
                                        render={({ field: _field }) => (
                                            <FormItem>
                                                <FormLabel>Мин. тираж</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        {...form.register("minQuantity", { valueAsNumber: true })}
                                                    />
                                                </FormControl>
                                                <FormDescription>Минимальное количество</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="maxColors"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Макс. цветов</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        placeholder="∞"
                                                        {...form.register("maxColors", { valueAsNumber: true })}
                                                        value={field.value ?? ""}
                                                    />
                                                </FormControl>
                                                <FormDescription>Пусто = безлимит</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="maxPrintArea"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Макс. область печати</FormLabel>
                                            <FormControl>
                                                <Input placeholder="30x40 см" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="estimatedTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Время на единицу (мин)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        placeholder="5"
                                                        {...form.register("estimatedTime", { valueAsNumber: true })}
                                                        value={field.value ?? ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="setupTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Время подготовки (мин)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        placeholder="30"
                                                        {...form.register("setupTime", { valueAsNumber: true })}
                                                        value={field.value ?? ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>

                            {/* Pricing Tab */}
                            <TabsContent value="pricing" className="space-y-3 mt-4">
                                <FormField
                                    control={form.control}
                                    name="baseCost"
                                    render={({ field: _field }) => (
                                        <FormItem>
                                            <FormLabel>Базовая стоимость (коп.)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    {...form.register("baseCost", { valueAsNumber: true })}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Фиксированная стоимость за заказ (в копейках)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="costPerUnit"
                                    render={({ field: _field }) => (
                                        <FormItem>
                                            <FormLabel>Стоимость за единицу (коп.)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    {...form.register("costPerUnit", { valueAsNumber: true })}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Стоимость нанесения на 1 изделие
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="setupCost"
                                    render={({ field: _field }) => (
                                        <FormItem>
                                            <FormLabel>Стоимость подготовки (коп.)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    {...form.register("setupCost", { valueAsNumber: true })}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Подготовка макета, настройка оборудования
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Preview calculation */}
                                <div className="rounded-lg border p-4 bg-muted/50">
                                    <h4 className="font-medium mb-2">Пример расчёта</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Заказ на 100 единиц:{" "}
                                        <span className="font-medium text-foreground">
                                            {(
                                                ((form.watch("baseCost") || 0) +
                                                    (form.watch("setupCost") || 0) +
                                                    (form.watch("costPerUnit") || 0) * 100) /
                                                100
                                            ).toFixed(0)}{" "}
                                            ₽
                                        </span>
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? "Сохранение..."
                                    : isEditing
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
