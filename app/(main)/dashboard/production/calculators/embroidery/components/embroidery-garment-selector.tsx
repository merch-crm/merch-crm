'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Shirt, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import { EMBROIDERY_GARMENTS, type EmbroideryGarment } from '../../embroidery-types'

interface EmbroideryGarmentSelectorProps {
 onSelect: (garmentId: string) => void
 disabled?: boolean
}

const categories = [
 { id: 'all', name: 'Все изделия' },
 { id: 'tshirt', name: 'Футболки' },
 { id: 'polo', name: 'Поло' },
 { id: 'hoodie', name: 'Худи' },
 { id: 'sweatshirt', name: 'Свитшоты' },
 { id: 'jacket', name: 'Верхняя одежда' },
 { id: 'cap', name: 'Головные уборы' },
 { id: 'bag', name: 'Сумки/Шопперы' },
 { id: 'towel', name: 'Текстиль' }
]

export const EmbroideryGarmentSelector = memo(function EmbroideryGarmentSelector({
 onSelect,
 disabled = false
}: EmbroideryGarmentSelectorProps) {
 const [isExpanded, setIsExpanded] = useState(false)
 const [searchQuery, setSearchQuery] = useState('')
 const [activeCategory, setActiveCategory] = useState('all')

 const filteredGarments = useMemo(() => {
  let garments = EMBROIDERY_GARMENTS

  if (activeCategory !== 'all') {
   garments = garments.filter((g: EmbroideryGarment) => g.category === activeCategory)
  }

  if (searchQuery) {
   const query = searchQuery.toLowerCase()
   garments = garments.filter((g: EmbroideryGarment) => g.name.toLowerCase().includes(query))
  }

  return garments
 }, [searchQuery, activeCategory])

 const handleSelect = useCallback((garmentId: string) => {
  onSelect(garmentId)
  setIsExpanded(false)
  setSearchQuery('')
 }, [onSelect])

 if (!isExpanded) {
  return (
   <Button variant="outline" color="neutral" onClick={() => setIsExpanded(true)}
    disabled={disabled}
    className="w-full h-16 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50 transition-all font-bold text-lg group"
   >
    <Plus className="w-6 h-6 mr-3 transition-transform group-hover:rotate-90" />
    Добавить еще одно изделие в расчет
   </Button>
  )
 }

 return (
  <Card className="border-slate-200 shadow-xl overflow-hidden bg-white animate-in zoom-in-95 duration-200">
   <div className="p-6 space-y-3">
    <div className="flex items-center justify-between">
     <div className="flex items-center gap-3">
       <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
        <Shirt className="w-5 h-5" />
       </div>
       <h3 className="text-xl font-black text-slate-800 ">Выберите изделие</h3>
     </div>
     <Button variant="ghost" color="neutral" size="icon" onClick={() => setIsExpanded(false)} className="rounded-full h-10 w-10">
      <X className="w-6 h-6 text-slate-400" />
     </Button>
    </div>

    <div className="flex flex-col sm:flex-row gap-3">
     <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
       placeholder="Поиск по названию (футболка, кепка...)"
       className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl font-medium focus-visible:ring-pink-500"
      />
     </div>
     
     <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar no-scrollbar scrollbar-hide">
      {categories.map(cat => (
       <Button key={cat.id} color={activeCategory === cat.id ? 'primary' : 'neutral'} variant={activeCategory === cat.id ? 'solid' : 'outline'} size="sm" onClick={() => setActiveCategory(cat.id)}
        className={cn(
         "rounded-full px-4 h-9 font-bold text-xs transition-all whitespace-nowrap",
         activeCategory === cat.id ? "bg-slate-900 text-white shadow-md" : "border-slate-200 text-slate-500 hover:bg-slate-100"
        )}
       >
        {cat.name}
       </Button>
      ))}
     </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
     {filteredGarments.map((garment: EmbroideryGarment) => (
      <div
       key={garment.id}
       className="p-4 rounded-2xl border border-slate-100 cursor-pointer hover:border-pink-200 hover:shadow-lg hover:bg-pink-50/30 transition-all group active:scale-[0.98]"
       role="button"
       tabIndex={0}
       aria-label={`Выбрать ${garment.name}`}
       onClick={() => handleSelect(garment.id)}
       onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
         e.preventDefault();
         handleSelect(garment.id);
        }
       }}
      >
       <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
         <Shirt className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
         <p className="font-bold text-slate-900 truncate group-hover:text-pink-700 transition-colors">{garment.name}</p>
         <div className="flex items-center gap-2 mt-1">
          <Badge color="primary" variant="outline" className="text-xs font-bold border-slate-200 text-slate-400">
           до {garment.maxColors} цветов
          </Badge>
         </div>
         <p className="text-xl font-black text-slate-900 mt-3 ">
          {formatCurrency(garment.basePrice)}
         </p>
        </div>
        <Plus className="w-5 h-5 text-slate-300 group-hover:text-pink-500 transition-colors" />
       </div>
      </div>
     ))}
     
     {filteredGarments.length === 0 && (
      <div className="col-span-full py-12 text-center">
       <p className="text-slate-400 font-medium">Ничего не найдено по вашему запросу</p>
       <Button variant="link" color="primary" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="text-pink-600 font-bold">
        Сбросить фильтры
       </Button>
      </div>
     )}
    </div>
   </div>
  </Card>
 )
})
