"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FunnelStageBadge } from "./funnel-stage-badge";
import {
  funnelStages,
  type FunnelStage
} from "@/lib/schema/clients/main";

interface FunnelStageSelectProps {
  value: FunnelStage | string | null;
  onChange: (stage: FunnelStage) => void;
  disabled?: boolean;
  className?: string;
}

export const FunnelStageSelect = memo(function FunnelStageSelect({
  value,
  onChange,
  disabled = false,
  className,
}: FunnelStageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentStage = (value as FunnelStage) || "lead";

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 h-10 px-3 rounded-xl border-2 transition-all",
          isOpen
            ? "border-primary bg-primary/5"
            : "border-slate-200 bg-white hover:border-slate-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <FunnelStageBadge stage={currentStage} size="sm" />
        <ChevronDown className={cn( "w-4 h-4 text-slate-400 transition-transform shrink-0", isOpen && "rotate-180" )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20"
            >
              <div className="p-2">
                {funnelStages.map((stage) => {
                  const isActive = currentStage === stage;

                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => {
                        onChange(stage as FunnelStage);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl transition-colors text-left",
                        isActive
                          ? "bg-primary/10"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <FunnelStageBadge stage={stage} size="sm" />
                      {isActive && (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});
