"use client";

import React from "react";
import { Activity, Server, Database, Wifi, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PulseNode {
  id: string;
  name: string;
  status: "healthy" | "warning" | "critical";
  icon: LucideIcon;
  latency: number;
}

interface BentoPulseWidgetProps {
  className?: string;
  nodes?: PulseNode[];
}

const defaultNodes: PulseNode[] = [
  { id: "api", name: "Интерфейс API", status: "healthy", icon: Server, latency: 42 },
  { id: "db", name: "База данных", status: "healthy", icon: Database, latency: 12 },
  { id: "cdn", name: "Сеть CDN", status: "warning", icon: Wifi, latency: 128 },
];

const statusStyles = {
  healthy: { ring: "ring-emerald-500/30", bg: "bg-emerald-500", pulse: "bg-emerald-400", text: "text-emerald-500" },
  warning: { ring: "ring-amber-500/30", bg: "bg-amber-500", pulse: "bg-amber-400", text: "text-amber-500" },
  critical: { ring: "ring-rose-500/30", bg: "bg-rose-500", pulse: "bg-rose-400", text: "text-rose-500" },
};

export function BentoPulseWidget({ className, nodes = defaultNodes }: BentoPulseWidgetProps) {
  const allHealthy = nodes.every((n) => n.status === "healthy");

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-card text-card-foreground shadow-crm-lg border border-border",
        "rounded-card p-6 flex flex-col",
        "animate-in fade-in slide-in-from-bottom-5 duration-700",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={cn("absolute inset-0 rounded-full opacity-40 animate-crm-blink", allHealthy ? "bg-emerald-500" : "bg-amber-500")}
            />
            <div className={cn("relative w-3 h-3 rounded-full", allHealthy ? "bg-emerald-500" : "bg-amber-500")} />
          </div>
          <span className="text-[11px] font-black tracking-tight">{allHealthy ? "Все системы работают штатно" : "Снижение производительности"}</span>
        </div>
        <Activity size={18} className="text-muted-foreground" />
      </div>

      {/* Pulse Nodes */}
      <div className="space-y-3 flex-1">
        {nodes.map((node, i) => {
          const styles = statusStyles[node.status];
          const Icon = node.icon;
          return (
            <div
              key={node.id}
              style={{ animationDelay: `${200 + i * 100}ms` }}
              className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center ring-2 bg-secondary/50", styles.ring)}>
                <Icon size={18} className={styles.text} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black tracking-tight text-slate-900">{node.name}</p>
                <p className="text-[11px] font-bold text-slate-400 tracking-tighter">задержка {node.latency} мс</p>

              </div>
              
              {/* Mini pulse bar */}
              <div className="flex items-end gap-px h-5">
                {Array.from({ length: 8 }).map((_, j) => (
                  <div
                    key={j}
                    style={{
                      height: `${4 + (j * 2) % 8}px`,
                      animationDelay: `${j * 120}ms`
                    }}
                    className={cn("w-1 rounded-full animate-pulse", styles.bg, "opacity-60")}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Uptime */}
      <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
        <span className="text-[11px] font-bold text-slate-400 tracking-tighter">Аптайм (30д)</span>
        <span className="text-[11px] font-black text-emerald-500 tracking-tight">99.98%</span>

      </div>
    </div>
  );
}
