"use client";

import { memo, useRef, useEffect } from "react";
import { MapPin, User, Trash2, Pencil, Lock, GripVertical, Star, Warehouse, Printer, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StorageLocation, StorageLocationItem } from "../storage.types";

interface SortableLocationCardProps {
  loc: StorageLocation;
  isAnyDragging?: boolean;
  isWide?: boolean;
  isExtraWide?: boolean;
  onLayoutChange?: (id: string, isWide: boolean, isExtraWide: boolean) => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export const LocationCardContent = memo(({
  loc,
  onEdit,
  onDeleteClick,
  dragHandleProps,
  isOverlay
}: {
  loc: StorageLocation;
  onEdit?: (e: React.MouseEvent) => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
  dragHandleProps?: Record<string, unknown>;
  isOverlay?: boolean;
}) => {
  const totalItemsInLoc = loc.items?.reduce((sum: number, i: StorageLocationItem) => sum + i.quantity, 0) || 0;
  const isBrak = loc.name.toLowerCase().includes("брак");
  const isDefault = loc.isDefault || false;

  const grouped = loc.items?.reduce((acc: Record<string, { count: number, name: string }>, item: StorageLocationItem) => {
    if (item.quantity > 0) {
      const catId = item.categoryId || "other";
      const catName = item.categoryName || "Прочее";
      if (!acc[catId]) acc[catId] = { count: 0, name: catName };
      acc[catId].count += item.quantity;
    }
    return acc;
  }, {}) || {};

  const categoriesList = Object.values(grouped).sort((a, b) => b.count - a.count).slice(0, 4);
  const total = Object.values(grouped).reduce((sum: number, i: { count: number }) => sum + i.count, 0) || 1;

  return (
    <div className={cn("group relative flex flex-col transition-all duration-300 h-full min-h-[380px] p-6 lg:p-8 overflow-hidden",
      !loc.isActive && loc.isActive !== undefined && "opacity-60 grayscale-[0.5]",
      isOverlay ? "!border-primary !shadow-crm-xl z-[100]" :
        isDefault
          ? "!border-primary/20 ring-4 ring-primary/5 shadow-crm-lg"
          : isBrak
            ? "!bg-rose-50/30 !border-rose-100"
            : ""
    )}>
      {/* Soft Corner Glow on Hover */}
      <div className={cn(
        "absolute -bottom-12 -right-12 w-48 h-48 opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-[60px] rounded-full pointer-events-none",
        loc.type === "warehouse" ? "bg-purple-500/10" :
          loc.type === "production" ? "bg-orange-500/10" :
            loc.type === "office" ? "bg-emerald-500/10" :
              "bg-primary/10"
      )} />

      <div className="flex items-start justify-between gap-2 mb-2 relative z-10">
        <div className="flex items-center gap-1 sm:gap-3 min-w-0">
          <div role="button" tabIndex={0}
            {...dragHandleProps}
            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-primary cursor-grab active:cursor-grabbing transition-colors rounded-[var(--radius-inner)] hover:bg-slate-50 mr-[-4px] sm:mr-[-8px] z-30"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
          <span className={cn("text-xs sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-[4px] sm:rounded-[6px] border truncate shrink-0",
            loc.type === "warehouse" ? "bg-purple-50 text-purple-600 border-purple-100" :
              loc.type === "production" ? "bg-orange-50 text-orange-600 border-orange-100" :
                loc.type === "office" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200"
          )}>
            {loc.type === "warehouse" ? "Склад" :
              loc.type === "production" ? "Производство" :
                loc.type === "office" ? "Офис" : "Склад"}
          </span>
        </div>
        <div className={cn("w-7 h-7 sm:w-12 sm:h-12 rounded-[var(--radius-inner)] flex items-center justify-center transition-all duration-500 shrink-0",
          isDefault ? "bg-primary/10 text-primary" : "bg-slate-50 text-slate-400"
        )}>
          {(() => {
            switch (loc.type) {
              case "warehouse": return <Warehouse className="w-3.5 h-3.5 sm:w-6 sm:h-6" />;
              case "production": return <Printer className="w-3.5 h-3.5 sm:w-6 sm:h-6" />;
              case "office": return <Briefcase className="w-3.5 h-3.5 sm:w-6 sm:h-6" />;
              default: return <MapPin className="w-3.5 h-3.5 sm:w-6 sm:h-6" />;
            }
          })()}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center py-1 sm:py-4 relative z-10">
        <div className="text-3xl sm:text-6xl font-bold text-slate-900 tabular-nums">
          {totalItemsInLoc}
        </div>
        <div className="text-xs sm:text-xs font-bold text-slate-400 flex items-center gap-2">
          <span className="truncate">единиц</span>
          <div className="h-px flex-1 bg-slate-50" />
        </div>
      </div>

      <div className="space-y-3 sm:space-y-3 mt-auto relative z-10">
        <div className="space-y-0.5 sm:space-y-2">
          <div className="flex items-center gap-1.5">
            <h3 className={cn(
              "text-base sm:text-2xl font-bold text-slate-900 leading-tight truncate transition-colors duration-300",
              loc.type === "warehouse" ? "group-hover:text-purple-600" :
                loc.type === "production" ? "group-hover:text-orange-600" :
                  loc.type === "office" ? "group-hover:text-emerald-600" : "group-hover:text-primary"
            )}>
              {loc.name} {(!loc.isActive && loc.isActive !== undefined) && <span className="text-slate-400 text-xs sm:text-sm font-medium">(Арх)</span>}
            </h3>

            {loc.isDefault && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary shrink-0" />}
            {loc.isSystem && <Lock className="w-2 h-2 sm:w-3 sm:h-3 text-slate-300 shrink-0" />}
          </div>
          <p className="text-xs sm:text-xs font-bold text-slate-400 truncate">
            {loc.address || "Адрес не указан"}
          </p>
        </div>

        {categoriesList.length > 0 && (
          <div className="space-y-1.5 pt-2 sm:pt-4 border-t border-slate-200">
            <div className="flex h-1 rounded-full overflow-hidden bg-slate-50/50 w-full mb-0.5 sm:mb-1">
              {categoriesList.map((cat: { count: number, name: string }, idx: number) => {
                const percent = (cat.count / total) * 100;
                const colors = ["bg-primary", "bg-slate-700", "bg-slate-400", "bg-slate-200"];
                if (isBrak) colors[0] = "bg-rose-500";
                return (
                  <div
                    key={idx}
                    style={{ width: `${percent}%` }}
                    className={cn("h-full", colors[idx % colors.length])}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categoriesList.slice(0, 1).map((cat: { count: number, name: string }, idx: number) => (
                <span key={idx} className="text-xs sm:text-xs font-bold text-slate-400 truncate">
                  {cat.name}: <span className="text-slate-900 tabular-nums">{cat.count}</span>
                </span>
              ))}
              {categoriesList.length > 1 && (
                <span className="text-xs sm:text-xs font-bold text-slate-300 hidden sm:inline">
                  +{categoriesList.length - 1} еще
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 sm:pt-4 transition-all">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0 pr-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
              <User className="w-2 sm:w-3 sm:h-3 text-slate-400" />
            </div>
            <span className="text-xs sm:text-xs font-bold text-slate-500 break-words line-clamp-2 md:line-clamp-none">
              {loc.responsibleUser?.name || "Не назначен"}
            </span>
          </div>

          {!isOverlay && (
            <div className="flex gap-1.5 sm:gap-2 shrink-0 z-30 ml-auto">
              <button type="button"
                onClick={(e) => { e.stopPropagation(); onEdit?.(e); }}
                className="p-1.5 sm:p-2.5 rounded-[var(--radius-inner)] bg-slate-50 text-slate-400 hover:bg-primary/5 hover:text-primary transition-all border border-slate-200"
              >
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              {!loc.isSystem && (
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); onDeleteClick?.(e); }}
                  className="p-1.5 sm:p-2.5 rounded-[var(--radius-inner)] bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all border border-rose-100"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

LocationCardContent.displayName = "LocationCardContent";

export const SortableLocationCard = memo(({
  loc,
  isAnyDragging,
  isWide: isWideProp,
  isExtraWide: isExtraWideProp,
  onLayoutChange,
  onDeleteClick,
  onClick
}: SortableLocationCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isWideRef = useRef(isWideProp ?? false);
  const isExtraWideRef = useRef(isExtraWideProp ?? false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: loc.id });

  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const wide = width > 380;
        const extraWide = width > 930;

        if (isDragging || isAnyDragging) {
          isWideRef.current = wide;
          isExtraWideRef.current = extraWide;
          return;
        }

        if (isWideRef.current !== wide || isExtraWideRef.current !== extraWide) {
          isWideRef.current = wide;
          isExtraWideRef.current = extraWide;
          onLayoutChange?.(loc.id, wide, extraWide);
        }
      }
    });

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isDragging, isAnyDragging, loc.id, onLayoutChange]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={cn("group relative bg-white border border-slate-200/60 rounded-[28px] sm:rounded-[32px] overflow-hidden transition-all duration-500 h-full",
        "hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] cursor-pointer",
        loc.type === "warehouse" ? "hover:border-purple-400/40" :
          loc.type === "production" ? "hover:border-orange-400/40" :
            loc.type === "office" ? "hover:border-emerald-400/40" :
              "hover:border-primary/40",
        isDragging ? "shadow-2xl ring-2 ring-primary/20 scale-[1.02] z-50 border-primary/30" : "shadow-sm"
      )}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
    >
      <LocationCardContent loc={loc} onEdit={() => onClick()}
        onDeleteClick={onDeleteClick}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
});

SortableLocationCard.displayName = "SortableLocationCard";
