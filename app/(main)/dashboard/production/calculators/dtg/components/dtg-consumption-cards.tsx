'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { 
  Droplet, 
  Palette,
  Waves
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ConsumptionItem } from '../../types'

interface DtgConsumptionCardsProps {
  consumption: ConsumptionItem[]
}

const iconMap: Record<string, React.ReactNode> = {
  ink_cmyk: <Palette className="w-6 h-6" />,
  ink_white: <Droplet className="w-6 h-6" />,
  primer: <Waves className="w-6 h-6" />
}

const colorMap: Record<string, string> = {
  ink_cmyk: 'from-violet-500 to-indigo-600',
  ink_white: 'from-slate-200 to-slate-400',
  primer: 'from-amber-400 to-orange-500'
}

const textBgMap: Record<string, string> = {
    ink_cmyk: 'bg-violet-50 text-violet-600',
    ink_white: 'bg-slate-50 text-slate-600',
    primer: 'bg-amber-50 text-amber-600'
}

export const DtgConsumptionCards = memo(function DtgConsumptionCards({
  consumption
}: DtgConsumptionCardsProps) {
  if (consumption.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {consumption.map((item, index) => (
        <Card
          key={index}
          className="p-6 rounded-[28px] border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all border-none bg-white"
        >
          <div className={cn(
              "absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform",
              textBgMap[item.key] || 'text-slate-400'
          )}>
              {iconMap[item.key] || <Droplet className="w-16 h-16" />}
          </div>
          
          <div className="relative z-10 flex flex-col gap-3">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-inner",
                colorMap[item.key] || 'from-slate-100 to-slate-200'
            )}>
                <div className="text-white">
                    {iconMap[item.key] || <Droplet className="w-6 h-6" />}
                </div>
            </div>
            
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1">
                {item.name}
              </p>
              <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 ">
                    {item.value.toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-slate-400">{item.unit}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
})
