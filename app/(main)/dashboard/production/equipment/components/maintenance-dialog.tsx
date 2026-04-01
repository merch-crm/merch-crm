"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { updateEquipmentMaintenance } from "../../actions/equipment-actions";
import type { Equipment } from "@/lib/schema/production";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/hooks/use-is-client";

const formSchema = z.object({
    status: z.enum(["active", "maintenance", "repair", "inactive"]),
    notes: z.string().optional(),
    nextMaintenanceAt: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MaintenanceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    equipment: Equipment;
    onSuccess: (equipment: Equipment) => void;
}

export function MaintenanceDialog({
    open,
    onOpenChange,
    equipment,
    onSuccess,
}: MaintenanceDialogProps) {
    const isClient = useIsClient();
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        if (isClient) {
            setNow(new Date()); // suppressHydrationWarning
        }
    }, [isClient]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: equipment.status as FormValues["status"],
            notes: "",
            nextMaintenanceAt: equipment.nextMaintenanceAt
                ? new Date(equipment.nextMaintenanceAt)
                : undefined,
        },
    });

    const onSubmit = async (values: FormValues) => {
        const result = await updateEquipmentMaintenance(equipment.id, {
            status: values.status as Parameters<typeof updateEquipmentMaintenance>[1]["status"],
            notes: values.notes,
            nextMaintenanceAt: values.nextMaintenanceAt,
        });

        if (result.success) {
            onSuccess(result.data!);
            onOpenChange(false);
            toast.success("Обслуживание зафиксировано");
        } else {
            toast.error(result.error || "Ошибка");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Обслуживание: {equipment.name}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Статус после обслуживания</FormLabel>
                                    <Select
                                        options={[
                                            { id: "active", title: "Активно" },
                                            { id: "maintenance", title: "На обслуживании" },
                                            { id: "repair", title: "В ремонте" },
                                            { id: "inactive", title: "Неактивно" },
                                        ]}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="nextMaintenanceAt"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Следующее ТО</FormLabel>
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
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => isClient && now ? date < now : false}
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
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Примечания</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Что было сделано..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Сохранение..." : "Сохранить"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
