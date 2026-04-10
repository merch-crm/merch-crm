// NO IMPORTS FROM VITEST - using globals: true
import { renderHook, act } from '@testing-library/react';
import { usePlacements } from '../use-placements';
import * as placementsActions from '@/lib/actions/calculators/placements';
import type { PlacementProduct } from '@/lib/types/placements';

// Mocks
vi.mock('@/lib/actions/calculators/placements');
vi.mock('sonner', () => ({
 toast: {
  success: vi.fn(),
  error: vi.fn(),
 },
}));

describe('usePlacements', () => {
 const mockProducts: PlacementProduct[] = [
  { 
   id: 'prod-1', 
   name: 'T-shirt', 
   type: 'dtf',
   description: 'Test product',
   isActive: true,
   areas: [
    { 
     id: 'area-1', 
     productId: 'prod-1',
     name: 'Front', 
     code: 'front', 
     workPrice: 10, 
     isActive: true, 
     maxWidthMm: 300, 
     maxHeightMm: 400, 
     sortOrder: 1,
     createdAt: new Date(),
     updatedAt: new Date()
    }
   ],
   sortOrder: 1,
   createdAt: new Date(),
   updatedAt: new Date()
  },
 ];

 beforeEach(() => {
  vi.clearAllMocks();
 });

 it('should fetch products on mount', async () => {
  vi.mocked(placementsActions.getPlacementProducts).mockResolvedValue(mockProducts);

  const { result } = renderHook(() => usePlacements(10));
  
  expect(result.current.isLoading).toBe(true);

  // Wait for useEffect
  await act(async () => {
   await Promise.resolve();
  });

  expect(result.current.isLoading).toBe(false);
  expect(result.current.availableProducts).toEqual(mockProducts);
 });

 it('should toggle placement selection', async () => {
  vi.mocked(placementsActions.getPlacementProducts).mockResolvedValue(mockProducts);
  const { result } = renderHook(() => usePlacements(10));

  await act(async () => {
   await Promise.resolve();
  });

  act(() => {
   result.current.togglePlacement(mockProducts[0], 'area-1', 5);
  });

  expect(result.current.selectedPlacements).toHaveLength(1);
  expect(result.current.selectedPlacements[0].count).toBe(5);
  expect(result.current.selectedPlacements[0].areaId).toBe('area-1');
 });

 it('should clear all selections', async () => {
  vi.mocked(placementsActions.getPlacementProducts).mockResolvedValue(mockProducts);
  const { result } = renderHook(() => usePlacements(10));

  await act(async () => {
   await Promise.resolve();
  });

  act(() => {
   result.current.togglePlacement(mockProducts[0], 'area-1', 1);
   result.current.clearPlacements();
  });

  expect(result.current.selectedPlacements).toHaveLength(0);
 });
});
