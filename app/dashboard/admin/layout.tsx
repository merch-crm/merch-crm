"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Shield, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
    { name: "Пользователи", href: "/dashboard/admin/users", icon: Users },
    { name: "Роли и права", href: "/dashboard/admin/roles", icon: Shield },
    { name: "Настройки системы", href: "/dashboard/admin/settings", icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Панель управления</h1>
                <p className="text-slate-500 mt-2 text-lg">Управление сотрудниками, их ролями и системными настройками</p>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                isActive
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.name}
                        </Link>
                    );
                })}
            </div>

            <div className="mt-6">
                {children}
            </div>
        </div>
    );
}
