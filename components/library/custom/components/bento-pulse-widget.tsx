"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Server, Database, Wifi, type LucideIcon } from "lucide-react";
import { cn } from "../utils/cn";

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
  { id: "api", name: "API", status: "healthy", icon: Server, latency: 42 },
  { id: "db", name: "Database", status: "healthy", icon: Database, latency: 12 },
  { id: "cdn", name: "CDN", status: "warning", icon: Wifi, latency: 128 },
];

const statusStyles = {
  healthy: { ring: "ring-emerald-500/30", bg: "bg-emerald-500", pulse: "bg-emerald-400", text: "text-emerald-500" },
  warning: { ring: "ring-amber-500/30", bg: "bg-amber-500", pulse: "bg-amber-400", text: "text-amber-500" },
  critical: { ring: "ring-rose-500/30", bg: "bg-rose-500", pulse: "bg-rose-400", text: "text-rose-500" },
};

export function BentoPulseWidget({ className, nodes = defaultNodes }: BentoPulseWidgetProps) {
  const allHealthy = nodes.every((n) => n.status === "healthy");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
      className={cn(
        "relative overflow-hidden bg-card text-card-foreground shadow-crm-lg border border-border",
        "rounded-[27px] p-6 flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={cn("absolute inset-0 rounded-full opacity-40", allHealthy ? "bg-emerald-500" : "bg-amber-500")}
            />
            <div className={cn("relative w-3 h-3 rounded-full", allHealthy ? "bg-emerald-500" : "bg-amber-500")} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-tight">{allHealthy ? "All Systems Operational" : "Degraded Performance"}</span>
        </div>
        <Activity size={18} className="text-muted-foreground" />
      </div>

      {/* Pulse Nodes */}
      <div className="space-y-3 flex-1">
        {nodes.map((node, i) => {
          const styles = statusStyles[node.status];
          const Icon = node.icon;
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center ring-2 bg-secondary/50", styles.ring)}>
                <Icon size={18} className={styles.text} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">{node.name}</p>
                <p className="text-[11px] font-bold text-slate-400 tracking-tighter">{node.latency}ms latency</p>

              </div>
              
              {/* Mini pulse bar */}
              <div className="flex items-end gap-px h-5">
                {Array.from({ length: 8 }).map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ height: 4 }}
                    animate={{ 
                      height: [4, 8 + (j * 2) % 12, 4], // deterministic animation for SSR safety
                    }}
                    transition={{
                      duration: 1 + (j * 0.1) % 1,
                      repeat: Infinity,
                      delay: j * 0.12,
                      ease: "easeInOut",
                    }}
                    className={cn("w-1 rounded-full", styles.bg, "opacity-60")}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Uptime */}
      <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Uptime (30d)</span>
        <span className="text-[11px] font-black text-emerald-500 uppercase tracking-tight">99.98%</span>

      </div>
    </motion.div>
  );
}
