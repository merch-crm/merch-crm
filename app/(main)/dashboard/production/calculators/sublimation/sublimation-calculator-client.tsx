'use client'

import { useState as useReactState, useCallback, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  Copy, 
  History, 
  Settings
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

import { 
  type CalculatorParams,
  type CalculationResult,
  type PrintGroupInput,
  type PlacementData,
  type MeterPriceTierData,
  type ConsumablesConfigData,
  PRINT_GROUP_COLORS
} from '../types'
import {
  DEFAULT_SUBLIMATION_PARAMS,
  SUBLIMATION_PRODUCTS,
} from '../sublimation-types'
import { 
  CalculatorHeader, 
  HistoryModal,
  CalculatorSettingsModal
} from '../components'

import { 
  SublimationParamsCard, 
  ProductSelector, 
  SublimationGroupsList, 
  FabricCalculator 
} from './components'

import { useSublimationCalculator } from './hooks/use-sublimation-calculator'
import { CostSummary } from '../dtf/components/cost-summary'
import { saveCalculation, getCalculationDetails } from '../actions'

// Динамический импорт PDF кнопки
const DownloadPdfButton = dynamic(
  () => import("../components").then(mod => mod.DownloadPdfButton),
  { ssr: false, loading: () => <Button variant="outline" size="sm" disabled><Spinner className="mr-2" /> PDF</Button> }
)

interface SublimationCalculatorClientProps {
  initialMeterPricing: MeterPriceTierData[]
  initialPlacements: PlacementData[]
  initialConsumablesConfig: ConsumablesConfigData | null
}

export function SublimationCalculatorClient({
  initialMeterPricing,
  initialPlacements,
  initialConsumablesConfig
}: SublimationCalculatorClientProps) {
  const { toast } = useToast()
  
  // Режим калькулятора
  const [calculationMode, setCalculationMode] = useReactState<'products' | 'custom' | 'fabric'>('products')
  
  // Параметры бумаги/печати
  const [params, setParams] = useReactState<CalculatorParams>({ ...DEFAULT_SUBLIMATION_PARAMS, applicationType: 'sublimation' })
  
  // Данные для разных режимов
  const [selectedProducts, setSelectedProducts] = useReactState<Record<string, number>>({})
  const [customGroups, setCustomGroups] = useReactState<PrintGroupInput[]>([])
  const [fabricParams, setFabricParams] = useReactState({
    fabricType: 'polyester-basic',
    widthM: 1.5,
    lengthM: 1,
    quantity: 1
  })
  
  const [showSettings, setShowSettings] = useReactState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useReactState(false)
  const [isSaving, setIsSaving] = useReactState(false)
  const [savedCalculationNumber, setSavedCalculationNumber] = useReactState<string | undefined>()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Конвертация продуктов в группы принтов
  const productGroups = useMemo((): PrintGroupInput[] => {
    return Object.entries(selectedProducts)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty], index) => {
        const product = SUBLIMATION_PRODUCTS.find(p => p.id === productId)
        if (!product) return null
        
        return {
          id: productId,
          name: product.name,
          widthMm: product.widthMm,
          heightMm: product.heightMm,
          quantity: qty,
          placementId: null,
          color: PRINT_GROUP_COLORS[index % PRINT_GROUP_COLORS.length],
          productId: product.id,
          productPrice: product.pricePerUnit
        }
      })
      .filter(Boolean) as PrintGroupInput[]
  }, [selectedProducts])

  // Входные данные для хука
  const activeGroups = calculationMode === 'products' ? productGroups : customGroups

  const result = useSublimationCalculator({
    params,
    groups: activeGroups,
    meterPricing: initialMeterPricing,
    placements: initialPlacements,
    consumablesConfig: initialConsumablesConfig,
    calculationMode,
    fabricParams: calculationMode === 'fabric' ? fabricParams : undefined
  })

  // Действия
  const handleSave = useCallback(async () => {
    if (!result) return
    
    setIsSaving(true)
    try {
      const response = await saveCalculation({
        applicationType: 'sublimation',
        params,
        result,
        groups: activeGroups
      })
      
      if (response.success && 'data' in response) {
        setSavedCalculationNumber(response.data.calculationNumber)
        toast(`Расчёт №${response.data.calculationNumber} успешно сохранён`, 'success')
      } else {
        toast(!response.success && 'error' in response ? String(response.error) : 'Не удалось сохранить расчет', 'destructive')
      }
    } catch (_err) {
      toast('Произошла непредвиденная ошибка при сохранении', 'destructive')
    } finally {
      setIsSaving(false)
    }
  }, [result, params, activeGroups, toast, setIsSaving, setSavedCalculationNumber])

  // Обработчик истории
  const handleSelectFromHistory = useCallback(async (item: { id: string }) => {
    try {
      const res = await getCalculationDetails(item.id)
      if (res.success && res.data) {
        const { calculation, groups } = res.data
        
        setParams({
          applicationType: 'sublimation',
          rollWidthMm: calculation.rollWidthMm || 1118,
          edgeMarginMm: calculation.edgeMarginMm || 10,
          printGapMm: calculation.printGapMm || 5
        })
        
        // Восстановление групп в зависимости от режима
        const restoredGroups: PrintGroupInput[] = groups.map((g, i) => ({
          id: crypto.randomUUID(),
          name: g.name || '',
          widthMm: g.widthMm,
          heightMm: g.heightMm,
          quantity: g.quantity,
          placementId: g.placementId || null,
          color: g.color || PRINT_GROUP_COLORS[i % PRINT_GROUP_COLORS.length]
        }))
        
        if (calculation.applicationType === 'sublimation') {
            setCalculationMode('custom')
            setCustomGroups(restoredGroups)
        }
        
        setSavedCalculationNumber(calculation.calculationNumber)
        toast(`Расчёт №${calculation.calculationNumber} загружен`, 'success')
      }
    } catch (_err) {
      toast('Ошибка загрузки', 'destructive')
    }
  }, [toast, setCalculationMode, setCustomGroups, setParams, setSavedCalculationNumber])

  const handleCopyResults = useCallback(() => {
    if (!result) return
    
    const text = `
Результаты расчета (Сублимация):
--------------------------------
Всего принтов: ${result.totalPrints}
Общая длина: ${result.totalLengthM.toFixed(2)} м
Итоговая стоимость: ${result.totalCost.toFixed(2)} ₽
Эффективность: ${result.efficiencyPercent.toFixed(1)}%
--------------------------------
    `.trim()
    
    navigator.clipboard.writeText(text)
    toast('Результаты расчета скопированы в буфер обмена', 'success')
  }, [result, toast])

  return (
    <div className="container mx-auto py-6 space-y-3 max-w-7xl px-4">
      {/* Header */}
      <CalculatorHeader 
        applicationType="sublimation"
        onSettingsClick={() => setShowSettings(true)}
        onHistoryClick={() => setIsHistoryOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="overflow-hidden border-slate-200 shadow-sm rounded-[24px]">
            <Tabs 
              value={calculationMode} 
              onValueChange={(v) => setCalculationMode(v as 'products' | 'custom' | 'fabric')}
              className="w-full"
            >
              <div className="px-6 pt-6 flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
                <TabsList className="bg-slate-100/80 p-1 rounded-xl">
                  <TabsTrigger value="products" className="rounded-lg px-4 h-9 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-xs">Готовые изделия</TabsTrigger>
                  <TabsTrigger value="custom" className="rounded-lg px-4 h-9 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-xs">Свои размеры</TabsTrigger>
                  <TabsTrigger value="fabric" className="rounded-lg px-4 h-9 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-xs">Печать на ткани</TabsTrigger>
                </TabsList>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn("rounded-xl font-bold text-xs h-9", showSettings ? "bg-indigo-50 text-indigo-600" : "text-slate-500")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Настройки печати
                </Button>
              </div>

              <div className="p-6">
                <TabsContent value="products" className="m-0 mt-0 focus-visible:outline-none">
                  <ProductSelector 
                    selectedProducts={Object.entries(selectedProducts)
                      .filter(([_, q]) => q > 0)
                      .map(([id, q]) => ({ productId: id, quantity: q }))} 

                    onChange={(products) => {
                      const newSelected: Record<string, number> = {};
                      (products || []).forEach((p: { productId: string; quantity: number }) => {
                        if (p.quantity > 0) newSelected[p.productId] = p.quantity
                      });
                      setSelectedProducts(newSelected)
                    }} 
                  />
                </TabsContent>
                
                <TabsContent value="custom" className="m-0 mt-0 focus-visible:outline-none">
                  <SublimationGroupsList 
                    groups={customGroups} 
                    onChange={setCustomGroups}
                    placements={initialPlacements}
                  />
                </TabsContent>

                <TabsContent value="fabric" className="m-0 mt-0 focus-visible:outline-none">
                   <FabricCalculator 
                    params={fabricParams}
                    onChange={setFabricParams}
                   />
                </TabsContent>
              </div>
            </Tabs>
          </Card>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <SublimationParamsCard 
                  params={params} 
                  onChange={(updates) => setParams(prev => ({ ...prev, ...updates, applicationType: 'sublimation' }))} 
                />
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>

        {/* Right Column: Cost Summary */}
        <div className="lg:col-span-5 space-y-3 sticky top-6">
          <CostSummary 
            result={result as CalculationResult} 
          />

          <div className="flex flex-col gap-3">
            <Button 
              size="lg" 
              className="w-full h-14 rounded-[20px] bg-slate-900 hover:bg-black text-white font-black text-base shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
              onClick={handleSave}
              disabled={!result || isSaving}
            >
              {isSaving ? <Spinner className="mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              Сохранить расчет
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
                <DownloadPdfButton
                  result={result as CalculationResult}
                  params={params}
                  applicationType="sublimation"
                  calculationNumber={savedCalculationNumber || `SUB-${Date.now().toString().slice(-6)}`}
                  canvasRef={canvasRef}
                />
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-[20px] h-14 font-black border-2 border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
                onClick={handleCopyResults}
                disabled={!result}
              >
                <Copy className="w-5 h-5 mr-2" />
                Копировать
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full rounded-xl text-slate-400 font-bold hover:text-slate-600"
              asChild
            >
                <Link href="/dashboard/production/calculators/history?type=sublimation">
                    <History className="w-4 h-4 mr-2" />
                    История расчетов
                </Link>
            </Button>
          </div>
        </div>
      </div>

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        applicationType="sublimation"
        onSelect={handleSelectFromHistory}
      />

      <CalculatorSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        applicationType="sublimation"
        initialMeterPricing={initialMeterPricing}
        initialPlacements={initialPlacements}
        initialConsumables={initialConsumablesConfig}
        onSettingsUpdated={() => {}}
      />
    </div>
  )
}
