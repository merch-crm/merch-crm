"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ChevronRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AtRiskBannerProps {
  atRiskCount: number;
  attentionCount: number;
  onDismiss?: () => void;
  className?: string;
}

export function AtRiskBanner({
  atRiskCount,
  attentionCount,
  onDismiss,
  className,
}: AtRiskBannerProps) {
  const totalWarning = atRiskCount + attentionCount;

  if (totalWarning === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className={cn(
          "relative p-5 rounded-3xl border-2 shadow-xl overflow-hidden group",
          atRiskCount > 0
            ? "bg-gradient-to-br from-orange-50 to-white border-orange-100 shadow-orange-500/5"
            : "bg-gradient-to-br from-amber-50 to-white border-amber-100 shadow-amber-500/5",
          className
        )}
      >
        {/* Декоративный элемент фона */}
        <div className={cn(
          "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20",
          atRiskCount > 0 ? "bg-orange-500" : "bg-amber-500"
        )} />

        <div className="flex items-start gap-3 relative z-10">
          <div
            className={cn(
              "flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500",
              atRiskCount > 0 ? "bg-orange-500 text-white" : "bg-amber-500 text-white"
            )}
          >
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-black text-slate-900 mb-1 flex items-center gap-2">
              {atRiskCount > 0
                ? "Внимание: есть клиенты в зоне риска"
                : "Клиенты требуют вашего внимания"}
              <div className="flex gap-1">
                {atRiskCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />}
                {attentionCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
              </div>
            </h3>
            <p className="text-[13px] font-medium text-slate-600 mb-4 leading-relaxed">
              {atRiskCount > 0 && (
                <span>
                  У вас <strong className="text-orange-600 font-bold">{atRiskCount}</strong> клиентов без заказов более 90 дней. Это критический порог оттока.{" "}
                </span>
              )}
              {attentionCount > 0 && (
                <span>
                  <strong className="text-amber-600 font-bold">{attentionCount}</strong> клиентов находятся без активности от 60 до 90 дней.
                </span>
              )}
              <br />
              Рекомендуем прозвонить их сегодня, чтобы восстановить лояльность.
            </p>

            <div className="flex flex-wrap gap-3">
              {atRiskCount > 0 && (
                <Link href="/dashboard/clients?activityStatus=at_risk">
                  <Button variant="solid" color="neutral" className="bg-orange-100/50 hover:bg-orange-100 border border-orange-200 text-orange-700 h-10 px-5 rounded-xl font-bold transition-all hover:translate-x-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Зона риска ({atRiskCount})
                    <ChevronRight className="w-4 h-4 ml-1 opacity-50 transition-opacity group-hover:opacity-100" />
                  </Button>
                </Link>
              )}
              {attentionCount > 0 && (
                <Link href="/dashboard/clients?activityStatus=attention">
                  <Button variant="solid" color="neutral" className="bg-amber-100/50 hover:bg-amber-100 border border-amber-200 text-amber-700 h-10 px-5 rounded-xl font-bold transition-all hover:translate-x-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Требуют внимания ({attentionCount})
                    <ChevronRight className="w-4 h-4 ml-1 opacity-50 transition-opacity group-hover:opacity-100" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="flex-shrink-0 p-2 rounded-xl hover:bg-black/5 text-slate-400 hover:text-slate-900 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
