import * as React from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSheetStack } from "@/components/ui/sheet-stack-context";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    showVisualTitle?: boolean;
    className?: string;
    footer?: React.ReactNode;
    hideClose?: boolean;
}

const DRAG_CLOSE_THRESHOLD = {
    offset: 150,
    velocity: 500,
} as const;

const Z_INDEX_BASE = 150;
const Z_INDEX_INCREMENT = 10;

export function BottomSheet({ isOpen, onClose, children, title, showVisualTitle = true, className, footer, hideClose }: BottomSheetProps) {
    const { registerSheet, unregisterSheet, getStackDepth } = useSheetStack();
    const [sheetId] = React.useState(() => Math.random().toString(36).slice(2, 11));

    // Register/Unregister sheet & handle overflow
    React.useEffect(() => {
        if (isOpen) {
            registerSheet(sheetId);
            const previousOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";

            return () => {
                unregisterSheet(sheetId);
                // Simple restoration strategy. Ideally should check if other sheets are open via context.
                document.body.style.overflow = previousOverflow;
            };
        }
    }, [isOpen, sheetId, registerSheet, unregisterSheet]);

    // Handle Escape key
    React.useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Stack depth logic for z-index
    const stackDepth = getStackDepth(sheetId);

    // Persist depth for exit animation using ref to avoid unnecessary re-renders
    const preservedDepthRef = React.useRef(0);
    React.useEffect(() => {
        if (stackDepth >= 0) {
            preservedDepthRef.current = stackDepth;
        }
    }, [stackDepth]);

    const effectiveDepth = stackDepth >= 0 ? stackDepth : preservedDepthRef.current;

    const dragControls = useDragControls();
    const zIndex = Z_INDEX_BASE + (effectiveDepth * Z_INDEX_INCREMENT);

    const hasCustomRounding = className && /rounded-(?!b-)/.test(className);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        style={{ zIndex: zIndex }}
                    />

                    {/* Sheet */}
                    <motion.div
                        drag="y"
                        dragControls={dragControls}
                        dragListener={false}
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > DRAG_CLOSE_THRESHOLD.offset || info.velocity.y > DRAG_CLOSE_THRESHOLD.velocity) {
                                onClose();
                            }
                        }}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 300,
                            mass: 0.8
                        }}
                        className={cn(
                            "fixed bottom-0 left-0 right-0 shadow-2xl max-h-[95vh] !w-full !max-w-none flex flex-col touch-none overflow-hidden bg-white",
                            !hasCustomRounding && "rounded-t-[32px]",
                            className,
                            "rounded-b-none" // Force flat bottom to avoid gaps
                        )}
                        style={{
                            zIndex: zIndex + 1,
                        }}
                    >
                        {/* Drag Handle Section */}
                        <div
                            onPointerDown={(e) => dragControls.start(e)}
                            className="flex justify-center p-4 cursor-grab active:cursor-grabbing shrink-0"
                        >
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                        </div>

                        {/* Header: Title and Close button */}
                        {(!hideClose || (title && showVisualTitle)) && (
                            <div className="flex items-center justify-between px-6 pt-2 pb-4 shrink-0 relative">
                                {/* Left Spacer to balance the close button */}
                                <div className={cn("w-10 h-10 shrink-0", "invisible")} />

                                <div className={cn("flex-1 text-center px-2", (!title || !showVisualTitle) && "sr-only")}>
                                    {title && (
                                        <h2 className="text-xl font-bold text-slate-900 leading-tight">
                                            {title}
                                        </h2>
                                    )}
                                </div>

                                {!hideClose ? (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onClose}
                                        className="w-10 h-10 rounded-full bg-slate-100/80 text-slate-500 hover:bg-slate-200 transition-all active:scale-95 backdrop-blur-sm border border-white/50 shadow-sm shrink-0 hover:text-slate-900"
                                        aria-label="Закрыть"
                                    >
                                        <X className="w-5 h-5 stroke-[2.5]" />
                                    </Button>
                                ) : (
                                    <div className="w-10 h-10 shrink-0 invisible" />
                                )}
                            </div>
                        )}

                        <div className="flex-1 flex flex-col overflow-hidden">
                            {children}
                        </div>

                        {footer && (
                            <div className="shrink-0 bg-white border-t border-slate-100">
                                {footer}
                            </div>
                        )}

                        {/* Safe area spacer */}
                        <div className="h-[env(safe-area-inset-bottom,24px)] shrink-0 bg-inherit" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
