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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import { createProductionStaff, updateProductionStaff } from "../../actions/staff-actions";
import { ProductionLine } from "../../actions/line-actions";
import { ProductionStaff, ApplicationType } from "@/lib/schema/production";

const formSchema = z.object({
    name: z.string().min(1, "Имя обязательно").max(255),
    phone: z.string().optional().nullable(),
    email: z.string().email("Некорректный email").or(z.literal("")).optional().nullable(),
    position: z.string().optional().nullable(),
    specializationIds: z.array(z.string().uuid()),
    lineIds: z.array(z.string().uuid()),
    hourlyRate: z.number().int().min(0).optional().nullable(),
    isActive: z.boolean(),
    userId: z.string().uuid().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface StaffFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member?: ProductionStaff | null;
    lines: ProductionLine[];
    applicationTypes: ApplicationType[];
    onSuccess: (member: ProductionStaff) => void;
}

export function StaffFormDialog({
    open,
    onOpenChange,
    member,
    lines,
    applicationTypes,
    onSuccess,
}: StaffFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!member;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            position: "",
            specializationIds: [],
            lineIds: [],
            hourlyRate: 0,
            isActive: true,
            userId: null,
        },
    });

    useEffect(() => {
        if (member) {
            form.reset({
                name: member.name || "",
                phone: member.phone || "",
                email: member.email || "",
                position: member.position || "",
                specializationIds: (member.specializationIds as string[]) || [],
                lineIds: (member.lineIds as string[]) || [],
                hourlyRate: member.hourlyRate || 0,
                isActive: member.isActive ?? true,
                userId: member.userId || null,
            });
        } else if (open) {
            form.reset({
                name: "",
                phone: "",
                email: "",
                position: "",
                specializationIds: [],
                lineIds: [],
                hourlyRate: 0,
                isActive: true,
                userId: null,
            });
        }
    }, [member, open, form]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);

        try {
            const payload = {
                ...values,
                email: values.email === "" ? null : values.email,
            };

            const result = isEditing
                ? await updateProductionStaff(member!.id, payload)
                : await createProductionStaff(payload);

            if (result.success && result.data) {
                onSuccess(result.data);
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
            <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Редактировать данные сотрудника" : "Добавить сотрудника"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ФИО *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Иванов Иван Иванович" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Должность</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Печатник / Технолог" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Телефон</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+7 (999) 000-00-00" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="ivan@example.com" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Specializations */}
                            <FormField
                                control={form.control}
                                name="specializationIds"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-2">
                                            <FormLabel>Специализация (технологии)</FormLabel>
                                            <FormDescription>Выберите типы нанесения, в которых компетентен сотрудник</FormDescription>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 p-3 border rounded-lg max-h-[200px] overflow-y-auto">
                                            {applicationTypes.map((type) => (
                                                <FormField
                                                    key={type.id}
                                                    control={form.control}
                                                    name="specializationIds"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={type.id}
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(type.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, type.id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== type.id
                                                                                    )
                                                                                );
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="text-sm font-normal cursor-pointer flex items-center gap-2">
                                                                    <div
                                                                        className="w-2 h-2 rounded-full"
                                                                        style={{ backgroundColor: type.color || "#6B7280" }}
                                                                    />
                                                                    {type.name}
                                                                </FormLabel>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Lines */}
                            <FormField
                                control={form.control}
                                name="lineIds"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-2">
                                            <FormLabel>Закрепленные линии</FormLabel>
                                            <FormDescription>Линии, на которых обычно работает сотрудник</FormDescription>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 p-3 border rounded-lg max-h-[200px] overflow-y-auto">
                                            {lines.map((line) => (
                                                <FormField
                                                    key={line.id}
                                                    control={form.control}
                                                    name="lineIds"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={line.id}
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(line.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, line.id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== line.id
                                                                                    )
                                                                                );
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="text-sm font-normal cursor-pointer flex items-center gap-2">
                                                                    <div
                                                                        className="w-2 h-2 rounded-full"
                                                                        style={{ backgroundColor: line.color || "#6B7280" }}
                                                                    />
                                                                    {line.name} ({line.code})
                                                                </FormLabel>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="cursor-pointer">Сотрудник активен</FormLabel>
                                    </FormItem>
                                )}
                            />

                            <div className="text-xs text-muted-foreground italic">
                                Неактивные сотрудники не отображаются в списках на назначение задач
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Сохранение..." : isEditing ? "Сохранить" : "Добавить"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
