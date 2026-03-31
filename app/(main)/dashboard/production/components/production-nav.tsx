"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Layers,
    Settings,
    Users,
    BarChart3,
    Printer,
    Factory
} from "lucide-react";

const navItems = [
    {
        title: "Обзор",
        href: "/dashboard/production",
        icon: BarChart3,
    },
    {
        title: "Типы нанесения",
        href: "/dashboard/production/application-types",
        icon: Layers,
    },
    {
        title: "Оборудование",
        href: "/dashboard/production/equipment",
        icon: Printer,
    },
    {
        title: "Линии",
        href: "/dashboard/production/lines",
        icon: Factory,
    },
    {
        title: "Сотрудники",
        href: "/dashboard/production/staff",
        icon: Users,
    },
    {
        title: "Настройки",
        href: "/dashboard/production/settings",
        icon: Settings,
    },
];

export function ProductionNav() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {navItems.map((item) => {
                const isActive = pathname === item.href ||
                    (item.href !== "/dashboard/production" && pathname.startsWith(item.href));

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
