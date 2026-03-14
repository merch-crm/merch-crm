'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Save, 
  RotateCcw, 
  Layers, 
  Settings, 
  Clock, 
  AlertCircle,
  ShoppingBag,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  type PrintItem, 
  type PrintApplicationInput,
} from '../print-application-types'
import { 
  PrintManager, 
  GarmentSelector, 
  ApplicationOrderCard,
  ResultSummary,
  CostBreakdown,
  TimeEstimate,
  QuantityDiscountInfo
} from './components'
import { usePrintApplicationCalculator } from './hooks/use-print-application-calculator'
import { savePrintApplicationCalculation } from '../actions'

export default function PrintApplicationCalculatorClient() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  
  // Состояние
  const [prints, setPrints] = useState<PrintItem[]>([])
  const [orders, setOrders] = useState<PrintApplicationInput[]>([])
  const [includeGarments, setIncludeGarments] = useState(true)
  const [isRush, setIsRush] = useState(false)
  const [notes, setNotes] = useState('')

  // Расчёт
  const result = usePrintApplicationCalculator({
    prints,
    orders,
    includeGarments,
    isRush,
  })

  // Обработчики
  const handleAddGarment = (garmentId: string, garmentName: string, garmentPrice: number) => {
    const newOrder: PrintApplicationInput = {
      id: crypto.randomUUID(),
      garmentId,
      garmentName,
      garmentPrice,
      quantity: 1,
      applications: [],
    }
    setOrders([...orders, newOrder])
    toast.success(`Добавлено: ${garmentName}`)
  }

  const handleUpdateOrder = (updatedOrder: PrintApplicationInput) => {
    setOrders((orders || []).map(o => o.id === updatedOrder.id ? updatedOrder : o))
  }

  const handleRemoveOrder = (id: string) => {
    setOrders((orders || []).filter(o => o.id !== id))
  }

  const handleReset = () => {
    toast(`Вы уверены? Это очистит все данные. Нажмите еще раз для подтверждения`, {
      action: {
        label: 'Очистить',
        onClick: () => {
          setPrints([])
          setOrders([])
          setIncludeGarments(true)
          setIsRush(false)
          setNotes('')
        }
      }
    })
  }

  const handleSave = async () => {
    if (!result) return

    setIsSaving(true)
    try {
      const response = await savePrintApplicationCalculation({
        prints,
        orders,
        settings: { includeGarments, isRush },
        result,
        notes,
      })

      if (response.success) {
        toast.success(`Расчёт ${response.data?.calculationNumber} сохранён`)
        router.push('/dashboard/production/calculators')
      } else {
        toast.error(response.error || 'Ошибка сохранения')
      }
    } catch (_error) {
      toast.error('Произошла ошибка при сохранении')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Нанесение принта</h1>
          <p className="text-muted-foreground">
            Расчёт стоимости нанесения готовых принтов на изделия
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Сбросить
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={!result || isSaving}
          >
            <Save className={`h-4 w-4 mr-1 ${isSaving ? 'animate-pulse' : ''}`} />
            {isSaving ? 'Сохранение...' : 'Сохранить расчёт'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Основная колонка (Ввод данных) */}
        <div className="lg:col-span-2 space-y-3">
          <Tabs defaultValue="garments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="garments" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Изделия и позиции
              </TabsTrigger>
              <TabsTrigger value="prints" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Библиотека принтов
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="garments" className="space-y-3 mt-4">
              {/* Выбор изделий */}
              <GarmentSelector onSelect={handleAddGarment} />

              {/* Заказы */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Ваш заказ</h3>
                  {(orders || []).length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {(orders || []).length} поз.
                    </span>
                  )}
                </div>

                {(orders || []).length > 0 ? (
                  (orders || []).map(order => (
                    <ApplicationOrderCard
                      key={order.id}
                      order={order}
                      prints={prints}
                      onUpdate={handleUpdateOrder}
                      onRemove={() => handleRemoveOrder(order.id)}
                    />
                  ))
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                      <p className="text-muted-foreground">
                        Выберите изделия в списке выше, чтобы начать расчёт
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="prints" className="mt-4">
              <PrintManager prints={prints} onPrintsChange={setPrints} />
            </TabsContent>
          </Tabs>

          {/* Заметки */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                Заметки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Дополнительные комментарии к расчёту..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Сайдбар (Результаты) */}
        <div className="space-y-3">
          {/* Настройки */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Настройки расчёта
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Включить стоимость изделий</Label>
                  <p className="text-xs text-muted-foreground">
                    Если изделия наши (не давальческие)
                  </p>
                </div>
                <Switch
                  checked={includeGarments}
                  onCheckedChange={setIncludeGarments}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Label>Срочный заказ</Label>
                    <Clock className="h-3 w-3 text-destructive" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Наценка +30% к итоговой стоимости
                  </p>
                </div>
                <Switch
                  checked={isRush}
                  onCheckedChange={setIsRush}
                />
              </div>
            </CardContent>
          </Card>

          {/* Результаты */}
          {result ? (
            <div className="space-y-3">
              <ResultSummary 
                result={result} 
                includeGarments={includeGarments} 
                isRush={isRush} 
              />
              <CostBreakdown result={result} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <TimeEstimate estimatedTimeMin={result.estimatedTime} />
                <QuantityDiscountInfo 
                  currentDiscountPercent={result.discountPercent} 
                  totalItems={result.totalItems} 
                />
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Ожидание данных
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Добавьте изделия и принты, чтобы увидеть результат расчёта.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
