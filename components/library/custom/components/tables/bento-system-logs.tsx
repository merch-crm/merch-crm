"use client";

import React from "react";
import { Terminal } from "lucide-react";
import { cn } from "../../utils/cn";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "fatal";
  message: string;
  source: string;
}

interface BentoSystemLogsProps {
  title: string;
  logs: LogEntry[];
  className?: string;
}

export function BentoSystemLogs({ title, logs, className }: BentoSystemLogsProps) {
  const getLevelColor = (level: string) => {
    switch(level) {
      case "info": return "text-blue-400";
      case "warn": return "text-amber-400";
      case "error": return "text-rose-400 font-bold";
      case "fatal": return "text-rose-600 font-black bg-rose-500/10 px-1 rounded";
      default: return "text-gray-400";
    }
  };

  return (
    <div className={cn("bg-[#0f172a] text-slate-300 shadow-xl border border-slate-800 p-6 rounded-[27px] flex flex-col font-mono text-xs relative overflow-hidden", className)}>
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500 opacity-50" />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-slate-400   flex items-center gap-2">
          <Terminal className="w-4 h-4" /> {title}
        </h3>
        <div className="flex gap-1.5 items-center">
          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        </div>
      </div>
      
      <div className="flex-1 w-full overflow-x-auto bg-[#020617] rounded-xl p-4 border border-slate-800/50 shadow-inner">
        <table className="w-full text-left whitespace-nowrap border-collapse">
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/50 transition-colors cursor-text group">
                <td className="py-1.5 px-2 text-slate-500 w-32 border-l-2 border-transparent group-hover:border-slate-500 pr-4">
                  {log.timestamp}
                </td>
                <td className="py-1.5 px-2 w-20">
                  <span className={cn("  text-[11px]", getLevelColor(log.level))}>
                    [{log.level}]
                  </span>
                </td>
                <td className="py-1.5 px-2 text-slate-400 w-32 truncate">
                  {log.source.padEnd(12, ' ')}
                </td>
                <td className="py-1.5 px-2 text-slate-300">
                  {log.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
