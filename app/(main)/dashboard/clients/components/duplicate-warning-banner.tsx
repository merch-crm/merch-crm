"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ExternalLink, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DuplicateClient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  company?: string | null;
}

interface DuplicateWarningBannerProps {
  duplicates: DuplicateClient[];
  onOpenClient: (clientId: string) => void;
  onDismiss: () => void;
  className?: string;
}

export const DuplicateWarningBanner = memo(function DuplicateWarningBanner({
  duplicates,
  onOpenClient,
  onDismiss,
  className,
}: DuplicateWarningBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (duplicates.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={cn("overflow-hidden", className)}
    >
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/50 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">
                Возможные дубликаты ({duplicates.length})
              </p>
              <p className="text-xs text-amber-600">
                Найдены клиенты с похожими данными
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onDismiss} className="h-7 w-7 p-0 text-amber-700 hover:text-amber-900 hover:bg-amber-100">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Expanded List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {duplicates.slice(0, 5).map((dup) => (
                <div
                  key={dup.id}
                  className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-amber-200/30"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {dup.lastName} {dup.firstName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {dup.phone}
                      {dup.company && ` • ${dup.company}`}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onOpenClient(dup.id)}
                    className="h-7 px-2 text-xs font-bold text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Открыть
                  </Button>
                </div>
              ))}
              {duplicates.length > 5 && (
                <p className="text-xs text-amber-600 text-center">
                  И ещё {duplicates.length - 5}...
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions (when collapsed) */}
        {!isExpanded && duplicates.length > 0 && (
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenClient(duplicates[0].id)}
              className="h-8 px-3 text-xs font-bold bg-white/70 text-amber-800 hover:bg-white border border-amber-200/50"
            >
              <ExternalLink className="w-3 h-3 mr-1.5" />
              Открыть {duplicates[0].lastName} {duplicates[0].firstName}
            </Button>
            {duplicates.length > 1 && (
              <span className="text-xs text-amber-600">
                +{duplicates.length - 1} ещё
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});
