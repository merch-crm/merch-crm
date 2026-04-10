import { useState, useCallback } from "react";
import type { Order } from "@/lib/types/order";

export function useOrderSelection(orders: Order[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isAllSelected = (orders?.length || 0) > 0 && orders?.every(o => selectedIds.includes(o.id));

  const handleSelectRow = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const toggleAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(orders?.map(o => o.id) || []);
    } else {
      setSelectedIds([]);
    }
  }, [orders]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    isAllSelected,
    handleSelectRow,
    toggleAll,
    clearSelection
  };
}
