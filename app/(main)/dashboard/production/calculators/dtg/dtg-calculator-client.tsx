'use client'

import { useEffect, useCallback, memo } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { 
  Save, 
  Trash2, 
  Calculator as CalcIcon,
  Plus,
  History,
  Settings
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'

import { 
  type ConsumablesConfigData,
  type MeterPriceTierData,
  type PlacementData,
} from '../types'

import {
  type DtgPrintInput,
  DTG_GARMENTS,
  DTG_PRINT_POSITIONS
} from '../dtg-types'

import { 
  GarmentSelector, 
  DtgOrderList, 
  DtgResultSummary, 
  DtgConsumptionCards 
} from './components'
import { useDtgCalculator } from './hooks/use-dtg-calculator'
import { useDtgState } from './hooks/use-dtg-state'
import { 
  saveDtgCalculation, 
  getCalculationDetails,
  getMeterPricing,
  getPlacements,
  getConsumablesConfig
} from '../actions'

// Динамический импорт компонентов, чтобы избежать проблем с гидратацией
const DownloadPdfButton = dynamic(
  () => import('../components').then(mod => mod.DownloadPdfButton),
  { ssr: false }
)

const HistoryModal = dynamic(
  () => import('../components').then(mod => mod.HistoryModal),
  { ssr: false }
)

const CalculatorSettingsModal = dynamic(
  () => import('../components').then(mod => mod.CalculatorSettingsModal),
  { ssr: false }
)

interface DtgCalculatorClientProps {
  initialMeterPricing: MeterPriceTierData[]
  initialPlacements: PlacementData[]
  initialConsumablesConfig: ConsumablesConfigData
}

const STORAGE_KEY = 'merch-crm-dtg-orders-v2'

export const DtgCalculatorClient = memo(function DtgCalculatorClient({
  initialMeterPricing,
  initialPlacements,
  initialConsumablesConfig
}: DtgCalculatorClientProps) {
  const { toast } = useToast()
  
  const { state, dispatch, setUi } = useDtgState({
    meterPricing: initialMeterPricing,
    placements: initialPlacements,
    consumablesConfig: initialConsumablesConfig
  })

  const { orders, isHistoryOpen, isSettingsOpen, isSaving, savedNumber, consumablesConfig } = state

  // Загрузка из localStorage при инициализации
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        dispatch({ type: 'SET_ORDERS', payload: JSON.parse(saved) })
      } catch (_e) {
        console.error('Failed to load DTG orders', _e)
      }
    }
  }, [dispatch])

  // Сохранение в localStorage
  useEffect(() => {
    const ordersToSave = orders || []
    if (ordersToSave.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ordersToSave))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [orders])

  // Расчёт
  const result = useDtgCalculator({
    orders,
    _consumablesConfig: consumablesConfig
  })

  // Обработчики заказов
  const handleAddGarment = useCallback((garmentId: string, color: 'light' | 'dark') => {
    const garment = DTG_GARMENTS.find(g => g.id === garmentId)
    if (!garment) return

    const newOrder: DtgPrintInput = {
      id: uuidv4(),
      garmentId,
      garmentColor: color,
      positions: [
        {
          positionId: DTG_PRINT_POSITIONS[0].id,
          widthMm: 210,
          heightMm: 297,
          fillPercent: 60
        }
      ],
      quantity: 1
    }

    dispatch({ type: 'ADD_ORDER', payload: newOrder })
    toast(`Добавлено: ${garment.name}`, 'success')
  }, [toast, dispatch])

  const handleUpdateOrder = useCallback((orderId: string, updates: Partial<DtgPrintInput>) => {
    dispatch({ type: 'UPDATE_ORDER', payload: { id: orderId, updates } })
  }, [dispatch])

  const handleDeleteOrder = useCallback((orderId: string) => {
    dispatch({ type: 'DELETE_ORDER', payload: orderId })
    toast('Изделие удалено', 'info')
  }, [toast, dispatch])

  const handleDuplicateOrder = useCallback((orderId: string) => {
    const orderToDup = orders.find(o => o.id === orderId)
    if (!orderToDup) return
    
    const duplicate: DtgPrintInput = {
      ...orderToDup,
      id: uuidv4()
    }
    
    dispatch({ type: 'DUPLICATE_ORDER', payload: duplicate })
    toast('Копия создана', 'success')
  }, [orders, toast, dispatch])

  const handleClearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ORDERS' })
    toast('Расчёт очищен', 'info')
  }, [toast, dispatch])

  // Сохранение на сервер
  const handleSave = useCallback(async () => {
    if (!result || (orders || []).length === 0) return

    setUi('isSaving', true)
    try {
      const res = await saveDtgCalculation({
        items: (orders || []).map(o => ({
          garmentId: o.garmentId,
          garmentColor: o.garmentColor,
          quantity: o.quantity,
          positions: o.positions
        })),
        totalQuantity: result.totalQuantity,
        totalGarmentCost: result.totalGarmentCost,
        totalPrintCost: result.totalPrintCost,
        totalWorkCost: result.totalWorkCost,
        totalPrimerCost: result.totalPrimerCost,
        totalCost: result.totalCost,
        avgCostPerItem: result.avgCostPerItem,
        consumption: result.consumption.map(c => ({
          ...c,
          color: c.key === 'primer' ? '#6366f1' : '#cbd5e1'
        }))
      })

      if (res.success && res.data) {
        dispatch({ type: 'SET_SAVED_NUMBER', payload: res.data.calculationNumber })
        toast(`Расчёт №${res.data.calculationNumber} сохранён`, 'success')
      } else if (!res.success) {
        toast(!res.success && 'error' in res ? String(res.error) : 'Ошибка при сохранении', 'destructive')
      }
    } catch (_err) {
      toast('Не удалось сохранить расчёт', 'destructive')
    } finally {
      setUi('isSaving', false)
    }
  }, [result, orders, toast, setUi, dispatch])

  // История
  const handleSelectFromHistory = useCallback(async (item: { id: string }) => {
    try {
      const res = await getCalculationDetails(item.id)
      if (res.success && res.data) {
        const { calculation } = res.data
        if (calculation.consumptionData) {
          const data = typeof calculation.consumptionData === 'string' 
            ? JSON.parse(calculation.consumptionData) 
            : (calculation.consumptionData as unknown as Record<string, unknown>)
          
          if (data.items) {
            dispatch({ type: 'SET_ORDERS', payload: (data.items as DtgPrintInput[]).map((it) => ({
              ...it,
              id: uuidv4()
            })) })
            dispatch({ type: 'SET_SAVED_NUMBER', payload: calculation.calculationNumber })
            toast(`Загружен расчёт №${calculation.calculationNumber}`, 'success')
          }
        }
      }
    } catch (_err) {
      toast('Ошибка загрузки из истории', 'destructive')
    }
  }, [toast, dispatch])

  // Настройки
  const handleSettingsUpdated = useCallback(async () => {
    try {
      const [pRes, plRes, cRes] = await Promise.all([
        getMeterPricing('dtg'),
        getPlacements('dtg'),
        getConsumablesConfig('dtg')
      ])
      if (pRes.success) dispatch({ type: 'SET_METER_PRICING', payload: pRes.data })
      if (plRes.success) dispatch({ type: 'SET_PLACEMENTS', payload: plRes.data })
      if (cRes.success && cRes.data) dispatch({ type: 'SET_CONSUMABLES', payload: cRes.data as ConsumablesConfigData })
      toast('Настройки обновлены', 'success')
    } catch (_err) {
      toast('Ошибка обновления настроек', 'destructive')
    }
  }, [toast, dispatch])

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <CalcIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">Прямая печать (DTG)</h1>
            <p className="text-xs font-bold text-slate-400">Расчёт себестоимости по расходу чернил</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setUi('isHistoryOpen', true)}
            className="rounded-xl font-bold text-xs"
          >
            <History className="w-4 h-4 mr-2" />
            История
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setUi('isSettingsOpen', true)}
            className="rounded-xl font-bold text-xs"
          >
            <Settings className="w-4 h-4 mr-2" />
            Настройки
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
        <div className="xl:col-span-8 space-y-3">
          <GarmentSelector onSelect={handleAddGarment} />

          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Список изделий
                {(orders || []).length > 0 && (
                  <Badge variant="secondary" className="rounded-full">
                    {(orders || []).length}
                  </Badge>
                )}
              </h2>
              {(orders || []).length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearAll}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Очистить всё
                </Button>
              )}
            </div>

            {(orders || []).length === 0 ? (
              <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  <CalcIcon className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Калькулятор пуст</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  Выберите изделие выше, чтобы начать расчёт
                </p>
                <div className="mt-6">
                    <Button variant="outline" className="rounded-xl" onClick={() => handleAddGarment(DTG_GARMENTS[0].id, 'light')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить футболку
                    </Button>
                </div>
              </div>
            ) : (
              <DtgOrderList 
                orders={orders}
                onUpdate={handleUpdateOrder}
                onDelete={handleDeleteOrder}
                onDuplicate={handleDuplicateOrder}
              />
            )}
          </div>

          {result && (orders || []).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 px-2">Прогноз расхода материалов</h2>
              <DtgConsumptionCards consumption={result.consumption} />
            </div>
          )}
        </div>

        <div className="xl:col-span-4 sticky top-6 space-y-3">
          {result && (orders || []).length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <DtgResultSummary result={result} />
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="default"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </Button>
                
                <DownloadPdfButton 
                  result={{
                    ...result,
                    sections: (result?.items || []).map((it, idx) => ({
                        groupId: (orders || [])[idx]?.id || uuidv4(),
                        name: it.garment.name,
                        widthMm: 0,
                        heightMm: 0,
                        quantity: it.quantity,
                        placementCost: it.workCost / it.quantity,
                        printCost: it.printCost,
                        workCost: it.workCost,
                        sectionCost: it.totalCost,
                        costPerPrint: it.costPerItem,
                        printsPerRow: 0,
                        rowsCount: 0,
                        sectionLengthMm: 0,
                        sectionAreaM2: 0,
                        color: it.garmentColor === 'dark' ? '#000000' : '#ffffff',
                        sortOrder: idx
                    })),
                    totalPrints: result.totalQuantity,
                    totalLengthM: 0,
                    totalAreaM2: 0,
                    printsAreaM2: 0,
                    efficiencyPercent: 0,
                    pricePerMeter: 0,
                    printCost: result.totalPrintCost,
                    placementCost: result.totalWorkCost,
                    materialsCost: result.totalPrintCost + result.totalPrimerCost,
                    totalCost: result.totalCost,
                    avgCostPerPrint: result.avgCostPerItem,
                    minCostPerPrint: result.avgCostPerItem,
                    maxCostPerPrint: result.avgCostPerItem,
                    consumption: result.consumption.map(c => ({
                      ...c,
                      color: c.key === 'primer' ? '#6366f1' : '#cbd5e1'
                    }))
                  }}
                  params={{
                    applicationType: 'dtg',
                    rollWidthMm: 400,
                    edgeMarginMm: 0,
                    printGapMm: 0
                  }}
                  applicationType="dtg"
                  calculationNumber={savedNumber}
                />
              </div>
            </motion.div>
          ) : (
            <div className="p-8 rounded-[32px] border border-dashed border-slate-200 bg-white/50 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-300">
                <CalcIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-400">
                Ожидание данных для расчёта
              </p>
            </div>
          )}
        </div>
      </div>

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setUi('isHistoryOpen', false)}
        applicationType="dtg"
        onSelect={handleSelectFromHistory}
      />

      <CalculatorSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setUi('isSettingsOpen', false)}
        applicationType="dtg"
        initialMeterPricing={initialMeterPricing}
        initialPlacements={initialPlacements}
        initialConsumables={consumablesConfig}
        onSettingsUpdated={handleSettingsUpdated}
      />
    </div>
  )
})
