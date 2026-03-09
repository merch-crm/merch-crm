"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Package,
    Layers,
    FolderTree,
    Plus,
    BarChart3,
} from "lucide-react";

const warehouseNavItems = [
    {
        title: "Обзор",
        href: "/dashboard/warehouse",
        icon: BarChart3,
        description: "Статистика и общая информация",
        exact: true,
    },
    {
        title: "Категории",
        href: "/dashboard/warehouse/categories",
        icon: FolderTree,
        description: "Структура категорий товаров",
    },
    {
        title: "Позиции",
        href: "/dashboard/warehouse/items",
        icon: Package,
        description: "Все товарные позиции",
    },
    {
        title: "Линейки",
        href: "/dashboard/warehouse/lines",
        icon: Layers,
        description: "Базовые и готовые линейки продуктов",
    },
];

export function WarehouseNav() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-wrap gap-2">
            {warehouseNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                );
            })}

            {/* Кнопка создания */}
            <Link
                href="/dashboard/warehouse/items/new"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors ml-auto"
            >
                <Plus className="h-4 w-4" />
                Создать
            </Link>
        </nav>
    );
}
