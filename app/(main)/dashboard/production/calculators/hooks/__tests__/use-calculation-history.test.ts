// NO IMPORTS FROM VITEST - using globals: true
import { renderHook, act } from '@testing-library/react';
import { useCalculationHistory } from '../use-calculation-history';
import * as historyActions from '@/lib/actions/calculators/history';
import type { ActionResult } from '@/lib/types/common';

// Mocks
vi.mock('@/lib/actions/calculators/history');

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe('useCalculationHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle deletion', async () => {
    vi.mocked(historyActions.deleteCalculation).mockResolvedValue({ 
      success: true, 
      data: { success: true } 
    } as unknown as ActionResult<{ success: boolean }>);

    const { result } = renderHook(() => useCalculationHistory());

    await act(async () => {
      await result.current.remove('1');
    });

    expect(historyActions.deleteCalculation).toHaveBeenCalledWith({ id: '1' });
  });

  it('should handle error during deletion', async () => {
    vi.mocked(historyActions.deleteCalculation).mockResolvedValue({ 
      success: false, 
      error: 'Delete error' 
    } as unknown as ActionResult<{ success: boolean }>);

    const { result } = renderHook(() => useCalculationHistory());

    await act(async () => {
      await result.current.remove('1');
    });

    expect(historyActions.deleteCalculation).toHaveBeenCalled();
  });
});
