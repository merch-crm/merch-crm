"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const DEFAULT_DATA = [
  { id: '1', name: 'Premium Hoodie', status: 'In Stock', price: '$45.00' },
  { id: '2', name: 'Cotton T-Shirt', status: 'Low Stock', price: '$22.00' },
  { id: '3', name: 'Design Mug', status: 'Out of Stock', price: '$12.00' },
];

export function BentoCompactTable({ data: propData }: { data?: typeof DEFAULT_DATA }) {
  const [isMounted, setIsMounted] = useState(false);
  const data = propData || DEFAULT_DATA;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full max-w-sm h-48 bg-white rounded-card border border-gray-100 animate-pulse" />;
  }

  return (
    <div className="w-full max-w-sm rounded-card bg-white border border-gray-100 shadow-crm-md p-6 flex flex-col gap-3 group hover:border-primary-base transition-colors overflow-hidden">
      <div className="flex justify-between items-center px-2">
         <h3 className="text-xs font-black text-gray-400">Inventory Alpha</h3>
         <button type="button" className="text-xs font-black text-primary-base hover:underline">View All</button>
      </div>

      <div className="flex flex-col">
         <div className="grid grid-cols-3 px-4 py-2 border-b border-gray-50 text-xs font-black text-gray-400">
            <span>Item</span>
            <span className="text-center">Status</span>
            <span className="text-right">Price</span>
         </div>
         <div className="flex flex-col mt-1">
            {(data || []).map((row, i) => (
               <motion.div 
                  key={row.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="grid grid-cols-3 px-4 py-3 items-center hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group/row"
               >
                  <span className="text-xs font-bold text-gray-950 truncate">{row.name}</span>
                  <div className="flex justify-center">
                     <span className={cn(
                        "text-xs font-black px-2 py-0.5 rounded-full",

                        row.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600' : 
                        row.status === 'Low Stock' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                     )}>
                        {row.status}
                     </span>
                  </div>
                  <span className="text-xs font-black text-gray-900 text-right tabular-nums">{row.price}</span>
               </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
}
