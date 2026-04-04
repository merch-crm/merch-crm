'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EMBROIDERY_QUANTITY_DISCOUNTS } from '../../types'

interface EmbroideryQuantityDiscountInfoProps {
  currentQuantity: number
}

export const EmbroideryQuantityDiscountInfo = memo(function EmbroideryQuantityDiscountInfo({
  currentQuantity
}: EmbroideryQuantityDiscountInfoProps) {
  // Находим текущую скидку
  const currentDiscountIdx = [...EMBROIDERY_QUANTITY_DISCOUNTS]
    .sort((a, b) => b.minQuantity - a.minQuantity)
    .findIndex(d => currentQuantity >= d.minQuantity)
  
  const currentDiscount = currentDiscountIdx !== -1 
    ? [...EMBROIDERY_QUANTITY_DISCOUNTS].sort((a, b) => b.minQuantity - a.minQuantity)[currentDiscountIdx]
    : null

  // Следующий уровень
  const nextDiscount = [...EMBROIDERY_QUANTITY_DISCOUNTS]
    .sort((a, b) => a.minQuantity - b.minQuantity)
    .find(d => d.minQuantity > currentQuantity)

  return (
    <Card className="p-6 border-slate-200 shadow-sm bg-white overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xs font-black text-slate-400">Система скидок</h4>
        {currentDiscount ? (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 rounded-full font-black text-xs">
             Активна скидка: {currentDiscount.discount}%
          </Badge>
        ) : (
          <Badge variant="outline" className="text-slate-400 font-bold text-xs">Скидка не применяется</Badge>
        )}
      </div>

      <div className="space-y-3">
        {/* Визуализация уровней */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EMBROIDERY_QUANTITY_DISCOUNTS.map((tier, idx) => {
            const isActive = currentQuantity >= tier.minQuantity
            const isNext = nextDiscount?.minQuantity === tier.minQuantity

            return (
              <div 
                key={idx}
                className={cn(
                  "p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden group",
                  isActive 
                    ? "bg-green-50 border-green-200 text-green-900" 
                    : isNext
                      ? "bg-blue-50 border-blue-200 border-dashed"
                      : "bg-slate-50 border-slate-100 opacity-60"
                )}
              >
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                )}
                
                <div className="flex flex-col">
                  <span className="text-xs font-black opacity-60">от {tier.minQuantity} шт</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black ">-{tier.discount}%</span>
                    <span className="text-xs font-bold opacity-60 ">экономии</span>
                  </div>
                </div>

                {isNext && (
                   <div className="mt-2 text-xs font-black text-blue-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Следующая цель
                   </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Прогресс-подсказка */}
        {nextDiscount && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
             {/* Схематичный прогресс-бар */}
             <div className="absolute bottom-0 left-0 h-1 bg-pink-500 transition-all duration-1000" 
                  style={{ width: `${(currentQuantity / nextDiscount.minQuantity) * 100}%` }} />
             
             <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                   <p className="text-sm font-bold ">
                     Добавьте еще <span className="text-pink-400 font-black">{nextDiscount.minQuantity - currentQuantity} изд.</span>
                   </p>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      чтобы получить скидку <span className="text-white">{nextDiscount.discount}%</span> на весь тираж.
                    </p>
                </div>
             </div>
          </div>
        )}

        {!nextDiscount && currentQuantity > 0 && (
          <div className="p-4 rounded-2xl bg-green-600 text-white flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
             </div>
              <div>
                <p className="text-sm font-bold ">Максимальная скидка!</p>
                <p className="text-xs font-bold text-white/70">Вы используете лучшую цену для данного тиража.</p>
              </div>
          </div>
        )}
      </div>
    </Card>
  )
})
