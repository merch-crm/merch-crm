'use client'

import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

import { 
 APPLICATION_GARMENTS, 
 APPLICATION_GARMENT_CATEGORIES,
 type ApplicationGarment
} from '../../print-application-types'

interface GarmentSelectorProps {
 onSelect: (garmentId: string, garmentName: string, garmentPrice: number) => void
}

export function GarmentSelector({ onSelect }: GarmentSelectorProps) {
 const [search, setSearch] = useState('')
 const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

 const filteredGarments = useMemo(() => {
  return APPLICATION_GARMENTS.filter((garment: ApplicationGarment) => {
   const matchesSearch = garment.name.toLowerCase().includes(search.toLowerCase())
   const isCategoryMatch = !selectedCategory || garment.category === selectedCategory
   return matchesSearch && isCategoryMatch
  })
 }, [search, selectedCategory])

 return (
  <Card>
   <CardHeader className="pb-3">
    <CardTitle className="text-base">Выберите изделие</CardTitle>
   </CardHeader>
   
   <CardContent className="space-y-3">
    {/* Поиск */}
    <div className="relative">
     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
     <Input placeholder="Поиск изделия..." value={search} onChange={(e) => setSearch(e.target.value)}
      className="pl-9"
     />
    </div>

    {/* Категории */}
    <div className="flex flex-wrap gap-2">
     <Badge color={selectedCategory === null ? 'purple' : 'gray'} variant={selectedCategory === null ? 'solid' : 'outline'} className="cursor-pointer" onClick={() => setSelectedCategory(null)}
     >
      Все
     </Badge>
     {APPLICATION_GARMENT_CATEGORIES.map((category: string) => (
      <Badge key={category} color={selectedCategory === category ? 'purple' : 'gray'} variant={selectedCategory === category ? 'solid' : 'outline'} className="cursor-pointer" onClick={() => setSelectedCategory(category)}
      >
       {category}
      </Badge>
     ))}
    </div>

    {/* Список изделий */}
    <ScrollArea className="h-[240px]">
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {filteredGarments.map((garment: ApplicationGarment) => (
       <div
        key={garment.id}
        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
       >
        <div className="min-w-0">
         <div className="font-medium truncate">{garment.name}</div>
         <div className="text-sm text-muted-foreground">
          {garment.basePrice.toLocaleString('ru-RU')} ₽ • {garment.availablePositions.length} позиций
         </div>
        </div>
        
        <Button variant="ghost" color="gray" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onSelect(garment.id, garment.name, garment.basePrice)}
        >
         <Plus className="h-4 w-4" />
        </Button>
       </div>
      ))}
     </div>
    </ScrollArea>
   </CardContent>
  </Card>
 )
}
