"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ShoppingCart,
    LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileSidebarTrigger } from "./mobile-sidebar-trigger";
import { motion } from "framer-motion";

const mobileTabs = [
    { name: "Главная", href: "/dashboard", icon: LayoutDashboard },
    { name: "Заказы", href: "/dashboard/orders", icon: ShoppingCart },
];

interface UserProp {
    name: string;
    email: string;
    roleName: string;
    departmentName: string;
    avatar?: string | null;
}

export function MobileBottomNav({ user }: { user: UserProp }) {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100]">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200/50" />

            <div className="relative px-4 pb-[env(safe-area-inset-bottom,16px)] pt-2">
                <div className="flex items-center justify-between h-14 translate-y-[-2px]">
                    {mobileTabs.map((item) => {
                        const isActive = item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-1 transition-all duration-300 flex-1 h-full",
                                    isActive ? "text-primary" : "text-slate-400"
                                )}
                            >
                                <div className="relative z-10 flex flex-col items-center gap-0.5">
                                    <div className={cn(
                                        "p-1 rounded-xl transition-transform duration-300",
                                        isActive ? "scale-110" : "scale-100"
                                    )}>
                                        <item.icon
                                            className={cn("h-5 w-5")}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold tracking-tight">{item.name}</span>
                                </div>

                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-nav-pill"
                                        className="absolute inset-0 bg-primary/5 rounded-2xl mx-1"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-nav-dot"
                                        className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        );
                    })}

                    <MobileSidebarTrigger user={user} />
                </div>
            </div>
        </div>
    );
}
