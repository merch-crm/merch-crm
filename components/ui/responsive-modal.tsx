"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
                        <DialogHeader className={cn(!showVisualTitle && "sr-only")}>
                            <DialogTitle>{title || "Modal"}</DialogTitle>
                        </DialogHeader>
                    )}
                    {!title && !description && (
                        <DialogTitle className="sr-only">Modal</DialogTitle>
                    )}
                    {children}
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
