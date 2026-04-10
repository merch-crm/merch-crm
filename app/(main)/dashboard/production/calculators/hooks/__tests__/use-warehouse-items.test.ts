import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWarehouseItems } from '../use-warehouse-items';
import * as warehouseActions from '@/lib/actions/calculators/warehouse';
import type { WarehouseItemForCalculator } from '@/lib/actions/calculators/warehouse';
import type { ActionResult } from '@/lib/types/common';

// We use vi.mock without a factory to let Vitest initialize the module as a mock
vi.mock('@/lib/actions/calculators/warehouse');

describe('useWarehouseItems', () => {
 const mockItems: WarehouseItemForCalculator[] = [
  { 
   id: 'item-1', 
   name: 'Paper', 
   price: 100,
   unit: 'm2',
   category: 'Paper',
   stock: 100
  },
 ];

 beforeEach(() => {
  vi.clearAllMocks();
 });

 it('should fetch items on mount', async () => {
  // vi.mocked provides the type safety for the mock methods
  vi.mocked(warehouseActions.getWarehouseItemsForCalculator).mockResolvedValue({
   success: true,
   data: mockItems
  } as unknown as ActionResult<WarehouseItemForCalculator[]>);

  const { result } = renderHook(() => useWarehouseItems('dtf'));

  expect(result.current.isLoading).toBe(true);
 });
});
