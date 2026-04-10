import { renderHook, act } from '@testing-library/react';
import { useAdjustStock } from './use-adjust-stock';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adjustInventoryStock } from '../stock-actions';
import type { InventoryItem, StorageLocation } from '@/lib/types';
import type React from 'react';

// Mock the server action
vi.mock('../stock-actions', () => ({
  adjustInventoryStock: vi.fn(),
}));

vi.mock('@/lib/sounds', () => ({
  playSound: vi.fn(),
}));

const mockItem = {
  id: 'item-1',
  quantity: 10,
  storageLocationId: 'loc-1',
  costPrice: 100,
} as unknown as InventoryItem;

const mockLocations: StorageLocation[] = [
  { id: 'loc-1', name: 'Склад 1' } as StorageLocation,
  { id: 'loc-2', name: 'Склад 2' } as StorageLocation,
];

describe('useAdjustStock', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values based on item', () => {
    const { result } = renderHook(() => useAdjustStock({
      item: mockItem,
      locations: mockLocations,
      onClose: mockOnClose
    }));

    expect(result.current.amount).toBe(1);
    expect(result.current.type).toBe("in");
    expect(result.current.selectedLocationId).toBe("loc-1");
    expect(result.current.costPrice).toBe("100");
  });

  it('sets initial amount to item quantity when type is"set"', () => {
    const { result } = renderHook(() => useAdjustStock({
      item: mockItem,
      locations: mockLocations,
      initialType:"set",
      onClose: mockOnClose
    }));

    expect(result.current.amount).toBe(10);
    expect(result.current.type).toBe("set");
  });

  it('selects first location if item has no storageLocationId', () => {
    const itemWithoutLoc = { ...mockItem, storageLocationId: null };
    const { result } = renderHook(() => useAdjustStock({
      item: itemWithoutLoc as InventoryItem,
      locations: mockLocations,
      onClose: mockOnClose
    }));

    expect(result.current.selectedLocationId).toBe("loc-1");
  });

  it('handles successful submission (replenish)', async () => {
    (adjustInventoryStock as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useAdjustStock({
      item: mockItem,
      locations: mockLocations,
      onClose: mockOnClose
    }));

    await act(async () => {
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(event);
    });

    expect(adjustInventoryStock).toHaveBeenCalledWith(
      'item-1',
      1,
      'in',
      '',
      'loc-1',
      100
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles successful submission (set)', async () => {
    (adjustInventoryStock as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useAdjustStock({
      item: mockItem,
      locations: mockLocations,
      initialType:"set",
      onClose: mockOnClose
    }));

    await act(async () => {
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(event);
    });

    expect(adjustInventoryStock).toHaveBeenCalledWith(
      'item-1',
      10,
      'set',
      '',
      'loc-1',
      undefined // costPrice undefined for 'set' type
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error on failed submission', async () => {
    (adjustInventoryStock as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, error: 'Server error' });
    const { result } = renderHook(() => useAdjustStock({
      item: mockItem,
      locations: mockLocations,
      onClose: mockOnClose
    }));

    await act(async () => {
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(event);
    });

    expect(result.current.error).toBe('Server error');
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('prevents submission if amount is zero or negative', async () => {
    const { result } = renderHook(() => useAdjustStock({
      item: mockItem,
      locations: mockLocations,
      onClose: mockOnClose
    }));

    act(() => {
      result.current.setAmount(0);
    });

    await act(async () => {
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(event);
    });

    expect(adjustInventoryStock).not.toHaveBeenCalled();
  });
});
