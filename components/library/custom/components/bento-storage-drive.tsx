"use client";

import React from "react";
import { motion } from "framer-motion";
import { HardDrive, Cloud, FileText, Image as ImageIcon, Music, Database, type LucideIcon } from "lucide-react";
import { cn } from "../utils/cn";

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
  { id: "1", name: "Documents", size: 450, color: "bg-blue-500", icon: FileText },
  { id: "2", name: "Media", size: 850, color: "bg-indigo-500", icon: ImageIcon },

  { id: "3", name: "Audio", size: 120, color: "bg-amber-500", icon: Music },
  { id: "4", name: "System", size: 60, color: "bg-slate-500", icon: Database },
];

export function BentoStorageDrive({ className }: BentoStorageDriveProps) {
  const totalStorage = 2048; // 2TB limit in GB
  const usedStorage = storageData.reduce((acc, item) => acc + item.size, 0);
  const percentage = (usedStorage / totalStorage) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
      className={cn(
        "relative overflow-hidden p-6 text-card-foreground bg-card shadow-crm-lg border border-border group",
        "rounded-[27px]", // Matching extreme radius from variables.css
        className
      )}
    >
      {/* Background abstract element crossing boundaries */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.05 }}
        transition={{ delay: 0.2, duration: 1 }}
        className="absolute -right-20 -top-20 w-64 h-64 bg-primary rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-full mb-3">
              <Cloud size={14} className="text-primary" />
              <span className="text-[11px] font-black uppercase tracking-tight text-primary">Cloud Storage</span>
            </div>
            <h3 className="text-3xl font-bold ">{(usedStorage / 1024).toFixed(2)} TB</h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
              of {(totalStorage / 1024).toFixed(1)} TB used ({(100 - percentage).toFixed(0)}% free)
            </p>

          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary rotate-3 transition-transform group-hover:rotate-12 duration-500">
            <HardDrive size={24} />
          </div>
        </div>

        {/* Asymmetrical stacked visualizer */}
        <div className="mt-auto">
          {/* Fragmented Ring / Bar */}
          <div className="h-4 w-full bg-secondary rounded-full overflow-hidden flex gap-0.5 relative z-20">
            {storageData.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ width: 0 }}
                animate={{ width: `${(item.size / totalStorage) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.1, type: "spring", bounce: 0 }}
                className={cn("h-full", item.color)}
                style={{ 
                  borderTopRightRadius: i === storageData.length - 1 ? '9999px' : 0,
                  borderBottomRightRadius: i === storageData.length - 1 ? '9999px' : 0,
                }}
              />
            ))}
          </div>

          {/* Floating legend breaking the grid align */}
          <div className="flex flex-wrap gap-x-3 gap-y-3 mt-6 pt-4 border-t border-border/50">
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
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm", item.color)}>
                    <ItemIcon size={14} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 leading-none">{item.name}</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 tracking-tighter uppercase">{item.size} GB</p>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
