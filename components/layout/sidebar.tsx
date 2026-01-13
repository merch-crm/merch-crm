"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Settings,
    LogOut,
    Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
    { name: "Обзор", href: "/dashboard", icon: LayoutDashboard },
    { name: "Заказы", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Склад", href: "/dashboard/warehouse", icon: Package },
    { name: "Клиенты", href: "/dashboard/clients", icon: Users },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <div className={cn("flex flex-col h-full bg-card border-r border-border", className)}>
            <div className="flex items-center h-16 px-6 border-b border-border">
                <Printer className="w-6 h-6 text-primary mr-2" />
                <span className="text-lg font-bold tracking-tight">MerchCRM</span>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto py-4">
                <nav className="flex-1 px-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                                        isActive
                                            ? "text-primary-foreground"
                                            : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-border">
                <form action="/api/auth/logout" method="POST">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Выйти
                    </Button>
                </form>
            </div>
        </div>
    );
}
