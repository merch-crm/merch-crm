// tests/unit/services/calculators/placements-service.test.ts

import { describe, it, expect } from 'vitest';
import { PlacementsService } from '@/lib/services/calculators/placements-service';
import { SelectedPlacement } from '@/lib/types/placements';

describe('PlacementsService', () => {
  const mockPlacements: SelectedPlacement[] = [
    {
      areaId: 'chest',
      productId: 'tshirt',
      productName: 'T-Shirt',
      areaName: 'Chest',
      workPrice: 100,
      count: 1,
    },
    {
      areaId: 'back',
      productId: 'tshirt',
      productName: 'T-Shirt',
      areaName: 'Back',
      workPrice: 150,
      count: 1,
    },
  ];

  describe('calculateTotalCost', () => {
    it('should correctly calculate total cost for placements and quantity', () => {
      const quantity = 10;
      const result = PlacementsService.calculateTotalCost(mockPlacements, quantity);
      
      // costPerUnit = 100 + 150 = 250
      // totalCost = 250 * 10 = 2500
      
      expect(result.costPerUnit).toBe(250);
      expect(result.totalCost).toBe(2500);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].subtotal).toBe(100);
      expect(result.items[1].subtotal).toBe(150);
    });

    it('should return zero for empty placements', () => {
      const result = PlacementsService.calculateTotalCost([], 10);
      expect(result.totalCost).toBe(0);
      expect(result.costPerUnit).toBe(0);
    });
  });

  describe('serializeForHistory', () => {
    it('should correctly serialize placements for history storage', () => {
      const serialized = PlacementsService.serializeForHistory(mockPlacements);
      expect(serialized).toHaveLength(2);
      expect(serialized[0]).toHaveProperty('areaId', 'chest');
      expect(serialized[0]).toHaveProperty('productId', 'tshirt');
      expect(serialized[0]).toHaveProperty('workPrice', 100);
    });
  });
});
