"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BentoCard, BentoIconContainer } from '@/components/ui/bento-primitives';
import { Tooltip } from '@/components/ui/tooltip';

interface BulletProgressProps {
  label: string;
  value: string;
  percentage: string;
  target?: string;
  colorClass?: string;
  delay?: number;
}

function BulletProgress({ label, value, percentage, target, colorClass = "bg-primary-base", delay = 0 }: BulletProgressProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[11px] font-black">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-900">{value}</span>
      </div>
      <div className="h-4 bg-gray-50 rounded-full relative overflow-hidden border border-gray-100 p-0.5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: percentage }}
          transition={{ duration: 1.5, type: "spring", delay }}
          className={cn("h-full rounded-full", colorClass)} 
        />
        {target && <div className={cn("absolute top-0 h-full w-[2px] bg-rose-300 z-10")} style={{ right: target }} />}
      </div>
    </div>
  );
}

export function BentoFinancialBullet() {
  return (
    <BentoCard className="w-full max-w-sm p-8 flex flex-col gap-3 group overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <BentoIconContainer>
            <Wallet className="size-5" />
          </BentoIconContainer>
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-gray-900 tracking-normal leading-none">Бюджет Отдела</h3>
            <p className="text-[11px] font-black text-gray-400 mt-1">Финансовый Год 2025</p>
          </div>
        </div>
        <Tooltip content="Детальная информация о бюджете подразделения">
          <button type="button" className="focus:outline-none">
            <Info className="size-4 text-slate-300 hover:text-slate-900 transition-colors cursor-pointer outline-none" />
          </button>
        </Tooltip>
      </div>

      <div className="space-y-3 pt-2">
        <BulletProgress label="Операции" value="142 500 ₽ / 200 000 ₽" percentage="71.25%" target="25%" colorClass="bg-slate-700 shadow-sm" />
        <BulletProgress label="Маркетинг" value="85 000 ₽ / 120 000 ₽" percentage="70.83%" target="30%" colorClass="bg-primary-base" delay={0.2} />
      </div>

      <div className="mt-2 text-[11px] font-black text-gray-400 flex items-center justify-center gap-2">
        <div className="size-1.5 rounded-full bg-rose-500" />
        Порог превышения бюджета: 90%
      </div>
    </BentoCard>
  );
}
