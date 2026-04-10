import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import StatusBadgeInteractive from "../status-badge-interactive";
import type { Order } from "@/lib/types/order";
import type { ClientSummary } from "@/lib/types/client";

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  showFinancials: boolean;
  currencySymbol: string;
  onSelect: (id: string) => void;
  onNavigate: (id: string) => void;
}

export function OrderCard({
  order,
  isSelected,
  showFinancials,
  currencySymbol,
  onSelect,
  onNavigate
}: OrderCardProps) {
  const clientName = (typeof order.client === 'object' && order.client && 'displayName' in order.client)
    ? (order.client as ClientSummary).displayName
    : (order.client?.name || "—");

  return (
    <div
      key={order.id}
      className={cn("group relative bg-white border-b border-slate-100 p-4 transition-all duration-300 active:bg-slate-50 outline-none focus-within:bg-slate-50",
        isSelected ? "crm-tr-selected" : "bg-white"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate(order.id);
        }
      }}
      onClick={() => onNavigate(order.id)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={(e) => e.stopPropagation()} className="shrink-0">
            <Checkbox id={`select-order-mobile-${order.id}`} aria-label={`Выбрать заказ ORD-${order.id.slice(0, 6)}`} checked={isSelected} onChange={() => onSelect(order.id)}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-black text-slate-900 truncate">ORD-{order.id.slice(0, 6)}</span>
              {order.isUrgent && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 border border-rose-100 rounded-full">
                  <Zap className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                  <span className="text-xs font-bold text-rose-500 leading-none">Срочно</span>
                </div>
              )}
            </div>
            <div className="text-base font-bold text-slate-700 leading-tight truncate mb-1">
              {clientName}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="truncate">Отв: {order.creator?.name || "Система"}</span>
              <span className="text-slate-200">•</span>
              <span>{format(new Date(order.createdAt), "dd MMM HH:mm", { locale: ru })}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {showFinancials && (
            <div className="text-sm font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">
              {Number(order.totalAmount).toLocaleString()} {currencySymbol}
            </div>
          )}
          <div className="flex items-center gap-2">
            <StatusBadgeInteractive orderId={order.id} status={order.status ?? "new"} />
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
