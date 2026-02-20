"use client";

import { cn } from "@/lib/utils";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    animate?: boolean;
    spacing?: "none" | "sm" | "md" | "lg";
}

const spacingMap = {
    none: "",
    sm: "flex flex-col gap-2",
    md: "flex flex-col gap-4",
    lg: "flex flex-col gap-4",
};

export function PageContainer({
    children,
    className,
    animate = true,
    spacing = "md",
}: PageContainerProps) {
    return (
        <div
            className={cn(
                spacingMap[spacing],
                animate && "animate-in fade-in slide-in-from-bottom-4 duration-700",
                className
            )}
        >
            {children}
        </div>
    );
}
