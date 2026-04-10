"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ArrowLeftRight, ArrowUpRight, Layers } from "lucide-react";
import { cn, formatUnit } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { RecentTransaction } from "./warehouse-stats-actions";

export function RecentTransactionsClient({ transactions = [] }: { transactions: RecentTransaction[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter to ensure we only have 'in' and 'transfer' (though server already filtered)
  const filtered = transactions.filter(t => t.type === 'in' || t.type === 'transfer');

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (filtered.length === 0) return null;

  return (
    <div className="crm-card shadow-sm hover:shadow-md transition-shadow duration-300 bg-white flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-[12px] bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          <ArrowLeftRight className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-[17px] font-bold text-slate-900 leading-tight">Последние поставки и перемещения</h4>
          <p className="text-xs font-medium text-slate-500 mt-0.5">История приходов и переводов между складами</p>
        </div>
      </div>

      <div className="card-breakout border-b border-slate-100 mb-2" />

      <div className="flex flex-col gap-2">
        {currentItems.map((tx) => (
          <div key={tx.id} className="group p-3 sm:p-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                tx.type === 'in' ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"
              )}>
                {tx.type === 'in' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowLeftRight className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-[14px] text-slate-900 line-clamp-1">
                  {tx.item?.name || "Неизвестный товар"}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[12px] font-medium text-slate-500">
                  <div className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {format(new Date(tx.createdAt), "dd MMM HH:mm", { locale: ru })}
                  </div>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  {tx.type === 'in' ? (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <span>Поставка на</span>
                      <span className="font-bold">{tx.storageLocation?.name || "Склад"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-indigo-600 line-clamp-1">
                      <span>Из</span>
                      <span className="font-bold">{tx.fromStorageLocation?.name || "Склада"}</span>
                      <span>в</span>
                      <span className="font-bold">{tx.storageLocation?.name || "Склад"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 min-w-[120px]">
              {tx.creator && (
                <div className="flex items-center gap-2" title={tx.creator.name}>
                  <Avatar className="w-6 h-6 border border-slate-200">
                    <AvatarImage src={tx.creator.image || undefined} alt={tx.creator.name} />
                    <AvatarFallback className="bg-slate-200 text-xs font-bold text-slate-600">
                      {tx.creator.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[12px] font-medium text-slate-600 hidden sm:block">
                    {tx.creator.name}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <span className={cn("text-[15px] font-black tabular-nums whitespace-nowrap",
                  tx.type === 'in' ? "text-emerald-600" : "text-indigo-600"
                )}>
                  +{tx.changeAmount} {tx.item ? formatUnit(tx.item.unit) : 'шт'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
          <Pagination currentPage={currentPage} totalItems={filtered.length} pageSize={itemsPerPage} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
