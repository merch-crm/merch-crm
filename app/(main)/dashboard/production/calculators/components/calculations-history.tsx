'use client'

import { useState as useReactState, useCallback, useEffect, memo, ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { 
 Search, 
 Trash2,
 Copy,
 ChevronLeft,
 ChevronRight,
 History,
 Layers,
 Droplets,
 Shirt,
 X,
 Printer,
 Flame,
 Scissors,
 PenTool
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { 
 getCalculationsHistory, 
 deleteCalculation,
 type CalculationHistoryItem,
 type CalculationHistoryFilters 
} from '../actions/history-actions'
import { 
 type ApplicationType, 
 APPLICATION_TYPE_LABELS 
} from '../types'

interface CalculationsHistoryProps {
 applicationType?: ApplicationType
 onSelect?: (calculation: CalculationHistoryItem) => void
 onClose?: () => void
 isModal?: boolean
}

const APP_ICONS: Record<ApplicationType, ReactNode> = {
 dtf: <Printer className="h-4 w-4" />,
 sublimation: <Droplets className="h-4 w-4" />,
 dtg: <Shirt className="h-4 w-4" />,
 silkscreen: <Layers className="h-4 w-4" />,
 thermotransfer: <Flame className="h-4 w-4" />,
 embroidery: <Scissors className="h-4 w-4" />,
 "print-application": <PenTool className="h-4 w-4" />,
}

const typeColors: Record<ApplicationType, string> = {
 dtf: 'bg-blue-100 text-blue-700',
 sublimation: 'bg-purple-100 text-purple-700',
 dtg: 'bg-green-100 text-green-700',
 silkscreen: 'bg-orange-100 text-orange-700',
 thermotransfer: 'bg-red-100 text-red-700',
 embroidery: 'bg-pink-100 text-pink-700',
 "print-application": 'bg-indigo-100 text-indigo-700'
}

export const CalculationsHistory = memo(function CalculationsHistory({
 applicationType,
 onSelect,
 onClose,
 isModal = false
}: CalculationsHistoryProps) {
 const { toast } = useToast()
 
 const [items, setItems] = useReactState<CalculationHistoryItem[]>([])
 const [isLoading, setIsLoading] = useReactState(true)
 const [total, setTotal] = useReactState(0)
 const [page, setPage] = useReactState(1)
 const [totalPages, setTotalPages] = useReactState(1)
 
 // Фильтры
 const [searchQuery, setSearchQuery] = useReactState('')
 const [filterType, setFilterType] = useReactState<ApplicationType | ''>(applicationType || '')
 
 // Удаление
 const [deleteId, setDeleteId] = useReactState<string | null>(null)
 const [isDeleting, setIsDeleting] = useReactState(false)

 // Загрузка данных
 const loadHistory = useCallback(async () => {
  setIsLoading(true)
  
  const filters: CalculationHistoryFilters = {
   page,
   limit: 10
  }
  
  if (filterType) {
   filters.applicationType = filterType
  }
  
  if (searchQuery) {
   filters.search = searchQuery
  }

  const result = await getCalculationsHistory(filters)
  
  if (result.success && result.data) {
   setItems(result.data.items)
   setTotal(result.data.total)
   setTotalPages(result.data.totalPages)
  } else {
   const hasError = !result.success ? result.error : 'Не удалось загрузить историю'
   toast(typeof hasError === 'string' ? hasError : 'Не удалось загрузить историю', 'error')
  }
  
  setIsLoading(false)
 }, [page, filterType, searchQuery, toast, setIsLoading, setItems, setTotal, setTotalPages])

 useEffect(() => {
  loadHistory()
 }, [loadHistory])

 // Поиск с дебаунсом
 useEffect(() => {
  const timer = setTimeout(() => {
   setPage(1)
   loadHistory()
  }, 300)
  
  return () => clearTimeout(timer)
 }, [searchQuery, loadHistory, setPage])

 // Обработчики
 const handleTypeChange = useCallback((value: string) => {
  setFilterType(value as ApplicationType | '')
  setPage(1)
 }, [setFilterType, setPage])

 const handleDelete = useCallback(async () => {
  if (!deleteId) return
  
  setIsDeleting(true)
  
  const result = await deleteCalculation(deleteId)
  
  if (result.success) {
   toast('Расчёт удалён', 'success')
   loadHistory()
  } else {
   const hasError = !result.success ? result.error : 'Ошибка удаления'
   toast(typeof hasError === 'string' ? hasError : 'Ошибка удаления', 'error')
  }
  
  setIsDeleting(false)
  setDeleteId(null)
 }, [deleteId, loadHistory, toast, setDeleteId, setIsDeleting])

 const handleCopyNumber = useCallback(async (number: string) => {
  try {
   await navigator.clipboard.writeText(number)
   toast('Номер скопирован', 'success')
  } catch {
   toast('Ошибка копирования', 'error')
  }
 }, [toast])

 // Опции фильтра типов
 const typeOptions = [
  { id: '', title: 'Все типы' },
  { id: 'dtf', title: 'DTF' },
  { id: 'sublimation', title: 'Сублимация' },
  { id: 'dtg', title: 'DTG' },
  { id: 'silkscreen', title: 'Шелкография' }
 ]

 return (
  <div className={cn("space-y-3", isModal && "p-4")}>
   {/* Заголовок */}
   <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
     <History className="w-5 h-5 text-slate-500" />
     <h3 className="text-lg font-bold text-slate-900">История расчётов</h3>
     {total > 0 && (
      <Badge color="neutral">{total}</Badge>
     )}
    </div>
    
    {isModal && onClose && (
     <Button variant="ghost" color="neutral" size="sm" onClick={onClose}>
      <X className="w-5 h-5" />
     </Button>
    )}
   </div>

   {/* Фильтры */}
   <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1">
     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
     <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Поиск по номеру..."
      className="pl-10"
     />
    </div>
    
    {!applicationType && (
     <Select value={filterType} onChange={handleTypeChange} options={typeOptions} className="w-full sm:w-40" compact />
    )}
   </div>

   {/* Список */}
   {isLoading ? (
    <div className="space-y-3">
     {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-20 rounded-xl" />
     ))}
    </div>
   ) : (items || []).length === 0 ? (
    <Card className="p-8 text-center">
     <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
     <p className="text-slate-500">История расчётов пуста</p>
    </Card>
   ) : (
    <div className="space-y-2">
     {(items || []).map(item => (
      <Card key={item.id} className={cn( "p-4 hover:shadow-md transition-shadow", onSelect && "cursor-pointer" )} onClick={() => onSelect?.(item)}
       onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
         e.preventDefault()
         onSelect(item)
        }
       }}
       role={onSelect ? "button" : "article"}
       tabIndex={onSelect ? 0 : undefined}
      >
       <div className="flex items-center gap-3">
        {/* Иконка типа */}
        <div className={cn(
         "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
         typeColors[item.applicationType]
        )}>
         {APP_ICONS[item.applicationType]}
        </div>

        {/* Информация */}
        <div className="flex-1 min-w-0">
         <div className="flex items-center gap-2 mb-1">
          <span className="font-mono font-medium text-slate-900">
           {item.calculationNumber}
          </span>
          <Button variant="ghost" color="neutral" size="sm" onClick={(e) => {
            e.stopPropagation()
            handleCopyNumber(item.calculationNumber)
           }}
           className="w-6 h-6 p-0"
          >
           <Copy className="w-3 h-3" />
          </Button>
         </div>
         
         <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>{formatDate(item.createdAt, 'DD.MM.YYYY')}</span>
          <span>•</span>
          <span>{item.totalPrints} шт</span>
          <span>•</span>
          <span>{item.groupsCount} позиций</span>
          {item.userName && (
           <>
            <span>•</span>
            <span>{item.userName}</span>
           </>
          )}
         </div>
        </div>

        {/* Стоимость */}
        <div className="text-right shrink-0">
         <p className="text-lg font-bold text-slate-900">
          {formatCurrency(item.totalCost)}
         </p>
         <Badge className={cn("text-xs", typeColors[item.applicationType])} color="neutral">
          {APPLICATION_TYPE_LABELS[item.applicationType]}
         </Badge>
        </div>

        {/* Действия */}
        <div role="button" tabIndex={0} className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
         <Button variant="ghost" color="neutral" size="sm" onClick={() => setDeleteId(item.id)}
         >
          <Trash2 className="w-4 h-4 text-red-500" />
         </Button>
        </div>
       </div>
      </Card>
     ))}
    </div>
   )}

   {/* Пагинация */}
   {totalPages > 1 && (
    <div className="flex items-center justify-center gap-2">
     <Button variant="outline" color="neutral" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))}
      disabled={page === 1 || isLoading}
     >
      <ChevronLeft className="w-4 h-4" />
     </Button>
     
     <span className="text-sm text-slate-600">
      {page} из {totalPages}
     </span>
     
     <Button variant="outline" color="neutral" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))}
      disabled={page === totalPages || isLoading}
     >
      <ChevronRight className="w-4 h-4" />
     </Button>
    </div>
   )}

   {/* Диалог подтверждения удаления */}
   <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
    onConfirm={handleDelete}
    title="Удалить расчёт?"
    description="Это действие нельзя отменить. Расчёт будет удалён безвозвратно."
    confirmText="Удалить"
    isLoading={isDeleting}
    variant="destructive"
   />
  </div>
 )
})
