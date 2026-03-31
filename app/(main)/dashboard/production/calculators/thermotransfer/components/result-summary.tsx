'use client'

import { Calculator, TrendingDown, Zap } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { PrintApplicationResult } from '../../types'

interface ResultSummaryProps {
  result: PrintApplicationResult
  includeGarments: boolean
  isRush: boolean
}

export function ResultSummary({ result, isRush }: ResultSummaryProps) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Итого
          {isRush && (
            <Badge variant="destructive" className="ml-auto">
              <Zap className="h-3 w-3 mr-1" />
              Срочно
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="text-3xl font-bold">
          {result.totalCost.toLocaleString('ru-RU')} ₽
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">За единицу</div>
            <div className="font-medium text-lg">
              {result.costPerItem.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Изделий</div>
            <div className="font-medium text-lg">{result.totalItems} шт.</div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Нанесений</div>
            <div className="font-medium text-lg">{result.totalApplications} шт.</div>
          </div>
          
          {result.discountPercent > 0 && (
            <div>
              <div className="text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Скидка
              </div>
              <div className="font-medium text-lg text-green-600">
                -{result.discountPercent}%
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
