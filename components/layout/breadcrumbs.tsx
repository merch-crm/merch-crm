"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
    dashboard: "Главная",
    orders: "Заказы",
    clients: "Клиенты",
    warehouse: "Склад",
    items: "Товары",
    production: "Производство",
    design: "Дизайн",
    tasks: "Задачи",
    "knowledge-base": "База знаний",
    admin: "Администрирование",
    branding: "Внешний вид",
    users: "Сотрудники",
    roles: "Роли",
    departments: "Отделы",
};

export function Breadcrumbs() {
    const pathname = usePathname();
    const paths = pathname.split("/").filter(Boolean);

    if (paths.length <= 1) return null;

    return (
        <nav className="flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-left-2 duration-500">
            <Link
                href="/dashboard"
                className="text-slate-400 hover:text-primary transition-colors hover:scale-110 active:scale-95"
            >
                <Home className="w-3.5 h-3.5" />
            </Link>

            {paths.slice(1).map((path, index) => {
                const href = `/${paths.slice(0, index + 2).join("/")}`;
                const label = routeLabels[path] || path;
                const isLast = index === paths.length - 2;

                return (
                    <div key={href} className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <Link
                            href={href}
                            className={cn(
                                "text-[11px] font-black tracking-widest transition-all",
                                isLast
                                    ? "text-slate-900"
                                    : "text-slate-400 hover:text-primary"
                            )}
                        >
                            {label}
                        </Link>
                    </div>
                );
            })}
        </nav>
    );
}
