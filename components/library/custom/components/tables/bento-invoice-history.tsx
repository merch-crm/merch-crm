"use client";

import React from "react";
import { Download } from "lucide-react";
import { cn } from "../../utils/cn";

export interface InvoiceRecord {
  id: string;
  client: string;
  amount: string;
  date: string;
  status: "paid" | "pending" | "overdue";
}

interface BentoInvoiceHistoryProps {
  title: string;
  invoices: InvoiceRecord[];
  className?: string;
}

export function BentoInvoiceHistory({ title, invoices, className }: BentoInvoiceHistoryProps) {
  const getStatusVisuals = (status: string) => {
    switch(status) {
      case "paid": return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20";
      case "pending": return "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20";
      case "overdue": return "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className={cn("bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-[27px] flex flex-col", className)}>
      <h3 className="text-sm font-semibold text-muted-foreground   mb-6">{title}</h3>
      
      <div className="flex-1 w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground text-xs font-semibold   text-left">
              <th className="pb-3 px-4 font-medium">Invoice ID</th>
              <th className="pb-3 px-4 font-medium">Client</th>
              <th className="pb-3 px-4 font-medium text-right">Amount</th>
              <th className="pb-3 px-4 font-medium text-center">Status</th>
              <th className="pb-3 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                <td className="py-4 px-4 font-medium text-foreground">{inv.id}</td>
                <td className="py-4 px-4">
                  <div className="font-semibold">{inv.client}</div>
                  <div className="text-xs text-muted-foreground">{inv.date}</div>
                </td>
                <td className="py-4 px-4 text-right font-bold ">{inv.amount}</td>
                <td className="py-4 px-4 text-center">
                  <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize", getStatusVisuals(inv.status))}>
                    {inv.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button 
                    type="button"
                    aria-label="Скачать инвойс"
                    className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground inline-flex ml-auto"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
