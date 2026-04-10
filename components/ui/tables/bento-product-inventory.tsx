"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Box, Search, Filter, ArrowUpRight, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_ITEMS = [
  { id: '1', sku: 'HF-204', name: 'Hoodie French Terry', stock: 45, price: '$64.00', variant: 'XL / Black' },
  { id: '2', sku: 'TS-091', name: 'Classic T-Shirt', stock: 124, price: '$24.00', variant: 'L / White' },
  { id: '3', sku: 'CP-552', name: 'Premium Cap', stock: 8, price: '$18.00', variant: 'Adjustable' },
];

export function BentoProductInventory({ items: propItems }: { items?: typeof DEFAULT_ITEMS }) {
  const [isMounted, setIsMounted] = useState(false);
  const items = propItems || DEFAULT_ITEMS;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
     return <div className="w-full max-w-sm h-[380px] bg-white rounded-card border border-gray-100 shadow-sm animate-pulse" />;
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-card border border-gray-100 shadow-crm-md p-6 flex flex-col gap-3 group overflow-hidden relative h-[380px]">
      <div className="flex items-center justify-between px-1">
         <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary-base flex items-center justify-center text-white shadow-lg shadow-primary-base/20">
               <Box className="size-4" />
            </div>
            <h4 className="text-xs font-black text-gray-900  leading-none">Инвентарь</h4>
         </div>
         <div className="flex items-center gap-1">
            <button type="button" className="size-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
               <Search className="size-3.5" />
            </button>
            <button type="button" className="size-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
               <Filter className="size-3.5" />
            </button>
         </div>
      </div>

      <div className="flex-1 space-y-3 relative z-10 overflow-y-auto pr-1 scrollbar-hide">
         {(items || []).map((item, i) => (
           <motion.div
             key={item.id}
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.1 }}
             className="flex items-center justify-between p-4 rounded-element bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-300 group/item cursor-pointer"
           >
               <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-black text-primary-base tracking-tight">{item.sku}</span>
                     <span className="text-xs font-black text-gray-300">• {item.variant}</span>
                  </div>
                  <span className="text-xs font-black text-gray-950 ">{item.name}</span>
               </div>
              <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                     <span className={cn(
                        "text-xs font-black",
                        item.stock <= 10 ? "text-rose-500" : "text-gray-400"
                     )}>
                       {item.stock} шт.
                    </span>
                    <span className="text-xs font-black text-gray-900 ">{item.price}</span>
                 </div>
                 <button type="button" className="size-6 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-300 group-hover/item:text-gray-900 transition-colors">
                    <MoreVertical className="size-3.5" />
                 </button>
              </div>
           </motion.div>
         ))}
      </div>

       <button type="button" className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg active:scale-95 group/btn">
          Все товары <ArrowUpRight className="size-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
       </button>


      <div className="absolute -left-20 -bottom-20 size-64 bg-primary-base/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
