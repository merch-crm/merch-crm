"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
    ArrowLeft,
    MoreVertical,
    Pencil,
    Trash2,
    Plus,
    Package,
    Tag,
    ExternalLink,
} from "lucide-react";
import { deleteProductLine, type ProductLineFull } from "../actions";
import { LineFormDialog } from "../components/line-form-dialog";
import type { InventoryItem } from "../../types";

interface LineDetailClientProps {
    line: ProductLineFull;
    items: InventoryItem[];
}

export function LineDetailClient({ line, items }: LineDetailClientProps) {
    const router = useRouter();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const renderPrintCollectionCard = () => {
        if (line.type !== "finished" || !line.printCollection) return null;
        const collection = line.printCollection as { name: string };
        return (
            <Card className="col-span-2">
                <CardHeader className="pb-2">
                    <CardDescription>Коллекция дизайнов</CardDescription>
                    <CardTitle className="text-lg flex items-center gap-2">
                        {String(collection.name)}
                        <Link href={`/dashboard/design/prints/${line.printCollectionId}`}>
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteProductLine(line.id);
            if (result.success) {
                toast.success("Линейка удалена");
                router.push("/dashboard/warehouse/lines");
            } else {
                toast.error(result.error || "Ошибка удаления");
            }
        } catch {
            toast.error("Произошла ошибка");
        } finally {
            setIsDeleting(false);
            setIsDeleteOpen(false);
        }
    };

    const typeConfig = {
        base: { label: "Базовая линейка", icon: Package, color: "blue" },
        finished: { label: "Готовая линейка", icon: Tag, color: "green" },
    };

    const config = typeConfig[line.type as keyof typeof typeConfig] || typeConfig.base;
    const TypeIcon = config.icon;

    return (
        <div className="space-y-3">
            {/* Шапка */}
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link
                            href="/dashboard/warehouse/lines"
                            className="hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <span>/</span>
                        {line.category && (
                            <>
                                <Link
                                    href={`/dashboard/warehouse/categories/${line.categoryId}`}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {line.category.name}
                                </Link>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-foreground">{line.name}</span>
                    </div>
                    <h1 className="text-2xl font-bold">{line.name}</h1>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`bg-${config.color}-500/10 text-${config.color}-600`}
                        >
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {config.label}
                        </Badge>
                        {line.printCollection && (
                            <Badge variant="secondary">
                                Коллекция: {line.printCollection.name}
                            </Badge>
                        )}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                router.push(
                                    `/dashboard/warehouse/items/new?lineId=${line.id}&lineType=${line.type}`
                                )
                            }
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Добавить позиции
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setIsDeleteOpen(true)}
                            className="text-destructive"
                            disabled={(items?.length || 0) > 0}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить линейку
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Позиций</CardDescription>
                        <CardTitle className="text-2xl">{items?.length || 0}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Общий остаток</CardDescription>
                        <CardTitle className="text-2xl">{(items || []).reduce((acc, item) => acc + item.quantity, 0)} шт.</CardTitle>
                    </CardHeader>
                </Card>
                {renderPrintCollectionCard()}
            </div>

            {/* Описание */}
            {line.description && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Описание</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{line.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Общие характеристики */}
            {line.commonAttributes != null &&
                typeof line.commonAttributes === "object" &&
                Object.keys(line.commonAttributes as Record<string, unknown>).length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Общие характеристики линейки
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(
                                line.commonAttributes as Record<string, string>
                            ).map(([key, value]) => (
                                <Badge key={key} variant="secondary">
                                    {key}: {value}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {/* Таблица позиций */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Позиции линейки</CardTitle>
                        <CardDescription>
                            {items?.length || 0} из {items?.length || 0} позиций
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            router.push(
                                `/dashboard/warehouse/items/new?lineId=${line.id}&lineType=${line.type}`
                            )
                        }
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить
                    </Button>
                </CardHeader>
                <CardContent>
                    {(items?.length || 0) === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            В линейке пока нет позиций
                        </div>
                    ) : (
                        <table className="crm-table w-full text-left">
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>SKU</th>
                                    <th className="text-right">Остаток</th>
                                    <th className="text-right">Цена</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(items || []).map((item) => (
                                    <tr
                                        key={item.id}
                                        className="cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-0"
                                        onClick={() =>
                                            router.push(`/dashboard/warehouse/items/${item.id}`)
                                        }
                                    >
                                        <td className="font-medium px-4 py-3">{item.name}</td>
                                        <td className="font-mono text-sm px-4 py-3">
                                            {item.sku}
                                        </td>
                                        <td className="text-right px-4 py-3">
                                            {item.quantity} {item.unit}
                                        </td>
                                        <td className="text-right px-4 py-3">
                                            {item.sellingPrice ? `${item.sellingPrice} ₽` : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* Диалоги */}
            <LineFormDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                line={line}
                onSuccess={() => router.refresh()}
            />

            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Удалить линейку?"
                description={
                    (items?.length || 0) > 0
                        ? `Невозможно удалить линейку с ${items?.length} позициями. Сначала удалите или переместите позиции.`
                        : "Это действие нельзя отменить. Линейка будет удалена безвозвратно."
                }
                confirmText={isDeleting ? "Удаление..." : "Удалить"}
                cancelText="Отмена"
                variant="destructive"
                isLoading={isDeleting}
                isConfirmDisabled={(items?.length || 0) > 0}
            />
        </div>
    );
}
