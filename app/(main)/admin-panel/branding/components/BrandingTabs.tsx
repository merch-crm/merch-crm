import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Monitor, Volume2, Share2 } from "lucide-react";
import { BrandingUiState } from "../hooks/useBrandingForm";

interface BrandingTabsProps {
    ui: BrandingUiState;
}

export function BrandingTabs({ ui }: BrandingTabsProps) {
    return (
        <TabsList className="flex w-full h-[58px] items-center gap-2 !p-[6px] !rounded-2xl crm-card bg-white/50 border border-slate-200/60 transition-all overflow-x-auto no-scrollbar">
            {[
                { id: "main", label: "Основные характеристики", icon: Building2 },
                { id: "ui", label: "Внешний вид", icon: Monitor },
                { id: "sounds", label: "Звуки", icon: Volume2 },
                { id: "comms", label: "Внешний вид & Связь", icon: Share2 }
            ].map((tab) => {
                const isActive = ui.activeTab === tab.id;
                return (
                    <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                            "flex-1 h-full relative flex items-center justify-center gap-2.5 px-6 !rounded-[16px] text-sm font-bold transition-all border-none data-[state=active]:bg-transparent data-[state=active]:!text-white data-[state=active]:shadow-none text-slate-500 hover:text-slate-900"
                        )}
                    >
                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    layoutId="activeBrandingTab"
                                    className="absolute inset-0 bg-primary !rounded-[16px] shadow-lg shadow-primary/25 z-0"
                                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                />
                            )}
                        </AnimatePresence>
                        <div className="relative z-10 flex items-center gap-2.5">
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </div>
                    </TabsTrigger>
                );
            })}
        </TabsList>
    );
}
