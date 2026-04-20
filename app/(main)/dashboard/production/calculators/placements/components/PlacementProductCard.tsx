/**
 * @fileoverview Карточка продукта нанесения (обновлённая)
 * @module calculators/placements/components/PlacementProductCard
 * @audit Обновлён 2026-03-25
 */

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
 MoreHorizontal,
 Edit,
 Trash2,
 EyeOff,
 MapPin,
 Copy,
} from 'lucide-react';
import { PlacementProduct, PRODUCT_TYPES } from '@/lib/types/placements';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

/**
 * Пропсы карточки продукта
 */
interface PlacementProductCardProps {
 product: PlacementProduct;
 viewMode: 'grid' | 'list';
 onEdit: () => void;
 onDelete: () => void;
 onDuplicate: () => void;
 isDeleting: boolean;
}

/**
 * Карточка продукта нанесения
 */
export function PlacementProductCard({
 product,
 viewMode,
 onEdit,
 onDelete,
 onDuplicate,
 isDeleting,
}: PlacementProductCardProps) {
 const productType = PRODUCT_TYPES[product.type];
 const activeAreas = product.areas.filter((a) => a.isActive);
 const prices = product.areas.map((a) => a.workPrice);
 const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
 const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

 const ActionsMenu = () => (
  <DropdownMenu>
   <DropdownMenuTrigger asChild>
    <Button variant="ghost" color="gray" size="icon" className="rounded-[10px] h-9 w-9 bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
     <MoreHorizontal className="h-4 w-4 text-slate-600" />
    </Button>
   </DropdownMenuTrigger>
   <DropdownMenuContent align="end" className="w-56 p-2 rounded-[14px]">
    <DropdownMenuItem onClick={onEdit} className="rounded-[8px] h-10 gap-2">
     <Edit className="h-4 w-4 text-slate-500" />
     <span>Редактировать</span>
    </DropdownMenuItem>
    <DropdownMenuItem onClick={onDuplicate} className="rounded-[8px] h-10 gap-2">
     <Copy className="h-4 w-4 text-slate-500" />
     <span>Дублировать</span>
    </DropdownMenuItem>
    <DropdownMenuSeparator className="my-1.5" />
    <DropdownMenuItem onClick={onDelete} disabled={isDeleting} className="rounded-[8px] h-10 gap-2 text-rose-500 focus:text-rose-600 focus:bg-rose-50 font-bold">
     <Trash2 className="h-4 w-4" />
     <span>Удалить</span>
    </DropdownMenuItem>
   </DropdownMenuContent>
  </DropdownMenu>
 );

 if (viewMode === 'list') {
  return (
   <Card className={cn( "rounded-[16px] border-slate-200 transition-all hover:border-slate-300 hover:shadow-md", !product.isActive && "bg-slate-50/50 grayscale-[0.5] opacity-80" )}>
    <CardContent className="p-4">
     <div className="flex items-center gap-3">
      {/* Иконка */}
      <div className="w-14 h-14 rounded-[14px] bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl shadow-inner shrink-0">
       {productType.icon}
      </div>

      {/* Информация */}
      <div className="flex-1 min-w-0">
       <div className="flex items-center gap-2 mb-1">
        <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
        {!product.isActive && (
         <Badge className="text-xs h-5 bg-slate-200 text-slate-600 border-none font-black" color="gray">
          Скрыт
         </Badge>
        )}
       </div>
       <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
        {productType.label} <span className="w-1 h-1 rounded-full bg-slate-300" /> {activeAreas.length} зон
       </p>
      </div>

      {/* Цены */}
      <div className="text-right shrink-0">
       <p className="text-lg font-black text-slate-900 leading-none">
        {minPrice === maxPrice
         ? formatCurrency(minPrice)
         : `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}`}
       </p>
       <p className="text-xs font-bold text-slate-400 mt-1">за нанесение</p>
      </div>

      {/* Действия */}
      <div className="shrink-0">
       <ActionsMenu />
      </div>
     </div>
    </CardContent>
   </Card>
  );
 }

 return (
  <Card className={cn( "rounded-[24px] border-slate-200 transition-all hover:border-slate-300 hover:shadow-xl group", !product.isActive && "bg-slate-50/50 grayscale-[0.5] opacity-80" )}>
   <CardHeader className="p-6 pb-0">
    <div className="flex items-start justify-between">
     <div className="flex items-center gap-3">
      <div className="w-16 h-16 rounded-[18px] bg-slate-50 border border-slate-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
       {productType.icon}
      </div>
      <div className="min-w-0">
       <h3 className="font-black text-xl text-slate-900 leading-tight mb-1 truncate">
        {product.name}
       </h3>
       <p className="text-xs font-bold text-slate-400">
        {productType.label}
       </p>
      </div>
     </div>
     <ActionsMenu />
    </div>
   </CardHeader>
   <CardContent className="p-6 space-y-3">
    {/* Статус */}
    {!product.isActive && (
     <Badge className="w-full justify-center text-xs h-7 bg-slate-100 text-slate-500 border-none font-bold" color="gray">
      <EyeOff className="h-3.5 w-3.5 mr-2" />
      Скрыт в калькуляторах
     </Badge>
    )}

    {/* Зоны */}
    <div className="space-y-3">
     <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
      <MapPin className="h-3.5 w-3.5" />
      <span>{activeAreas.length} зон нанесения</span>
     </div>
     <div className="flex flex-wrap gap-1.5">
      {activeAreas.slice(0, 4).map((area) => (
       <Badge key={area.id} color="purple" variant="outline" className="text-xs font-bold py-0.5 px-2 bg-slate-50/50 border-slate-200 text-slate-600 rounded-lg">
        {area.name}
       </Badge>
      ))}
      {activeAreas.length > 4 && (
       <Badge color="purple" variant="outline" className="text-xs font-black py-0.5 px-2 bg-indigo-50 border-indigo-100 text-indigo-600 rounded-lg">
        +{activeAreas.length - 4}
       </Badge>
      )}
      {activeAreas.length === 0 && (
       <p className="text-xs text-slate-400 italic">Зоны не настроены</p>
      )}
     </div>
    </div>

    {/* Цены */}
    <div className="pt-4 border-t border-slate-100 mt-2">
     <div className="flex items-end justify-between">
      <div>
       <p className="text-xs font-bold text-slate-400 mb-1">
        Стоимость работы
       </p>
       <p className="text-2xl font-black text-slate-900 ">
        {minPrice === maxPrice
         ? formatCurrency(minPrice)
         : `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}`}
       </p>
      </div>
     </div>
    </div>
   </CardContent>
  </Card>
 );
}

export default PlacementProductCard;
