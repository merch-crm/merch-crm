'use client'

import { useState as useReactState, useCallback, useEffect, useMemo, memo } from 'react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { 
  DollarSign, 
  Shirt, 
  Droplets,
  Save,
  RotateCcw,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

import { MeterPricingEditor } from './meter-pricing-editor'
import { PlacementsEditor } from './placements-editor'
import { ConsumablesEditor } from './consumables-editor'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

import { 
  bulkUpdateMeterPricing,
  bulkUpdatePlacementPrices,
  saveConsumablesConfig
} from '../actions'

import { 
  type MeterPriceTierData,
  type PlacementData,
  type ConsumablesConfigData,
  type ApplicationType,
  APPLICATION_TYPE_LABELS
} from '../types'

interface CalculatorSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  applicationType: ApplicationType
  initialMeterPricing: MeterPriceTierData[]
  initialPlacements: PlacementData[]
  initialConsumables: ConsumablesConfigData | null
  onSettingsUpdated: () => void
}

type TabValue = 'pricing' | 'placements' | 'consumables'

const DEFAULT_CONSUMABLES: ConsumablesConfigData = {
  applicationType: 'dtf',
  inkWhitePerM2: 12,
  inkCmykPerM2: 8,
  powderPerM2: 15,
  paperPerM2: 1.1,
  fillPercent: 70,
  wastePercent: 10,
  config: null,
}

export const CalculatorSettingsModal = memo(function CalculatorSettingsModal({
  isOpen,
  onClose,
  applicationType,
  initialMeterPricing,
  initialPlacements,
  initialConsumables,
  onSettingsUpdated
}: CalculatorSettingsModalProps) {
  const { toast } = useToast()
  
  const safeInitialConsumables = useMemo(() => 
    initialConsumables ?? { ...DEFAULT_CONSUMABLES, applicationType },
    [initialConsumables, applicationType]
  )

  // Локальное состояние для редактирования
  const [meterPricing, setMeterPricing] = useReactState<MeterPriceTierData[]>(initialMeterPricing)
  const [placements, setPlacements] = useReactState<PlacementData[]>(initialPlacements)
  const [consumables, setConsumables] = useReactState<ConsumablesConfigData>(safeInitialConsumables)
  
  const [activeTab, setActiveTab] = useReactState<TabValue>('pricing')
  const [isSaving, setIsSaving] = useReactState(false)
  const [hasChanges, setHasChanges] = useReactState(false)
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useReactState(false)

  // Сброс состояния при открытии
  useEffect(() => {
    if (isOpen) {
      setMeterPricing(initialMeterPricing)
      setPlacements(initialPlacements)
      setConsumables(initialConsumables ?? { ...DEFAULT_CONSUMABLES, applicationType })
      setHasChanges(false)
    }
  }, [isOpen, initialMeterPricing, initialPlacements, initialConsumables, applicationType, setMeterPricing, setPlacements, setConsumables, setHasChanges])

  // Отслеживание изменений
  useEffect(() => {
    const pricingChanged = JSON.stringify(meterPricing) !== JSON.stringify(initialMeterPricing)
    const placementsChanged = JSON.stringify(placements) !== JSON.stringify(initialPlacements)
    const consumablesChanged = JSON.stringify(consumables) !== JSON.stringify(safeInitialConsumables)
    
    setHasChanges(pricingChanged || placementsChanged || consumablesChanged)
  }, [meterPricing, placements, consumables, initialMeterPricing, initialPlacements, safeInitialConsumables, setHasChanges])

  const handleMeterPricingUpdate = useCallback((newTiers: MeterPriceTierData[]) => {
    setMeterPricing(newTiers)
  }, [setMeterPricing])

  const handlePlacementsUpdate = useCallback((newPlacements: PlacementData[]) => {
    setPlacements(newPlacements)
  }, [setPlacements])

  const handleConsumablesUpdate = useCallback((newConfig: ConsumablesConfigData) => {
    setConsumables(newConfig)
  }, [setConsumables])

  const handleReset = useCallback(() => {
    setMeterPricing(initialMeterPricing)
    setPlacements(initialPlacements)
    setConsumables(initialConsumables ?? { ...DEFAULT_CONSUMABLES, applicationType })
    setHasChanges(false)
    
    toast('Изменения сброшены — настройки возвращены к исходным значениям', 'info')
  }, [initialMeterPricing, initialPlacements, initialConsumables, applicationType, toast, setMeterPricing, setPlacements, setConsumables, setHasChanges])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    
    try {
      const promises: Promise<{ success: boolean; error?: string }>[] = []

      // ---- Meter Pricing: grouped by rollWidthMm ----
      const byWidth = new Map<number, typeof meterPricing>()
      for (const t of meterPricing) {
        const arr = byWidth.get(t.rollWidthMm) || []
        arr.push(t)
        byWidth.set(t.rollWidthMm, arr)
      }
      for (const [rollWidthMm, tiers] of byWidth) {
        promises.push(
          bulkUpdateMeterPricing(
            applicationType,
            rollWidthMm,
            tiers.map(t => ({
              id: t.id.startsWith('temp-') ? undefined : t.id,
              fromMeters: t.fromMeters,
              toMeters: t.toMeters,
              pricePerMeter: t.pricePerMeter,
              sortOrder: t.sortOrder,
            }))
          )
        )
      }

      // ---- Placements: only update existing ones' workPrice ----
      const existingPlacements = placements.filter(p => !p.id.startsWith('temp-'))
      if (existingPlacements.length > 0) {
        promises.push(
          bulkUpdatePlacementPrices(
            existingPlacements.map(p => ({
              id: p.id,
              workPrice: p.workPrice
            }))
          )
        )
      }

      // ---- Consumables ----
      promises.push(
        saveConsumablesConfig({
          applicationType,
          inkWhitePerM2: consumables.inkWhitePerM2,
          inkCmykPerM2: consumables.inkCmykPerM2,
          powderPerM2: consumables.powderPerM2,
          paperPerM2: consumables.paperPerM2,
          fillPercent: consumables.fillPercent,
          wastePercent: consumables.wastePercent
        })
      )

      const results = await Promise.all(promises)

      const allSuccess = results.every(r => r.success)

      if (allSuccess) {
        toast('Все настройки успешно сохранены', 'success')
        onSettingsUpdated()
        onClose()
      } else {
        const errors = results
          .filter(r => !r.success)
          .map(r => r.error)
          .filter(Boolean)
          .join(', ')
        toast(errors || 'Не удалось сохранить некоторые настройки', 'error')
      }
    } catch {
      toast('Произошла ошибка при сохранении настроек', 'error')
    } finally {
      setIsSaving(false)
    }
  }, [applicationType, meterPricing, placements, consumables, onSettingsUpdated, onClose, toast, setIsSaving])

  const handleClose = useCallback(() => {
    if (hasChanges) {
      setIsConfirmCloseOpen(true)
    } else {
      onClose()
    }
  }, [hasChanges, onClose, setIsConfirmCloseOpen])

  const tabConfig = [
    { 
      value: 'pricing' as const, 
      label: 'Цены за метр', 
      icon: DollarSign,
      count: meterPricing.length
    },
    { 
      value: 'placements' as const, 
      label: 'Нанесения', 
      icon: Shirt,
      count: placements.length
    },
    { 
      value: 'consumables' as const, 
      label: 'Расходники', 
      icon: Droplets,
      count: null
    }
  ]

  const footer = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        {hasChanges && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Есть несохранённые изменения
          </Badge>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!hasChanges || isSaving}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Сбросить</span>
        </Button>
        
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <Spinner className="w-4 h-4 mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          <span className="hidden sm:inline">Сохранить</span>
        </Button>
      </div>
    </div>
  )

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Настройки калькулятора — ${APPLICATION_TYPE_LABELS[applicationType]}`}
      footer={footer}
    >
      <div className="px-6 py-4 overflow-y-auto custom-scrollbar">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <div className="crm-filter-tray mb-4">
            <TabsList className="w-full grid grid-cols-3 bg-transparent">
              {tabConfig.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-2xl"
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count !== null && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {tab.count}
                    </Badge>
                  )}
                  
                  {activeTab === tab.value && (
                    <motion.div
                      layoutId="settings-tab-indicator"
                      className="absolute inset-0 bg-white rounded-2xl shadow-sm -z-10"
                      transition={{ type: 'spring', duration: 0.3 }}
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="pricing" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MeterPricingEditor
                tiers={meterPricing}
                applicationType={applicationType}
                onUpdate={handleMeterPricingUpdate}
                isLoading={isSaving}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="placements" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PlacementsEditor
                placements={placements}
                applicationType={applicationType}
                onUpdate={handlePlacementsUpdate}
                isLoading={isSaving}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="consumables" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ConsumablesEditor
                config={consumables}
                applicationType={applicationType}
                onUpdate={handleConsumablesUpdate}
                isLoading={isSaving}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        isOpen={isConfirmCloseOpen}
        onClose={() => setIsConfirmCloseOpen(false)}
        onConfirm={() => {
          setIsConfirmCloseOpen(false)
          onClose()
        }}
        title="Несохранённые изменения"
        description="У вас есть несохранённые изменения в настройках калькулятора. Вы уверены, что хотите закрыть окно без сохранения?"
        confirmText="Закрыть без сохранения"
        cancelText="Вернуться к редактированию"
        variant="destructive"
      />
    </ResponsiveModal>
  )
})
