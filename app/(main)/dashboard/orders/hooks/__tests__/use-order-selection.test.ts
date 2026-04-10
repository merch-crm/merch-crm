import { renderHook, act } from '@testing-library/react';
import { useOrderSelection } from '../use-order-selection';
import { describe, it, expect } from 'vitest';

const mockOrders = [
  { id: '1' },
  { id: '2' },
  { id: '3' },
] as unknown as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

describe('useOrderSelection', () => {
  it('initializes with empty selection', () => {
    const { result } = renderHook(() => useOrderSelection(mockOrders));

    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
  });

  it('toggles individual row selection', () => {
    const { result } = renderHook(() => useOrderSelection(mockOrders));

    act(() => {
      result.current.handleSelectRow('1');
    });
    expect(result.current.selectedIds).toContain('1');

    act(() => {
      result.current.handleSelectRow('1');
    });
    expect(result.current.selectedIds).not.toContain('1');
  });

  it('toggles all rows', () => {
    const { result } = renderHook(() => useOrderSelection(mockOrders));

    act(() => {
      result.current.toggleAll(true);
    });
    expect(result.current.selectedIds).toHaveLength(3);
    expect(result.current.isAllSelected).toBe(true);

    act(() => {
      result.current.toggleAll(false);
    });
    expect(result.current.selectedIds).toHaveLength(0);
    expect(result.current.isAllSelected).toBe(false);
  });

  it('clears selection', () => {
    const { result } = renderHook(() => useOrderSelection(mockOrders));

    act(() => {
      result.current.toggleAll(true);
    });
    expect(result.current.selectedIds).toHaveLength(3);

    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selectedIds).toHaveLength(0);
  });

  it('updates isAllSelected correctly when manually selecting all', () => {
    const { result } = renderHook(() => useOrderSelection(mockOrders));

    act(() => {
      result.current.handleSelectRow('1');
      result.current.handleSelectRow('2');
      result.current.handleSelectRow('3');
    });

    expect(result.current.isAllSelected).toBe(true);
  });
});
