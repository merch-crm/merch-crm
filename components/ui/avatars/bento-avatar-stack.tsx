"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function BentoAvatarStack() {
  const [isExpanded, setIsExpanded] = useState(false);
  const avatars = [
    { name: 'Leonid', color: 'bg-primary-base' },
    { name: 'Alex', color: 'bg-indigo-500' },
    { name: 'Sarah', color: 'bg-emerald-500' },
    { name: 'Mike', color: 'bg-amber-500' },
    { name: 'Elena', color: 'bg-rose-500' }
  ];

  return (
    <div className="w-full max-w-sm rounded-card bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col items-center gap-3 group">
      <h3 className="text-sm font-black text-gray-900  ">Active Team</h3>
      
      <div 
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="flex items-center justify-center h-20 relative cursor-pointer"
      >
        {avatars.map((avatar, i) => (
          <motion.div
            key={i}
            animate={{ 
              x: isExpanded ? (i - (avatars.length - 1) / 2) * 45 : i * -12,
              scale: isExpanded ? 1.1 : 1,
              zIndex: isExpanded ? 10 : avatars.length - i
            }}
            className={cn(
              "absolute size-12 rounded-element border-4 border-white shadow-xl flex items-center justify-center text-white text-xs font-black",
              avatar.color
            )}
          >
            {avatar.name[0]}
          </motion.div>
        ))}
      </div>

      <p className="text-[11px] font-bold text-gray-400 mt-2 transition-opacity group-hover:opacity-0">
         +12 others working now
      </p>
    </div>
  );
}
