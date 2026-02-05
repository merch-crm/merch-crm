"use client";

import { Search, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function FloatingSearch() {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const checkModals = () => {
            const hasDialog =
                document.querySelector('[role="dialog"]') ||
                document.querySelector('[data-radix-portal]') ||
                document.querySelector('[data-state="open"]') ||
                document.querySelector('[data-dialog-open="true"]') ||
                document.body.hasAttribute('data-scroll-locked') ||
                document.body.classList.contains('overflow-hidden') ||
                document.body.style.overflow === 'hidden';
            setIsModalOpen(!!hasDialog);
        };

        const handleScroll = () => {
            setIsHovered(false);
        };

        checkModals();
        window.addEventListener("scroll", handleScroll, { passive: true });

        const observer = new MutationObserver(checkModals);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'data-scroll-locked']
        });

        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleOpen = () => {
        setIsHovered(false);
        window.dispatchEvent(new CustomEvent("open-command-menu"));
    };

    if (isModalOpen || pathname === "/dashboard/warehouse/items/new") return null;

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="hidden md:flex fixed bottom-8 right-8 z-[40] h-14 bg-white/95 backdrop-blur-xl border border-primary/20 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:shadow-primary/20 hover:border-primary/40 transition-all duration-300 group items-center overflow-hidden"
        >
            <div className="w-14 h-14 flex items-center justify-center shrink-0">
                <Search className="w-6 h-6 text-primary" />
            </div>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden flex items-center"
                    >
                        <div className="pr-6 pl-1 flex items-center whitespace-nowrap">
                            <span className="text-sm font-bold text-slate-700 mr-4">Поиск</span>
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-400">
                                <Command className="w-3.5 h-3.5" />
                                <span>K</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
