/**
 * @fileoverview Секция выбора нанесений для калькуляторов
 * @module calculators/components/PlacementsSection
 */

'use client';

import { useState, useMemo } from 'react';
import { PlacementProduct, SelectedPlacement } from '@/lib/types/placements';
import { PlacementsService } from '@/lib/services/calculators/placements-service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Minus, 
  Plus, 
  X, 
  Search,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface PlacementsSectionProps {
  /** Список доступных продуктов */
  products: PlacementProduct[];
  /** Текущие выбранные нанесения */
  selectedPlacements: SelectedPlacement[];
  /** Обработчик изменения выбора */
  onToggle: (product: PlacementProduct, areaId: string, count: number) => void;
  /** Обработчик полной очистки */
  onClear: () => void;
  /** Состояние загрузки */
  isLoading?: boolean;
}

export function PlacementsSection({
  products,
  selectedPlacements,
  onToggle,
  onClear,
  isLoading = false,
}: PlacementsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Группировка продуктов по типам
  const groupedProducts = useMemo(() => {
    if (!products) return {};
    return PlacementsService.groupByCategory(products);
  }, [products]);

  // Фильтрация продуктов
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || p.type === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [products, searchQuery, activeTab]);

  // Проверка, выбрана ли зона
  const getSelectedCount = (areaId: string) => {
    return selectedPlacements.find((p) => p.areaId === areaId)?.count || 0;
  };

  return (
    <Card className="">
      <div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-xl">
              👕
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Нанесения на изделия</h3>
              <p className="text-sm text-slate-500 font-medium">
                Выберите места нанесения и их количество
              </p>
            </div>
          </div>
          {selectedPlacements.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold rounded-xl"
              onClick={onClear}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Очистить все
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-6 space-y-3">
        {/* Поиск и фильтр */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Поиск по изделиям..."
              className="pl-8 h-8 text-xs bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <ScrollArea className="h-10">
              <TabsList className="h-8 p-0.5 bg-slate-100/50 border overflow-visible inline-flex">
                <TabsTrigger value="all" className="text-xs px-3 h-7">Все</TabsTrigger>
                {Object.keys(groupedProducts).map((type) => (
                  <TabsTrigger key={type} value={type} className="text-xs px-3 h-7">
                    <span className="mr-1.5 opacity-70">
                      {String(PlacementsService.getProductIcon(type) || '')}
                    </span>
                    {String(PlacementsService.getProductIcon(type) || '') !== '📦' ? type : 'Другое'}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Список продуктов */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-slate-200" />
                    <div className="h-5 w-32 rounded bg-slate-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-10 rounded border bg-slate-100/50" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>{String(PlacementsService.getProductIcon(product.type) || '')}</span>
                  <span>{product.name}</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {product.areas.filter(a => a.isActive).map((area) => {
                    const count = getSelectedCount(area.id);
                    const isSelected = count > 0;
                    
                    return (
                      <div 
                        key={area.id}
                        className={`flex flex-col border rounded-lg transition-all ${
                          isSelected 
                            ? 'border-blue-400 bg-blue-50/30' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="p-2 flex items-start justify-between gap-2 overflow-hidden">
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {isSelected && (
                                <CheckCircle2 className="h-3 w-3 text-blue-500 shrink-0" />
                              )}
                              <span className="text-xs font-medium truncate">{area.name}</span>
                            </div>
                            <div className="text-xs text-slate-500 font-bold mt-0.5">
                              {formatCurrency(area.workPrice)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center p-1 px-2 border-t mt-auto">
                          <div className="flex items-center border rounded h-7 bg-white">
                            <button
                              type="button"
                              className="h-full w-7 flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-30"
                              disabled={count <= 0}
                              onClick={() => onToggle(product, area.id, count - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-medium">{count}</span>
                            <button
                              type="button"
                              className="h-full w-7 flex items-center justify-center text-slate-400 hover:text-slate-600"
                              onClick={() => onToggle(product, area.id, count + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          
                          {isSelected && (
                            <button
                              type="button"
                              className="ml-auto text-slate-300 hover:text-red-500 transition-colors"
                              onClick={() => onToggle(product, area.id, 0)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="text-xs">Изделия не найдены</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Summary Footer */}
      {selectedPlacements.length > 0 && (
        <div className="bg-slate-50 border-t p-3">
          <div className="flex flex-wrap gap-1.5">
            {selectedPlacements.map((p) => (
              <Badge 
                key={p.areaId}
                variant="outline" 
                className="bg-white border-blue-100 text-blue-700 text-xs py-0 px-2 h-6 font-medium tracking-tight pr-1"
              >
                {p.count}× {String(p.areaName)} ({String(p.productName)})
                <button 
                  type="button"
                  className="ml-1 hover:bg-red-50 rounded"
                  onClick={() => onToggle({ id: p.productId } as unknown as PlacementProduct, p.areaId, 0)}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// Вспомогательный компонент ScrollArea (кастомная реализация для вкладок)
function ScrollArea({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`overflow-x-auto overflow-y-hidden scrollbar-hide ${className}`}>
      {children}
    </div>
  );
}
