'use client'

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, History } from 'lucide-react'
import { 
 type ApplicationType, 
 APPLICATION_TYPE_LABELS,
 APPLICATION_TYPE_DESCRIPTIONS 
} from '../types'

interface CalculatorHeaderProps {
 applicationType: ApplicationType
 onSettingsClick: () => void
 onHistoryClick: () => void
}

export const CalculatorHeader = memo(function CalculatorHeader({
 applicationType,
 onSettingsClick,
 onHistoryClick
}: CalculatorHeaderProps) {
 return (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
   <div>
    <div className="flex items-center gap-3">
     <h1 className="text-2xl font-bold text-slate-900">
      {APPLICATION_TYPE_LABELS[applicationType]}
     </h1>
     <Badge className="text-xs" color="neutral">
      Калькулятор
     </Badge>
    </div>
    {APPLICATION_TYPE_DESCRIPTIONS[applicationType] && (
     <p className="text-sm text-slate-500 mt-1">
      {APPLICATION_TYPE_DESCRIPTIONS[applicationType]}
     </p>
    )}
   </div>

   <div className="flex items-center gap-2">
    <Button variant="outline" color="neutral" size="sm" onClick={onHistoryClick} className="rounded-xl">
     <History className="w-4 h-4 mr-2" />
     <span className="hidden sm:inline">История</span>
    </Button>
    
    <Button variant="outline" color="neutral" size="sm" onClick={onSettingsClick} className="rounded-xl">
     <Settings className="w-4 h-4 mr-2" />
     <span className="hidden sm:inline">Настройки</span>
    </Button>
   </div>
  </div>
 )
})
