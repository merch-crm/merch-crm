"use client";

import { MapPin, Lock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { EditStorageLocationDialog } from "./edit-storage-location-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DndContext,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { StorageLocation } from "./storage.types";
export * from "./storage.types";
import { useStorageLocations } from "./hooks/use-storage-locations";
import { SortableLocationCard, LocationCardContent } from "./components/location-card";

interface StorageLocationsTabProps {
  locations: StorageLocation[];
  users: { id: string; name: string }[];
}

export function StorageLocationsTab({ locations, users }: StorageLocationsTabProps) {
  const {
    uiState,
    setUiState,
    dataState,
    stableLayouts,
    cardLayoutsRef,
    sensors,
    handleDeleteClick,
    handleConfirmDelete,
    handleDragStart,
    handleDragEnd,
    onLayoutChange
  } = useStorageLocations(locations);

  if (!dataState.localLocations.length) return (
    <EmptyState icon={MapPin} title="Места хранения не найдены" description="Добавьте первое место хранения для систематизации учета." className="py-20" />
  );

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={dataState.localLocations.map(l => l.id)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-wrap items-stretch justify-center w-full gap-3 sm:gap-3 animate-in fade-in slide-in-from-bottom-6 duration-1000" data-testid="storage-list">
            {dataState.localLocations.map((loc) => (
              <div
                key={loc.id}
                className={cn("transition-all duration-300 flex-grow",
                  (stableLayouts[loc.id]?.isWide || (uiState.activeId && cardLayoutsRef.current.get(loc.id)?.isWide))
                    ? "min-w-[500px] flex-[1_1_600px]"
                    : "min-w-[300px] flex-[1_1_21%]"
                )}
              >
                <SortableLocationCard loc={loc} isAnyDragging={!!uiState.activeId} isWide={stableLayouts[loc.id]?.isWide} isExtraWide={stableLayouts[loc.id]?.isExtraWide} onLayoutChange={onLayoutChange} onDeleteClick={(e) => handleDeleteClick(e, loc.id, loc.name, loc.isSystem || false)}
                  onClick={() => setUiState(prev => ({ ...prev, editingLocation: loc }))}
                />
              </div>
            ))}
          </div>
        </SortableContext>
        <DragOverlay adjustScale={false} dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)', }}>
          {uiState.activeId ? (
            <div className="w-full h-full pointer-events-none z-[100]">
              <div className="bg-white border border-primary/40 rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-primary/20 overflow-hidden">
                <LocationCardContent loc={dataState.localLocations.find(l => l.id === uiState.activeId)!}
                  isOverlay
                />
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ConfirmDialog isOpen={!!uiState.deleteId} onClose={() => setUiState(prev => ({ ...prev, deleteId: null }))}
        onConfirm={handleConfirmDelete}
        isLoading={uiState.isDeleting}
        title="Удалить локацию?"
        description={`Локация «${uiState.deleteName}» будет удалена. Данное действие необратимо.`}
        confirmText="Удалить"
        variant="destructive"
      >
        {uiState.deleteIsSystem && (
          <div className="p-4 bg-rose-50 rounded-[var(--radius-inner)] border border-rose-100 text-left">
            <div className="flex items-center gap-2 text-rose-600 mb-3">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-semibold">Системная защита</span>
            </div>
            <Input type="password" value={uiState.deletePassword} onChange={(e) => setUiState(prev => ({ ...prev, deletePassword: e.target.value }))}
              placeholder="Пароль администратора"
              className="border-2 border-rose-100 focus:border-rose-300 font-medium text-slate-900 placeholder:text-rose-200 text-sm"
              autoFocus
            />
          </div>
        )}
      </ConfirmDialog>

      <EditStorageLocationDialog users={users} locations={locations} location={uiState.editingLocation || locations[0]} isOpen={!!uiState.editingLocation} onClose={() => setUiState(prev => ({ ...prev, editingLocation: null }))}
      />
    </>
  );
}
