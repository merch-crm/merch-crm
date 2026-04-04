/**
 * @fileoverview Клиентский компонент страницы нанесений (обновлённый)
 * @module calculators/placements/placements-page-client
 * @audit Обновлён 2026-03-25
 */

'use client';

import { usePlacementsManagement } from '../hooks/use-placements-management';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  ArrowLeft,
  Package,
  GripVertical,
} from 'lucide-react';
import Link from 'next/link';
import {
  PlacementProduct,
  PlacementProductType,
  PRODUCT_TYPES,
} from '@/lib/types/placements';
import { PlacementProductCard } from './components/PlacementProductCard';
import { PlacementProductModal } from './components/PlacementProductModal';

/**
 * Пропсы клиентского компонента
 */
interface PlacementsPageClientProps {
  initialProducts: PlacementProduct[];
}

/**
 * Сортируемая обёртка для карточки
 */
function SortableProductCard({
  product,
  viewMode,
  onEdit,
  onDelete,
  onDuplicate,
  isDeleting,
  disabled,
}: {
  product: PlacementProduct;
  viewMode: 'grid' | 'list';
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isDeleting: boolean;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {!disabled && (
        <div
          {...attributes}
          {...listeners}
          className={`
            absolute z-10 cursor-grab active:cursor-grabbing
            ${viewMode === 'grid' 
              ? 'top-2 right-12 opacity-0 group-hover:opacity-100' 
              : 'left-0 top-1/2 -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100'
            }
            transition-opacity p-1 rounded-md hover:bg-muted
          `}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <PlacementProductCard
        product={product}
        viewMode={viewMode}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        isDeleting={isDeleting}
      />
    </div>
  );
}

/**
 * Клиентский компонент страницы управления нанесениями
 */
export function PlacementsPageClient({
  initialProducts,
}: PlacementsPageClientProps) {
  const {
    products,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    viewMode,
    setViewMode,
    isModalOpen,
    setIsModalOpen,
    editingProduct,
    setEditingProduct,
    isDeleting,
    deleteConfirm,
    setDeleteConfirm,
    filteredProducts,
    canSort,
    handleDragEnd,
    handleCreate,
    handleEdit,
    handleDuplicate,
    handleDeleteClick,
    handleDeleteConfirm,
    handleSave,
  } = usePlacementsManagement(initialProducts);

  // Сенсоры для drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Опции для Select
  const typeOptions = [
    { id: 'all', title: 'Все типы' },
    ...Object.entries(PRODUCT_TYPES).map(([id, config]) => ({
      id,
      title: config.label,
      icon: <span className="text-lg">{config.icon}</span>,
    })),
  ];

  return (
    <div className="space-y-3">
      {/* Заголовок */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/production/calculators">
            <Button variant="ghost" size="icon" className="rounded-xl bg-white border border-slate-200">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold ">Нанесения</h1>
            <p className="text-sm text-slate-500">
              Управление продуктами и зонами нанесения для калькуляторов
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} className="rounded-xl h-11 px-6 shadow-md hover:shadow-lg transition-all gap-2">
          <Plus className="h-4 w-4" />
          Добавить продукт
        </Button>
      </div>

      <Separator className="bg-slate-100" />

      {/* Фильтры и поиск */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 sticky top-0 z-10 py-2 bg-slate-50/80 backdrop-blur-md -mx-2 px-2 rounded-xl border border-transparent hover:border-slate-200/50 transition-all">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или зоне..."
            className="pl-10 h-11 rounded-[12px] bg-white border-slate-200 focus:border-slate-300 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filterType}
            onChange={(v) => setFilterType(v as PlacementProductType | 'all')}
            options={typeOptions}
            className="w-56"
            compact
          />

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-[12px] p-1 shadow-sm">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-9 w-9 rounded-[8px]"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-9 w-9 rounded-[8px]"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Статистика и подсказка */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Всего: <strong className="text-slate-700">{products?.length || 0}</strong>
          </span>
          <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Активных: <strong className="text-slate-700">{(products || []).filter((p: PlacementProduct) => p.isActive).length}</strong>
          </span>
        </div>
        {canSort && (filteredProducts?.length || 0) > 1 && (
          <span className="flex items-center gap-1.5 opacity-60">
            <GripVertical className="h-3.5 w-3.5" />
            Перетащите для изменения порядка
          </span>
        )}
      </div>

      {/* Список продуктов */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-[24px] bg-white/50">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
            <Package className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Нет продуктов</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            {searchQuery || filterType !== 'all'
              ? 'Попробуйте изменить параметры поиска или фильтрации'
              : 'Добавьте первый продукт для настройки нанесений в калькуляторах'}
          </p>
          {!searchQuery && filterType === 'all' && (
            <Button onClick={handleCreate} className="rounded-xl px-8 h-12 shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              Создать продукт
            </Button>
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={(filteredProducts || []).map((p: PlacementProduct) => p.id)}
            strategy={
              viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy
            }
          >
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
                  : 'space-y-3 max-w-5xl mx-auto'
              }
            >
              {(filteredProducts || []).map((product) => (
                <SortableProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  onEdit={() => handleEdit(product)}
                  onDelete={() => handleDeleteClick(product)}
                  onDuplicate={() => handleDuplicate(product)}
                  isDeleting={isDeleting}
                  disabled={!canSort}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Модалка создания/редактирования */}
      <PlacementProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSave}
      />

      {/* Диалог подтверждения удаления */}
      <AlertDialog
        open={deleteConfirm.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteConfirm({ isOpen: false, productId: null, productName: '' })
        }
      >
        <AlertDialogContent className="rounded-[24px] border-none shadow-2xl p-8 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900">Удалить продукт?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 pt-2 leading-relaxed">
              Вы уверены, что хотите удалить «<span className="font-bold text-slate-700">{deleteConfirm.productName}</span>»?
              Это действие также удалит все зоны нанесения этого продукта.
              Данные можно будет восстановить в течение 30 дней.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
            <AlertDialogCancel className="h-12 px-6 rounded-xl bg-slate-100 border-none hover:bg-slate-200 text-slate-700 font-bold transition-all">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="h-12 px-6 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-200/50 transition-all border-none"
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PlacementsPageClient;
