"use client";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import type { ApplicationTypeFormValues } from "../application-type-form-dialog";

const categoryOptions = [
    { value: "print", label: "Печать" },
    { value: "embroidery", label: "Вышивка" },
    { value: "engraving", label: "Гравировка" },
    { value: "transfer", label: "Термоперенос" },
    { value: "other", label: "Прочее" },
] as const;

const colorPresets = [
    "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", 
    "#EC4899", "#6366F1", "#F97316", "#14B8A6",
];

interface GeneralTabProps {
    form: UseFormReturn<ApplicationTypeFormValues>;
}

export function GeneralTab({ form }: GeneralTabProps) {
    return (
        <div className="space-y-3 mt-4">
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
        </div>
    );
}
