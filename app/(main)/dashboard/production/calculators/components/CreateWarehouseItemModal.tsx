/**
 * @fileoverview Модалка быстрого создания материала на складе
 * @module calculators/components/CreateWarehouseItemModal
 * @audit Создан 2026-03-26
 */

'use client';

import { useState } from 'react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SubmitButton } from '@/components/ui/submit-button';
import {
  CONSUMABLE_CATEGORIES,
  ConsumableCategory,
} from '@/lib/types/consumables';
import { createWarehouseItemForCalculator } from '@/lib/actions/calculators/warehouse';
import { isSuccess } from '@/lib/types/common';

/**
 * Пропсы модалки
 */
interface CreateWarehouseItemModalProps {
  /** Открыта ли модалка */
  isOpen: boolean;
  /** Обработчик закрытия */
  onClose: () => void;
  /** Предустановленная категория */
  defaultCategory?: ConsumableCategory;
  /** Обработчик создания */
  onCreated: (item: {
    id: string;
    name: string;
    price: number;
    unit: string;
    stock: number;
    category: string;
  }) => void;
}

/**
 * Модалка быстрого создания материала на складе
 */
export function CreateWarehouseItemModal({
  isOpen,
  onClose,
  defaultCategory,
  onCreated,
}: CreateWarehouseItemModalProps) {
  // const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    category: defaultCategory || ('ink_cmyk' as ConsumableCategory),
    price: '',
    unit: '',
    stock: '',
    sku: '',
  });

  // Синхронизация категории при открытии
  useState(() => {
    if (isOpen && defaultCategory) {
      setFormData((prev) => ({
        ...prev,
        category: defaultCategory,
        unit: CONSUMABLE_CATEGORIES[defaultCategory]?.unit || '',
      }));
    }
  });

  /**
   * Валидация формы
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Введите корректную цену';
    }
    if (!formData.unit.trim()) {
      newErrors.unit = 'Введите единицу измерения';
    }
    if (!formData.stock || parseFloat(formData.stock) < 0) {
      newErrors.stock = 'Введите корректное количество';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Обработчик отправки
   */
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const result = await createWarehouseItemForCalculator({
        name: formData.name,
        categorySlug: formData.category,
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock: parseFloat(formData.stock),
        sku: formData.sku || undefined,
      });

      if (!isSuccess(result)) {
        toast.error('Ошибка', {
          description: result.error,
        });
        return;
      }

      onCreated(result.data);

      toast.success('Материал создан', {
        description: `"${formData.name}" добавлен на склад`,
      });

      // Сбрасываем форму
      setFormData({
        name: '',
        category: defaultCategory || 'ink_cmyk',
        price: '',
        unit: CONSUMABLE_CATEGORIES[defaultCategory || 'ink_cmyk']?.unit || '',
        stock: '',
        sku: '',
      });

      onClose();
    } catch (_error) {
      toast.error('Ошибка', {
        description: 'Не удалось создать материал',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обработчик смены категории
   */
  const handleCategoryChange = (category: ConsumableCategory) => {
    const categoryInfo = CONSUMABLE_CATEGORIES[category];
    setFormData((prev) => ({
      ...prev,
      category,
      unit: categoryInfo?.unit || prev.unit,
    }));
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Новый материал на складе"
      description="Быстрое добавление материала для использования в калькуляторах"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose} className="rounded-md">
            Отмена
          </Button>
          <SubmitButton
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Создание..."
            className="rounded-md"
          >
            <Save className="mr-2 h-4 w-4" />
            Создать
          </SubmitButton>
        </div>
      }
    >
      <div className="space-y-3 p-6">
        {/* Название */}
        <div className="space-y-2">
          <Label>
            Название <span className="text-destructive">*</span>
          </Label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Например: Белые чернила DTF 1л"
            className="rounded-md"
          />
          {errors.name && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Категория */}
        <div className="space-y-2">
          <Label>Категория</Label>
          <Select
            value={formData.category}
            onChange={(v) => handleCategoryChange(v as ConsumableCategory)}
            options={Object.entries(CONSUMABLE_CATEGORIES).map(([key, value]) => ({
              id: key,
              title: value.label,
            }))}
          />
        </div>

        {/* Цена и единица */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>
              Цена <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="0.00"
                className="rounded-md pr-8"
                min={0}
                step={0.01}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₽
              </span>
            </div>
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Единица <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formData.unit}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, unit: e.target.value }))
              }
              placeholder="мл, г, м²"
              className="rounded-md"
            />
            {errors.unit && (
              <p className="text-xs text-destructive">{errors.unit}</p>
            )}
          </div>
        </div>

        {/* Остаток и SKU */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>
              Остаток <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, stock: e.target.value }))
              }
              placeholder="0"
              className="rounded-md"
              min={0}
            />
            {errors.stock && (
              <p className="text-xs text-destructive">{errors.stock}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Артикул (SKU)</Label>
            <Input
              value={formData.sku}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sku: e.target.value }))
              }
              placeholder="INK-WHITE-001"
              className="rounded-md"
            />
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}

export default CreateWarehouseItemModal;
