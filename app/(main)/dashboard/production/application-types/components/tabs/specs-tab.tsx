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
import { UseFormReturn } from "react-hook-form";
import type { ApplicationTypeFormValues } from "../application-type-form-dialog";

interface SpecsTabProps {
    form: UseFormReturn<ApplicationTypeFormValues>;
}

export function SpecsTab({ form }: SpecsTabProps) {
    return (
        <div className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
                <FormField
                    control={form.control}
                    name="minQuantity"
                    render={() => (
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
        </div>
    );
}
