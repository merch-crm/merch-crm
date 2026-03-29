// NO IMPORTS FROM VITEST - using globals: true
import { renderHook, act } from '@testing-library/react';
import { usePlacementsManagement } from '../use-placements-management';
import * as placementsActions from '@/lib/actions/calculators/placements';
import type { PlacementProduct } from '@/lib/types/placements';
import type { ActionResult } from '@/lib/types/common';

// Mocks
vi.mock('@/lib/actions/calculators/placements');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('usePlacementsManagement', () => {
  const mockPlacements: PlacementProduct[] = [
    { 
      id: '1', 
      name: 'Front', 
      type: 'dtf',
      description: 'Front placement',
      isActive: true,
      areas: [],
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with provided products', () => {
    const { result } = renderHook(() => usePlacementsManagement(mockPlacements));
    expect(result.current.products).toEqual(mockPlacements);
    expect(result.current.filteredProducts).toEqual(mockPlacements);
  });

  it('should handle product creation', async () => {
    const newProduct = { ...mockPlacements[0], id: '2', name: 'Back' };
    vi.mocked(placementsActions.createPlacementProduct).mockResolvedValue({ 
      success: true, 
      data: newProduct 
    } as unknown as ActionResult<PlacementProduct>);

    const { result } = renderHook(() => usePlacementsManagement(mockPlacements));

    await act(async () => {
      await result.current.handleSave({ 
        name: 'Back', 
        type: 'dtf', 
        areas: [],
        isActive: true 
      });
    });

    expect(placementsActions.createPlacementProduct).toHaveBeenCalled();
    expect(result.current.products).toContainEqual(newProduct);
  });

  it('should handle product deletion', async () => {
    vi.mocked(placementsActions.deletePlacementProduct).mockResolvedValue({ 
      success: true, 
      data: undefined 
    } as any);

    const { result } = renderHook(() => usePlacementsManagement(mockPlacements));

    // First set the delete confirm state
    act(() => {
      result.current.handleDeleteClick(mockPlacements[0]);
    });

    // Then confirm
    await act(async () => {
      await result.current.handleDeleteConfirm();
    });

    expect(placementsActions.deletePlacementProduct).toHaveBeenCalledWith('1');
    expect(result.current.products).toHaveLength(0);
  });

  it('should filter products by search query', () => {
    const products: PlacementProduct[] = [
      { ...mockPlacements[0], id: '1', name: 'Front' },
      { ...mockPlacements[0], id: '2', name: 'Back' },
    ];
    const { result } = renderHook(() => usePlacementsManagement(products));

    act(() => {
      result.current.setSearchQuery('front');
    });

    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0].name).toBe('Front');
  });
});
