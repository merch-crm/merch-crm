"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ShoppingCart,
    Users,
    Palette,
    Settings,
    Bell,
    Printer,
    CheckSquare,
    BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

import { UserNav } from "./user-nav";

export function Navbar({ user }: { user: { name: string, email: string, roleName: string, departmentName: string, avatar?: string | null } }) {
    const pathname = usePathname();

    const filteredNavigation = navigation.filter(item => {
        if (!item.departments) return true;
        return item.departments.includes(user.departmentName);
    });

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm shadow-slate-200/20">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center">
                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="bg-indigo-600 rounded-xl p-2 shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <Printer className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">MerchCRM</span>
                        </Link>
                    </div>

                    <div className="flex-1" />

                    {/* Center: Nav Links */}
                    <nav className="hidden md:flex items-center gap-2">
                        {filteredNavigation.map((item) => {
                            const isActive = item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2.5 px-5 py-2.5 rounded-[var(--radius-inner)] text-[13px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                                        isActive
                                            ? "text-indigo-600 bg-indigo-50 shadow-inner"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    <item.icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex-1" />

                    {/* Right Side: Notifications & Profile */}
                    <div className="flex items-center justify-end gap-2 md:gap-4">
                        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all rounded-[14px]">
                            <Bell className="h-5.5 w-5.5" />
                            <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                        </Button>

                        <div className="h-6 w-px bg-slate-200 mx-1 md:mx-2" />

                        <UserNav user={user} />
                    </div>
                </div>
            </div>
        </header>
    );
}
