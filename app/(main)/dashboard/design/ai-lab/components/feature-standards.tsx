"use client";

import { motion } from "framer-motion";
import { Eraser, Maximize, FileCode, Type } from "lucide-react";

const STANDARDS = [
    { icon: Eraser, label: "Removal", text: "Прозрачность для печати." },
    { icon: Maximize, label: "Upscale", text: "Рост качества до 300 DPI." },
    { icon: FileCode, label: "Vector", text: "Трассировка лого в кривые." },
    { icon: Type, label: "Typography", text: "AI генерация надписей." }
];

export function FeatureStandards() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            {STANDARDS.map((item, i) => (
                <motion.div 
                    key={i}
                    whileHover={{ y: -6 }}
                    className="crm-card p-6 flex flex-col gap-3 border-transparent hover:border-primary/20 transition-all cursor-default shadow-sm hover:shadow-2xl hover:shadow-slate-200 group/info"
                >
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/40 transition-all group-hover/info:bg-primary/10 group-hover/info:text-primary group-hover/info:scale-110">
                        <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-xs mb-1 text-slate-900 ">{item.label}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-bold  opacity-70">
                            {item.text}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
