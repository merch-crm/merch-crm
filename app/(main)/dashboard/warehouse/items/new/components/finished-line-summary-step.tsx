"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AccordionRoot as Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Check,
  Loader2,
  Palette,
  Layers,
  Package,
  AlertTriangle,
} from "lucide-react";

interface GeneratedPosition {
  tempId: string;
  name: string;
  sku: string;
  printName: string;
  colorName: string;
  sizeName: string;
}

interface FinishedLineSummaryStepProps {
  /** Название готовой линейки */
  lineName: string;
  /** Название коллекции */
  collectionName: string;
  /** Название базовой линейки */
  baseLineName: string;
  /** Сгенерированные позиции */
  positions: GeneratedPosition[];
  /** Процесс сохранения */
  isSaving: boolean;
  /** Навигация */
  onBack: () => void;
  onSubmit: () => void;
  /** Ошибки */
  errors?: Record<string, string>;
}

export function FinishedLineSummaryStep({
  lineName,
  collectionName,
  baseLineName,
  positions,
  isSaving,
  onBack,
  onSubmit,
  errors,
}: FinishedLineSummaryStepProps) {
  const [confirmed, setConfirmed] = useState(false);

  // Группируем позиции по принтам
  const positionsByPrint = positions.reduce((acc, pos) => {
    if (!acc[pos.printName]) {
      acc[pos.printName] = [];
    }
    acc[pos.printName].push(pos);
    return acc;
  }, {} as Record<string, GeneratedPosition[]>);

  const printNames = Object.keys(positionsByPrint);

  // Уникальные цвета и размеры
  const uniqueColors = [...new Set(positions.map((p) => p.colorName))];
  const uniqueSizes = [...new Set(positions.map((p) => p.sizeName))];

  return (
    <div className="space-y-3">
      {/* Заголовок */}
      <div>
        <h2 className="text-xl font-semibold">Подтверждение создания</h2>
        <p className="text-muted-foreground mt-1">
          Проверьте данные и подтвердите создание готовой линейки
        </p>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Коллекция</p>
                <p className="font-medium">{collectionName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Базовая линейка</p>
                <p className="font-medium">{baseLineName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Package className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Позиций</p>
                <p className="font-medium text-xl">{positions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Название линейки */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Готовая линейка</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{lineName}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Принты ({printNames.length}):</p>
              <div className="flex flex-wrap gap-1">
                {printNames.slice(0, 5).map((name) => (
                  <Badge key={name} color="gray">
                    {name}
                  </Badge>
                ))}
                {printNames.length > 5 && (
                  <Badge color="purple" variant="outline">+{printNames.length - 5}</Badge>
                )}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs text-muted-foreground mb-1">Цвета ({uniqueColors.length}):</p>
              <div className="flex flex-wrap gap-1">
                {uniqueColors.map((color) => (
                  <Badge key={color} color="purple" variant="outline">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs text-muted-foreground mb-1">Размеры ({uniqueSizes.length}):</p>
              <div className="flex flex-wrap gap-1">
                {uniqueSizes.map((size) => (
                  <Badge key={size} color="purple" variant="outline">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список позиций */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Создаваемые позиции ({positions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {printNames.map((printName) => (
              <AccordionItem key={printName} value={printName}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{printName}</span>
                    <Badge className="ml-2" color="gray">
                      {positionsByPrint[printName].length} позиций
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                    {positionsByPrint[printName].map((pos) => (
                      <div
                        key={pos.tempId}
                        className="p-2 bg-muted/50 rounded text-sm"
                      >
                        <p className="font-medium truncate" title={pos.name}>
                          {pos.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {pos.sku}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Предупреждение */}
      {positions.length > 100 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700">Большое количество позиций</p>
                <p className="text-sm text-muted-foreground">
                  Создание {positions.length} позиций может занять некоторое время.
                  Пожалуйста, не закрывайте страницу до завершения.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Подтверждение */}
      <div className="flex items-start gap-3 p-4 border rounded-lg">
        <Checkbox id="confirm" checked={confirmed} onCheckedChange={(checked) => setConfirmed(checked as boolean)}
        />
        <Label htmlFor="confirm" className="text-sm cursor-pointer">
          Я проверил данные и подтверждаю создание готовой линейки «{lineName}»
          с {positions.length} позициями
        </Label>
      </div>

      {errors?.submit && (
        <p className="text-destructive text-sm">{errors.submit}</p>
      )}

      {/* Навигация */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" color="gray" onClick={onBack} disabled={isSaving}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <Button onClick={onSubmit} disabled={!confirmed || isSaving} className="min-w-[200px]">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Создание...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Создать линейку
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
