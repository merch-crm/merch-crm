'use client'

import { Trash2, Plus, Minus, MapPin } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

import {
  type PrintItem,
  type PrintApplicationInput,
  type ApplicationGarment,
  APPLICATION_POSITIONS,
  APPLICATION_GARMENTS,
} from '../../types'

interface ApplicationOrderCardProps {
  order: PrintApplicationInput
  prints: PrintItem[]
  onUpdate: (order: PrintApplicationInput) => void
  onRemove: () => void
}

export function ApplicationOrderCard({
  order,
  prints,
  onUpdate,
  onRemove,
}: ApplicationOrderCardProps) {
  const garment = APPLICATION_GARMENTS.find((g: ApplicationGarment) => g.id === order.garmentId)
  const availablePositions = garment 
    ? APPLICATION_POSITIONS.filter(p => garment.availablePositions.includes(p.id))
    : APPLICATION_POSITIONS

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, order.quantity + delta)
    onUpdate({ ...order, quantity: newQuantity })
  }

  const handleAddApplication = () => {
    if (prints.length === 0 || availablePositions.length === 0) return
    
    // Находим первую незанятую позицию
    const usedPositions = order.applications.map(a => a.positionId)
    const freePosition = availablePositions.find(p => !usedPositions.includes(p.id))
    
    if (!freePosition) return

    const firstPrint = prints[0]
    
    onUpdate({
      ...order,
      applications: [
        ...order.applications,
        {
          positionId: freePosition.id,
          positionName: freePosition.name,
          printId: firstPrint.id,
          printName: firstPrint.name,
          printType: firstPrint.type,
          printPrice: firstPrint.purchasePrice,
          sizeId: firstPrint.sizeId,
        },
      ],
    })
  }

  const handleRemoveApplication = (index: number) => {
    onUpdate({
      ...order,
      applications: order.applications.filter((_, i) => i !== index),
    })
  }

  const handleApplicationChange = (
    index: number, 
    field: 'positionId' | 'printId', 
    value: string
  ) => {
    const newApplications = [...order.applications]
    
    if (field === 'positionId') {
      const position = APPLICATION_POSITIONS.find(p => p.id === value)
      newApplications[index] = {
        ...newApplications[index],
        positionId: value,
        positionName: position?.name || '',
      }
    } else if (field === 'printId') {
      const print = prints.find(p => p.id === value)
      if (print) {
        newApplications[index] = {
          ...newApplications[index],
          printId: value,
          printName: print.name,
          printType: print.type,
          printPrice: print.purchasePrice,
          sizeId: print.sizeId,
        }
      }
    }
    
    onUpdate({ ...order, applications: newApplications })
  }

  const positionOptions = availablePositions.map(pos => ({
    id: pos.id,
    title: pos.name,
  }))

  const printOptions = prints.map(print => ({
    id: print.id,
    title: print.name,
    description: `${print.purchasePrice} ₽`
  }))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="font-medium">{order.garmentName}</div>
              <div className="text-sm text-muted-foreground">
                {order.garmentPrice?.toLocaleString('ru-RU')} ₽ за шт.
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Количество */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(-1)}
                disabled={order.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <Input
                type="number"
                min="1"
                value={order.quantity}
                onChange={(e) => onUpdate({ 
                  ...order, 
                  quantity: Math.max(1, parseInt(e.target.value) || 1) 
                })}
                className="w-16 h-8 text-center"
              />
              
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Нанесения */}
        {order.applications.map((app, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
          >
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            
            <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
              <Select
                options={positionOptions.map((opt: { id: string; title: string }) => ({
                  ...opt,
                  disabled: order.applications.some(a => a.positionId === opt.id && a !== app)
                }))}
                value={app.positionId}
                onChange={(v) => handleApplicationChange(index, 'positionId', v)}
                compact
                variant="minimal"
              />

              <Select
                options={printOptions}
                value={app.printId}
                onChange={(v) => handleApplicationChange(index, 'printId', v)}
                compact
                variant="minimal"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => handleRemoveApplication(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {/* Кнопка добавления нанесения */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleAddApplication}
          disabled={
            prints.length === 0 || 
            order.applications.length >= availablePositions.length
          }
        >
          <Plus className="h-4 w-4 mr-1" />
          Добавить нанесение
        </Button>

        {order.applications.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Добавьте хотя бы одно нанесение
          </p>
        )}
      </CardContent>
    </Card>
  )
}
