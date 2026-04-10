import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { 
 PlacementProduct, 
 PlacementProductType, 
 PlacementProductFormData 
} from '@/lib/types/placements';
import { 
 deletePlacementProduct, 
 createPlacementProduct, 
 updatePlacementProduct,
 updatePlacementProductsOrder
} from '@/lib/actions/calculators/placements';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export function usePlacementsManagement(initialProducts: PlacementProduct[]) {
 const [products, setProducts] = useState<PlacementProduct[]>(initialProducts);
 const [searchQuery, setSearchQuery] = useState('');
 const [filterType, setFilterType] = useState<PlacementProductType | 'all'>('all');
 const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingProduct, setEditingProduct] = useState<PlacementProduct | null>(null);
 const [isDeleting, setIsDeleting] = useState(false);
 const [deleteConfirm, setDeleteConfirm] = useState<{
  isOpen: boolean;
  productId: string | null;
  productName: string;
 }>({ isOpen: false, productId: null, productName: '' });

 const filteredProducts = useMemo(() => {
  return (products || []).filter((product) => {
   const matchesSearch =
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.areas.some((a) =>
     a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
   const matchesType = filterType === 'all' || product.type === filterType;
   return matchesSearch && matchesType;
  });
 }, [products, searchQuery, filterType]);

 const canSort = !searchQuery && filterType === 'all';

 const handleDragEnd = useCallback(
  async (event: DragEndEvent) => {
   const { active, over } = event;

   if (over && active.id !== over.id) {
    const oldIndex = (products || []).findIndex((p) => p.id === active.id);
    const newIndex = (products || []).findIndex((p) => p.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
     const newProducts = arrayMove(products || [], oldIndex, newIndex);
     setProducts(newProducts);

     const orderedIds = (newProducts || []).map((p) => p.id);
     const result = await updatePlacementProductsOrder(orderedIds);

     if (!result.success) {
      setProducts(products);
      toast.error('Не удалось сохранить порядок');
     }
    }
   }
  },
  [products]
 );

 const handleCreate = () => {
  setEditingProduct(null);
  setIsModalOpen(true);
 };

 const handleEdit = (product: PlacementProduct) => {
  setEditingProduct(product);
  setIsModalOpen(true);
 };

 const handleDuplicate = useCallback(
  async (product: PlacementProduct) => {
   try {
    const result = await createPlacementProduct({
     type: product.type,
     name: `${product.name} (копия)`,
     description: product.description,
     isActive: product.isActive,
     areas: product.areas.map((a) => ({
      name: a.name,
      code: a.code,
      maxWidthMm: a.maxWidthMm,
      maxHeightMm: a.maxHeightMm,
      workPrice: a.workPrice,
      isActive: a.isActive,
      sortOrder: a.sortOrder,
     })),
    });

    if (result.success && result.data) {
     setProducts((prev) => [...prev, result.data! as PlacementProduct]);
     toast.success(`Создана копия "${product.name}"`);
    } else {
     toast.error('error' in result ? result.error : 'Не удалось дублировать продукт');
    }
   } catch (_error) {
    toast.error('Не удалось дублировать продукт');
   }
  },
  []
 );

 const handleDeleteClick = (product: PlacementProduct) => {
  setDeleteConfirm({
   isOpen: true,
   productId: product.id,
   productName: product.name,
  });
 };

 const handleDeleteConfirm = useCallback(async () => {
  if (!deleteConfirm.productId) return;

  setIsDeleting(true);
  try {
   const result = await deletePlacementProduct(deleteConfirm.productId);
   if (result.success) {
    setProducts((prev) =>
     prev.filter((p) => p.id !== deleteConfirm.productId)
    );
    toast.success(`"${deleteConfirm.productName}" успешно удалён`);
   } else {
    toast.error('error' in result ? result.error : 'Не удалось удалить продукт');
   }
  } catch (_error) {
   toast.error('Не удалось удалить продукт');
  } finally {
   setIsDeleting(false);
   setDeleteConfirm({ isOpen: false, productId: null, productName: '' });
  }
 }, [deleteConfirm]);

 const handleSave = async (formData: PlacementProductFormData) => {
  try {
   let result;
   if (editingProduct) {
    result = await updatePlacementProduct(editingProduct.id, formData);
   } else {
    result = await createPlacementProduct(formData);
   }

   if (result.success && result.data) {
    const savedProduct = result.data as PlacementProduct;
    setProducts((prev) => {
     const index = prev.findIndex((p) => p.id === savedProduct.id);
     if (index >= 0) {
      const updated = [...prev];
      updated[index] = savedProduct;
      return updated;
     }
     return [...prev, savedProduct];
    });
    setIsModalOpen(false);
    setEditingProduct(null);
    toast.success(editingProduct ? 'Изменения сохранены' : 'Продукт создан');
   } else {
    toast.error('error' in result ? result.error : 'Ошибка при сохранении');
   }
  } catch (_error) {
   toast.error('Произошла ошибка при сохранении');
  }
 };

 return {
  products,
  setProducts,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  viewMode,
  setViewMode,
  isModalOpen,
  setIsModalOpen,
  editingProduct,
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
  setEditingProduct,
 };
}
