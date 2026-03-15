"use client"

import { useCallback, useMemo, memo, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { 
  Calculator, 
  Save, 
  Copy, 
  AlertCircle,
  Scissors,
  Sparkles,
  Percent,
  History,
  Loader2,
  Shirt
} from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { useToast } from '@/components/ui/toast'
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context"

// Компоненты
import { CalculationsHistory, WarehouseMaterialsList } from '../components'
import {
  DesignManager,
  EmbroideryOrderCard,
  EmbroideryGarmentSelector,
  EmbroideryResultSummary,
  EmbroideryCostBreakdown,
  ThreadConsumptionCard,
  EmbroideryQuantityDiscountInfo
} from './components'

// Хуки
import { useEmbroideryCalculator } from './hooks/use-embroidery-calculator'
import { useEmbroideryState } from './hooks/use-embroidery-state'

// Типы
import {
  type EmbroideryDesign,
  type EmbroideryPrintInput,
  EMBROIDERY_QUANTITY_DISCOUNTS
} from '../embroidery-types'
import type { SelectedMaterial } from '../../components/warehouse-materials-list'

import { saveEmbroideryCalculation } from '../actions'

export const EmbroideryCalculatorClient = memo(function EmbroideryCalculatorClient() {
  const { toast } = useToast()
  const { setCustomTrail } = useBreadcrumbs()
  const { state, dispatch, setUi } = useEmbroideryState()

  const {
    designs,
    orders,
    materials,
    result,
    calculationError,
    isCalculating,
    isSaving,
    isCopying,
    showHistory,
    savedCalculationInfo
  } = state

  useEffect(() => {
    setCustomTrail([
      { label: "Главная", href: "/dashboard" },
      { label: "Производство", href: "/dashboard/production" },
      { label: "Калькуляторы", href: "/dashboard/production/calculators" },
      { label: "Вышивка", href: "/dashboard/production/calculators/embroidery" },
    ]);
    return () => setCustomTrail(null);
  }, [setCustomTrail]);

  // Хук расчёта
  const calculatedResult = useEmbroideryCalculator(designs, orders)

  // Статистика для превью
  const stats = useMemo(() => {
    const totalQuantity = orders.reduce((sum: number, o: EmbroideryPrintInput) => sum + o.quantity, 0)
    const totalStitches = orders.reduce((sum: number, order: EmbroideryPrintInput) => {
      return sum + order.positions.reduce((pSum: number, pos: { designId: string }) => {
        const design = designs.find((d: EmbroideryDesign) => d.id === pos.designId)
        return pSum + (design?.stitchCount || 0) * order.quantity
      }, 0)
    }, 0)
    
    const discountTier = [...EMBROIDERY_QUANTITY_DISCOUNTS]
      .sort((a, b) => b.minQuantity - a.minQuantity)
      .find(d => totalQuantity >= d.minQuantity)
    
    return {
      designsCount: (designs || []).length,
      ordersCount: (orders || []).length,
      totalQuantity,
      totalStitches,
      discountPercent: discountTier ? discountTier.discount : 0
    }
  }, [designs, orders])

  // Обработчики дизайнов
  const handleAddDesign = useCallback((design: EmbroideryDesign) => {
    dispatch({ type: 'ADD_DESIGN', payload: design })
  }, [dispatch])

  const handleUpdateDesign = useCallback((designId: string, updates: Partial<EmbroideryDesign>) => {
    dispatch({ type: 'UPDATE_DESIGN', payload: { id: designId, updates } })
  }, [dispatch])

  const handleDeleteDesign = useCallback((designId: string) => {
    dispatch({ type: 'DELETE_DESIGN', payload: designId })
  }, [dispatch])

  // Обработчики заказов
  const handleAddOrder = useCallback((garmentId: string) => {
    const newOrder: EmbroideryPrintInput = {
      id: crypto.randomUUID(),
      garmentId,
      quantity: 10,
      positions: []
    }
    dispatch({ type: 'ADD_ORDER', payload: newOrder })
  }, [dispatch])

  const handleUpdateOrder = useCallback((orderId: string, updates: Partial<EmbroideryPrintInput>) => {
    dispatch({ type: 'UPDATE_ORDER', payload: { id: orderId, updates } })
  }, [dispatch])

  const handleDeleteOrder = useCallback((orderId: string) => {
    dispatch({ type: 'DELETE_ORDER', payload: orderId })
  }, [dispatch])

  const handleDuplicateOrder = useCallback((orderId: string) => {
    const orderToDuplicate = orders.find((o: EmbroideryPrintInput) => o.id === orderId)
    if (!orderToDuplicate) return

    dispatch({ type: 'DUPLICATE_ORDER', payload: {
      ...orderToDuplicate,
      id: crypto.randomUUID()
    }})
  }, [orders, dispatch])

  const handleUpdateMaterials = useCallback((newMaterials: SelectedMaterial[]) => {
    dispatch({ type: 'SET_MATERIALS', payload: newMaterials })
  }, [dispatch])

  // Расчёт
  const handleCalculate = useCallback(async () => {
    if (designs.length === 0) {
      toast('Добавьте хотя бы один дизайн вышивки', 'destructive')
      return
    }

    const validOrders = (orders || []).filter((o: EmbroideryPrintInput) => o.positions.length > 0 && o.quantity > 0)
    
    if (validOrders.length === 0) {
      toast('Добавьте хотя бы один заказ с позицией вышивки', 'destructive')
      return
    }

    setUi('isCalculating', true)
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // Визуальная пауза
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (calculatedResult) {
        dispatch({ type: 'SET_RESULT', payload: calculatedResult })
        toast(`Расчёт выполнен: ${formatCurrency(calculatedResult.totalCost)}`, 'success')
      }
    } catch (_error) {
      dispatch({ type: 'SET_ERROR', payload: 'Ошибка при расчёте' })
      toast('Ошибка расчёта', 'destructive')
    } finally {
      setUi('isCalculating', false)
    }
  }, [designs, orders, calculatedResult, toast, setUi, dispatch])

  // Сохранение
  const handleSave = useCallback(async () => {
    if (!result) return
    
    setUi('isSaving', true)
    try {
      const resp = await saveEmbroideryCalculation({
        designs,
        orders,
        result: {
          ...result,
          avgCostPerItem: result.avgCostPerItem || 0,
          threadConsumption: {
            totalThreadMeters: result.totalThreadConsumption
          },
          materials: result.materials,
          materialsCost: result.materialsCost
        },
        notes: ''
      })
      
      if (resp.success && resp.data) {
        dispatch({ type: 'SET_SAVED_INFO', payload: {
          id: resp.data.id,
          number: resp.data.calculationNumber
        }})
        toast(`Расчёт сохранён: ${resp.data.calculationNumber}`, 'success')
      } else {
        toast(!resp.success && 'error' in resp ? String(resp.error) : 'Ошибка при сохранении', 'destructive')
      }
    } catch (_error) {
      toast('Системная ошибка при сохранении', 'destructive')
    } finally {
      setUi('isSaving', false)
    }
  }, [result, designs, orders, toast, setUi, dispatch])

  // Копирование
  const handleCopy = useCallback(async () => {
    if (!result) return

    setUi('isCopying', true)
    try {
      const text = [
        '📋 Расчёт вышивки',
        savedCalculationInfo ? `№ ${savedCalculationInfo.number}` : '',
        '',
        `Изделий: ${result.totalQuantity} шт.`,
        `Всего стежков: ${result.totalStitches.toLocaleString('ru-RU')}`,
        '',
        '💰 Стоимость:',
        `• Изделия: ${formatCurrency(result.totalGarmentCost)}`,
        `• Дигитайзинг: ${formatCurrency(result.totalDigitizingCost)}`,
        `• Вышивка: ${formatCurrency(result.totalEmbroideryCost)}`,
        `• Настройка (Setup): ${formatCurrency(result.totalSetupCost)}`,
        result.totalExtraColorsCost > 0 ? `• Доп. цвета: ${formatCurrency(result.totalExtraColorsCost)}` : null,
        result.discountAmount > 0 ? `• Скидка (${result.discountPercent}%): -${formatCurrency(result.discountAmount)}` : null,
        '',
        `✅ Итого: ${formatCurrency(result.totalCost)}`,
        `📊 За единицу: ${formatCurrency(result.avgCostPerItem)}`,
      ].filter(Boolean).join('\n')

      await navigator.clipboard.writeText(text)
      toast('Скопировано в буфер обмена', 'success')
    } catch (_error) {
      toast('Не удалось скопировать', 'destructive')
    } finally {
      setUi('isCopying', false)
    }
  }, [result, savedCalculationInfo, toast, setUi])

  return (
    <div className="flex flex-col gap-3 pb-20">
      {/* Шапка */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
               <Scissors className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">Вышивка</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-md">
            Профессиональный расчёт стоимости машинной вышивки с учётом стежков, плотности и тиража.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setUi('showHistory', !showHistory)}
            className="rounded-2xl border-slate-200 h-12 px-6 font-bold hover:bg-slate-50 transition-all"
          >
            <History className="mr-2 h-4 w-4" />
            {showHistory ? 'Скрыть историю' : 'История расчётов'}
          </Button>
          
          <Button 
            onClick={handleSave} 
            disabled={!result || isSaving}
            className="bg-slate-900 hover:bg-black text-white rounded-2xl h-12 px-8 shadow-xl shadow-slate-200 transition-all font-black"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {isSaving ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ РАСЧЁТ'}
          </Button>
        </div>
      </div>

      {showHistory && (
        <Card className="border-pink-100 bg-pink-50/20 overflow-hidden rounded-[32px] border-2">
          <div className="p-8">
            <h3 className="text-xl font-black mb-6 text-pink-900 flex items-center gap-3">
               <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600">
                  <History className="w-4 h-4" />
               </div>
               Последние расчёты вышивки
            </h3>
            <CalculationsHistory applicationType="embroidery" />
          </div>
        </Card>
      )}

      {/* Основной контент */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Левая панель - Ввод данных */}
        <div className="xl:col-span-8 space-y-3">
          
          {/* Статистика текущего сеанса */}
          {(designs.length > 0 || (orders || []).length > 0) && (
            <Card className="p-6 border-slate-100 bg-white shadow-sm rounded-3xl border-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-black text-slate-400">Дизайнов</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.designsCount}</p>
                </div>
                <div className="w-px h-12 bg-slate-100 hidden sm:block" />
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-black text-slate-400">Общий тираж</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.totalQuantity}</p>
                </div>
                <div className="w-px h-12 bg-slate-100 hidden sm:block" />
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-black text-slate-400">Всего стежков</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.totalStitches.toLocaleString()}</p>
                </div>
                {stats.discountPercent > 0 && (
                  <Badge className="bg-green-500 text-white hover:bg-green-600 border-none ml-auto py-2.5 px-5 rounded-2xl text-xs font-black shadow-lg shadow-green-100">
                    <Percent className="w-4 h-4 mr-2" />
                    Тиражная скидка {stats.discountPercent}%
                  </Badge>
                )}
              </div>
            </Card>
          )}

          {/* Менеджер макетов */}
          <DesignManager
            designs={designs}
            onAdd={handleAddDesign}
            onUpdate={handleUpdateDesign}
            onDelete={handleDeleteDesign}
          />

          {/* Список изделий в заказе */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                     <Shirt className="w-5 h-5" />
                  </div>
                  Спецификация изделий
               </h2>
               {(orders || []).length > 0 && (
                  <Badge variant="secondary" className="bg-pink-50 text-pink-600 font-black px-4 py-1.5 rounded-xl border-pink-100">
                     {(orders || []).length} поз.
                  </Badge>
               )}
            </div>

            {(orders || []).map((order: EmbroideryPrintInput, index: number) => (
              <EmbroideryOrderCard
                key={order.id}
                order={order}
                index={index}
                designs={designs}
                onUpdate={(updates: Partial<EmbroideryPrintInput>) => handleUpdateOrder(order.id, updates)}
                onDelete={() => handleDeleteOrder(order.id)}
                onDuplicate={() => handleDuplicateOrder(order.id)}
              />
            ))}

            <EmbroideryGarmentSelector 
               onSelect={handleAddOrder} 
               disabled={designs.length === 0}
            />

          {/* Доп. материалы со склада */}
          {(designs.length > 0 || (orders || []).length > 0) && (
            <div className="mt-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <Calculator className="w-5 h-5" />
                </div>
                Дополнительные материалы
              </h2>
              <WarehouseMaterialsList
                materials={materials}
                onChange={handleUpdateMaterials}
              />
            </div>
          )}
          </div>

          {designs.length === 0 && (orders || []).length === 0 && (
            <Card className="p-24 text-center border-dashed border-2 border-slate-200 bg-slate-50/30 rounded-[48px]">
              <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-200">
                 <Sparkles className="w-12 h-12 text-pink-500 animate-pulse" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Создайте первый расчёт</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 text-lg">
                Добавьте параметры дизайна для вышивки и выберите изделия из каталога. Мы мгновенно рассчитаем себестоимость.
              </p>
              <Button 
                onClick={() => handleAddDesign({
                  id: crypto.randomUUID(),
                  name: "Новый дизайн",
                  widthMm: 80,
                  heightMm: 80,
                  stitchCount: 6500,
                  colorsCount: 3,
                  density: "medium",
                  threadType: "polyester",
                  hasDigitizing: true
                })}
                className="bg-pink-600 hover:bg-pink-700 text-white rounded-2xl h-14 px-10 font-black text-lg shadow-xl shadow-pink-100"
              >
                БЫСТРЫЙ СТАРТ
              </Button>
            </Card>
          )}

          {/* Кнопки действий */}
          {(designs.length > 0 || (orders || []).length > 0) && (
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                onClick={handleCalculate}
                disabled={isCalculating || designs.length === 0 || stats.ordersCount === 0}
                className="flex-1 h-16 text-xl font-black bg-slate-900 hover:bg-black text-white rounded-[24px] shadow-2xl shadow-slate-200 transition-all active:scale-95 group"
              >
                {isCalculating ? (
                  <Spinner className="w-6 h-6 mr-3" />
                ) : (
                  <Calculator className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                )}
                {isCalculating ? 'ВЫПОЛНЯЕТСЯ РАСЧЁТ...' : 'РАССЧИТАТЬ СТОИМОСТЬ'}
              </Button>

              {result && (
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  disabled={isCopying}
                  className="h-16 px-10 border-2 border-slate-200 rounded-[24px] font-black hover:bg-slate-50 text-slate-700 transition-all"
                >
                  {isCopying ? (
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  ) : (
                    <Copy className="w-6 h-6 mr-3" />
                  )}
                  КОПИРОВАТЬ
                </Button>
              )}
            </div>
          )}

          {calculationError && (
            <Card className="p-6 bg-red-50 border-red-200 shadow-sm rounded-3xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-8 h-8 shrink-0" />
                <span className="font-black text-lg">{calculationError}</span>
              </div>
            </Card>
          )}
        </div>

        {/* Правая панель - Результаты */}
        <div className="xl:col-span-4 space-y-3">
          {result ? (
            <div className="sticky top-8 space-y-3 animate-in fade-in slide-in-from-right-8 duration-700">
               <EmbroideryResultSummary result={result} />
               <EmbroideryCostBreakdown result={result} />
               <ThreadConsumptionCard result={result} />
               <EmbroideryQuantityDiscountInfo currentQuantity={result.totalQuantity} />
            </div>
          ) : (
            <div className="sticky top-8 space-y-3">
               <Card className="p-10 text-center border-2 border-slate-100 bg-slate-50/50 rounded-[32px] opacity-60">
                  <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-xs">Результаты появятся после расчёта</p>
               </Card>
               <EmbroideryQuantityDiscountInfo currentQuantity={stats.totalQuantity} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
