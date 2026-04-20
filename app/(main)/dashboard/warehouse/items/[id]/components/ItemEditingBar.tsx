"use client";

import React from"react";
import { createPortal } from"react-dom";
import { motion } from"framer-motion";
import { Save, Loader2, Archive } from"lucide-react";
import { Button } from"@/components/ui/button";
import { InventoryItem } from"@/app/(main)/dashboard/warehouse/types";

interface ItemEditingBarProps {
  isEditing: boolean;
  isMounted: boolean;
  hasChanges: boolean;
  editData: Partial<InventoryItem>;
  item: InventoryItem;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export const ItemEditingBar = React.memo(({
  isEditing,
  isMounted,
  hasChanges,
  editData,
  item,
  isSaving,
  onCancel,
  onSave,
  onDelete,
}: ItemEditingBarProps) => {
  if (!isEditing || !isMounted) return null;

  return createPortal(
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
        className="fixed bottom-6 md:bottom-10 left-1/2 z-[110] flex items-center bg-card p-2.5 px-4 md:px-8 gap-3 md:gap-3 rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-border w-[calc(100%-2rem)] md:w-auto overflow-hidden"
        data-dialog-open="true"
      >
        {/* Left Side: Info */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 md:gap-3 flex-1 min-w-0"
        >
          <div className="flex flex-col relative min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs md:text-xs font-bold text-muted-foreground whitespace-nowrap">Режим правки</span>
              {hasChanges && (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" title="Есть несохраненные изменения" />
              )}
            </div>
            <span className="text-[13px] md:text-[15px] font-bold text-foreground truncate leading-none">
              {editData.name || item.name}
            </span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-border shrink-0" />
        </motion.div>

        {/* Right Side: Actions */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 md:gap-3 shrink-0"
        >
          <Button 
            variant="ghost" 
            color="gray"
            onClick={onCancel} 
            className="h-10 md:h-12 px-5 md:px-8 font-bold text-[13px] md:text-sm active:scale-95 border-none rounded-xl md:rounded-2xl"
          >
            Отмена
          </Button>

          <Button 
            variant="solid" 
            color="black" 
            disabled={isSaving} 
            onClick={onSave} 
            className="h-10 md:h-12 px-6 md:px-10 font-bold text-[13px] md:text-sm active:scale-95 transition-all border-none rounded-xl md:rounded-2xl shadow-xl shadow-black/10"
          >
            <div className="flex items-center gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Сохранение…</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Сохранить</span>
                </>
              )}
            </div>
          </Button>

          <Button 
            variant="solid" 
            color="red" 
            size="icon" 
            onClick={onDelete} 
            disabled={isSaving} 
            aria-label="Архивировать товар" 
            className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center active:scale-95 transition-all border-none rounded-xl md:rounded-2xl group/archive" 
            title="Архивировать"
          >
            <Archive className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover/archive:scale-110" />
          </Button>
        </motion.div>
      </motion.div>
    </>,
    document.body
  );
});

ItemEditingBar.displayName ="ItemEditingBar";
