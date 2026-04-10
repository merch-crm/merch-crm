'use client'

import { Percent } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PRINT_APPLICATION_QUANTITY_DISCOUNTS } from '../../types'

interface QuantityDiscountInfoProps {
 currentDiscountPercent: number
 totalItems: number
}

export function QuantityDiscountInfo({ 
 currentDiscountPercent, 
 totalItems 
}: QuantityDiscountInfoProps) {
 return (
  <Card>
   <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
     <Percent className="h-4 w-4" />
     Скидки от тиража
    </CardTitle>
   </CardHeader>
   
   <CardContent>
    <div className="space-y-1">
     {PRINT_APPLICATION_QUANTITY_DISCOUNTS.map((tier, idx) => {
      const isCurrent = currentDiscountPercent === tier.discount && 
       totalItems >= tier.minQuantity && 
       (tier.maxQuantity === null || totalItems <= tier.maxQuantity)

      return (
       <div 
        key={idx}
        className={`flex items-center justify-between text-xs p-1.5 rounded transition-colors ${
         isCurrent ? 'bg-green-100 font-bold' : 'text-muted-foreground'
        }`}
       >
        <span>{tier.label}</span>
        <span>{tier.discount}%</span>
       </div>
      )
     })}
    </div>
   </CardContent>
  </Card>
 )
}
