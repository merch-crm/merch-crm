"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCount } from "@/lib/pluralize";
import { 
  Search, 
  Package, 
  AlertCircle, 
  Loader2, 
  Plus,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Select } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/toast";
import {
  getWarehouseMaterialsForCalculator,
  getWarehouseCategoriesForCalculator,
} from "@/app/(main)/dashboard/production/actions/warehouse-integration-actions";

export interface WarehouseMaterial {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  quantity: number;
  unit: string;
  price: number;
  minQuantity: number | null;
}

interface WarehouseCategory {
  id: string;
  name: string;
  count: number;
}

interface WarehouseMaterialPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (material: WarehouseMaterial, quantity: number) => void;
  selectedIds?: string[];
  applicationTypeId?: string;
}

export function WarehouseMaterialPicker({
  open,
  onOpenChange,
  onSelect,
  selectedIds = [],
  applicationTypeId,
}: WarehouseMaterialPickerProps) {
  const { toast } = useToast();
  
  const [materials, setMaterials] = useState<WarehouseMaterial[]>([]);
  const [categories, setCategories] = useState<WarehouseCategory[]>([]);
  const [fetchState, setFetchState] = useState({ loading: false, error: null as string | null });
  
  const [filters, setFilters] = useState({ search: "", category: "all" });
  const [selectedMaterial, setSelectedMaterial] = useState<WarehouseMaterial | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Загрузка категорий
  const loadCategories = useCallback(async () => {
    const result = await getWarehouseCategoriesForCalculator();
    if (result.success && result.data) {
      setCategories(result.data);
    }
  }, []);

  // Загрузка материалов
  const loadMaterials = useCallback(async () => {
    setFetchState({ loading: true, error: null });
    
    try {
      const result = await getWarehouseMaterialsForCalculator({
        search: filters.search || undefined,
        category: filters.category !== "all" ? filters.category : undefined,
        applicationTypeId,
        limit: 50,
        offset: 0,
      });
      
      if (result.success && result.data) {
        setMaterials(result.data as unknown as WarehouseMaterial[]);
      } else {
        setFetchState(prev => ({ ...prev, error: result.error || "Ошибка загрузки материалов" }));
      }
    } catch (_err) {
      setFetchState(prev => ({ ...prev, error: "Не удалось загрузить материалы" }));
    } finally {
      setFetchState(prev => ({ ...prev, loading: false }));
    }
  }, [filters.search, filters.category, applicationTypeId]);

  // Загрузка при открытии
  useEffect(() => {
    if (open) {
      loadCategories();
      loadMaterials();
    }
  }, [open, loadCategories, loadMaterials]);

  // Перезагрузка при изменении фильтров
  useEffect(() => {
    if (open) {
      const timeoutId = setTimeout(loadMaterials, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.search, filters.category, open, loadMaterials]);

  const handleSelect = () => {
    if (!selectedMaterial) return;
    
    if (quantity <= 0) {
      toast("Укажите количество больше 0");
      return;
    }
    
    if (quantity > selectedMaterial.quantity) {
      toast(`Доступно только ${formatCount(selectedMaterial.quantity, selectedMaterial.unit, selectedMaterial.unit, selectedMaterial.unit)}`);
      return;
    }
    
    onSelect(selectedMaterial, quantity);
    setSelectedMaterial(null);
    setQuantity(1);
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedMaterial(null);
    setQuantity(1);
    setFilters({ search: "", category: "all" });
    onOpenChange(false);
  };

  const isLowStock = (material: WarehouseMaterial) => {
    if (!material.minQuantity) return false;
    return material.quantity <= material.minQuantity;
  };

  const isCriticalStock = (material: WarehouseMaterial) => {
    if (!material.minQuantity) return false;
    return material.quantity <= material.minQuantity * 0.2;
  };

  // Фильтруем уже выбранные
  const filteredMaterials = materials.filter(
    (m) => !selectedIds.includes(m.id)
  );

  return (
    <ResponsiveModal 
      isOpen={open} 
      onClose={handleClose}
      title="Выбор материала со склада"
      footer={
        <div className="flex gap-3 justify-end w-full">
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!selectedMaterial || quantity <= 0}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </Button>
        </div>
      }
    >
        <div className="p-4 space-y-3">
          {/* Фильтры */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Поиск по названию или артикулу..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-9"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <Select
              options={[
                { id: "all", title: "Все категории" },
                ...categories.map(cat => ({
                  id: cat.id,
                  title: cat.name,
                  badge: cat.count
                }))
              ]}
              value={filters.category}
              onChange={(value: string) => setFilters(prev => ({ ...prev, category: value }))}
              className="w-[220px]"
            />
          </div>

          {/* Список материалов */}
          <ScrollArea className="h-[300px] border rounded-xl">
            {fetchState.loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : fetchState.error ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
                <p className="text-sm text-slate-600">{fetchState.error}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadMaterials}
                  className="mt-3"
                >
                  Повторить
                </Button>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Package className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">
                  {filters.search ? "Материалы не найдены" : "Нет доступных материалов"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredMaterials.map((material) => (
                  <button
                    type="button"
                    key={material.id}
                    onClick={() => setSelectedMaterial(material)}
                    className={cn(
                      "w-full p-3 text-left transition-colors hover:bg-slate-50",
                      selectedMaterial?.id === material.id && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 truncate">
                            {material.name}
                          </span>
                          {isCriticalStock(material) && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-rose-100 text-rose-700 rounded">
                              Критично
                            </span>
                          )}
                          {isLowStock(material) && !isCriticalStock(material) && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                              Мало
                            </span>
                          )}
                        </div>
                        {material.sku && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Артикул: {material.sku}
                          </p>
                        )}
                        {material.category && (
                          <p className="text-xs text-slate-400">
                            {material.category}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className={cn(
                          "text-sm font-semibold",
                          isCriticalStock(material) 
                            ? "text-rose-600" 
                            : isLowStock(material) 
                              ? "text-amber-600" 
                              : "text-slate-900"
                        )}>
                          {material.quantity} {material.unit}
                        </div>
                        <div className="text-xs text-slate-400">
                          {material.price.toLocaleString("ru-RU")} ₽/{material.unit}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Выбранный материал и количество */}
          {selectedMaterial && (
            <div className="p-4 bg-slate-50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {selectedMaterial.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Доступно: {selectedMaterial.quantity} {selectedMaterial.unit}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMaterial(null)}
                  className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600">Количество:</label>
                <Input
                  type="number"
                  min={1}
                  max={selectedMaterial.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-slate-500">
                  {selectedMaterial.unit}
                </span>
                <div className="flex-1 text-right">
                  <span className="text-sm font-semibold text-slate-900">
                    {(selectedMaterial.price * quantity).toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
    </ResponsiveModal>
  );
}
