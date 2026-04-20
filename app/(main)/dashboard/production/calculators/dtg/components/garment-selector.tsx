'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
 Plus, 
 Search,
 Shirt,
 Sun,
 Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import { 
 DTG_GARMENTS, 
 DTG_GARMENT_CATEGORIES,
 type DtgGarment,
 type GarmentColor
} from '../../types'

interface GarmentSelectorProps {
 onSelect: (garmentId: string, color: GarmentColor) => void
}

interface GarmentCardProps {
 garment: DtgGarment
 onSelect: (color: GarmentColor) => void
}

const GarmentCard = memo(function GarmentCard({
 garment,
 onSelect
}: GarmentCardProps) {
 const [showColorChoice, setShowColorChoice] = useState(false)

 const handleClick = useCallback(() => {
  setShowColorChoice(true)
 }, [])

 const handleColorSelect = useCallback((color: GarmentColor) => {
  onSelect(color)
  setShowColorChoice(false)
 }, [onSelect])

 if (showColorChoice) {
  return (
   <Card className="p-4 ring-2 ring-primary bg-primary/5">
    <p className="text-sm font-medium text-slate-700 mb-3">{garment.name}</p>
    <div className="grid grid-cols-2 gap-2">
     <Button variant="outline" color="gray" size="sm" onClick={() => handleColorSelect('light')}
      className="flex items-center gap-2"
     >
      <Sun className="w-4 h-4 text-amber-500" />
      Светлый
     </Button>
     <Button variant="outline" color="gray" size="sm" onClick={() => handleColorSelect('dark')}
      className="flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700"
     >
      <Moon className="w-4 h-4" />
      Тёмный
     </Button>
    </div>
    <Button variant="ghost" color="gray" size="sm" onClick={() => setShowColorChoice(false)}
     className="w-full mt-2 text-slate-500"
    >
     Отмена
    </Button>
   </Card>
  )
 }

 return (
  <Card className="p-4 cursor-pointer hover:shadow-md hover:bg-slate-50 transition-all" onClick={handleClick}>
   <div className="flex items-start gap-3">
    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
     <Shirt className="w-5 h-5 text-slate-500" />
    </div>
    
    <div className="flex-1 min-w-0">
     <h4 className="font-medium text-slate-900 truncate">{garment.name}</h4>
     <p className="text-sm text-slate-500">
      до {garment.maxPrintWidth}×{garment.maxPrintHeight} мм
     </p>
     <div className="mt-1">
      <Badge className="text-xs" color="gray">
        {formatCurrency(garment.basePrice)}
      </Badge>
     </div>
    </div>

    <Button variant="ghost" color="gray" size="sm" className="shrink-0">
     <Plus className="w-4 h-4" />
    </Button>
   </div>
  </Card>
 )
})

export const GarmentSelector = memo(function GarmentSelector({
 onSelect
}: GarmentSelectorProps) {
 const [searchQuery, setSearchQuery] = useState('')
 const [activeCategory, setActiveCategory] = useState('all')
 const [isExpanded, setIsExpanded] = useState(false)

 // Фильтрация
 const filteredGarments = useMemo(() => {
  let garments = DTG_GARMENTS

  if (activeCategory !== 'all') {
   garments = garments.filter(g => g.category === activeCategory)
  }

  if (searchQuery) {
   const query = searchQuery.toLowerCase()
   garments = garments.filter(g => 
    g.name.toLowerCase().includes(query)
   )
  }

  return garments
 }, [searchQuery, activeCategory])

 const handleSelect = useCallback((garmentId: string, color: GarmentColor) => {
  onSelect(garmentId, color)
  setIsExpanded(false)
 }, [onSelect])

 if (!isExpanded) {
  return (
   <Button variant="outline" color="gray" onClick={() => setIsExpanded(true)}
    className="w-full rounded-[24px] py-8 border-2 border-dashed border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all"
   >
    <Plus className="w-6 h-6 mr-2" />
    <span className="text-lg font-bold">Добавить изделие для печати</span>
   </Button>
  )
 }

 return (
  <Card className="overflow-hidden border-slate-200 shadow-sm rounded-[24px]">
   <div className="p-6 space-y-3">
    <div className="flex items-center justify-between">
     <h3 className="text-lg font-black text-slate-900">Выберите изделие</h3>
     <Button variant="ghost" color="gray" size="sm" onClick={() => setIsExpanded(false)}
      className="rounded-xl font-bold"
     >
      Отмена
     </Button>
    </div>

    {/* Поиск */}
    <div className="relative">
     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
     <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Поиск по названию..."
      className="pl-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all h-11"
     />
    </div>

    {/* Категории */}
    <div className="flex flex-wrap gap-2">
     {DTG_GARMENT_CATEGORIES.map(cat => (
      <Button key={cat.id} color={activeCategory === cat.id ? 'purple' : 'gray'} variant={activeCategory === cat.id ? 'solid' : 'outline'} size="sm" onClick={() => setActiveCategory(cat.id)}
       className={cn(
        "rounded-full px-4 font-bold transition-all",
        activeCategory === cat.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
       )}
      >
       {cat.name}
      </Button>
     ))}
    </div>

    {/* Список изделий */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
     {filteredGarments.map(garment => (
      <GarmentCard key={garment.id} garment={garment} onSelect={(color) => handleSelect(garment.id, color)}
      />
     ))}
    </div>

    {filteredGarments.length === 0 && (
     <p className="text-center text-slate-500 py-8 font-medium">
      Изделия не найдены
     </p>
    )}
   </div>
  </Card>
 )
})
