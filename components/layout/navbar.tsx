"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    Palette,
    Settings,
    Bell,
    Printer,
    CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
    { name: "Главная", href: "/dashboard", icon: LayoutDashboard },
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
        name: "Дизайн-студия",
        href: "/dashboard/design",
        icon: Palette,
        departments: ["Руководство", "Дизайн"]
    },
];

import { UserNav } from "./user-nav";

export function Navbar({ user }: { user: { name: string, email: string, roleName: string, departmentName: string, avatar?: string | null } }) {
    const pathname = usePathname();

    const filteredNavigation = navigation.filter(item => {
        if (!item.departments) return true;
        return item.departments.includes(user.departmentName);
    });

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center">
                    {/* Left: Logo */}
                    <div className="flex-1 flex items-center">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="bg-indigo-600 rounded-full p-1.5 shadow-sm shadow-indigo-100">
                                <Printer className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-black text-slate-900 tracking-tighter">MerchCRM</span>
                        </Link>
                    </div>

                    {/* Center: Nav Links */}
                    <nav className="hidden md:flex items-center justify-center gap-2">
                        {filteredNavigation.map((item) => {
                            const isActive = item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                                        isActive
                                            ? "text-slate-900 bg-slate-100"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    <item.icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side: Notifications & Profile */}
                    <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
                        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-indigo-600 transition-colors rounded-full">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                        </Button>

                        <div className="h-6 w-px bg-slate-200 mx-1 md:mx-2" />

                        <UserNav user={user} />
                    </div>
                </div>
            </div>
        </header>
    );
}
