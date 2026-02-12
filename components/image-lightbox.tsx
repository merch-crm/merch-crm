"use client";

import { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Maximize2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";


interface ImageLightboxProps {
    src: string;
    alt?: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
    const [scale, setScale] = useState(1);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
            if (!isOpen) {
                setScale(1);
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-md"
                role="dialog"
                aria-modal="true"
                data-dialog-open="true"
                onClick={onClose}
            >
                {/* Controls */}
                <div className="absolute top-6 right-6 flex items-center gap-3 z-[1001]">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            setScale(s => Math.min(s + 0.5, 4));
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/10 h-11 w-11"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            setScale(s => Math.max(s - 0.5, 0.5));
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/10 h-11 w-11"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            const win = window.open(src, "_blank");
                            if (!win) {
                                toast("Браузер заблокировал всплывающее окно. Разрешите всплывающие окна для просмотра изображения.", "error");
                            }
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/10 h-11 w-11"
                    >
                        <Download className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="bg-white/20 hover:bg-rose-500 text-white rounded-full border border-white/20 h-11 w-11"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Info */}
                <div className="absolute top-6 left-6 z-[1001]">
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-[18px] backdrop-blur-sm">
                        <Maximize2 className="w-4 h-4 text-indigo-400" />
                        <span className="text-white text-xs font-bold  tracking-normal">{alt || "Просмотр макета"}</span>
                    </div>
                </div>

                {/* Main Image */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-full h-full flex items-center justify-center p-12 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.img
                        src={src}
                        alt={alt}
                        style={{ scale }}
                        drag
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        dragElastic={0.1}
                        className="max-w-full max-h-full object-contain shadow-2xl rounded-[18px] cursor-grab active:cursor-grabbing"
                    />
                </motion.div>

                {/* Footer Tip */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-bold  tracking-[0.2em]">
                    Используйте зум или перетаскивание для детального осмотра
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
