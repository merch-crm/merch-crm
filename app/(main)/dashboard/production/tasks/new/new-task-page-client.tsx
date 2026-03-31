"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { createProductionTask } from "../../actions/task-actions";
import type { ProductionLine, ProductionStaff, ApplicationType } from "@/lib/schema/production";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    title: z.string().min(1, "Введите название"),
    description: z.string().optional().nullable(),
    orderId: z.string().optional().nullable(),
    orderItemId: z.string().optional().nullable(),
    applicationTypeId: z.string().optional().nullable(),
    lineId: z.string().optional().nullable(),
    assigneeId: z.string().optional().nullable(),
    quantity: z.number().min(1, "Минимум 1"),
    priority: z.enum(["low", "normal", "high", "urgent"]),
    dueDate: z.date().optional().nullable(),
    estimatedTime: z.number().optional().nullable(),
    notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewTaskPageClientProps {
    lines: ProductionLine[];
    staff: ProductionStaff[];
    applicationTypes: ApplicationType[];
}

export function NewTaskPageClient({
    lines,
    staff,
    applicationTypes,
}: NewTaskPageClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { setCustomTrail } = useBreadcrumbs();

    useEffect(() => {
        setCustomTrail([
            { label: "Производство", href: "/dashboard/production" },
            { label: "Задачи", href: "/dashboard/production/tasks" },
            { label: "Новая задача", href: "" },
        ]);
        return () => setCustomTrail(null);
    }, [setCustomTrail]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            orderId: "",
            orderItemId: "",
            applicationTypeId: "",
            lineId: "",
            assigneeId: "",
            quantity: 1,
            priority: "normal",
            estimatedTime: 0,
            notes: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        const result = await createProductionTask({
            orderId: values.orderId || "",
            name: values.title,
            description: values.description,
            orderItemId: values.orderItemId,
            applicationTypeId: values.applicationTypeId || "",
            lineId: values.lineId,
            assigneeId: values.assigneeId,
            quantity: values.quantity,
            priority: values.priority,
            dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        });

        if (result.success && result.data) {
            toast("Задача создана", "success");
            router.push(`/dashboard/production/tasks/${result.data.id}`);
        } else {
            toast(result.error || "Ошибка", "destructive");
        }
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Новая задача</h1>
                    <p className="text-muted-foreground">Создание производственной задачи</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Основная информация</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Название *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Печать футболок для заказа #123" {...field} value={field.value || ""} />
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
                                                placeholder="Детальное описание задачи..."
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="orderId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ID заказа</FormLabel>
                                            <FormControl>
                                                <Input placeholder="order-uuid" {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormDescription>Опционально</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Количество *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    {...field}
                                                    value={field.value || 0}
                                                    onChange={e => field.onChange({ target: { value: Number(e.target.value) } })}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Приоритет</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value || "normal"}
                                                onChange={field.onChange}
                                                options={[
                                                    { id: "low", title: "Низкий" },
                                                    { id: "normal", title: "Обычный" },
                                                    { id: "high", title: "Высокий" },
                                                    { id: "urgent", title: "Срочный" }
                                                ]}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Assignment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Назначение</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <FormField
                                control={form.control}
                                name="applicationTypeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Тип нанесения</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                placeholder="Выберите тип"
                                                options={applicationTypes
                                                    .filter((t) => t.isActive)
                                                    .map((type) => ({ id: type.id, title: type.name }))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lineId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Производственная линия</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                placeholder="Выберите линию"
                                                options={lines
                                                    .filter((l) => l.isActive)
                                                    .map((line) => ({ id: line.id, title: line.name }))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assigneeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Исполнитель</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                placeholder="Выберите исполнителя"
                                                options={staff
                                                    .filter((s) => s.isActive)
                                                    .map((person) => ({ id: person.id, title: person.name }))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Сроки</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Срок выполнения</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? format(field.value, "dd.MM.yyyy", { locale: ru })
                                                            : "Выберите дату"}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value || undefined}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="estimatedTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Оценка времени (мин.)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                placeholder="60"
                                                {...field}
                                                value={field.value || 0}
                                                onChange={e => field.onChange({ target: { value: Number(e.target.value) } })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Примечания</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Дополнительные заметки..."
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Отмена
                        </Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Создание..." : "Создать задачу"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
