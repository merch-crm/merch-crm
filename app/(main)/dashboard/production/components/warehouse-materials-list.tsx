"use client";

import { useState } from "react";
import { Trash2, Plus, Minus, AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { WarehouseMaterialPicker, type WarehouseMaterial } from "./warehouse-material-picker";

export interface SelectedMaterial {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  availableQuantity: number;
  unit: string;
  price: number;
}

interface WarehouseMaterialsListProps {
  materials: SelectedMaterial[];
  onChange: (materials: SelectedMaterial[]) => void;
  applicationTypeId?: string;
  disabled?: boolean;
  className?: string;
}

export function WarehouseMaterialsList({
  materials,
  onChange,
  applicationTypeId,
  disabled = false,
  className,
}: WarehouseMaterialsListProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleAddMaterial = (
    material: WarehouseMaterial,
    quantity: number
  ) => {
    const existing = materials.find((m) => m.id === material.id);
    
    if (existing) {
      // Увеличиваем количество существующего
      onChange(
        materials.map((m) =>
          m.id === material.id
            ? { ...m, quantity: Math.min(m.quantity + quantity, m.availableQuantity) }
            : m
        )
      );
    } else {
      // Добавляем новый
      onChange([
        ...materials,
        {
          id: material.id,
          name: material.name,
          sku: material.sku,
          quantity,
          availableQuantity: material.quantity,
          unit: material.unit,
          price: material.price,
        },
      ]);
    }
  };

  const handleRemoveMaterial = (id: string) => {
    onChange(materials.filter((m) => m.id !== id));
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    onChange(
      materials.map((m) => {
        if (m.id !== id) return m;
        
        const clampedQuantity = Math.max(1, Math.min(newQuantity, m.availableQuantity));
        return { ...m, quantity: clampedQuantity };
      })
    );
  };

  const handleIncrement = (id: string) => {
    const material = materials.find((m) => m.id === id);
    if (material && material.quantity < material.availableQuantity) {
      handleQuantityChange(id, material.quantity + 1);
    }
  };

  const handleDecrement = (id: string) => {
    const material = materials.find((m) => m.id === id);
    if (material && material.quantity > 1) {
      handleQuantityChange(id, material.quantity - 1);
    }
  };

  const totalCost = materials.reduce(
    (sum, m) => sum + m.price * m.quantity,
    0
  );

  const hasInsufficientStock = materials.some(
    (m) => m.quantity > m.availableQuantity
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">
            Материалы со склада
          </span>
          {materials.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
              {materials.length}
            </span>
          )}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPickerOpen(true)}
          disabled={disabled}
          className="gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Добавить</span>
        </Button>
      </div>

      {/* Список материалов */}
      {materials.length > 0 ? (
        <div className="space-y-2">
          {materials.map((material) => {
            const isInsufficient = material.quantity > material.availableQuantity;
            const itemTotal = material.price * material.quantity;

            return (
              <div
                key={material.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                  isInsufficient
                    ? "border-rose-200 bg-rose-50/50"
                    : "border-slate-200 bg-white"
                )}
              >
                {/* Информация о материале */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 truncate">
                      {material.name}
                    </span>
                    {isInsufficient && (
                      <Tooltip content="Недостаточно на складе">
                        <div className="flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-rose-500 cursor-help" />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                  {material.sku && (
                    <p className="text-xs text-slate-400">
                      Артикул: {material.sku}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    Доступно: {material.availableQuantity} {material.unit} •{" "}
                    {material.price.toLocaleString("ru-RU")} ₽/{material.unit}
                  </p>
                </div>

                {/* Управление количеством */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDecrement(material.id)}
                    disabled={disabled || material.quantity <= 1}
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                      material.quantity <= 1
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  
                  <Input
                    type="number"
                    min={1}
                    max={material.availableQuantity}
                    value={material.quantity}
                    onChange={(e) =>
                      handleQuantityChange(material.id, Number(e.target.value))
                    }
                    disabled={disabled}
                    className={cn(
                      "w-16 text-center h-7 text-sm",
                      isInsufficient && "border-rose-300"
                    )}
                  />
                  
                  <button
                    type="button"
                    onClick={() => handleIncrement(material.id)}
                    disabled={disabled || material.quantity >= material.availableQuantity}
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                      material.quantity >= material.availableQuantity
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  
                  <span className="text-xs text-slate-400 w-8">
                    {material.unit}
                  </span>
                </div>

                {/* Стоимость и удаление */}
                <div className="flex items-center gap-3">
                  <div className="text-right min-w-[80px]">
                    <div className="text-sm font-semibold text-slate-900">
                      {itemTotal.toLocaleString("ru-RU")} ₽
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(material.id)}
                    disabled={disabled}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Итого */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-sm text-slate-600">Итого материалы:</span>
            <span className="text-lg font-bold text-slate-900">
              {totalCost.toLocaleString("ru-RU")} ₽
            </span>
          </div>

          {/* Предупреждение о нехватке */}
          {hasInsufficientStock && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <p className="text-sm text-rose-700">
                Некоторых материалов недостаточно на складе. Уменьшите количество или выберите другие материалы.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl">
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Материалы не выбраны</p>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => setPickerOpen(true)}
            disabled={disabled}
            className="mt-1"
          >
            Добавить материал
          </Button>
        </div>
      )}

      {/* Модальное окно выбора */}
      <WarehouseMaterialPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAddMaterial}
        selectedIds={materials.map((m) => m.id)}
        applicationTypeId={applicationTypeId}
      />
    </div>
  );
}
