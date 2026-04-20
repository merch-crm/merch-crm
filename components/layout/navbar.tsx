"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ShoppingCart,
    Users,
    Palette,
    Settings,
    CheckSquare,
    Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HeaderSearch } from "./header-search";
import Image from "next/image";
import { UserNav } from "./user-nav";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { NavDropdown } from "./nav-dropdown";
import type { Notification, BrandingSettings } from "@/lib/types";

const navigation = [
    { name: "Заказы", href: "/dashboard/orders", icon: ShoppingCart },
    {
        name: "Клиенты",
        href: "/dashboard/clients",
        icon: Users,
        departments: ["Руководство", "Отдел продаж"],
    },
    { name: "Задачи", href: "/dashboard/tasks", icon: CheckSquare },
    {
        name: "Производство",
        href: "/dashboard/production",
        icon: Settings,
        departments: ["Руководство", "Производство"],
    },
    {
        name: "Дизайн",
        href: "/dashboard/design",
        icon: Palette,
        departments: ["Руководство", "Дизайн"],
        children: [
            { name: "Студия", href: "/dashboard/design" },
            { name: "Принты", href: "/dashboard/design/prints" },
        ],
    },
    {
        name: "Склад",
        href: "/dashboard/warehouse",
        icon: Package,
        departments: ["Руководство", "Склад", "Производство"],
        children: [
            { name: "Обзор", href: "/dashboard/warehouse/overview" },
            { name: "Категории", href: "/dashboard/warehouse/categories" },
            { name: "Линейки", href: "/dashboard/warehouse/lines" },
            { name: "Характеристики", href: "/dashboard/warehouse/characteristics" },
        ],
    },
];

export function Navbar({
    user,
    branding,
    notifications,
    unreadCount,
}: {
    user: {
        name: string;
        email: string;
        roleName: string;
        departmentName: string;
        image?: string | null;
    };
    branding: BrandingSettings;
    notifications: Notification[];
    unreadCount: number;
}) {
    const pathname = usePathname();

    const filteredNavigation = navigation.filter((item) => {
        if (!item.departments) return true;
        return item.departments.includes(user.departmentName);
    });

    return (
        <header
            data-testid="desktop-navbar"
            className="hidden md:block sticky top-0 z-50 bg-white border-b border-slate-200 h-16 shadow-sm"
        >
            <div className="px-4 h-full flex items-center justify-between max-w-[1480px] mx-auto w-full">
                <div className="flex items-center">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
                        {branding.logoUrl ? (
                            <div className="relative h-6 w-6">
                                <Image src={branding.logoUrl} alt="Logo" fill className="object-contain" unoptimized />
                            </div>
                        ) : (
                            <div className="w-6 h-6 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-md border-b-2 border-slate-950 flex items-center justify-center text-white text-xs font-black shadow-inner shadow-slate-900/50">
                                {branding.companyName
                                    ? branding.companyName.charAt(0).toUpperCase() + "."
                                    : "M."}
                            </div>
                        )}
                        <span className="font-bold text-lg text-slate-800 hidden lg:block ml-1">
                            {branding.companyName || "MerchCRM"}
                        </span>
                    </Link>
                </div>

                {/* Nav Links - Distributed Area */}
                <nav className="flex-1 flex items-center justify-center gap-10 text-[14px] font-semibold px-12">
                    {filteredNavigation.map((item) => {
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(item.href);

                        // Если есть подменю
                        if (item.children && item.children.length > 0) {
                            return (
                                <NavDropdown key={item.name} name={item.name} href={item.href} isActive={isActive}>
                                    {item.children}
                                </NavDropdown>
                            );
                        }

                        return (
                            <Link key={item.name} href={item.href} className={cn( "transition-colors whitespace-nowrap", isActive ? "text-primary cursor-default" : "text-slate-400 hover:text-slate-900 cursor-pointer" )}>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3 ml-auto">
                    {/* Search */}
                    <HeaderSearch />

                    <div className="w-px h-5 bg-slate-200 hidden sm:block"></div>

                    {/* Right Side: Notifications & Profile */}
                    <div className="flex items-center justify-end gap-3 shrink-0">
                        <NotificationCenter notifications={notifications} unreadCount={unreadCount} branding={branding} />

                        <UserNav user={user} branding={branding} />
                    </div>
                </div>
            </div>
        </header>
    );
}
