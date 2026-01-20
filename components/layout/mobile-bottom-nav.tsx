"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ShoppingCart,
    Users,
    Settings,
    LayoutDashboard,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MobileSidebarTrigger } from "./mobile-sidebar-trigger";
// import { Sidebar } from "./sidebar"; // We will implement a simplified mobile sidebar later if needed

const mobileTabs = [
    { name: "Заказы", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Клиенты", href: "/dashboard/clients", icon: Users },
    { name: "Производство", href: "/dashboard/production", icon: Settings },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 pb-safe pt-2 px-6 z-50">
            <div className="flex items-center justify-between mb-2">
                {mobileTabs.map((item) => {
                    const isActive = item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-[14px] transition-all duration-300 w-16",
                                isActive
                                    ? "text-primary"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-[10px] transition-all",
                                isActive ? "bg-primary/10" : "bg-transparent"
                            )}>
                                <item.icon className={cn("h-5 w-5", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-bold">{item.name}</span>
                        </Link>
                    );
                })}


                {/* Menu Trigger for Sidebar */}
                <MobileSidebarTrigger />
            </div>
            {/* Safe Area at bottom for iOS home indicator */}
            <div className="h-4 w-full" />
        </div>
    );
}
