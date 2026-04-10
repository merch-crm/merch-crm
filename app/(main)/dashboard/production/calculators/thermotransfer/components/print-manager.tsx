'use client'

import { useState } from 'react'
import { Plus, Trash2, Package, Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'

import { 
 PrintItem, 
 PrintType,
 PRINT_TYPES, 
 PRINT_SIZES,
} from '../../types'

interface PrintManagerProps {
 prints: PrintItem[]
 onPrintsChange: (prints: PrintItem[]) => void
}

export function PrintManager({ prints, onPrintsChange }: PrintManagerProps) {
 const [isAdding, setIsAdding] = useState(false)
 
 // Форма нового принта
 const [newPrint, setNewPrint] = useState({
  name: '',
  type: 'heat-transfer' as PrintType,
  sizeId: 'm',
  purchasePrice: 0,
  quantity: 1,
 })

 const handleAdd = () => {
  if (!newPrint.name.trim()) return

  const print: PrintItem = {
   id: crypto.randomUUID(),
   name: newPrint.name.trim(),
   type: newPrint.type,
   sizeId: newPrint.sizeId,
   purchasePrice: newPrint.purchasePrice,
   quantity: newPrint.quantity,
  }

  onPrintsChange([...prints, print])
  setNewPrint({
   name: '',
   type: 'heat-transfer',
   sizeId: 'm',
   purchasePrice: 0,
   quantity: 1,
  })
  setIsAdding(false)
 }

 const handleRemove = (id: string) => {
  onPrintsChange(prints.filter(p => p.id !== id))
 }

 const getPrintTypeName = (type: PrintType) => 
  PRINT_TYPES.find(pt => pt.id === type)?.name || type

 const getSizeName = (sizeId: string) =>
  PRINT_SIZES.find(s => s.id === sizeId)?.name || sizeId

 const typeOptions = PRINT_TYPES.map(type => ({
  id: type.id,
  title: type.name,
 }))

 const sizeOptions = PRINT_SIZES.map(size => ({
  id: size.id,
  title: size.name,
 }))

 return (
  <Card>
   <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
     <CardTitle className="text-base flex items-center gap-2">
      <Package className="h-4 w-4" />
      Принты для нанесения
      {prints.length > 0 && (
       <Badge color="neutral">{prints.length}</Badge>
      )}
     </CardTitle>
     
     {!isAdding && (
      <Button variant="outline" color="neutral" size="sm" onClick={() => setIsAdding(true)}
      >
       <Plus className="h-4 w-4 mr-1" />
       Добавить
      </Button>
     )}
    </div>
   </CardHeader>

   <CardContent className="space-y-3">
    {/* Форма добавления */}
    {isAdding && (
     <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
       <div className="space-y-2">
        <Label>Название</Label>
        <Input placeholder="Например: Логотип компании" value={newPrint.name} onChange={(e) => setNewPrint(prev => ({ ...prev, name: e.target.value }))}
        />
       </div>
       
       <div className="space-y-2">
        <Label>Тип принта</Label>
        <Select options={typeOptions} value={newPrint.type} onChange={(v) => setNewPrint(prev => ({ ...prev, type: v as PrintType }))}
         compact
        />
       </div>
       
       <div className="space-y-2">
        <Label>Размер</Label>
        <Select options={sizeOptions} value={newPrint.sizeId} onChange={(v) => setNewPrint(prev => ({ ...prev, sizeId: v }))}
         compact
        />
       </div>
       
       <div className="space-y-2">
        <Label>Цена принта, ₽</Label>
        <Input type="number" min="0" value={newPrint.purchasePrice || ''} onChange={(e) => setNewPrint(prev => ({ 
          ...prev, 
          purchasePrice: parseFloat(e.target.value) || 0 
         }))}
        />
       </div>
      </div>
      
      <div className="flex justify-end gap-2">
       <Button variant="ghost" color="neutral" size="sm" onClick={() => setIsAdding(false)}
       >
        <X className="h-4 w-4 mr-1" />
        Отмена
       </Button>
       <Button size="sm" onClick={handleAdd} disabled={!newPrint.name.trim()}>
        <Check className="h-4 w-4 mr-1" />
        Добавить
       </Button>
      </div>
     </div>
    )}

    {/* Список принтов */}
    {prints.length > 0 ? (
     <div className="space-y-2">
      {prints.map(print => (
       <div
        key={print.id}
        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
       >
        <div className="flex-1 min-w-0">
         <div className="flex items-center gap-2">
          <span className="font-medium truncate">{print.name}</span>
          <Badge color="primary" variant="outline" className="shrink-0">
           {getPrintTypeName(print.type)}
          </Badge>
         </div>
         <div className="text-sm text-muted-foreground mt-0.5">
          {getSizeName(print.sizeId)} • {print.purchasePrice.toLocaleString('ru-RU')} ₽
         </div>
        </div>
        
        <div className="flex items-center gap-1 ml-4">
         <Button variant="ghost" color="neutral" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleRemove(print.id)}
         >
          <Trash2 className="h-4 w-4" />
         </Button>
        </div>
       </div>
      ))}
     </div>
    ) : !isAdding && (
     <p className="text-sm text-muted-foreground text-center py-4">
      Нет добавленных принтов
     </p>
    )}
   </CardContent>
  </Card>
 )
}
