import React from "react";
import { motion } from "framer-motion";
import { HardDrive, Cloud, FileText, Image as ImageIcon, Music, Database, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoCard, BentoGlow, BentoIconContainer } from "@/components/library/custom/ui/bento-primitives";

interface StorageItem {
  id: string;
  name: string;
  size: number;
  color: string;
  icon: LucideIcon;
}

interface BentoStorageDriveProps {
  className?: string;
}

const storageData: StorageItem[] = [
  { id: "1", name: "Документы", size: 450, color: "bg-blue-500", icon: FileText },
  { id: "2", name: "Медиа", size: 850, color: "bg-indigo-500", icon: ImageIcon },
  { id: "3", name: "Аудио", size: 120, color: "bg-amber-500", icon: Music },
  { id: "4", name: "Система", size: 60, color: "bg-slate-500", icon: Database },
];

export function BentoStorageDrive({ className }: BentoStorageDriveProps) {
  const totalStorage = 2048; // 2TB limit in GB
  const usedStorage = storageData.reduce((acc, item) => acc + item.size, 0);
  const percentage = (usedStorage / totalStorage) * 100;

  return (
    <BentoCard className={className}>
      <BentoGlow />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full mb-3">
              <Cloud size={14} className="text-primary-base" />
              <span className="text-[11px] font-black tracking-tight text-primary-base">Облачное хранилище</span>
            </div>
            <h3 className="text-3xl font-bold tabular-nums">{(usedStorage / 1024).toFixed(2)} ТБ</h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1 tracking-tighter tabular-nums">
              из {(totalStorage / 1024).toFixed(1)} ТБ использовано ({(100 - percentage).toFixed(0)}% свободно)
            </p>

          </div>
          <BentoIconContainer className="rotate-3 transition-transform group-hover:rotate-12 duration-500 bg-primary-base/10 text-primary-base border border-primary-base/20 size-12 rounded-element">
            <HardDrive size={24} />
          </BentoIconContainer>
        </div>

        {/* Asymmetrical stacked visualizer */}
        <div className="mt-auto">
          {/* Fragmented Ring / Bar */}
          <div className="h-4 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden flex gap-0.5 relative z-20 shadow-inner">
            {storageData.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ width: 0 }}
                animate={{ width: `${(item.size / totalStorage) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.1, type: "spring", bounce: 0 }}
                className={cn("h-full shadow-sm", item.color)}
                style={{ 
                  borderTopRightRadius: i === storageData.length - 1 ? '9999px' : 0,
                  borderBottomRightRadius: i === storageData.length - 1 ? '9999px' : 0,
                }}
              />
            ))}
          </div>

          {/* Floating legend breaking the grid align */}
          <div className="flex flex-wrap gap-x-3 gap-y-3 mt-6 pt-4 border-t border-slate-100">
            {storageData.map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <BentoIconContainer className={cn("size-8 rounded-xl flex items-center justify-center text-white shadow-sm border-none", item.color)}>
                    <ItemIcon size={14} />
                  </BentoIconContainer>
                  <div className="flex flex-col items-start">
                    <p className="text-[11px] font-black tracking-tight text-slate-900 leading-none">{item.name}</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 tracking-tighter tabular-nums leading-none">{item.size} ГБ</p>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
