"use client";

import React from "react";
import { Clock, ExternalLink } from "lucide-react";
import { cn } from "../../utils/cn";

interface BentoRecentActivityProps {
  title: string;
  activities: {
    id: string;
    action: string;
    target: string;
    time: string;
    user: string;
    type: "create" | "update" | "delete" | "system";
  }[];
  className?: string;
}

export function BentoRecentActivity({ title, activities, className }: BentoRecentActivityProps) {
  const getTypeStyles = (type: string) => {
    switch(type) {
      case "create": return "bg-emerald-50 text-emerald-600";
      case "update": return "bg-blue-50 text-blue-600";
      case "delete": return "bg-rose-50 text-rose-600";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className={cn("bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-[27px] flex flex-col", className)}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground  ">{title}</h3>
        <Clock className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1 overflow-auto pr-2 -mr-2">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <tbody className="divide-y divide-border/40">
            {activities.map((a) => (
              <tr key={a.id} className="group hover:bg-muted/30 transition-colors">
                <td className="py-3 px-2 first:rounded-l-lg last:rounded-r-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-xs font-bold shrink-0">
                      {a.user.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{a.user}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="truncate max-w-[120px]">{a.action}</span>
                        <span className="font-medium text-foreground">{a.target}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold  ", getTypeStyles(a.type))}>
                    {a.type}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-xs text-muted-foreground font-medium w-24">
                  {a.time}
                </td>
                <td className="py-3 px-2 w-8 text-right">
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-muted-foreground hover:text-foreground cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
