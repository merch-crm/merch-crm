"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Palette,
  Layers,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PrintCollection {
  id: string;
  name: string;
  coverImage: string | null;
  designsCount: number;
}

interface BaseLine {
  id: string;
  name: string;
  itemsCount: number;
  colors: string[];
  sizes: string[];
}

interface FinishedLineSelectStepProps {
  /** Доступные коллекции принтов */
  collections: PrintCollection[];
  /** Доступные базовые линейки для категории */
  baseLines: BaseLine[];
  /** Выбранная коллекция */
  selectedCollectionId: string | null;
  /** Выбранная базовая линейка */
  selectedBaseLineId: string | null;
  /** Загрузка данных */
  isLoading: boolean;
  /** Callback выбора коллекции */
  onCollectionChange: (id: string | null) => void;
  /** Callback выбора базовой линейки */
  onBaseLineChange: (id: string | null) => void;
  /** Навигация */
  onBack: () => void;
  onNext: () => void;
  /** Ошибки */
  errors?: Record<string, string>;
}

export function FinishedLineSelectStep({
  collections,
  baseLines,
  selectedCollectionId,
  selectedBaseLineId,
  isLoading,
  onCollectionChange,
  onBaseLineChange,
  onBack,
  onNext,
  errors,
}: FinishedLineSelectStepProps) {
  const [collectionSearch, setCollectionSearch] = useState("");

  // Фильтруем коллекции по поиску
  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(collectionSearch.toLowerCase())
  );

  // Выбранная коллекция
  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);

  // Выбранная базовая линейка
  const selectedBaseLine = baseLines.find((l) => l.id === selectedBaseLineId);

  // Проверка возможности продолжить
  const canProceed = selectedCollectionId && selectedBaseLineId;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Заголовок */}
      <div>
        <h2 className="text-xl font-semibold">Выбор коллекции и базы</h2>
        <p className="text-muted-foreground mt-1">
          Выберите коллекцию принтов и базовую линейку для создания готовой продукции
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Выбор коллекции */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Коллекция принтов
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Поиск коллекции..." value={collectionSearch} onChange={(e) => setCollectionSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Список коллекций */}
            {collections.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Нет доступных коллекций принтов
                </p>
                <Button color="system" variant="link" className="mt-2" onClick={() => window.open("/dashboard/design/prints", "_blank")}
                >
                  Создать коллекцию
                </Button>
              </div>
            ) : filteredCollections.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Коллекции не найдены
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {filteredCollections.map((collection) => (
                  <Button
                    key={collection.id}
                    variant="ghost"
                    onClick={() => onCollectionChange(collection.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors w-full text-left h-auto",
                      selectedCollectionId === collection.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50"
                    )}
                    aria-label={`Выбрать коллекцию ${collection.name}`}
                  >
                    {/* Обложка */}
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {collection.coverImage ? (
                        <Image src={collection.coverImage} alt={collection.name} width={48} height={48} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Информация */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-foreground">{collection.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {collection.designsCount} принтов
                      </p>
                    </div>

                    {/* Индикатор выбора */}
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                        selectedCollectionId === collection.id
                          ? "border-primary"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {selectedCollectionId === collection.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {errors?.collection && (
              <p className="text-destructive text-sm">{errors.collection}</p>
            )}
          </CardContent>
        </Card>

        {/* Выбор базовой линейки */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Базовая линейка
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {baseLines.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Нет базовых линеек в этой категории
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Сначала создайте базовую линейку
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {baseLines.map((line) => (
                  <Button
                    key={line.id}
                    variant="ghost"
                    onClick={() => onBaseLineChange(line.id)}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-colors w-full text-left h-auto block hover:bg-slate-50",
                      selectedBaseLineId === line.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50"
                    )}
                    aria-label={`Выбрать базовую линейку ${line.name}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">{line.name}</p>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                          selectedBaseLineId === line.id
                            ? "border-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {selectedBaseLineId === line.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      {line.itemsCount} позиций в линейке
                    </p>

                    {/* Доступные цвета */}
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Цвета:</p>
                      <div className="flex flex-wrap gap-1">
                        {line.colors.slice(0, 6).map((color) => (
                          <Badge key={color} className="text-xs" color="neutral">
                            {color}
                          </Badge>
                        ))}
                        {line.colors.length > 6 && (
                          <Badge color="primary" variant="outline" className="text-xs">
                            +{line.colors.length - 6}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Доступные размеры */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Размеры:</p>
                      <div className="flex flex-wrap gap-1">
                        {line.sizes.map((size) => (
                          <Badge key={size} color="primary" variant="outline" className="text-xs">
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {errors?.baseLine && (
              <p className="text-destructive text-sm">{errors.baseLine}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Сводка выбора */}
      {selectedCollection && selectedBaseLine && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Будет создано:</p>
                <p className="font-medium">
                  Готовая линейка «{selectedCollection.name}» на базе «{selectedBaseLine.name}»
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Максимум позиций:</p>
                <p className="font-medium">
                  {selectedCollection.designsCount} × {selectedBaseLine.colors.length} × {selectedBaseLine.sizes.length} ={" "}
                  <span className="text-primary">
                    {selectedCollection.designsCount * selectedBaseLine.colors.length * selectedBaseLine.sizes.length}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Навигация */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" color="neutral" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Далее
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
