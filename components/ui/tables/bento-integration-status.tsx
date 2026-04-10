"use client";

import React, { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IntegrationStatus {
  id: string;
  name: string;
  category: string;
  status: "connected" | "error" | "disconnected" | "syncing";
  lastSync: string;
  isActive: boolean;
}

interface BentoIntegrationStatusProps {
  title: string;
  integrations: IntegrationStatus[];
  className?: string;
}

export function BentoIntegrationStatus({ title, integrations: initialIntegrations, className }: BentoIntegrationStatusProps) {
  const [integrations, setIntegrations] = useState(initialIntegrations);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, isActive: !i.isActive } : i));
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "connected": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "error": return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case "disconnected": return <XCircle className="w-4 h-4 text-gray-400" />;
      case "syncing": return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return null;
    }
  };

  return (
    <div className={cn("bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-card flex flex-col", className)}>
      <h3 className="text-sm font-semibold text-muted-foreground   mb-6">{title}</h3>
      
      <div className="flex-1 space-y-3">
        {integrations.map((integration) => (
          <div key={integration.id} className={cn(
            "flex items-center gap-3 p-4 rounded-element border transition-all duration-300",
            integration.isActive ? "bg-card border-border shadow-sm" : "bg-muted/20 border-transparent opacity-70 grayscale-[0.5]"
          )}>
            <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center font-black text-lg shrink-0">
              {integration.name.charAt(0)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate text-foreground">{integration.name}</div>
              <div className="text-xs text-muted-foreground   font-bold mt-0.5">{integration.category}</div>
            </div>
            
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold bg-secondary/50 px-2 py-1 rounded-md">
                {getStatusIcon(integration.status)}
                <span className="capitalize">{integration.status}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">{integration.lastSync}</div>
            </div>
            
            <div className="shrink-0 pl-2 border-l border-border/50 ml-2">
              <button 
                type="button"
                aria-label={integration.isActive ? "Отключить интеграцию" : "Включить интеграцию"}
                onClick={() => toggleIntegration(integration.id)}
                className={cn(
                  "w-10 h-6 rounded-full flex items-center p-1 transition-colors duration-300",
                  integration.isActive ? "bg-emerald-500" : "bg-muted-foreground/30"
                )}
              >
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
                  integration.isActive ? "translate-x-4" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
