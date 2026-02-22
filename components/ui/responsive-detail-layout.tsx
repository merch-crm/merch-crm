import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveDetailLayoutProps {
    leftSidebar?: React.ReactNode;
    mainContent?: React.ReactNode;
    rightSidebar?: React.ReactNode;
    isArchived?: boolean;
    hideLeftSidebarOnMobile?: boolean;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

export function ResponsiveDetailLayout({
    leftSidebar,
    mainContent,
    rightSidebar,
    isArchived,
    hideLeftSidebarOnMobile = false,
    header,
    footer,
}: ResponsiveDetailLayoutProps) {
    return (
        <div className="flex flex-col font-sans relative">
            <div className="flex-1 w-full mx-auto space-y-0 text-foreground">
                {header}

                <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-2 xl:flex xl:flex-row xl:items-start md:gap-3 xl:gap-3">

                    {/* LEFT SIDEBAR (Image, Mobile Info, Actions) */}
                    {leftSidebar && (
                        <div className={cn(
                            "flex flex-col gap-3 w-full xl:sticky xl:top-[112px] xl:z-[10] xl:w-[320px] xl:shrink-0",
                            isArchived && "grayscale opacity-70",
                            hideLeftSidebarOnMobile ? "hidden md:flex" : "flex"
                        )}>
                            {leftSidebar}
                        </div>
                    )}

                    {/* MAIN BENTO GRID */}
                    <div className={cn(
                        "md:contents xl:flex-1 xl:w-full xl:grid xl:grid-cols-12 xl:gap-3",
                        isArchived && "grayscale opacity-70"
                    )}>
                        {/* MAIN CONTENT (Specs, Finance, etc) */}
                        {mainContent && (
                            <div className="md:contents xl:contents">
                                {mainContent}
                            </div>
                        )}

                        {/* RIGHT SIDEBAR (Alerts, Widgets) */}
                        {rightSidebar && (
                            <div className="md:contents xl:contents">
                                {rightSidebar}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {footer}
        </div>
    );
}
