"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Printer, Search } from "lucide-react";
import { UserNav } from "./user-nav";
import { NotificationCenter, Notification } from "@/components/notifications/notification-center";
import { useSheetStack } from "@/components/ui/sheet-stack-context";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

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

const routeNames: Record<string, string> = {
    "/dashboard": "Главная",
    "/dashboard/orders": "Заказы",
    "/dashboard/clients": "Клиенты",
    "/dashboard/tasks": "Задачи",
    "/dashboard/production": "Производство",
    "/dashboard/warehouse": "Склад",
    "/dashboard/design": "Дизайн",
    "/dashboard/knowledge-base": "База знаний",
    "/admin-panel": "Админ-панель",
};

export function MobileHeader({ user, branding, notifications, unreadCount }: {
    user: { name: string, email: string, roleName: string, departmentName: string, avatar?: string | null };
    branding: BrandingSettings;
    notifications: Notification[];
    unreadCount: number;
}) {
    const pathname = usePathname();
    const { stack } = useSheetStack();
    const [isBodyLocked, setIsBodyLocked] = useState(false);

    useEffect(() => {
        const checkBodyLock = () => {
            const isLocked = document.body.style.overflow === 'hidden' ||
                document.body.hasAttribute('data-vaul-drawer-wrapper');
            setIsBodyLocked(isLocked);
        };

        // Initial check
        checkBodyLock();

        // Observe changes to body style/attributes
        const observer = new MutationObserver(checkBodyLock);
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['style', 'class', 'data-vaul-drawer-wrapper']
        });

        return () => observer.disconnect();
    }, []);

    const isSheetOpen = stack.length > 0 || isBodyLocked;

    // Find the title for the current route
    const currentTitle = Object.entries(routeNames).find(([route]) =>
        pathname === route || (route !== "/dashboard" && pathname.startsWith(route))
    )?.[1] || branding.companyName;

    return (
        <header className={cn(
            "md:hidden sticky top-0 z-[100] h-14 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 px-4 flex items-center justify-between transition-all duration-300 ease-in-out",
            isSheetOpen ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        )}>
            <div className="flex items-center gap-3">
                <Link href="/dashboard" className="transition-transform active:scale-95">
                    <div className="bg-primary rounded-[10px] p-1.5 shadow-lg shadow-primary/20">
                        {branding.logoUrl ? (
                            <div className="relative h-4 w-4">
                                <Image
                                    src={branding.logoUrl}
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <Printer className="h-4 w-4 text-white" />
                        )}
                    </div>
                </Link>
                <h1 className="text-[17px] font-bold text-slate-900 tracking-tight">
                    {currentTitle}
                </h1>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => {
                        // This will be handled by the CommandMenu or Global Search
                        window.dispatchEvent(new CustomEvent("open-global-search"));
                    }}
                    className="p-2 text-slate-500 hover:text-slate-900 transition-colors active:scale-90"
                >
                    <Search className="h-5 w-5" strokeWidth={2.5} />
                </button>
                <NotificationCenter notifications={notifications} unreadCount={unreadCount} branding={branding} />
                <div className="w-1" />
                <UserNav user={user} branding={branding} />
            </div>
        </header>
    );
}
