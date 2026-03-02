"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function LayoutShell({ children, crmBackgroundUrl }: { children: ReactNode; crmBackgroundUrl?: string | null }) {
    const pathname = usePathname();
    const isFocusedPage = pathname.startsWith("/dashboard/warehouse/items/new");

    return (
        <div className={cn(
            "min-h-screen relative main-layout-container",
            isFocusedPage ? "pb-0" : "pb-24 md:pb-0"
        )}>
            {crmBackgroundUrl && <div className="crm-background" />}
            {children}
        </div>
    );
}
