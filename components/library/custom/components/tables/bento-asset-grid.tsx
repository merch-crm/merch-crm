"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileIcon, ImageIcon, VideoIcon, MoreVertical } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';
import { BentoCard, BentoIconContainer } from "@/components/library/custom/ui/bento-primitives";

const assets = [
  { name: 'Logo_Final.png', size: '2.4MB', icon: ImageIcon, color: 'text-emerald-500' },
  { name: 'Campaign_V2.mp4', size: '42.1MB', icon: VideoIcon, color: 'text-primary-base' },
  { name: 'Strategy.pdf', size: '1.2MB', icon: FileIcon, color: 'text-amber-500' },
];

export function BentoAssetGrid({ className }: { className?: string }) {
  return (
    <BentoCard className={cn("max-w-sm p-8 flex flex-col gap-3 group overflow-hidden", className)}>
      <div className="flex justify-between items-center px-1">
         <h3 className="text-sm font-black text-gray-900  leading-none">Cloud Assets</h3>
         <span className="text-[11px] font-black text-gray-400  ">3 Items</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
         {assets.map((asset, i) => (
            <motion.div 
               key={asset.name}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between group/asset hover:bg-white hover:shadow-sm transition-all cursor-pointer"
            >
               <div className="flex items-center gap-3">
                  <BentoIconContainer className={cn("size-10 bg-white border border-gray-100 shadow-sm", asset.color)}>
                     <asset.icon className="size-5" />
                  </BentoIconContainer>
                  <div className="flex flex-col">
                     <span className="text-xs font-bold text-gray-950 truncate max-w-[120px]">{asset.name}</span>
                     <span className="text-[11px] font-black text-gray-400 ">{asset.size}</span>
                  </div>
               </div>
               <button type="button" aria-label={`Options for ${asset.name}`} className="size-8 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <MoreVertical className="size-4" />
               </button>
            </motion.div>
         ))}
      </div>

      <div className="mt-2 w-full h-1 bg-gray-50 rounded-full overflow-hidden">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: '65%' }}
           className="h-full bg-primary-base" 
         />
      </div>
      <div className="flex justify-between text-[11px] font-black text-gray-400   -mt-1">
         <span>6.5GB Used</span>
         <span>10GB Limit</span>
      </div>

    </BentoCard>
  );
}
