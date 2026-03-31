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

interface PricingTabProps {
    form: UseFormReturn<ApplicationTypeFormValues>;
}

export function PricingTab({ form }: PricingTabProps) {
    const baseCost = form.watch("baseCost") || 0;
    const setupCost = form.watch("setupCost") || 0;
    const costPerUnit = form.watch("costPerUnit") || 0;

    return (
        <div className="space-y-3 mt-4">
            <FormField
                control={form.control}
                name="baseCost"
                render={() => (
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
                render={() => (
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
                render={() => (
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

            <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Пример расчёта</h4>
                <p className="text-sm text-muted-foreground">
                    Заказ на 100 единиц:{" "}
                    <span className="font-medium text-foreground">
                        {((baseCost + setupCost + costPerUnit * 100) / 100).toFixed(0)} ₽
                    </span>
                </p>
            </div>
        </div>
    );
}
