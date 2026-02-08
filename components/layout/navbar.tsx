"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ShoppingCart,
    Users,
    Palette,
    Settings,
    Printer,
    CheckSquare,
    BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";


const navigation = [
    { name: "Заказы", href: "/dashboard/orders", icon: ShoppingCart },
    {
        name: "Клиенты",
        href: "/dashboard/clients",
        icon: Users,
        departments: ["Руководство", "Отдел продаж"]
    },
    { name: "Задачи", href: "/dashboard/tasks", icon: CheckSquare },
    {
        name: "Производство",
        href: "/dashboard/production",
        icon: Settings,
        departments: ["Руководство", "Производство"]
    },
    {
        name: "Дизайн",
        href: "/dashboard/design",
        icon: Palette,
        departments: ["Руководство", "Дизайн"]
    },
    { name: "База знаний", href: "/dashboard/knowledge-base", icon: BookOpen },
];

import Image from "next/image";
import { UserNav } from "./user-nav";
import { NotificationCenter } from "@/components/notifications/notification-center";

interface BrandingSettings {
    companyName: string;
    logoUrl: string | null;
    primaryColor: string;
    faviconUrl: string | null;
    currencySymbol?: string;
    dateFormat?: string;
    timezone?: string;
    [key: string]: unknown;
}

import { Notification } from "@/components/notifications/notification-center";

export function Navbar({ user, branding, notifications, unreadCount }: {
    user: { name: string, email: string, roleName: string, departmentName: string, avatar?: string | null };
    branding: BrandingSettings;
    notifications: Notification[];
    unreadCount: number;
}) {
    const pathname = usePathname();

    const filteredNavigation = navigation.filter(item => {
        if (!item.departments) return true;
        return item.departments.includes(user.departmentName);
    });

    return (
        <header className="hidden md:block sticky top-0 z-50 p-3 md:p-4 md:px-6">
            <div className="max-w-[1440px] mx-auto glass-panel !p-0 h-16 md:h-20 flex items-center">
                <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Left: Logo */}
                    <div className="flex items-center shrink-0">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="bg-primary rounded-[18px] w-11 h-11 p-1.5 flex items-center justify-center shadow-sm transition-all duration-500">
                                {branding.logoUrl ? (
                                    <div className="relative h-8 w-8">
                                        <Image src={branding.logoUrl} alt="Logo" fill className="object-contain" />
                                    </div>
                                ) : (
                                    <Printer className="h-8 w-8 text-white" />
                                )}
                            </div>
                            <span className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-primary transition-colors">
                                {branding.companyName}
                            </span>
                        </Link>
                    </div>

                    {/* Center: Nav Links */}
                    <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 mx-auto pointer-events-auto transition-all duration-300">
                        {filteredNavigation.map((item) => {
                            const isActive = item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2.5 px-4 py-2 rounded-lg text-[13px] font-bold tracking-normal transition-all duration-300 whitespace-nowrap",
                                        isActive
                                            ? "text-primary bg-primary/10 shadow-inner"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-slate-400")} />
                                    <span className="relative z-10 hidden xl:inline-block">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side: Notifications & Profile */}
                    <div className="flex items-center justify-end gap-2 md:gap-4 shrink-0">
                        <NotificationCenter notifications={notifications} unreadCount={unreadCount} branding={branding} />

                        <div className="h-6 w-px bg-slate-200 mx-1 md:mx-2" />

                        <UserNav user={user} branding={branding} />
                    </div>
                </div>
            </div>
        </header>
    );
}
