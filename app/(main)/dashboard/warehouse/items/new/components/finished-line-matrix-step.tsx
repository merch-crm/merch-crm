"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  Calculator,
  CheckSquare,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MatrixSelection {
  colors: string[];
  sizes: string[];
}

interface FinishedLineMatrixStepProps {
  /** Название коллекции */
  collectionName: string;
  /** Название базовой линейки */
  baseLineName: string;
  /** Количество выбранных принтов */
  selectedPrintsCount: number;
  /** Доступные цвета из базовой линейки */
  availableColors: string[];
  /** Доступные размеры из базовой линейки */
  availableSizes: string[];
  /** Текущий выбор */
  selection: MatrixSelection;
  /** Callback изменения выбора */
  onSelectionChange: (selection: MatrixSelection) => void;
  /** Навигация */
  onBack: () => void;
  onNext: () => void;
  /** Ошибки */
  errors?: Record<string, string>;
}

export function FinishedLineMatrixStep({
  collectionName,
  baseLineName,
  selectedPrintsCount,
  availableColors,
  availableSizes,
  selection,
  onSelectionChange,
  onBack,
  onNext,
  errors,
}: FinishedLineMatrixStepProps) {
  const [activeTab, setActiveTab] = useState<"colors" | "sizes" | "preview">("colors");

  // Подсчёт позиций
  const totalPositions = useMemo(() => {
    return selectedPrintsCount * selection.colors.length * selection.sizes.length;
  }, [selectedPrintsCount, selection.colors.length, selection.sizes.length]);

  // Выбор цветов
  const toggleColor = useCallback((color: string) => {
    const newColors = selection.colors.includes(color)
      ? selection.colors.filter((c) => c !== color)
      : [...selection.colors, color];
    onSelectionChange({ ...selection, colors: newColors });
  }, [selection, onSelectionChange]);

  const toggleAllColors = useCallback(() => {
    const allSelected = selection.colors.length === availableColors.length;
    onSelectionChange({
      ...selection,
      colors: allSelected ? [] : [...availableColors],
    });
  }, [selection, availableColors, onSelectionChange]);

  // Выбор размеров
  const toggleSize = useCallback((size: string) => {
    const newSizes = selection.sizes.includes(size)
      ? selection.sizes.filter((s) => s !== size)
      : [...selection.sizes, size];
    onSelectionChange({ ...selection, sizes: newSizes });
  }, [selection, onSelectionChange]);

  const toggleAllSizes = useCallback(() => {
    const allSelected = selection.sizes.length === availableSizes.length;
    onSelectionChange({
      ...selection,
      sizes: allSelected ? [] : [...availableSizes],
    });
  }, [selection, availableSizes, onSelectionChange]);

  // Можно продолжить?
  const canProceed = selection.colors.length > 0 && selection.sizes.length > 0;

  return (
    <div className="space-y-3">
      {/* Заголовок */}
      <div>
        <h2 className="text-xl font-semibold">Матрица вариантов</h2>
        <p className="text-muted-foreground mt-1">
          Выберите цвета и размеры для создания позиций
        </p>
      </div>

      {/* Статистика */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Коллекция</p>
              <p className="font-medium">{collectionName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Базовая линейка</p>
              <p className="font-medium">{baseLineName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Принтов</p>
              <p className="font-medium">{selectedPrintsCount}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-muted-foreground">Будет создано</p>
              <p className="text-2xl font-bold text-primary">
                {totalPositions} <span className="text-sm font-normal">позиций</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Табы */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="colors" className="gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selection.colors.length > 0 ? "#22c55e" : "#ef4444" }}
            />
            Цвета ({selection.colors.length})
          </TabsTrigger>
          <TabsTrigger value="sizes" className="gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selection.sizes.length > 0 ? "#22c55e" : "#ef4444" }}
            />
            Размеры ({selection.sizes.length})
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            Превью
          </TabsTrigger>
        </TabsList>

        {/* Цвета */}
        <TabsContent value="colors" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Выберите цвета</CardTitle>
                <Button variant="outline" color="neutral" size="sm" onClick={toggleAllColors}>
                  {selection.colors.length === availableColors.length ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Снять все
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Выбрать все
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableColors.map((color) => {
                  const isSelected = selection.colors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-left w-full",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                      onClick={() => toggleColor(color)}
                    >
                      <Checkbox checked={isSelected} />
                      <span className="font-medium">{color}</span>
                    </button>
                  );
                })}
              </div>
              {errors?.colors && (
                <p className="text-destructive text-sm mt-2">{errors.colors}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Размеры */}
        <TabsContent value="sizes" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Выберите размеры</CardTitle>
                <Button variant="outline" color="neutral" size="sm" onClick={toggleAllSizes}>
                  {selection.sizes.length === availableSizes.length ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Снять все
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Выбрать все
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map((size) => {
                  const isSelected = selection.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                      onClick={() => toggleSize(size)}
                    >
                      <Checkbox checked={isSelected} />
                      <span className="font-medium">{size}</span>
                    </button>
                  );
                })}
              </div>
              {errors?.sizes && (
                <p className="text-destructive text-sm mt-2">{errors.sizes}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Превью матрицы */}
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Расчёт позиций
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Параметр</TableHead>
                      <TableHead className="text-right">Количество</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Принтов выбрано</TableCell>
                      <TableCell className="text-right font-medium">
                        {selectedPrintsCount}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Цветов выбрано</TableCell>
                      <TableCell className="text-right font-medium">
                        {selection.colors.length}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Размеров выбрано</TableCell>
                      <TableCell className="text-right font-medium">
                        {selection.sizes.length}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-t-2">
                      <TableCell className="font-semibold">Итого позиций</TableCell>
                      <TableCell className="text-right">
                        <span className="text-2xl font-bold text-primary">
                          {totalPositions}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Формула */}
              <div className="mt-4 p-3 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Формула расчёта:</p>
                <p className="font-mono">
                  {selectedPrintsCount} принтов × {selection.colors.length} цветов × {selection.sizes.length} размеров ={" "}
                  <span className="text-primary font-bold">{totalPositions}</span>
                </p>
              </div>

              {/* Выбранные значения */}
              {selection.colors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Выбранные цвета:</p>
                  <div className="flex flex-wrap gap-1">
                    {selection.colors.map((color) => (
                      <Badge key={color} color="neutral">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selection.sizes.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Выбранные размеры:</p>
                  <div className="flex flex-wrap gap-1">
                    {selection.sizes.map((size) => (
                      <Badge key={size} color="primary" variant="outline">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Навигация */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" color="neutral" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Создать {totalPositions} позиций
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
