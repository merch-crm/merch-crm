'use client'

import { Clock, Calendar } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TimeEstimateProps {
  estimatedTimeMin: number
}

export function TimeEstimate({ estimatedTimeMin }: TimeEstimateProps) {
  const hours = Math.floor(estimatedTimeMin / 60)
  const mins = estimatedTimeMin % 60

  const timeString = hours > 0 
    ? `${hours} ч ${mins} мин` 
    : `${mins} мин`

  // Приблизительное количество смен (8 часов)
  const shifts = (estimatedTimeMin / 480).toFixed(1)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
          <Clock className="h-4 w-4" />
          Оценка времени
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold">{timeString}</div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-orange-50 p-2 rounded border border-orange-100 italic">
          <Calendar className="h-4 w-4" />
          Приблизительно {shifts} раб. смен
        </div>
        
        <p className="text-xs text-muted-foreground leading-tight">
          * Время включает настройку (приладку) оборудования и непосредственный процесс нанесения.
        </p>
      </CardContent>
    </Card>
  )
}
