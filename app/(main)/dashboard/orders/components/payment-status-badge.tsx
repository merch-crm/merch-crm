import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDashed, PieChart, RefreshCcw } from "lucide-react";

type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";

interface PaymentStatusBadgeProps {
 status: PaymentStatus;
 className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
 const config = {
  unpaid: {
   label: "Не оплачен",
   icon: CircleDashed,
   className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  partial: {
   label: "Частично",
   icon: PieChart,
   className: "bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-500/10",
  },
  paid: {
   label: "Оплачен",
   icon: CheckCircle2,
   className: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-500/10",
  },
  refunded: {
   label: "Возврат",
   icon: RefreshCcw,
   className: "bg-rose-50 text-rose-600 border-rose-200",
  },
 };

 const { label, icon: Icon, className: statusClassName } = config[status] || config.unpaid;

 return (
  <div
   className={cn(
    "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-black  transition-all duration-300",
    statusClassName,
    className
   )}
  >
   <Icon className="w-3 h-3" />
   <span>{label}</span>
  </div>
 );
}
