"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createMockup, updateMockup } from "@/app/(main)/dashboard/design/prints/actions/mockup-actions";
import type { PrintDesignMockup } from "@/lib/schema/designs";

const formSchema = z.object({
    name: z.string().min(1, "Название обязательно"),
    color: z.string(),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface MockupFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    designId: string;
    mockup?: PrintDesignMockup | null;
    onSuccess: (mockup: PrintDesignMockup) => void;
}

const colorPresets = [
    "#FFFFFF",
    "#000000",
    "#1F2937",
    "#DC2626",
    "#2563EB",
    "#16A34A",
    "#CA8A04",
    "#9333EA",
    "#EC4899",
    "#F97316",
];

export function MockupFormDialog({
    open,
    onOpenChange,
    designId,
    mockup,
    onSuccess,
}: MockupFormDialogProps) {
    // const { toast } = useToast(); // Removed deprecated useToast
    const isEdit = !!mockup;

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            color: "",
            isActive: true,
        },
    });

    useEffect(() => {
        if (mockup) {
            form.reset({
                name: mockup.name || "",
                color: mockup.color || "",
                isActive: mockup.isActive,
            });
            setImagePreview(mockup.imagePath || null);
        } else {
            form.reset({
                name: "",
                color: "",
                isActive: true,
            });
            setImagePreview(null);
        }
        setImageFile(null);
    }, [mockup, form, open]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(mockup?.imagePath || null);
    };

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        setIsUploading(true);

        let imagePath = mockup?.imagePath;

        // Upload image if new file selected
        if (imageFile) {
            const formData = new FormData();
            formData.append("file", imageFile);
            formData.append("type", "mockup");
            formData.append("designId", designId);

            const uploadRes = await fetch("/api/uploads/design-files", {
                method: "POST",
                body: formData,
            });

            if (uploadRes.ok) {
                const { path } = await uploadRes.json();
                imagePath = path;
            } else {
                toast.error("Не удалось загрузить изображение");
                setIsUploading(false);
                return;
            }
        }

        const data = {
            name: values.name,
            color: values.color || undefined,
            isActive: values.isActive,
            imagePath: imagePath!,
        };

        const result = isEdit
            ? await updateMockup(mockup.id, data)
            : await createMockup({ ...data, designId });

        if (result.success && result.data) {
            onSuccess(result.data);
            onOpenChange(false);
        } else if (!result.success) {
            toast.error(result.error || "Ошибка");
        }

        setIsUploading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Редактировать мокап" : "Добавить мокап"}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        {/* Image Upload */}
                        <div>
                            <label className="text-sm font-medium">Изображение</label>
                            <div className="mt-2">
                                {imagePreview ? (
                                    <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={handleRemoveImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">
                                            Нажмите для загрузки
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Футболка белая (перед)" {...field} />
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
                                    <FormLabel>Цвет продукта</FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            <Input placeholder="#FFFFFF" {...field} value={field.value || ""} />
                                            <div className="flex flex-wrap gap-2">
                                                {colorPresets.map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        className={`w-6 h-6 rounded-full border-2 ${field.value === color
                                                            ? "border-primary"
                                                            : "border-transparent"
                                                            }`}
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => field.onChange(color)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                    <FormLabel>Активен</FormLabel>
                                    <FormControl>
                                        <Switch
                                            checked={field.value ?? true}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" disabled={isUploading}>
                                {isUploading
                                    ? "Сохранение..."
                                    : isEdit
                                        ? "Сохранить"
                                        : "Добавить"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
