"use client";

import { Search, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function FloatingSearch() {
    const [isHovered, setIsHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Проверяем наличие открытых диалогов/модалок
        const checkModals = () => {
            const hasDialog = document.querySelector('[role="dialog"]') ||
                document.querySelector('[data-radix-portal]') ||
                document.body.classList.contains('overflow-hidden') ||
                document.body.style.overflow === 'hidden';
            setIsModalOpen(!!hasDialog);
        };

        // Начальная проверка
        checkModals();

        // Следим за изменениями в DOM
        const observer = new MutationObserver(checkModals);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    const handleOpen = () => {
        window.dispatchEvent(new CustomEvent("open-command-menu"));
    };

    if (isModalOpen) return null;

    return (
        <motion.button
            layout
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed bottom-8 right-8 z-[110] h-14 bg-white/80 backdrop-blur-xl border border-primary/20 rounded-full shadow-2xl shadow-primary/10 hover:shadow-primary/20 hover:border-primary/40 transition-shadow group flex items-center overflow-hidden"
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
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden flex items-center"
                    >
                        <div className="pr-5 pl-1 flex items-center whitespace-nowrap">
                            <span className="text-sm font-medium text-slate-600 mr-3">Поиск</span>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-[8px] bg-slate-100/80 border border-slate-200 text-[10px] font-bold text-slate-500">
                                <Command className="w-3 h-3" />
                                <span>K</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
