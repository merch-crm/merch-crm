"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutGrid,
    ClipboardList,
    FolderHeart,
    Plus,
} from "lucide-react";

const designNavItems = [
    {
        title: "Обзор",
        href: "/dashboard/design",
        icon: LayoutGrid,
        description: "Дизайн-студия",
        exact: true,
    },
    {
        title: "Очередь",
        href: "/dashboard/design/queue",
        icon: ClipboardList,
        description: "Задачи на дизайн",
    },
    {
        title: "Коллекции принтов",
        href: "/dashboard/design/prints",
        icon: FolderHeart,
        description: "Библиотека принтов для продукции",
    },
];

export function DesignNav() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-wrap gap-2">
            {designNavItems.map((item) => {
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

            {/* Кнопка создания коллекции */}
            <Link
                href="/dashboard/design/prints?create=true"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors ml-auto"
            >
                <Plus className="h-4 w-4" />
                Новая коллекция
            </Link>
        </nav>
    );
}
