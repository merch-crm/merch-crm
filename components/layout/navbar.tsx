"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ShoppingCart,
    Users,
    Palette,
    Settings,
    CheckSquare,
    BookOpen,
    Package,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HeaderSearch } from "./header-search";
import Image from "next/image";
import { UserNav } from "./user-nav";
import { NotificationCenter } from "@/components/notifications/notification-center";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    { name: "База знаний", href: "/dashboard/knowledge-base", icon: BookOpen },
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
        avatar?: string | null;
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
                <div className="flex items-center gap-3">
                    {/* Logo */}
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 group shrink-0"
                    >
                        {branding.logoUrl ? (
                            <div className="relative h-6 w-6">
                                <Image
                                    src={branding.logoUrl}
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        ) : (
                            <div className="w-6 h-6 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-md border-b-2 border-slate-950 flex items-center justify-center text-white text-[11px] font-black shadow-inner shadow-slate-900/50">
                                {branding.companyName
                                    ? branding.companyName.charAt(0).toUpperCase() + "."
                                    : "M."}
                            </div>
                        )}
                        <span className="font-bold text-lg text-slate-800 tracking-tight hidden lg:block ml-1">
                            {branding.companyName || "MerchCRM"}
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <nav className="flex items-center gap-3 text-[14px] font-semibold">
                        {filteredNavigation.map((item) => {
                            const isActive =
                                item.href === "/dashboard"
                                    ? pathname === "/dashboard"
                                    : pathname.startsWith(item.href);

                            // Если есть подменю
                            if (item.children && item.children.length > 0) {
                                return (
                                    <DropdownMenu key={item.name}>
                                        <DropdownMenuTrigger
                                            className={cn(
                                                "flex items-center gap-1 transition-colors whitespace-nowrap outline-none",
                                                isActive
                                                    ? "text-primary"
                                                    : "text-slate-400 hover:text-slate-900"
                                            )}
                                        >
                                            {item.name}
                                            <ChevronDown className="h-3 w-3" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="min-w-[160px]">
                                            {item.children.map((child) => (
                                                <DropdownMenuItem key={child.href} asChild>
                                                    <Link
                                                        href={child.href}
                                                        className={cn(
                                                            pathname === child.href && "bg-slate-100"
                                                        )}
                                                    >
                                                        {child.name}
                                                    </Link>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                );
                            }

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "transition-colors whitespace-nowrap",
                                        isActive
                                            ? "text-primary cursor-default"
                                            : "text-slate-400 hover:text-slate-900 cursor-pointer"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

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
