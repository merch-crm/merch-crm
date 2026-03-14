'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search,
  Coffee,
  MousePointer,
  Puzzle,
  Flag,
  Shirt,
  Circle,
  Square,
  Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import { SUBLIMATION_PRODUCTS, type SublimationProduct } from '../../sublimation-types'

interface ProductSelectorProps {
  selectedProducts: Array<{
    productId: string
    quantity: number
    customName?: string
  }>
  onChange: (products: Array<{
    productId: string
    quantity: number
    customName?: string
  }>) => void
}

const productIcons: Record<string, React.ElementType> = {
  'cylindrical': Coffee,
  'flat': Square,
  'fabric': Flag,
}

const productSpecificIcons: Record<string, React.ElementType> = {
    'mousepad': MousePointer,
    'puzzle-a4': Puzzle,
    'puzzle-a3': Puzzle,
    'tshirt-full': Shirt,
    'fabric-meter': ImageIcon,
    'plate-20cm': Circle,
}

const productCategories = [
  { id: 'all', name: 'Все' },
  { id: 'mugs', name: 'Кружки', products: ['mug-11oz', 'mug-15oz'] },
  { id: 'souvenirs', name: 'Сувениры', products: ['mousepad', 'puzzle-a4', 'puzzle-a3', 'plate-20cm', 'pillow-40x40'] },
  { id: 'textile', name: 'Текстиль', products: ['flag-small', 'flag-medium', 'tshirt-full', 'fabric-meter'] }
]

interface ProductCardProps {
  product: SublimationProduct
  quantity: number
  onAdd: () => void
  onRemove: () => void
  onQuantityChange: (quantity: number) => void
}

const ProductCard = memo(function ProductCard({
  product,
  quantity,
  onAdd,
  onRemove,
  onQuantityChange
}: ProductCardProps) {
  const isSelected = quantity > 0
  const Icon = productSpecificIcons[product.id] || productIcons[product.type] || Square

  return (
    <Card 
      className={cn(
        "p-4 transition-all cursor-pointer border-slate-200 shadow-sm hover:shadow-md",
        isSelected ? "ring-2 ring-primary bg-primary/5 border-transparent" : "hover:bg-slate-50"
      )}
      role="button"
      tabIndex={isSelected ? -1 : 0}
      onClick={() => !isSelected && onAdd()}
      onKeyDown={(e) => {
        if (!isSelected && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onAdd()
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
          isSelected ? "bg-white text-primary" : "bg-slate-100 text-slate-400"
        )}>
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 truncate text-sm">{product.name}</h4>
          <p className="text-xs text-slate-500 font-medium">
            {product.widthMm} × {product.heightMm} мм
          </p>
          {product.pricePerUnit > 0 && (
            <div className="mt-1 flex items-center gap-1">
                <span className="text-xs font-bold text-slate-400 tracking-tight">Заготовка:</span>
                <span className="text-xs font-bold text-slate-700">{formatCurrency(product.pricePerUnit)}</span>
            </div>
          )}
        </div>

        {isSelected ? (
          <div role="button" tabIndex={0} className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            <Button
              variant="outline"
              size="icon"
              onClick={onRemove}
              className="w-7 h-7 rounded-lg bg-white border-slate-200"
            >
              {quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3.5 h-3.5" />}
            </Button>
            
            <Input
              type="number"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
              className="w-12 h-7 text-center p-0 text-xs font-bold bg-white border-slate-200 rounded-lg"
              min={0}
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={onAdd}
              className="w-7 h-7 rounded-lg bg-white border-slate-200"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={onAdd} className="h-8 text-xs font-bold rounded-lg hover:bg-primary/10 hover:text-primary">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Добавить
          </Button>
        )}
      </div>
    </Card>
  )
})

export const ProductSelector = memo(function ProductSelector({
  selectedProducts,
  onChange
}: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredProducts = useMemo(() => {
    let products = SUBLIMATION_PRODUCTS
    if (activeCategory !== 'all') {
      const category = productCategories.find(c => c.id === activeCategory)
      if (category?.products) {
        products = products.filter(p => category.products!.includes(p.id))
      }
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      products = (products || []).filter(p => p.name.toLowerCase().includes(query))
    }
    return products
  }, [searchQuery, activeCategory])

  const getQuantity = useCallback((productId: string): number => {
    const item = (selectedProducts || []).find(p => p.productId === productId)
    return item?.quantity || 0
  }, [selectedProducts])

  const handleAdd = useCallback((productId: string) => {
    const safeSelected = selectedProducts || []
    const existing = safeSelected.find(p => p.productId === productId)
    if (existing) {
      onChange(safeSelected.map(p => 
        p.productId === productId ? { ...p, quantity: p.quantity + 1 } : p
      ))
    } else {
      onChange([...safeSelected, { productId, quantity: 1 }])
    }
  }, [selectedProducts, onChange])

  const handleRemove = useCallback((productId: string) => {
    const existing = selectedProducts.find(p => p.productId === productId)
    if (existing && existing.quantity > 1) {
      onChange(selectedProducts.map(p => 
        p.productId === productId ? { ...p, quantity: p.quantity - 1 } : p
      ))
    } else {
      onChange(selectedProducts.filter(p => p.productId !== productId))
    }
  }, [selectedProducts, onChange])

  const handleQuantityChange = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      onChange(selectedProducts.filter(p => p.productId !== productId))
    } else {
      onChange(selectedProducts.map(p => 
        p.productId === productId ? { ...p, quantity } : p
      ))
    }
  }, [selectedProducts, onChange])

  return (
    <div className="space-y-3">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск изделий..."
            className="pl-10 bg-white border-slate-200 rounded-xl focus:ring-primary/20 h-10"
            />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {productCategories.map(cat => (
                <Button
                    key={cat.id}
                    variant={activeCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                        "rounded-full px-4 h-10 text-xs font-bold whitespace-nowrap",
                        activeCategory === cat.id ? "shadow-md" : "bg-white border-slate-200 text-slate-600"
                    )}
                >
                    {cat.name}
                </Button>
            ))}
        </div>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={getQuantity(product.id)}
            onAdd={() => handleAdd(product.id)}
            onRemove={() => handleRemove(product.id)}
            onQuantityChange={(qty) => handleQuantityChange(product.id, qty)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold">Ничего не найдено</p>
        </div>
      )}
    </div>
  )
})
