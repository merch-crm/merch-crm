"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from "next/image";
import { PhoneOff, MicOff } from 'lucide-react';

export function BentoCallCard({ 
  name = "Alexander D.", 
  role = "Client",
  duration = "14:26" 
}: { 
  name?: string; 
  role?: string;
  duration?: string;
}) {
  return (
    <div className="w-full max-w-[280px] rounded-[32px] bg-gray-950 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
      {/* Background ripples */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} 
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 m-auto size-48 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none"
      />
      
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="size-20 rounded-full border-2 border-white/10 p-1">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 relative">
             <Image 
               src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}`} 
               alt={name} 
               fill 
               className="object-cover" 
             />
          </div>
        </div>
        
        <div className="text-center flex flex-col gap-1">
          <h3 className="text-white text-lg font-black">{name}</h3>
          <p className="text-gray-400 text-xs font-bold  ">{role}</p>
        </div>
        
        <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
           <span className="text-emerald-400 font-mono text-sm font-medium">{duration}</span>
        </div>
        
        <div className="flex items-center gap-3 mt-4">
          <button type="button" className="size-12 rounded-[18px] bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-md">
            <MicOff className="size-5" />
          </button>
          <button type="button" className="size-12 rounded-[18px] bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors shadow-lg shadow-red-500/20">
            <PhoneOff className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
