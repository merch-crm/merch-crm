"use client";

import { memo } from "react";
import {
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, type SelectOption } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

import { QuickSizeButtons } from "./quick-size-buttons";
import { ImageUploader } from "./image-uploader";
import {
  type PrintGroupInput,
  type PlacementData,
  isPrintGroupFilled,
} from "../../types";

interface PrintGroupCardProps {
  group: PrintGroupInput;
  index: number;
  placements: PlacementData[];
  onUpdate: (updates: Partial<PrintGroupInput>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const PrintGroupCard = memo(function PrintGroupCard({
  group,
  index,
  placements,
  onUpdate,
  onRemove,
  canRemove,
}: PrintGroupCardProps) {
  const isFilled = isPrintGroupFilled(group);

  // Опции нанесений для Select
  const placementOptions: SelectOption[] = placements.map((p) => ({
    id: p.id,
    title: p.name,
    description: p.widthMm > 0
      ? `${p.widthMm}×${p.heightMm} мм • ${formatCurrency(p.workPrice)}`
      : formatCurrency(p.workPrice),
  }));

  // Обработчик изменения размеров из изображения
  const handleImageSizeDetected = (widthMm: number, heightMm: number, fileName: string) => {
    onUpdate({
      widthMm,
      heightMm,
      name: group.name || fileName,
    });
  };

  return (
    <Card className={cn( "transition-all duration-200", isFilled && "ring-2 ring-offset-2", )} style={{ borderColor: group.color + "40", ...(isFilled && { "--tw-ring-color": group.color + "40" } as React.CSSProperties), }}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Left: Index & Actions */}
          <div className="flex flex-col items-center gap-2 pt-1">
            {/* Color Index */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm cursor-grab active:cursor-grabbing"
              style={{ backgroundColor: group.color }}
            >
              {index + 1}
            </div>

            {/* Delete Button */}
            {canRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Удалить принт"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right: Form */}
          <div className="flex-1 space-y-3">
            {/* Row 1: Name & Image */}
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="ml-1">Название принта <span className="text-red-500">*</span></Label>
                <Input placeholder="Например: Логотип на грудь" value={group.name} onChange={(e) => onUpdate({ name: e.target.value })}
                />
              </div>

              {/* Image Uploader */}
              <ImageUploader imagePreview={group.imagePreview} onImageChange={(preview) => onUpdate({ imagePreview: preview })}
                onSizeDetected={handleImageSizeDetected}
              />
            </div>

            {/* Row 2: Dimensions & Quantity */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="ml-1">Ширина (мм)</Label>
                <Input type="number" placeholder="100" value={group.widthMm || ""} onChange={(e) =>
                    onUpdate({ widthMm: parseInt(e.target.value, 10) || 0 })
                  }
                  min={1}
                  max={2000}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="ml-1">Высота (мм)</Label>
                <Input type="number" placeholder="100" value={group.heightMm || ""} onChange={(e) =>
                    onUpdate({ heightMm: parseInt(e.target.value, 10) || 0 })
                  }
                  min={1}
                  max={2000}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="ml-1">Количество</Label>
                <Input type="number" placeholder="10" value={group.quantity || ""} onChange={(e) =>
                    onUpdate({ quantity: parseInt(e.target.value, 10) || 0 })
                  }
                  min={1}
                  max={100000}
                />
              </div>
            </div>

            {/* Row 3: Quick Sizes */}
            <QuickSizeButtons currentWidth={group.widthMm} currentHeight={group.heightMm} onSelect={(widthMm, heightMm) => onUpdate({ widthMm, heightMm })}
            />

            {/* Row 4: Placement */}
            <Select label="Нанесение" options={placementOptions} value={group.placementId || ""} onChange={(value) => onUpdate({ placementId: value || null })}
              placeholder="Выберите тип нанесения"
              clearable
            />

            {/* Info: Calculated area */}
            {group.widthMm > 0 && group.heightMm > 0 && group.quantity > 0 && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 text-sm">
                <span className="text-muted-foreground">Площадь принтов:</span>
                <span className="font-bold">
                  {((group.widthMm * group.heightMm * group.quantity) / 1_000_000).toFixed(4)} м²
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
