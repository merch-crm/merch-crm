"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Package, ArrowUpRight, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/components/library/custom/utils/cn";

const DEFAULT_ORDERS = [
  { id: '1', customer: 'Арсений П.', items: 3, total: '$145.00', status: 'In Prep' },
  { id: '2', customer: 'Марина К.', items: 1, total: '$22.50', status: 'Pending' },
  { id: '3', customer: 'Виктор С.', items: 5, total: '$412.00', status: 'Ready' },
];

export function BentoOrderQueue({ orders: propOrders }: { orders?: typeof DEFAULT_ORDERS }) {
  const [isMounted, setIsMounted] = useState(false);
  const orders = propOrders || DEFAULT_ORDERS;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
     return <div className="w-full max-w-sm h-64 bg-white rounded-[32px] border border-gray-100 animate-pulse" />;
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-[32px] border border-gray-100 shadow-crm-md p-6 flex flex-col gap-3 group overflow-hidden relative">
      <div className="flex items-center justify-between px-1">
         <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
               <ShoppingCart className="size-4" />
            </div>
            <h4 className="text-xs font-black text-gray-900  leading-none">Очередь заказов</h4>
         </div>
         <button type="button" className="text-[11px] font-black text-primary-base hover:underline flex items-center gap-1 group/btn">
            Все заказы <ArrowUpRight className="size-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
         </button>
      </div>

      <div className="space-y-2 relative z-10">
         {(orders || []).map((order, i) => (
           <motion.div
             key={order.id}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="flex items-center justify-between p-3.5 rounded-[20px] bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-300 group/item"
           >
              <div className="flex items-center gap-3">
                 <div className="size-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover/item:text-primary-base transition-colors shadow-sm">
                    <Package className="size-4" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-900 ">{order.customer}</span>
                    <span className="text-[11px] font-black text-gray-400 ">{order.items} изд. • {order.total}</span>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <span className={cn(
                    "text-[11px] font-black px-2 py-0.5 rounded-full",
                    order.status === 'Ready' ? "bg-emerald-50 text-emerald-600" :
                    order.status === 'In Prep' ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"
                 )}>
                    {order.status}
                 </span>
                 <ChevronRight className="size-3 text-gray-200 group-hover/item:text-gray-400 transition-colors" />
              </div>
           </motion.div>
         ))}
      </div>

      <div className="flex items-center gap-2 px-1 text-[11px] font-black text-gray-400">
         <Clock className="size-3" />
         <span>Последнее обновление: только что</span>
      </div>


      <div className="absolute -right-20 -bottom-20 size-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
