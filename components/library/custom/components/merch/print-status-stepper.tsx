"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Printer, Wind, Package, Truck, AlertCircle, type LucideIcon } from 'lucide-react';
import { cn } from "../../utils/cn";

export type MerchStatus = 'queued' | 'printing' | 'drying' | 'quality_check' | 'packed' | 'shipped' | 'error';

interface StatusStep {
  status: MerchStatus;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const STEPS: StatusStep[] = [
  { status: 'queued', label: 'В очереди', description: 'Заказ ожидает печати', icon: Clock, color: 'text-blue-500 bg-blue-50 border-blue-100' },
  { status: 'printing', label: 'Печать', description: 'Нанесение принта на изделие', icon: Printer, color: 'text-amber-500 bg-amber-50 border-amber-100' },
  { status: 'drying', label: 'Сушка', description: 'Термическая обработка', icon: Wind, color: 'text-sky-500 bg-sky-50 border-sky-100' },
  { status: 'quality_check', label: 'Контроль QC', description: 'Проверка качества нанесения', icon: Check, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
  { status: 'packed', label: 'Упаковано', description: 'Готов к отправке', icon: Package, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
  { status: 'shipped', label: 'Отправлено', description: 'Передано курьерской службе', icon: Truck, color: 'text-slate-500 bg-slate-50 border-slate-100' },
];

export interface MerchStatusStepperProps {
  currentStatus: MerchStatus;
  className?: string;
}

export function MerchStatusStepper({ currentStatus, className }: MerchStatusStepperProps) {
  const currentIndex = STEPS.findIndex(s => s.status === currentStatus);
  const isError = currentStatus === 'error';

  return (
    <div className={cn("flex flex-col gap-0 w-full max-w-md", className)}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.status} className="relative flex gap-3 group">
            {/* Line connector */}
            {index !== STEPS.length - 1 && (
              <div className="absolute left-[19px] top-[48px] w-[2px] h-[calc(100%-48px)] bg-gray-100 overflow-hidden">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: isCompleted ? '100%' : '0%' }}
                  className="w-full bg-primary-base transition-all duration-700"
                />
              </div>
            )}

            {/* Icon Node */}
            <div className="relative z-10 py-1">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.05 : 1,
                  backgroundColor: isCompleted ? 'var(--primary-base)' : isActive ? 'white' : '#f3f4f6',
                  borderColor: isCompleted ? 'var(--primary-base)' : isActive ? 'var(--primary-base)' : '#e5e7eb',
                }}
                className={cn(
                  "size-10 rounded-xl border-2 flex items-center justify-center transition-shadow",
                  isActive && "shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]",
                  isCompleted ? "text-white" : isActive ? "text-primary-base" : "text-gray-400"
                )}
              >
                {isCompleted ? (
                   <Check className="size-5" />
                ) : (
                   <Icon className="size-5" />
                )}
              </motion.div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col py-3 pb-8">
              <span className={cn(
                "text-sm font-bold  transition-colors",
                isActive ? "text-gray-900" : isCompleted ? "text-gray-600" : "text-gray-400"
              )}>
                {step.label}
              </span>
              <span className={cn(
                "text-xs transition-colors",
                isActive ? "text-gray-500" : "text-gray-400"
              )}>
                {step.description}
              </span>
              
              {isActive && (
                 <motion.div 
                   layoutId="active-indicator"
                   className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-primary-base/5 border border-primary-base/10 rounded-md w-fit"
                 >
                   <div className="size-1.5 rounded-full bg-primary-base animate-pulse" />
                   <span className="text-[11px] font-bold text-primary-base  ">Текущий статус</span>
                 </motion.div>
              )}
            </div>
          </div>
        );
      })}

      {isError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-center">
          <div className="size-10 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0">
             <AlertCircle className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-red-900">Ошибка выполнения</span>
            <span className="text-xs text-red-600">Процесс приостановлен. Пожалуйста, проверьте настройки оборудования.</span>
          </div>
        </div>
      )}
    </div>
  );
}
