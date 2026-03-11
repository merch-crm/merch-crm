"use client";

import { useState, useEffect } from "react";
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

import { createProductionLine, updateProductionLine, type ProductionLineWithStats } from "../../actions/line-actions";
import { ApplicationType } from "@/lib/schema/production";

const formSchema = z.object({
    name: z.string().min(1, "Обязательное поле").max(255),
    code: z.string().min(1, "Обязательное поле").max(50).regex(/^[A-Z0-9-]+$/, "Только заглавные буквы, цифры и дефис"),
    description: z.string().optional().nullable(),
    applicationTypeId: z.string().uuid().optional().nullable(),
    capacity: z.number().int().min(1).optional().nullable(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Некорректный HEX цвет").optional().nullable(),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface LineFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    line?: Partial<ProductionLineWithStats> | null;
    applicationTypes: ApplicationType[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (line: ProductionLineWithStats | any) => void;
}

const colorPresets = [
    "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6",
    "#EC4899", "#6366F1", "#F97316", "#14B8A6",
];

export function LineFormDialog({
    open,
    onOpenChange,
    line,
    applicationTypes,
    onSuccess,
}: LineFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!line;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            code: "",
            description: "",
            applicationTypeId: null,
            capacity: 100,
            color: "#3B82F6",
            isActive: true,
        },
    });

    const { toast } = useToast();

    useEffect(() => {
        if (line) {
            form.reset({
                name: line.name,
                code: line.code,
                description: line.description || "",
                applicationTypeId: line.applicationTypeId,
                capacity: line.capacity || 100,
                color: line.color || "#3B82F6",
                isActive: line.isActive,
            });
        } else if (open) {
            form.reset({
                name: "",
                code: "",
                description: "",
                applicationTypeId: null,
                capacity: 100,
                color: "#3B82F6",
            });
        }
    }, [line, open, form]);

    // Автогенерация кода из названия
    const watchName = form.watch("name");
    useEffect(() => {
        if (!isEditing && watchName && open) {
            const code = watchName
                .toUpperCase()
                .replace(/[^A-Z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
                .slice(0, 20);
            form.setValue("code", `LINE-${code}`);
        }
    }, [watchName, isEditing, open, form]);

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        setIsSubmitting(true);

        const data = {
            ...values,
            capacity: values.capacity ? Number(values.capacity) : 100,
        };

        try {
            const result = isEditing && line?.id
                ? await updateProductionLine(line.id, data as Parameters<typeof updateProductionLine>[1])
                : await createProductionLine(data as Parameters<typeof createProductionLine>[0]);

            if (result.success && result.data) {
                onSuccess(result.data);
            } else {
                toast(result.error || "Ошибка при сохранении", "error");
            }
        } catch (_error) {
            toast("Произошла ошибка", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Редактировать линию" : "Новая линия"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Линия DTF #1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Код *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="LINE-DTF-1" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Уникальный код (заглавные буквы, цифры, дефис)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="applicationTypeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Тип нанесения</FormLabel>
                                    <Select
                                        options={[
                                            { id: "none", title: "Не указан" },
                                            ...applicationTypes.map((type) => ({
                                                id: type.id,
                                                title: type.name,
                                                color: type.color || "#6B7280",
                                            })),
                                        ]}
                                        value={field.value || "none"}
                                        onChange={(val) => field.onChange(val === "none" ? null : val)}
                                        placeholder="Выберите тип..."
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="capacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Мощность (ед/день)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            {...field}
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Максимальное количество единиц продукции в день
                                    </FormDescription>
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
                                                    className={`w-6 h-6 rounded border-2 ${field.value === color ? "border-foreground" : "border-transparent"
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
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                    </div>
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
                                            placeholder="Описание линии..."
                                            rows={2}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
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
                                        <FormLabel>Активна</FormLabel>
                                        <FormDescription>
                                            Неактивные линии не принимают новые задачи
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value ?? true}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
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
