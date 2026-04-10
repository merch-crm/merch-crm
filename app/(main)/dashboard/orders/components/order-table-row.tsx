import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Zap, Archive, ArchiveRestore, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import StatusBadgeInteractive from "../status-badge-interactive";
import PriorityBadgeInteractive from "../priority-badge-interactive";
import type { Order } from "@/lib/types/order";
import type { ClientSummary } from "@/lib/types/client";

interface OrderTableRowProps {
  order: Order;
  config: {
    isSelected: boolean;
    isAdmin: boolean;
    showFinancials: boolean;
    showArchived: boolean;
    currencySymbol: string;
  };
  actions: {
    onSelect: (id: string) => void;
    onUpdateField: (id: string, field: string, value: string | number | boolean) => void | Promise<boolean>;
    onToggleArchived: (id: string, current: boolean) => void;
    onNavigate: (id: string) => void;
  };
}

export function OrderTableRow({
  order,
  config: { isSelected, isAdmin, showFinancials, showArchived, currencySymbol },
  actions: { onSelect, onUpdateField, onToggleArchived, onNavigate }
}: OrderTableRowProps) {
  const clientName = (typeof order.client === 'object' && order.client && 'displayName' in order.client)
    ? (order.client as ClientSummary).displayName
    : (order.client?.name || "—");

  return (
    <tr
      key={order.id}
      onClick={() => onNavigate(order.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate(order.id);
        }
      }}
      tabIndex={0}
      role="link"
      className={cn("crm-tr group hover:bg-white/80 transition-all cursor-pointer outline-none focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-primary/20",
        isSelected && "crm-tr-selected"
      )}
    >
      <td className="crm-td crm-td-selection" onClick={(e) => e.stopPropagation()}>
        <Checkbox id={`select-order-${order.id}`} aria-label={`Выбрать заказ ORD-${order.id.slice(0, 6)}`} checked={isSelected} onChange={() => onSelect(order.id)}
        />
      </td>
      <td className="crm-td">
        <div className="text-sm font-bold text-slate-900 mb-0.5">ORD-{order.id.slice(0, 6)}</div>
        <div className="text-xs font-medium text-slate-400">{format(new Date(order.createdAt), "dd MMM HH:mm", { locale: ru })}</div>
      </td>
      <td className="crm-td">
        <div className="text-sm font-bold text-slate-900 mb-0.5">{clientName}</div>
        <div className="text-xs font-medium text-slate-400">Отв: {order.creator?.name || "Система"}</div>
      </td>
      {showFinancials && (
        <td className="crm-td crm-td-number">
          <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-[var(--radius-sm)]">
            {Number(order.totalAmount).toLocaleString()} {currencySymbol}
          </span>
        </td>
      )}
      <td className="crm-td">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={(e) => {
              e.stopPropagation();
              onUpdateField(order.id, "isUrgent", !order.isUrgent);
            }}
            className={cn("w-8 h-8 rounded-2xl transition-all",
              order.isUrgent
                ? "bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-200"
                : "bg-slate-50 text-slate-400 hover:text-slate-600"
            )}
            title={order.isUrgent ? "Срочно" : "Обычный"}
            aria-label={order.isUrgent ? "Удалить метку срочности" : "Сделать срочным"}
          >
            <Zap className={cn("w-4 h-4", order.isUrgent && "fill-rose-600")} />
          </Button>
          <StatusBadgeInteractive orderId={order.id} status={order.status ?? "new"} />
        </div>
      </td>
      <td className="crm-td">
        <div className="flex items-center gap-1">
          <PriorityBadgeInteractive orderId={order.id} priority={order.priority ?? "medium"} />
          {isAdmin && (
            <Button type="button" variant="ghost" size="icon" onClick={(e) => {
                e.stopPropagation();
                onToggleArchived(order.id, showArchived);
              }}
              className="w-8 h-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all"
              title={showArchived ? "Восстановить" : "Архивировать"}
              aria-label={showArchived ? "Восстановить заказ" : "Архивировать заказ"}
            >
              {showArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </td>
      <td className="crm-td crm-td-actions" onClick={(e) => e.stopPropagation()}>
        <Button asChild variant="ghost" className="w-8 h-8 p-0 hover:bg-primary hover:text-white transition-all bg-slate-100 text-slate-400 rounded-[10px]" aria-label={`Перейти к заказу ORD-${order.id.slice(0, 6)}`}>
          <a href={`/dashboard/orders/${order.id}`}>
            <ArrowRight className="w-4 h-4" />
          </a>
        </Button>
      </td>
    </tr>
  );
}
