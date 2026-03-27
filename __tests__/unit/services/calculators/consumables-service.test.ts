// __tests__/unit/services/calculators/consumables-service.test.ts

import { describe, it, expect } from 'vitest';
import { 
  calculatePrintConsumablesCost, 
  calculateEmbroideryConsumablesCost,
  calculateSilkscreenConsumablesCost
} from '@/lib/services/calculators/consumables-service';
import { ConsumablesConfig } from '@/lib/types/calculators';

describe('ConsumablesService', () => {
  const mockPrintConfig: ConsumablesConfig = {
    calculatorType: 'dtf',
    items: [
      { id: '1', key: 'k1', name: 'Ink', consumptionPerUnit: 10, consumptionUnit: 'ml/m2', unit: 'ml', pricePerUnit: 5, priceUnit: 'RUB/ml', source: 'manual' },
      { id: '2', key: 'k2', name: 'Film', consumptionPerUnit: 1.2, consumptionUnit: 'm2/m2', unit: 'm2', pricePerUnit: 100, priceUnit: 'RUB/m2', source: 'manual' },
    ]
  };

  describe('calculatePrintConsumablesCost', () => {
    it('should calculate basic print cost', () => {
      const result = calculatePrintConsumablesCost(mockPrintConfig, 2.0, 1); // 2m2, qty=1
      // Ink: 10 * 2 * 5 = 100
      // Film: 1.2 * 2 * 100 = 240
      // Total: 340
      expect(result.totalCost).toBe(340);
      expect(result.items).toHaveLength(2);
    });

    it('should handle zero area', () => {
      const result = calculatePrintConsumablesCost(mockPrintConfig, 0, 1);
      expect(result.totalCost).toBe(0);
    });
  });

  describe('calculateEmbroideryConsumablesCost', () => {
    const mockEmbConfig: ConsumablesConfig = {
      calculatorType: 'embroidery',
      items: [
        { id: 'upper_thread', key: 'ut', name: 'Thread', consumptionPerUnit: 6, consumptionUnit: 'm/1k', unit: 'm', pricePerUnit: 0.5, priceUnit: 'RUB/m', source: 'manual' },
        { id: 'stabilizer', key: 'st', name: 'Stabilizer', consumptionPerUnit: 1, consumptionUnit: 'm2/m2', unit: 'm2', pricePerUnit: 150, priceUnit: 'RUB/m2', source: 'manual' },
      ]
    };

    it('should calculate embroidery cost', () => {
      const result = calculateEmbroideryConsumablesCost(mockEmbConfig, 10000, 0.1, 1); 
      // Thread: (6 * 10000) / 1000 * 0.5 = 60 * 0.5 = 30
      // Stabilizer: 1 * 0.1 * 150 = 15
      // Total: 45
      expect(result.totalCost).toBe(45);
    });
  });

  describe('calculateSilkscreenConsumablesCost', () => {
    const mockSilkConfig: ConsumablesConfig = {
      calculatorType: 'silkscreen',
      items: [
        { id: 'plastisol_ink', key: 'ink', name: 'Ink', consumptionPerUnit: 40, consumptionUnit: 'g/m2', unit: 'g', pricePerUnit: 2, priceUnit: 'RUB/g', source: 'manual' },
        { id: 'mesh_frame', key: 'mesh', name: 'Mesh', consumptionPerUnit: 1, consumptionUnit: 'pcs', unit: 'pcs', pricePerUnit: 500, priceUnit: 'RUB/pcs', source: 'manual' },
        { id: 'emulsion', key: 'emu', name: 'Emul', consumptionPerUnit: 10, consumptionUnit: 'g/screen', unit: 'g', pricePerUnit: 3, priceUnit: 'RUB/g', source: 'manual' },
      ]
    };

    it('should calculate silkscreen cost', () => {
      const result = calculateSilkscreenConsumablesCost(mockSilkConfig, 0.5, 2, 100, 1); 
      // Ink: 40 * 0.5 * 100 * 2 = 4000
      // Mesh: 2 * 500 = 1000
      // Emulsion: 10 * 2 * 3 = 60
      // Total: 5060
      expect(result.totalCost).toBe(5060);
    });
  });
});
