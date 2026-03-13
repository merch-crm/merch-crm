"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import {
    Pencil,
    Save,
    X,
    Loader2,
    Banknote,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { DesignWithMockups } from "@/lib/types";
import { updateDesign } from "@/app/(main)/dashboard/design/prints/actions";

interface DesignPricingCardProps {
    design: DesignWithMockups;
    applicationTypes: { id: string; name: string; color: string }[];
}

export function DesignPricingCard({
    design,
    applicationTypes
}: DesignPricingCardProps) {
    const selectOptions: SelectOption[] = applicationTypes.map(type => ({
        id: type.id,
        title: type.name,
        color: type.color
    }));
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        applicationTypeId: design.applicationTypeId || "none",
        costPrice: design.costPrice || "",
        retailPrice: design.retailPrice || "",
        printFilePath: design.printFilePath || "",
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateDesign(design.id, {
                costPrice: form.costPrice ? Number(form.costPrice) : null,
                retailPrice: form.retailPrice ? Number(form.retailPrice) : null,
                applicationTypeId: form.applicationTypeId === "none" ? null : form.applicationTypeId,
            });

            if (result.success) {
                toast.success("Настройки сохранены");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.error || "Ошибка сохранения");
            }
        } catch {
            toast.error("Произошла ошибка");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setForm({
            applicationTypeId: design.applicationTypeId || "none",
            costPrice: design.costPrice || "",
            retailPrice: design.retailPrice || "",
            printFilePath: design.printFilePath || "",
        });
        setIsEditing(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-muted-foreground" />
                        Цены и печать
                    </CardTitle>
                    <CardDescription>
                        Настройки производства и стоимости
                    </CardDescription>
                </div>
                {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Изменить
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Тип нанесения */}
                    <div className="space-y-2">
                        <Label>Тип нанесения</Label>
                        {isEditing ? (
                            <Select
                                value={form.applicationTypeId}
                                onChange={(v) => setForm({ ...form, applicationTypeId: v })}
                                options={[
                                    { id: "none", title: "Не указан" },
                                    ...selectOptions
                                ]}
                            />
                        ) : (
                            <div className="text-sm font-medium h-10 flex items-center px-3 border rounded-md bg-muted/30">
                                {design.applicationType ? (
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: design.applicationType.color || "#ccc" }}
                                        />
                                        {design.applicationType.name}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground italic">Не указан</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Файл для печати */}
                    <div className="space-y-2">
                        <Label>Путь к оригиналу (ссылка)</Label>
                        {isEditing ? (
                            <Input
                                value={form.printFilePath}
                                onChange={(e) => setForm({ ...form, printFilePath: e.target.value })}
                                placeholder="ftp://... или https://..."
                                className="font-mono text-xs"
                            />
                        ) : (
                            <div className="flex items-center gap-2 h-10">
                                <div className="flex-1 text-sm font-mono truncate px-3 border rounded-md bg-muted/30 h-full flex items-center">
                                    {design.printFilePath || <span className="text-muted-foreground italic">Не указан</span>}
                                </div>
                                {design.printFilePath && (
                                    <Button variant="outline" size="icon" asChild className="h-10 w-10">
                                        <a href={design.printFilePath} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Себестоимость */}
                    <div className="space-y-2">
                        <Label>Себестоимость</Label>
                        {isEditing ? (
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={form.costPrice}
                                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                                    className="pl-8"
                                    placeholder="0.00"
                                />
                                <span className="absolute left-3 top-2.5 text-muted-foreground">₽</span>
                            </div>
                        ) : (
                            <div className="text-lg font-bold h-10 flex items-center px-3 border rounded-md bg-muted/30">
                                {design.costPrice ? `${design.costPrice} ₽` : "—"}
                            </div>
                        )}
                    </div>

                    {/* Розничная цена */}
                    <div className="space-y-2">
                        <Label>Розничная цена</Label>
                        {isEditing ? (
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={form.retailPrice}
                                    onChange={(e) => setForm({ ...form, retailPrice: e.target.value })}
                                    className="pl-8"
                                    placeholder="0.00"
                                />
                                <span className="absolute left-3 top-2.5 text-muted-foreground">₽</span>
                            </div>
                        ) : (
                            <div className="text-lg font-bold text-primary h-10 flex items-center px-3 border rounded-md bg-primary/5 border-primary/20">
                                {design.retailPrice ? `${design.retailPrice} ₽` : "—"}
                            </div>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>
                            <X className="h-4 w-4 mr-2" />
                            Отмена
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Сохранить
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
