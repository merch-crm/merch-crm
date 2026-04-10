"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { InventoryItem, Category } from "@/app/(main)/dashboard/warehouse/types";
import { getCategoryIcon } from "@/app/(main)/dashboard/warehouse/category/icons";

interface ItemImagePreviewProps {
  item: InventoryItem;
  isEditing: boolean;
  thumbSettings: { zoom: number; x: number; y: number };
  baseScale: number;
  handleMainMouseDown: (e: React.MouseEvent) => void;
  setAspectRatio: (ratio: number) => void;
  updateThumb: (settings: Partial<{ zoom: number; x: number; y: number }>) => void;
  openGallery: (src: string) => void;
}

export function ItemImagePreview({
  item,
  isEditing,
  thumbSettings,
  baseScale,
  handleMainMouseDown,
  setAspectRatio,
  updateThumb,
  openGallery
}: ItemImagePreviewProps) {
  const currentSettings = thumbSettings || { zoom: 1, x: 0, y: 0 };

  return (
    <div className="flex flex-col gap-0 h-full">
      <div className="group relative w-full h-full aspect-square xl:aspect-auto overflow-hidden rounded-[24px]">
        <div role="button" tabIndex={0}
          className={cn("absolute inset-0 overflow-hidden rounded-[24px]",
            !item.image && "bg-muted/50",
            isEditing ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
          )}
          onMouseDown={handleMainMouseDown}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!isEditing && item.image) openGallery(item.image);
            }
          }}
          onClick={() => !isEditing && item.image && openGallery(item.image)}
        >
          {item.image ? (
            <div className="absolute inset-0 overflow-hidden">
              <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 ease-out select-none pointer-events-none" unoptimized priority style={{ transform: `scale(${((isEditing ? currentSettings?.zoom : item.thumbnailSettings?.zoom) ?? 1) * baseScale}) translate(${(isEditing ? currentSettings?.x : item.thumbnailSettings?.x) ?? 0}%, ${(isEditing ? currentSettings?.y : item.thumbnailSettings?.y) ?? 0}%)`, transformOrigin: 'center center', }} onLoad={(img: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = img.target as HTMLImageElement;
                  setAspectRatio(target.naturalWidth / target.naturalHeight);
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 bg-muted/50">
              {(() => {
                const CategoryIcon = getCategoryIcon(item.category as Partial<Category> || {});
                return (
                  <>
                    <div className="w-20 h-20 rounded-3xl bg-card shadow-inner flex items-center justify-center mb-4">
                      <CategoryIcon className="w-10 h-10 opacity-30" aria-label="No image" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground/50">Нет фото</p>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* THUMBNAIL CONTROLS */}
      {isEditing && item.image && (
        <div className="crm-card bg-white shadow-sm border border-slate-100 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-500">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Масштаб</span>
              <span className="text-xs font-black text-slate-900">{Math.round(currentSettings.zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.01"
              value={currentSettings.zoom}
              onChange={(e) => updateThumb({ zoom: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Ось X</span>
                <span className="text-xs font-black text-slate-900">{Math.round(currentSettings.x)}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={currentSettings.x}
                onChange={(e) => updateThumb({ x: parseInt(e.target.value) })}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Ось Y</span>
                <span className="text-xs font-black text-slate-900">{Math.round(currentSettings.y)}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={currentSettings.y}
                onChange={(e) => updateThumb({ y: parseInt(e.target.value) })}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
