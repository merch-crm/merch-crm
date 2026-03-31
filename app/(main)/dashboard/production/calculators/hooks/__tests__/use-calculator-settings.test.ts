// NO IMPORTS FROM VITEST - using globals: true
import { renderHook, act } from '@testing-library/react';
import { useCalculatorSettings } from '../use-calculator-settings';
import * as configActions from '@/lib/actions/calculators/settings';
import { getDefaultGlobalSettings } from '@/lib/types/calculators';
import type { GlobalCalculatorSettings } from '@/lib/types/calculators';
import type { ActionResult } from '@/lib/types/common';

// Mocks
vi.mock('@/lib/actions/calculators/settings');

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useCalculatorSettings', () => {
  const calculatorType = 'dtf';
  const mockSettings: GlobalCalculatorSettings = getDefaultGlobalSettings(calculatorType);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch settings on mount', async () => {
    vi.mocked(configActions.getGlobalSettings).mockResolvedValue({
      success: true,
      data: mockSettings
    } as unknown as ActionResult<GlobalCalculatorSettings>);

    const { result } = renderHook(() => useCalculatorSettings(calculatorType));
    
    // Wait for useEffect
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.settings).toEqual(mockSettings);
  });

  it('should update settings locally', async () => {
    vi.mocked(configActions.getGlobalSettings).mockResolvedValue({
      success: true,
      data: mockSettings
    } as unknown as ActionResult<GlobalCalculatorSettings>);

    const { result } = renderHook(() => useCalculatorSettings(calculatorType));

    act(() => {
      result.current.updateSettings({
        marginConfig: { defaultMargin: 50 }
      });
    });

    expect(result.current.settings.marginConfig.defaultMargin).toBe(50);
  });

  it('should handle save correctly', async () => {
    vi.mocked(configActions.getGlobalSettings).mockResolvedValue({
      success: true,
      data: mockSettings
    } as unknown as ActionResult<GlobalCalculatorSettings>);

    vi.mocked(configActions.saveGlobalSettings).mockResolvedValue({ 
      success: true, 
      data: { ...mockSettings, marginConfig: { defaultMargin: 60 } }
    } as unknown as ActionResult<GlobalCalculatorSettings>);

    const { result } = renderHook(() => useCalculatorSettings(calculatorType));

    let success;
    await act(async () => {
      success = await result.current.saveSettings({ ...mockSettings, marginConfig: { defaultMargin: 60 } });
    });

    expect(success).toBe(true);
    expect(result.current.settings.marginConfig.defaultMargin).toBe(60);
  });
});
