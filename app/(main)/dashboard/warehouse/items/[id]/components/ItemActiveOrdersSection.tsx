"use client";

import React from "react";
import {
  ShoppingBag,
} from "lucide-react";
import { ActiveOrderItem } from "@/app/(main)/dashboard/warehouse/types";
import Link from "next/link";

interface ItemActiveOrdersSectionProps {
  orders: ActiveOrderItem[];
}

export function ItemActiveOrdersSection({ orders = [] }: ItemActiveOrdersSectionProps) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="table-empty py-12">
        <ShoppingBag />
        <p>Нет заказов</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {(orders || []).map((item, idx) => {
        if (!item.order) return null;

        const clientName = item.order.client
          ? `${item.order.client.firstName} ${item.order.client.lastName}`.trim()
          : "Частное лицо";
        const avatarInitial = clientName.charAt(0).toUpperCase();

        const orderData = item.order as { category?: string; status?: string; orderNumber?: string };
        const categoryRaw = orderData.category;
        const _orderCategory = categoryRaw === "corporate" ? "Корпоративный заказ" :
          categoryRaw === "retail" ? "Розничный заказ" :
            categoryRaw === "wholesale" ? "Оптовый заказ" :
              (item.order.client?.company || "В работе");

        // Try to extract a status or use category as fallback for the right side badge
        const statusText = orderData.status === 'new' ? 'Новый' :
          orderData.status === 'processing' ? 'В обработке' :
            orderData.status === 'ready' ? 'Готов' :
              'В резерве';

        const orderNumber = item.order.orderNumber?.startsWith('#') ? item.order.orderNumber : `#${item.order.orderNumber}`;

        return (
          <Link key={item.id} href={`/dashboard/orders/${item.order.id}`} className="group p-3.5 rounded-2xl border border-slate-100/80 bg-white hover:border-slate-200 hover:shadow-sm transition-all duration-300 flex items-center justify-between" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-blue-50/50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-sm shrink-0">
                {avatarInitial}
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  Заказ {orderNumber}
                </span>
                <span className="text-[12px] font-bold text-slate-400 mt-0.5">
                  {clientName}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[14px] font-black text-slate-900 tabular-nums">
                {item.quantity} шт.
              </span>
              <span className="text-xs font-bold text-slate-400 mt-1">
                {statusText}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
