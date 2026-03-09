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
    DialogDescription,
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
import { createCollection, updateCollection } from "../actions/index";

const formSchema = z.object({
    name: z.string().min(1, "Название обязательно").max(100, "Максимум 100 символов"),
    description: z.string().max(500, "Максимум 500 символов").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Collection {
    id: string;
    name: string;
    description: string | null;
    coverImage: string | null;
}

interface CollectionFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collection?: Collection;
    onSuccess?: (id: string) => void;
}

export function CollectionFormDialog({
    open,
    onOpenChange,
    collection,
    onSuccess,
}: CollectionFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!collection;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    // Заполнение формы при редактировании
    useEffect(() => {
        if (open && collection) {
            form.reset({
                name: collection.name,
                description: collection.description || "",
            });
        } else if (open && !collection) {
            form.reset({
                name: "",
                description: "",
            });
        }
    }, [open, collection, form]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);

        try {
            if (isEditing) {
                const result = await updateCollection(collection.id, values);
                if (!result.success) {
                    toast.error(result.error || "Ошибка обновления");
                } else {
                    toast.success("Коллекция обновлена");
                    onOpenChange(false);
                    onSuccess?.(collection.id);
                }
            } else {
                const result = await createCollection(values);
                if (!result.success) {
                    toast.error(result.error || "Ошибка создания");
                } else if (result.data) {
                    toast.success("Коллекция создана");
                    onOpenChange(false);
                    onSuccess?.(result.data.id);
                }
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error(error instanceof Error ? error.message : "Произошла ошибка");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Редактировать коллекцию" : "Новая коллекция"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Измените информацию о коллекции"
                            : "Создайте новую коллекцию принтов"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, (errors) => {
                            console.error("Form Validation Errors:", errors);
                        })}
                        className="space-y-3"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Например: Знаки зодиака"
                                            disabled={isSubmitting}
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
                                            {...field}
                                            placeholder="Краткое описание коллекции..."
                                            rows={3}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                {isEditing ? "Сохранить" : "Создать"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
