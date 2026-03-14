'use client'

import { useCallback, useMemo, useRef, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
// import { useBreadcrumbs } from '@/components/layout/breadcrumbs'
import { 
  Calculator, 
  Save, 
  Copy, 
  AlertCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { formatCount } from '@/lib/pluralize'
import dynamic from "next/dynamic"

// Динамический импорт кнопки PDF
const DownloadPdfButton = dynamic(
    () => import("../components").then((mod) => mod.DownloadPdfButton),
    { ssr: false }
)

// Компоненты
import { CalculatorHeader, CalculatorSettingsModal, HistoryModal } from '../components'
import {
  RollParamsCard,
  PrintGroupsList,
  FilmLayoutCanvas,
  LayoutInfoCard,
  CostSummary,
  ConsumptionCards,
  CostPerPrintTable
} from './components'

// Хуки и утилиты
import { useLayoutCalculator } from './hooks/use-layout-calculator'
import { useDtfState } from './hooks/use-dtf-state'

// Actions
import { 
  saveCalculation,
  getMeterPricing,
  getPlacements,
  getConsumablesConfig,
  getCalculationDetails
} from '../actions'

// Типы
import {
  type MeterPriceTierData,
  type PlacementData,
  type ConsumablesConfigData,
  type PrintGroupInput,
  PRINT_GROUP_COLORS
} from '../types'

interface DtfCalculatorClientProps {
  initialMeterPricing: MeterPriceTierData[]
  initialPlacements: PlacementData[]
  initialConsumables: ConsumablesConfigData | null
}

export const DtfCalculatorClient = memo(function DtfCalculatorClient({
  initialMeterPricing,
  initialPlacements,
  initialConsumables
}: DtfCalculatorClientProps) {
  const { toast } = useToast()
  
  // State Management via useReducer
  const { state, dispatch, setUiFlag } = useDtfState({
    meterPricing: initialMeterPricing,
    placements: initialPlacements,
    consumablesConfig: initialConsumables
  })

  // Destructure state for convenience
  const {
    params: calculatorParams,
    printGroups,
    result,
    meterPricing,
    placements,
    consumablesConfig,
    isCalculating,
    isSaving,
    calculationError,
    savedCalculationNumber,
    isSettingsOpen,
    isHistoryOpen
  } = state

  // Ref для Canvas (для экспорта в PDF)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Хук расчёта
  const calculatedResultFromHook = useLayoutCalculator({
    groups: printGroups,
    params: calculatorParams,
    meterPricing,
    placements,
    consumablesConfig,
    applicationType: 'dtf'
  })

  // Фильтрованные группы (заполненные)
  const filledGroups = useMemo(() => 
    printGroups.filter(g => g.widthMm > 0 && g.heightMm > 0 && g.quantity > 0),
    [printGroups]
  )

  // Обработчики параметров
  const handleParamsChange = useCallback((updates: Partial<typeof calculatorParams>) => {
    dispatch({ type: 'UPDATE_PARAMS', payload: updates })
  }, [dispatch])

  // Обработчики групп принтов
  const handleGroupsChange = useCallback((newGroups: PrintGroupInput[]) => {
    dispatch({ type: 'SET_GROUPS', payload: newGroups })
  }, [dispatch])

  // Расчёт
  const handleCalculate = useCallback(async () => {
    if (filledGroups.length === 0) {
      toast('Добавьте хотя бы один принт с размерами', 'destructive')
      return
    }

    setUiFlag('isCalculating', true)
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // Имитируем небольшую задержку для UI-фидбека
      await new Promise(resolve => setTimeout(resolve, 300))
      
      if (calculatedResultFromHook) {
        dispatch({ type: 'SET_RESULT', payload: calculatedResultFromHook })
        toast('Расчёт выполнен', 'success')
      } else {
        throw new Error('Ошибка расчета')
      }
    } catch (_error) {
      dispatch({ type: 'SET_ERROR', payload: 'Ошибка при расчёте' })
      toast('Не удалось выполнить расчёт', 'destructive')
    } finally {
      setUiFlag('isCalculating', false)
    }
  }, [filledGroups, calculatedResultFromHook, toast, setUiFlag, dispatch])

  // Сохранение
  const handleSave = useCallback(async () => {
    if (!result) return

    setUiFlag('isSaving', true)

    try {
      const saveResult = await saveCalculation({
        applicationType: 'dtf',
        rollWidthMm: calculatorParams.rollWidthMm,
        edgeMarginMm: calculatorParams.edgeMarginMm,
        printGapMm: calculatorParams.printGapMm,
        groups: filledGroups.map((g, i) => ({
          name: g.name || `Принт ${i + 1}`,
          widthMm: g.widthMm,
          heightMm: g.heightMm,
          quantity: g.quantity,
          placementId: g.placementId,
          color: g.color || PRINT_GROUP_COLORS[i % PRINT_GROUP_COLORS.length]
        }))
      })

      if (saveResult.success && 'data' in saveResult && saveResult.data) {
        dispatch({ type: 'SET_SAVED_NUMBER', payload: saveResult.data.calculationNumber })
        toast(`Расчёт сохранён под номером ${saveResult.data.calculationNumber}`, 'success')
      } else {
        throw new Error(!saveResult.success && 'error' in saveResult ? String(saveResult.error) : 'Ошибка сохранения')
      }
    } catch (_error) {
      toast('Не удалось сохранить расчёт', 'destructive')
    } finally {
      setUiFlag('isSaving', false)
    }
  }, [result, calculatorParams, filledGroups, toast, setUiFlag, dispatch])

  // Копирование результата
  const handleCopyResult = useCallback(async () => {
    if (!result) return

    const text = [
      `DTF-печать | Расчёт себестоимости`,
      savedCalculationNumber ? `№ ${savedCalculationNumber}` : '',
      ``,
      `Параметры:`,
      `• Ширина рулона: ${calculatorParams.rollWidthMm} мм`,
      `• Отступ: ${calculatorParams.edgeMarginMm} мм`,
      `• Зазор: ${calculatorParams.printGapMm} мм`,
      ``,
      `Итоги:`,
      `• ${formatCount(result.totalPrints, 'принт', 'принта', 'принтов')}`,
      `• Длина: ${result.totalLengthM.toFixed(2)} м`,
      `• КПД: ${result.efficiencyPercent.toFixed(1)}%`,
      `• Себестоимость: ${formatCurrency(result.totalCost)}`,
      `• Средняя цена за принт: ${formatCurrency(result.avgCostPerPrint)}`,
      ``,
      `Детализация:`,
      ...result.sections.map(s => 
        `• ${s.name}: ${formatCount(s.quantity, 'штука', 'штуки', 'штук')} × ${formatCurrency(s.costPerPrint)} = ${formatCurrency(s.sectionCost)}`
      )
    ].filter(Boolean).join('\n')

    try {
      await navigator.clipboard.writeText(text)
      toast('Результат расчёта скопирована в буфер обмена', 'success')
    } catch (_error) {
      toast('Не удалось скопировать', 'destructive')
    }
  }, [result, calculatorParams, savedCalculationNumber, toast])

  // Обновление настроек
  const handleSettingsUpdated = useCallback(async () => {
    try {
      const [newPricingRes, newPlacementsRes, newConsumablesRes] = await Promise.all([
        getMeterPricing('dtf'),
        getPlacements('dtf'),
        getConsumablesConfig('dtf')
      ])

      if (newPricingRes.success) dispatch({ type: 'SET_METER_PRICING', payload: newPricingRes.data })
      if (newPlacementsRes.success) dispatch({ type: 'SET_PLACEMENTS', payload: newPlacementsRes.data })
      if (newConsumablesRes.success) dispatch({ type: 'SET_CONSUMABLES', payload: newConsumablesRes.data })

      if (result) {
        dispatch({ type: 'SET_RESULT', payload: null })
        toast('Настройки обновлены. Пересчитайте для применения новых цен', 'info')
      }
    } catch (_error) {
      toast('Не удалось загрузить обновлённые настройки', 'destructive')
    }
  }, [result, toast, dispatch])

  // Обработчик выбора из истории
  const handleSelectFromHistory = useCallback(async (item: { id: string }) => {
    try {
      const res = await getCalculationDetails(item.id)
      if (res.success && res.data) {
        const { calculation, groups } = res.data
        
        const restoredParams = {
          applicationType: 'dtf',
          rollWidthMm: calculation.rollWidthMm || 600,
          edgeMarginMm: calculation.edgeMarginMm || 5,
          printGapMm: calculation.printGapMm || 5
        }
        
        const restoredGroups = groups.map((g, i) => ({
          id: crypto.randomUUID(),
          name: g.name || '',
          widthMm: g.widthMm,
          heightMm: g.heightMm,
          quantity: g.quantity,
          placementId: g.placementId || null,
          color: g.color || PRINT_GROUP_COLORS[i % PRINT_GROUP_COLORS.length]
        }))
        
        dispatch({ 
          type: 'LOAD_CALCULATION', 
          payload: { 
            params: restoredParams as typeof calculatorParams, 
            groups: restoredGroups, 
            number: calculation.calculationNumber 
          } 
        })
        
        toast(`Расчёт №${calculation.calculationNumber} загружен`, 'success')
      }
    } catch (_error) {
      toast('Ошибка загрузки деталей расчёта', 'destructive')
    }
  }, [toast, dispatch])

  return (
    <div className="space-y-3">
      {/* Заголовок */}
      <CalculatorHeader
        applicationType="dtf"
        onSettingsClick={() => setUiFlag('isSettingsOpen', true)}
        onHistoryClick={() => setUiFlag('isHistoryOpen', true)}
      />

      {/* Параметры рулона */}
      <RollParamsCard
        params={calculatorParams}
        onChange={handleParamsChange}
      />

      {/* Список принтов */}
      <PrintGroupsList
        groups={printGroups}
        onChange={handleGroupsChange}
        placements={placements}
      />

      {/* Кнопки действий */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleCalculate}
          disabled={isCalculating || filledGroups.length === 0}
          className="flex-1 sm:flex-none animate-in fade-in duration-500"
        >
          {isCalculating ? (
            <Spinner className="w-4 h-4 mr-2" />
          ) : (
            <Calculator className="w-4 h-4 mr-2" />
          )}
          <span className="hidden sm:inline">Рассчитать раскладку</span>
          <span className="sm:hidden">Рассчитать</span>
        </Button>

        {result && (
          <>
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
              className="animate-in fade-in duration-500"
            >
              {isSaving ? (
                <Spinner className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              <span className="hidden sm:inline">Сохранить</span>
            </Button>

            <DownloadPdfButton
              result={result}
              params={calculatorParams}
              applicationType="dtf"
              calculationNumber={savedCalculationNumber}
              canvasRef={canvasRef}
            />

            <Button
              variant="ghost"
              onClick={handleCopyResult}
              className="animate-in fade-in duration-500"
            >
              <Copy className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Копировать</span>
            </Button>
          </>
        )}
      </div>

      {/* Ошибка расчёта */}
      {calculationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{calculationError}</span>
          </div>
        </div>
      )}

      {/* Результаты */}
      {result && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Номер расчёта */}
          {savedCalculationNumber && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                № {savedCalculationNumber}
              </Badge>
              <span className="text-sm text-slate-500">Расчёт сохранён</span>
            </div>
          )}

          {/* Итоговая стоимость */}
          <CostSummary result={result} />

          {/* Визуализация раскладки */}
          <FilmLayoutCanvas
            ref={canvasRef}
            sections={result.sections}
            totalLengthMm={result.totalLengthM * 1000}
            rollWidthMm={calculatorParams.rollWidthMm}
            edgeMarginMm={calculatorParams.edgeMarginMm}
            printGapMm={calculatorParams.printGapMm}
          />

          {/* Информация о раскладке */}
          <LayoutInfoCard 
            result={result} 
            rollWidthMm={calculatorParams.rollWidthMm}
          />

          {/* Таблица себестоимости по принтам */}
          <CostPerPrintTable sections={result.sections} />

          {/* Расход материалов */}
          <ConsumptionCards consumption={result.consumption} />
        </div>
      )}

      {/* Модальное окно настроек */}
      <CalculatorSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setUiFlag('isSettingsOpen', false)}
        applicationType="dtf"
        initialMeterPricing={meterPricing}
        initialPlacements={placements}
        initialConsumables={consumablesConfig}
        onSettingsUpdated={handleSettingsUpdated}
      />

      {/* Модальное окно истории */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setUiFlag('isHistoryOpen', false)}
        applicationType="dtf"
        onSelect={handleSelectFromHistory}
      />
    </div>
  )
})
