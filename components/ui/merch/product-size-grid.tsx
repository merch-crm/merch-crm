"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Typo } from "@/components/ui/typo";

export interface SizeOption {
  id: string;
  label: string;
  fullLabel?: string;
  stock: number; // 0 to 100 for density or exact count
  price_adder?: number;
}

const DEFAULT_SIZES: SizeOption[] = [
  { id: 'xs', label: 'XS', fullLabel: 'Extra Small', stock: 12 },
  { id: 's', label: 'S', fullLabel: 'Small', stock: 45 },
  { id: 'm', label: 'M', fullLabel: 'Medium', stock: 89 },
  { id: 'l', label: 'L', fullLabel: 'Large', stock: 2 },
  { id: 'xl', label: 'XL', fullLabel: 'Extra Large', stock: 0 },
  { id: '2xl', label: '2XL', fullLabel: 'Double Extra Large', stock: 15 },
  { id: '3xl', label: '3XL', fullLabel: 'Triple Extra Large', stock: 7 },
  { id: '4xl', label: '4XL', fullLabel: 'Quadruple Extra Large', stock: 0 },
];

export interface ProductSizeGridProps {
  sizes?: SizeOption[];
  onSelect?: (size: SizeOption) => void;
  className?: string;
}

export function ProductSizeGrid({ sizes = DEFAULT_SIZES, onSelect, className }: ProductSizeGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (size: SizeOption) => {
    if (size.stock === 0) return;
    setSelectedId(size.id);
    if (onSelect) onSelect(size);
  };

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      <div className="flex items-center justify-between px-1">
        <Typo as="span" className="text-xs font-bold text-gray-400 ">Размерная сетка</Typo>
        <Typo as="span" className="text-[11px] font-medium text-gray-400 italic">Наличие обновлено 5м назад</Typo>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {sizes.map((size) => {
          const isSelected = selectedId === size.id;
          const isOutOfStock = size.stock === 0;
          const isLowStock = size.stock > 0 && size.stock < 5;

          return (
            <motion.button
              key={size.id}
              type="button"
              onClick={() => handleSelect(size)}
              whileHover={!isOutOfStock ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
              className={cn(
                "relative h-14 rounded-element border-2 flex flex-col items-center justify-center transition-all duration-300 overflow-hidden group",
                isSelected 
                  ? "bg-primary-base border-primary-base text-white shadow-[0_8px_20px_rgba(var(--primary-rgb),0.25)]" 
                  : isOutOfStock
                    ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-white border-gray-100 text-gray-700 hover:border-primary-base/30 hover:shadow-lg hover:shadow-gray-200/50"
              )}
            >
              {/* Stock density background indicator */}
              {!isOutOfStock && !isSelected && (
                <div 
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-1 transition-all duration-500 bg-gray-100 group-hover:bg-primary-base/10"
                  )}
                >
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (size.stock / 50) * 100)}%` }}
                    className={cn(
                        "h-full rounded-full transition-colors",
                        isLowStock ? "bg-amber-400" : "bg-emerald-400"
                    )}
                  />
                </div>
              )}

              <Typo as="span" className="text-sm font-black">{size.label}</Typo>
              
              <AnimatePresence>
                {isLowStock && !isSelected && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute -top-1 -right-1 size-2 rounded-full bg-amber-500 border-2 border-white shadow-sm ring-2 ring-amber-500/20"
                  />
                )}
              </AnimatePresence>

              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                   <div className="w-[120%] h-[2px] bg-gray-400 rotate-45" />
                </div>
              )}

              {/* Price adder if exists */}
              {size.price_adder && !isSelected && (
                 <Typo as="span" className="absolute bottom-1 right-2 text-[11px] font-bold text-emerald-600">
                    +{size.price_adder}₽
                 </Typo>
              )}
            </motion.button>

          );
        })}
      </div>

      <div className="flex gap-3 mt-2 px-1">
         <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-emerald-400" />
            <Typo as="span" className="text-[11px] font-bold text-gray-500">Достаточно</Typo>
         </div>
         <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-amber-400" />
            <Typo as="span" className="text-[11px] font-bold text-gray-500">Мало</Typo>
         </div>
         <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-gray-200" />
            <Typo as="span" className="text-[11px] font-bold text-gray-500">Нет</Typo>
         </div>
      </div>
    </div>
  );
}
