"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    ShoppingCart,
    Users,
    Palette,
    Settings,
    Printer,
    BookOpen,
    CheckSquare,

    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserNav } from "./user-nav";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { motion } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error" | "transfer";
    isRead: boolean;
    createdAt: Date;
}

interface BrandingSettings {
    companyName: string;
    logoUrl: string | null;
    primaryColor: string;
    faviconUrl: string | null;
}

export function DesktopHeader({ user, notifications, branding }: {
    user: { name: string, email: string, roleName: string, departmentName: string, avatar?: string | null };
    notifications: Notification[];
    branding: BrandingSettings;
}) {
    const pathname = usePathname();

    const filteredNavigation = navigation.filter(item => {
        if (!item.departments) return true;
        return item.departments.includes(user.departmentName);
    });

    return (
        <header className="sticky-glass-header hidden md:flex items-center justify-between px-6 py-3">
            {/* Logo Section */}
            <div className="flex items-center">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-[14px] bg-primary shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                        {branding.logoUrl ? (
                            <Image src={branding.logoUrl} alt="Logo" width={24} height={24} className="w-6 h-6 object-contain" />
                        ) : (
                            <Printer className="h-5 w-5 text-white" />
                        )}
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-primary transition-colors">
                        {branding.companyName}
                    </span>
                </Link>
            </div>

            {/* Navigation Pills */}
            <nav className="flex items-center gap-1 bg-secondary/50 p-1.5 rounded-[16px] border border-white/50 backdrop-blur-sm">
                {filteredNavigation.slice(0, 5).map((item) => {
                    const isActive = pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "relative flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-bold transition-all duration-300 z-0",
                                isActive
                                    ? "text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-primary rounded-[12px] -z-10"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                {filteredNavigation.length > 5 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className={cn(
                                "relative flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-bold transition-all duration-300 z-0 outline-none",
                                "text-slate-500 hover:text-slate-900 data-[state=open]:text-slate-900 data-[state=open]:bg-white/60 hover:bg-white/60"
                            )}
                        >
                            <span>Еще</span>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2">
                            {filteredNavigation.slice(5).map((item) => (
                                <DropdownMenuItem key={item.name} asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-md transition-colors cursor-pointer",
                                            pathname.startsWith(item.href)
                                                ? "bg-slate-100 text-slate-900 font-bold"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                        )}
                                    >
                                        <item.icon className={cn("h-4 w-4", pathname.startsWith(item.href) ? "text-primary" : "text-slate-400")} />
                                        <span>{item.name}</span>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <NotificationCenter notifications={notifications} />

                <div className="h-8 w-px bg-slate-200/50" />

                <UserNav user={user} />
            </div>
        </header>
    );
}
