// NO IMPORTS FROM VITEST - using globals: true
import { renderHook, act } from '@testing-library/react';
import { useConsumablesConfig } from '../use-consumables-config';
import * as configActions from '@/lib/actions/calculators/consumables';
import type { ConsumablesConfig } from '@/lib/types/calculators';
import type { ActionResult } from '@/lib/types/common';

// Mocks
vi.mock('@/lib/actions/calculators/consumables');

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useConsumablesConfig', () => {
  const mockConfig: ConsumablesConfig = {
    calculatorType: 'dtf',
    items: [
      { 
        id: 'ink', 
        key: 'ink', 
        name: 'Ink', 
        consumptionPerUnit: 10, 
        consumptionUnit: 'ml/m2', 
        unit: 'ml', 
        pricePerUnit: 10, 
        priceUnit: '₽/ml', 
        source: 'manual' 
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch config on mount', async () => {
    vi.mocked(configActions.getConsumablesConfig).mockResolvedValue({
      success: true,
      data: mockConfig
    } as unknown as ActionResult<ConsumablesConfig>);

    const { result } = renderHook(() => useConsumablesConfig('dtf'));
    
    // Wait for useEffect
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.config).toEqual(mockConfig);
  });

  it('should handle save correctly', async () => {
    vi.mocked(configActions.getConsumablesConfig).mockResolvedValue({
      success: true,
      data: mockConfig
    } as unknown as ActionResult<ConsumablesConfig>);

    vi.mocked(configActions.saveConsumablesConfig).mockResolvedValue({ 
      success: true, 
      data: mockConfig 
    } as unknown as ActionResult<ConsumablesConfig>);

    const { result } = renderHook(() => useConsumablesConfig('dtf'));

    let success;
    await act(async () => {
      success = await result.current.saveConfig(mockConfig);
    });

    expect(success).toBe(true);
    expect(configActions.saveConsumablesConfig).toHaveBeenCalledWith('dtf', mockConfig);
  });
});
