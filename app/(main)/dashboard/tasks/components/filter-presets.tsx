"use client";

import { useState } from "react";
import { Trash2, Plus, Save, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import type { TaskFilters, TaskFilterPreset } from "@/lib/types/tasks";
import { saveFilterPreset, deleteFilterPreset } from "../actions/filter-preset-actions";

const SYSTEM_PRESETS: TaskFilterPreset[] = [
  {
    id: "system-my-tasks",
    name: "Мои задачи",
    filters: { assigneeId: "me" },
    isSystem: true,
    isFavorite: false,
    userId: "",
    createdAt: new Date(),
  },
  {
    id: "system-overdue",
    name: "Просроченные",
    filters: { isOverdue: true },
    isSystem: true,
    isFavorite: false,
    userId: "",
    createdAt: new Date(),
  },
  {
    id: "system-urgent",
    name: "Срочные",
    filters: { priority: ["urgent"] },
    isSystem: true,
    isFavorite: false,
    userId: "",
    createdAt: new Date(),
  },
];

interface FilterPresetsProps {
  currentFilters: TaskFilters;
  userPresets: TaskFilterPreset[];
  onApplyPreset: (filters: TaskFilters) => void;
  onPresetsChange: () => void;
}

export function FilterPresets({
  currentFilters,
  userPresets,
  onApplyPreset,
  onPresetsChange,
}: FilterPresetsProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const _allPresets = [...SYSTEM_PRESETS, ...userPresets];

  const handleApplyPreset = (preset: TaskFilterPreset) => {
    onApplyPreset(preset.filters);
    setIsOpen(false);
    toast(`Применён пресет "${preset.name}"`, "success");
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      toast("Введите название пресета", "destructive");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveFilterPreset({
        name: presetName.trim(),
        filters: currentFilters,
      });

      if (result.success) {
        toast(`Пресет "${presetName}" сохранён`, "success");
        setIsSaveDialogOpen(false);
        setPresetName("");
        onPresetsChange();
      } else {
        toast(result.error || "Не удалось сохранить пресет", "destructive");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    const result = await deleteFilterPreset(presetId);
    if (result.success) {
      toast("Пресет удалён", "success");
      onPresetsChange();
    } else {
      toast(result.error || "Не удалось удалить пресет", "destructive");
    }
  };

  const hasActiveFilters = Object.values(currentFilters).some(
    (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  );

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-11 px-4 rounded-xl border-slate-200/60 bg-white/80 backdrop-blur-sm hover:bg-white transition-all"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Пресеты
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 rounded-2xl border-slate-200 shadow-xl" align="end">
          <div className="p-4 border-b border-slate-100">
            <h4 className="font-semibold text-slate-900">Сохранённые фильтры</h4>
            <p className="text-xs text-slate-500 mt-1">Быстрый доступ к фильтрам</p>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {/* System Presets */}
            <div className="mb-2">
              <p className="text-xs font-semibold text-slate-400 tracking-wider px-3 py-2">
                Системные
              </p>
              {SYSTEM_PRESETS.map((preset) => (
                <button type="button"
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            {/* User Presets */}
            {userPresets.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 tracking-wider px-3 py-2">
                  Мои пресеты
                </p>
                {userPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <button type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="flex-1 text-left text-sm font-medium text-slate-700 group-hover:text-slate-900"
                    >
                      {preset.name}
                    </button>
                    <button type="button"
                      onClick={() => handleDeletePreset(preset.id)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Current */}
          {hasActiveFilters && (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start rounded-xl hover:bg-white"
                onClick={() => {
                  setIsOpen(false);
                  setIsSaveDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Сохранить текущий фильтр
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Сохранить фильтр</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Название пресета</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Например: Срочные задачи дизайна"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
              className="rounded-xl"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSavePreset}
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
