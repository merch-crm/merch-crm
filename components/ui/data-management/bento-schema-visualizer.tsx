"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Link2, Database, Table, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BentoSchemaVisualizer() {
  const nodes = [
    { name: 'Пользователи', fields: ['id', 'email', 'pwd'], x: 20, y: 30, color: 'text-indigo-500' },
    { name: 'Сделки', fields: ['id', 'uid', 'amt'], x: 140, y: 80, color: 'text-emerald-500' },
    { name: 'Лиды', fields: ['id', 'nm', 'st'], x: 50, y: 130, color: 'text-amber-500' }
  ];

  return (
    <div className="w-full max-w-sm h-[300px] rounded-card bg-slate-900 p-6 flex flex-col gap-3 overflow-hidden relative group">
      <div className="flex items-center gap-2 mb-2">
         <Database className="size-4 text-indigo-400" />
         <h3 className="text-white text-xs font-black tracking-wide">Основная схема БД</h3>
      </div>
      
      <div className="relative flex-1 bg-white/5 rounded-element border border-white/10 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />
        
        {/* Connection Lines (Static SVG overlay) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
           <motion.path 
             d="M 60 50 L 150 90" 
             stroke="rgba(255,255,255,0.1)" 
             strokeWidth="1.5" 
             fill="none" 
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
           />
           <motion.path 
             d="M 70 140 L 150 110" 
             stroke="rgba(255,255,255,0.1)" 
             strokeWidth="1.5" 
             strokeDasharray="4 4"
             fill="none" 
           />
        </svg>

        {nodes.map((node, i) => (
          <motion.div
            key={i}
            drag
            dragConstraints={{ top: 0, left: 0, right: 180, bottom: 100 }}
            initial={{ x: node.x, y: node.y }}
            whileHover={{ scale: 1.05, zIndex: 50 }}
            className="absolute p-2 bg-slate-800 rounded-xl border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing"
          >
             <div className="flex items-center gap-2 mb-1.5 border-b border-white/5 pb-1 pr-4">
                <Table className={cn("size-3", node.color)} />
                <span className="text-[11px] font-black text-white leading-none">{node.name}</span>
             </div>
             <div className="flex flex-col gap-0.5">
                {node.fields.map((f, j) => (
                  <div key={j} className="flex items-center gap-1.5">
                     <span className="size-1 rounded-full bg-white/20" />
                     <span className="text-[11px] font-mono text-white/40">{f}</span>
                     {j === 0 && <Key className="size-2 text-amber-400 opacity-60" />}
                  </div>
                ))}
             </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute right-4 bottom-4 flex gap-2">
         <button type="button" aria-label="Связать схему" className="size-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <Link2 className="size-4" />
         </button>
         <button type="button" aria-label="Создать ветку схемы" className="size-8 rounded-lg bg-primary-base flex items-center justify-center text-white shadow-lg">
            <GitBranch className="size-4" />
         </button>
      </div>

    </div>
  );
}
