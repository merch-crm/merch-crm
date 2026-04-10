"use client";

import { motion, AnimatePresence } from"framer-motion";
import { FileDown, Trash2, X } from"lucide-react";
import { Button } from"@/components/ui/button";
import { createPortal } from"react-dom";

interface HistorySelectionBarProps {
  mounted: boolean;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  isAdmin: boolean;
  handleExportSelected: () => void;
  handleDeleteSelected: () => void;
}

export function HistorySelectionBar({
  mounted,
  selectedIds,
  setSelectedIds,
  isAdmin,
  handleExportSelected,
  handleDeleteSelected
}: HistorySelectionBarProps) {
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {selectedIds.length > 0 && (
        <>
          {/* Bottom Progressive Gradient Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-x-0 bottom-0 h-80 pointer-events-none z-[80]"
            style={{
              maskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
              background: 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 40%, transparent 100%)'
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 100, x:"-50%", scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x:"-50%", scale: 1 }}
            exit={{ opacity: 0, y: 100, x:"-50%", scale: 0.9 }}
            transition={{ type:"spring", damping: 25, stiffness: 200, mass: 0.8 }}
            className="fixed bottom-6 sm:bottom-10 left-1/2 z-[100] flex items-center bg-white p-1.5 sm:p-2 gap-2 sm:gap-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 max-w-[95vw]"
          >
            <div className="flex items-center gap-2 sm:gap-3 pl-0 sm:pl-0 pr-1 sm:pr-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 text-white shrink-0">
                {selectedIds.length}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-slate-500 whitespace-nowrap">Записей выбрано</span>
            </div>

            <div className="w-px h-6 sm:h-8 bg-slate-200 mx-1 sm:mx-2 shrink-0" />

            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="md" onClick={handleExportSelected} className="h-auto py-2.5 rounded-full flex items-center gap-2 text-slate-500 hover:bg-primary/10 hover:text-primary border-none shadow-none !shadow-none group">
                <FileDown className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                <span className="hidden sm:inline text-xs font-bold transition-colors">Экспорт</span>
              </Button>

              {isAdmin && (
                <Button type="button" variant="ghost" size="md" onClick={handleDeleteSelected} className="h-auto py-2.5 rounded-full flex items-center gap-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-600 border-none shadow-none group">
                  <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
                  <span className="hidden sm:inline text-xs font-bold transition-colors">Удалить</span>
                </Button>
              )}

              <div className="w-px h-6 sm:h-8 bg-slate-200 mx-1 sm:mx-2 shrink-0" />

              <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedIds([])}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
