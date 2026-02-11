"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ResponsiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    showVisualTitle?: boolean;
    description?: string;
    className?: string;
    desktopBreakpoint?: number;
    hideClose?: boolean;
    footer?: React.ReactNode;
}

export function ResponsiveModal({
    isOpen,
    onClose,
    children,
    title,
    showVisualTitle = true,
    description,
    className,
    desktopBreakpoint = 768,
    hideClose,
    footer
}: ResponsiveModalProps) {
    const isDesktop = useMediaQuery(`(min-width: ${desktopBreakpoint}px)`);
    const shouldHideClose = hideClose !== undefined ? hideClose : !showVisualTitle;

    // Ждём определения устройства — не рендерим ничего до монтирования
    if (isDesktop === null) {
        return null;
    }

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className={cn("p-0 overflow-hidden flex flex-col", className)} hideClose={shouldHideClose}>
                    {(title || description) && (
                        <DialogHeader className={cn("px-6 py-4 border-b border-border shrink-0", !showVisualTitle && "sr-only")}>
                            <DialogTitle className="text-xl font-bold">{title || "Modal"}</DialogTitle>
                            {description && (
                                <DialogDescription className="text-[11px] font-medium text-muted-foreground mt-0.5">
                                    {description}
                                </DialogDescription>
                            )}
                        </DialogHeader>
                    )}
                    {!title && !description && (
                        <DialogTitle className="sr-only">Modal</DialogTitle>
                    )}
                    <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                        {children}
                    </div>
                    {footer && (
                        <DialogFooter className="px-6 py-4 border-t border-border bg-card/50 shrink-0">
                            {footer}
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            showVisualTitle={showVisualTitle}
            className={className}
            footer={footer}
            hideClose={shouldHideClose}
        >
            {children}
        </BottomSheet>
    );
}
