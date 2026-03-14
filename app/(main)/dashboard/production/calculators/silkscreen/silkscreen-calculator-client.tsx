'use client'

import { useState } from "react";
import { 
  Plus,
  Save, 
  History
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { 
  SILKSCREEN_GARMENTS, 
  DEFAULT_SILKSCREEN_PARAMS,
  type SilkscreenPrintInput
} from '../silkscreen-types'
import { useSilkscreenCalculator } from './hooks/use-silkscreen-calculator'
import { saveSilkscreenCalculation } from '../actions'
import { CalculationsHistory, DownloadPdfButton } from '../components'
import { SilkscreenSummary } from "./components/silkscreen-summary";
import { SilkscreenOrderCard } from "./components/silkscreen-order-card";

export function SilkscreenCalculatorClient() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<SilkscreenPrintInput[]>([])
  const [includeScreens, setIncludeScreens] = useState(DEFAULT_SILKSCREEN_PARAMS.includeScreens)
  const [isSaving, setIsSaving] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const result = useSilkscreenCalculator({ orders, includeScreens })

  const addOrder = () => {
    const newOrder: SilkscreenPrintInput = {
      id: Math.random().toString(36).substr(2, 9),
      garmentId: SILKSCREEN_GARMENTS[0].id,
      quantity: 50,
      positions: [{ positionId: 'front', sizeId: 'm', colors: [{ inkType: 'plastisol', isUnderbase: false }] }],
      isDarkGarment: false
    }
    setOrders([...orders, newOrder])
  }

  const handleSave = async () => {
    if (!result) return
    setIsSaving(true)
    try {
      const saveResult = await saveSilkscreenCalculation({
        orders,
        includeScreens,
        result: {
          quantity: result.quantity,
          garmentCost: result.garmentCost,
          totalScreensCost: result.totalScreensCost,
          totalSetupCost: result.totalSetupCost,
          printCostBeforeDiscount: result.printCostBeforeDiscount,
          quantityDiscount: result.quantityDiscount,
          discountPercent: result.discountPercent,
          totalPrintCost: result.totalPrintCost,
          totalCost: result.totalCost,
          costPerItem: result.costPerItem
        }
      })
      if (saveResult.success && saveResult.data) {
        toast(`Расчёт сохранён: ${saveResult.data.calculationNumber}`, 'success')
      } else {
        toast('Ошибка сохранения', 'destructive')
      }
    } catch (_err) {
      toast('Ошибка при сохранении', 'destructive')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Шелкография</h1>
          <p className="text-muted-foreground">Профессиональный расчет стоимости многоцветной печати</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
                <History className="w-4 h-4 mr-2" /> История
            </Button>
            <DownloadPdfButton 
                applicationType="silkscreen"
                calculationNumber="NEW"
                params={{ rollWidthMm: 0, edgeMarginMm: 0, printGapMm: 0, applicationType: 'silkscreen' }}
                result={result as unknown as React.ComponentProps<typeof DownloadPdfButton>['result']}
            />
            <Button size="sm" onClick={handleSave} disabled={isSaving || !result || (orders || []).length === 0}>
                <Save className="w-4 h-4 mr-2" /> Сохранить
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-2">
        <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Checkbox id="include-screens" checked={includeScreens} onCheckedChange={(val) => setIncludeScreens(!!val)} />
                    <Label htmlFor="include-screens" className="text-sm font-medium">Включать стоимость сеток в расчет</Label>
                </div>
                <Button onClick={addOrder} size="sm" className="shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Добавить изделие
                </Button>
            </div>

            {(orders || []).length === 0 ? (
                <div className="h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                    <p>Добавьте первое изделие для начала расчета</p>
                    <Button variant="link" onClick={addOrder}>+ Нажмите здесь</Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {(orders || []).map((order) => (
                        <SilkscreenOrderCard 
                            key={order.id} 
                            order={order} 
                            actions={{
                                onUpdate: (updates) => setOrders((orders || []).map(o => o.id === order.id ? { ...o, ...updates } : o)),
                                onRemove: () => setOrders((orders || []).filter(o => o.id !== order.id)),
                                onUpdatePosition: (idx, updates) => {
                                    const newOrders = [...orders];
                                    const oIdx = orders.findIndex(o => o.id === order.id);
                                    newOrders[oIdx].positions[idx] = { ...newOrders[oIdx].positions[idx], ...updates };
                                    setOrders(newOrders);
                                },
                                onAddPosition: () => {
                                    const newOrders = [...orders];
                                    const oIdx = orders.findIndex(o => o.id === order.id);
                                    newOrders[oIdx].positions.push({ positionId: 'back', sizeId: 'm', colors: [{ inkType: 'plastisol', isUnderbase: order.isDarkGarment }] });
                                    setOrders(newOrders);
                                },
                                onAddColor: (pIdx) => {
                                    const newOrders = [...orders];
                                    const oIdx = orders.findIndex(o => o.id === order.id);
                                    newOrders[oIdx].positions[pIdx].colors.push({ inkType: 'plastisol', isUnderbase: false });
                                    setOrders(newOrders);
                                },
                                onRemoveColor: (pIdx, cIdx) => {
                                    const newOrders = [...orders];
                                    const oIdx = orders.findIndex(o => o.id === order.id);
                                    newOrders[oIdx].positions[pIdx].colors.splice(cIdx, 1);
                                    setOrders(newOrders);
                                },
                                onUpdateColor: (pIdx, cIdx, updates) => {
                                    const newOrders = [...orders];
                                    const oIdx = orders.findIndex(o => o.id === order.id);
                                    newOrders[oIdx].positions[pIdx].colors[cIdx] = { ...newOrders[oIdx].positions[pIdx].colors[cIdx], ...updates };
                                    setOrders(newOrders);
                                }
                            }}
                        />
                    ))}
                </div>
            )}
        </div>

        <div className="space-y-3">
            <SilkscreenSummary result={result} />
            {showHistory && (
                <Card>
                    <CardContent className="pt-6">
                        <CalculationsHistory applicationType="silkscreen" />
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  )
}
