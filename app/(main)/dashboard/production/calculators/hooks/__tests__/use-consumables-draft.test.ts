// NO IMPORTS FROM VITEST - using globals: true
import { renderHook, act } from '@testing-library/react';
import { useConsumablesDraft } from '../use-consumables-draft';
import type { ConsumablesConfig } from '@/lib/types/calculators';

describe('useConsumablesDraft', () => {
  const mockConfig: ConsumablesConfig = {
    calculatorType: 'dtf',
    items: [{ id: '1', key: 'ink', name: 'Ink', consumptionPerUnit: 10, consumptionUnit: 'ml/m2', unit: 'ml', pricePerUnit: 10, priceUnit: '₽/ml', source: 'manual' }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with no draft', () => {
    const { result } = renderHook(() => useConsumablesDraft('dtf', null));
    expect(result.current.hasDraft).toBe(false);
  });

  it('should save draft manually', () => {
    const { result } = renderHook(() => useConsumablesDraft('dtf', null));
    
    act(() => {
      result.current.saveDraft(mockConfig);
    });

    expect(result.current.hasDraft).toBe(true);
    expect(localStorage.getItem('consumables-draft-dtf')).toContain('config');
  });

  it('should load draft manually', () => {
    const { result: hook1 } = renderHook(() => useConsumablesDraft('dtf', null));
    
    act(() => {
      hook1.current.saveDraft(mockConfig);
    });

    const { result: hook2 } = renderHook(() => useConsumablesDraft('dtf', null));
    const loaded = hook2.current.loadDraft();

    expect(loaded).toEqual(mockConfig);
  });

  it('should clear draft', () => {
    const { result } = renderHook(() => useConsumablesDraft('dtf', null));
    
    act(() => {
      result.current.saveDraft(mockConfig);
      result.current.clearDraft();
    });

    expect(result.current.hasDraft).toBe(false);
    expect(localStorage.getItem('consumables-draft-dtf')).toBeNull();
  });

  it('should autosave after interval', () => {
    renderHook(() => useConsumablesDraft('dtf', mockConfig, true));
    
    act(() => {
      vi.advanceTimersByTime(5000); // AUTOSAVE_INTERVAL
    });

    expect(localStorage.getItem('consumables-draft-dtf')).not.toBeNull();
  });
});
