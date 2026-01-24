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



export function Navbar({ user }: {
    user: { name: string, email: string, roleName: string, departmentName: string, avatar?: string | null };
}) {
    const pathname = usePathname();

    const filteredNavigation = navigation.filter(item => {
        if (!item.departments) return true;
        return item.departments.includes(user.departmentName);
    });

    return (
        <header className="sticky top-0 z-50 p-3 md:p-4 md:px-6">
            <div className="max-w-[1600px] mx-auto glass-panel !p-0 h-16 md:h-20 flex items-center shadow-crm-lg border-white/50">
                <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Left: Logo */}
                    <div className="flex items-center shrink-0">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="bg-primary rounded-[18px] p-2 shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <Printer className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-primary transition-colors">MerchCRM</span>
                        </Link>
                    </div>

                    {/* Center: Nav Links */}
                    <nav className="hidden lg:flex items-center gap-1 mx-8 pointer-events-auto">
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
                                    <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-400")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side: Notifications & Profile */}
                    <div className="flex items-center justify-end gap-2 md:gap-4 shrink-0">
                        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-primary hover:bg-primary/10 transition-all rounded-lg">
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
