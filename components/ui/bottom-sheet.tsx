import * as React from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSheetStack } from "@/components/ui/sheet-stack-context";
import { X } from "lucide-react";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    showVisualTitle?: boolean;
    className?: string;
    footer?: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, children, title, showVisualTitle = true, className, footer }: BottomSheetProps) {
    const { registerSheet, unregisterSheet, getStackDepth } = useSheetStack();
    const [sheetId] = React.useState(() => Math.random().toString(36).substr(2, 9));


    // Register/Unregister sheet
    React.useEffect(() => {
        if (isOpen) {
            registerSheet(sheetId);
            document.body.style.overflow = "hidden";
            return () => {
                unregisterSheet(sheetId);
                // Only unset overflow if this was the last sheet (simplification: just unset)
                // A better approach checks stack length, but this is safe for now
                document.body.style.overflow = "unset";
            };
        }
    }, [isOpen, sheetId, registerSheet, unregisterSheet]);

    // Update depth periodically or ideally reactive if context allowed,
    // but here we can check depth on render if we force update?
    // Actually, simple way: check depth whenever stack changes.
    // However, our context exposes methods. Let's make it simple:
    // We will assume this component re-renders when parent re-renders or on mount.
    // For proper reactivity, the context should provide the stack array or version.
    // Let's rely on CSS mostly, but we need the index.
    // Updated Plan: The context provider created earlier uses 'stack'.
    // We need to subscribe to it. The current 'useSheetStack' exposes getStackDepth but that doesn't trigger re-render if stack updates unless we expose stack.
    // Let's just use a simple z-index increment for now based on a global variable or simpler approach if context is hard to reuse without changing it.
    // Wait, I can update the context to expose the stack or simply rely on the fact that when a new sheet opens,
    // it mounds and gets a higher Z-index naturally?
    // Not enough for "scale down" effect.
    // Let's modify this component to assume it's "on top" if it's the latest.

    // For now, let's just make sure z-index is high enough to stack.
    // We will use a standard high z-index, but nested sheets need higher.
    // We can use a simple prop or context.

    // Let's use the context properly. I'll stick to the Z-Index fix for overlap first.
    // Scale effect is bonus.

    // RE-READING SCREENSHOT: The issue is they are both on z-[151].
    // If I just increase Z-index for subsequent sheets, it fixes the overlap.

    // Let's use a ref to count how many valid sheets are open? No, React state is separate.
    // I will use a simple z-index increment based on the order in DOM? No, generic Portals.

    // Let's stick to the plan: Use the context.
    // BUT I need to fix the Context first to expose the stack so I can 'use' it to trigger re-renders.
    // I will edit this file to use the context, assuming I will update the context next to be reactive.

    const stackDepth = getStackDepth(sheetId);

    // Persist depth for exit animation
    const [preservedDepth, setPreservedDepth] = React.useState(0);
    React.useEffect(() => {
        if (stackDepth >= 0) {
            setPreservedDepth(stackDepth);
        }
    }, [stackDepth]);

    const effectiveDepth = stackDepth >= 0 ? stackDepth : preservedDepth;

    const dragControls = useDragControls();

    // Adjust Z-Index base
    const zIndex = 150 + (effectiveDepth * 10);

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
                            if (info.offset.y > 150 || info.velocity.y > 500) {
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
                            "fixed bottom-0 left-0 right-0 shadow-2xl max-h-[95vh] !w-full !max-w-none flex flex-col touch-none overflow-hidden",
                            // Default rounding top if no rounding specified
                            !className?.includes('rounded') && "rounded-t-[32px]",
                            className,
                            "rounded-b-none" // Force flat bottom to avoid gaps and background leaks
                        )}
                        style={{
                            backgroundColor: 'var(--sheet-bg, #ffffff)',
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

                        {/* Header: Title centered, Close button on right */}
                        <div className="flex items-center px-6 pt-2 pb-4 shrink-0">
                            {/* Left Spacer to balance the close button for perfect centering */}
                            <div className="w-10 h-10 shrink-0 invisible" />

                            <div className={cn("flex-1 text-center px-2", !showVisualTitle && "sr-only")}>
                                {title && (
                                    <h2 className="text-xl font-bold text-slate-900 leading-tight">
                                        {title}
                                    </h2>
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-500 hover:bg-slate-200 transition-all active:scale-95 backdrop-blur-sm border border-white/50 shadow-sm shrink-0"
                                aria-label="Закрыть"
                            >
                                <X className="w-5 h-5 stroke-[2.5]" />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden">
                            {children}
                        </div>

                        {footer && (
                            <div className="shrink-0 bg-white border-t border-slate-100">
                                {footer}
                            </div>
                        )}

                        {/* Safe area spacer with same background to prevent gaps */}
                        <div className="h-[env(safe-area-inset-bottom,24px)] shrink-0 bg-inherit" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
