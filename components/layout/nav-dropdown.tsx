"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface NavDropdownProps {
    name: string;
    href: string;
    isActive: boolean;
    children: { name: string; href: string }[];
}

export function NavDropdown({ name, href, isActive, children }: NavDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const pathname = usePathname();
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    return (
        <div
            className="relative h-full flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex items-center gap-1 group">
                <Link
                    href={href}
                    className={cn(
                        "flex items-center gap-1 transition-all whitespace-nowrap outline-none py-2 px-1 rounded-lg",
                        isActive
                            ? "text-primary bg-primary/5 font-bold"
                            : "text-slate-400 hover:text-slate-900 font-semibold"
                    )}
                >
                    {name}
                </Link>
                <div className={cn(
                    "p-1 rounded-md transition-all duration-200 cursor-pointer",
                    isOpen ? "bg-slate-100 text-primary rotate-180" : "text-slate-300 hover:text-slate-600"
                )}>
                    <ChevronDown className="h-3.5 w-3.5" />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute top-full left-0 mt-1 min-w-[200px] bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[var(--radius-outer)] shadow-crm-xl z-50 p-1.5 overflow-hidden"
                    >
                        <div className="flex flex-col gap-1">
                            {children.map((child) => {
                                const isChildActive = pathname === child.href;
                                return (
                                    <Link
                                        key={child.href}
                                        href={child.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center px-3 py-2.5 text-sm rounded-[var(--radius-inner)] transition-all",
                                            isChildActive
                                                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                                                : "text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        {child.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
