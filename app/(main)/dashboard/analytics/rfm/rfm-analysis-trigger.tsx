"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface RFMAnalysisTriggerProps {
  onAnalyze: () => Promise<void>;
}

export function RFMAnalysisTrigger({ onAnalyze }: RFMAnalysisTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      await onAnalyze();
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} color="black"
        className="px-6 gap-2 font-bold shadow-xl shadow-slate-200 min-w-[180px]"
      >
        <RefreshCw className="w-4 h-4" />
        Запустить анализ
      </Button>

      <ResponsiveModal isOpen={isOpen} onClose={() => !isLoading && setIsOpen(false)}
        title="Запустить RFM-анализ?"
        description="Система пересчитает сегменты для всех клиентов на основе их истории заказов. Это может занять несколько секунд."
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="button" className="bg-slate-900 hover:bg-slate-800 text-white" onClick={handleAnalyze} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Обработка...
                </>
              ) : (
                "Да, запустить"
              )}
            </Button>
          </div>
        }
      >
        <div className="p-6 flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-sm text-slate-600">
            Это действие обновит RFM-сегменты для всей базы клиентов.
            Данные будут актуализированы согласно последним покупкам.
          </p>
        </div>
      </ResponsiveModal>
    </>
  );
}
