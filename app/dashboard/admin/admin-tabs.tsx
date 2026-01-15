"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Shield, Settings, Building, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminTabsProps {
}


export default function AdminTabs({ }: AdminTabsProps) {
    const pathname = usePathname();

    const tabs = [
        { name: "Пользователи", href: "/dashboard/admin/users", icon: Users },
        { name: "Отделы компании", href: "/dashboard/admin/departments", icon: Building },
        { name: "Роли и права", href: "/dashboard/admin/roles", icon: Shield },
        { name: "Мониторинг", href: "/dashboard/admin/monitoring", icon: Settings },
        { name: "Хранилище", href: "/dashboard/admin/storage", icon: HardDrive },
    ];

    return (
        <nav className="inline-flex items-center gap-1 p-1 bg-[#f1f5f9] rounded-full border-none shadow-none flex-wrap">
            {tabs.map((tab) => {
                const isActive = pathname.startsWith(tab.href) || (pathname === "/dashboard/admin" && tab.href === "/dashboard/admin/users");
                return (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={cn(
                            "flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200",
                            isActive
                                ? "bg-white text-[#4f46e5] shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]"
                                : "text-[#64748b] hover:text-[#0f172a]"
                        )}
                    >
                        <tab.icon className={cn("w-4.5 h-4.5", isActive ? "text-[#4f46e5]" : "text-[#64748b]")} />
                        {tab.name}
                    </Link>
                );
            })}
        </nav>
    );
}
