"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function ClientSideMain({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isFocusedPage = pathname.startsWith("/dashboard/warehouse/items/new");

    return (
        <main className={cn(
            "flex-1 px-container pt-2 md:pt-3 max-w-[1480px] mx-auto w-full",
            isFocusedPage ? "pb-0" : "pb-4"
        )}>
            {children}
        </main>
    );
}
