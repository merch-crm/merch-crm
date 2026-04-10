"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ActiveOrderItem } from "@/app/(main)/dashboard/warehouse/types";
import { ItemActiveOrdersSection } from "./ItemActiveOrdersSection";

interface ItemActiveOrdersWrapperProps {
  activeOrders: ActiveOrderItem[];
  reservedQuantity: number;
  tabletTab: string;
}

export function ItemActiveOrdersWrapper({
  activeOrders,
  reservedQuantity,
  tabletTab
}: ItemActiveOrdersWrapperProps) {
  if (activeOrders.length === 0 && reservedQuantity === 0 && tabletTab !== 'placement' && tabletTab !== 'characteristic') return null;

  return (
    <div className={cn("bg-white border border-slate-100/60 rounded-[28px] p-6 flex flex-col gap-3 shadow-sm",
      (tabletTab === 'placement' || tabletTab === 'characteristic') ? "flex" : "hidden", "xl:flex"
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[17px] font-black text-slate-900">Активные заказы ({activeOrders.length})</h3>
        <button type="button" className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors">
          Смотреть все
        </button>
      </div>
      <ItemActiveOrdersSection orders={activeOrders} />
    </div>
  );
}
