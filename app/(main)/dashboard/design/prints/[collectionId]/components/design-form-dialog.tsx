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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createDesign, updateDesign } from "../../actions";

const designFormSchema = z.object({
    name: z
        .string()
        .min(1, "Название обязательно")
        .max(255, "Название слишком длинное"),
    description: z
        .string()
        .max(1000, "Описание слишком длинное")
        .optional()
        .nullable(),
});

type DesignFormValues = z.infer<typeof designFormSchema>;

interface DesignFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collectionId: string;
    applicationTypes?: { id: string; name: string; color: string | null }[];
    design?: {
        id: string;
        name: string;
        description: string | null;
    } | null;
    onSuccess: (designId: string) => void;
}

export function DesignFormDialog({
    open,
    onOpenChange,
    collectionId,
    applicationTypes: _applicationTypes, // Not used but passed so we don't crash
    design,
    onSuccess,
}: DesignFormDialogProps) {
    const isEditing = !!design;

    const form = useForm<DesignFormValues>({
        resolver: zodResolver(designFormSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    // Reset form when dialog opens/closes or design changes
    useEffect(() => {
        if (open) {
            form.reset({
                name: design?.name || "",
                description: design?.description || "",
            });
        }
    }, [open, design, form]);

    const onSubmit = async (values: DesignFormValues) => {
        try {
            if (isEditing) {
                const result = await updateDesign(design!.id, {
                    name: values.name,
                    description: values.description || null,
                });

                if (!result.success) {
                    toast.error(result.error || "Не удалось обновить принт");
                } else {
                    onSuccess(design!.id);
                }
            } else {
                const result = await createDesign({
                    collectionId,
                    name: values.name,
                    description: values.description || null,
                });

                if (!result.success) {
                    toast.error(result.error || "Не удалось создать принт");
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Редактировать принт" : "Новый принт"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Измените название или описание принта"
                            : "Добавьте новый принт в коллекцию"}
                    </DialogDescription>
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
                                        <Input
                                            placeholder="Например: Овен"
                                            {...field}
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
                                            placeholder="Описание принта (необязательно)"
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
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
