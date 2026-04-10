import { renderHook, act } from '@testing-library/react';
import { useDuplicateCheck } from '../use-duplicate-check';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkClientDuplicates } from '../../actions/core.actions';

// --- Mocks ---
vi.mock('../../actions/core.actions', () => ({
  checkClientDuplicates: vi.fn(),
}));

describe('useDuplicateCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useDuplicateCheck());

    expect(result.current.duplicates).toEqual([]);
    expect(result.current.isChecking).toBe(false);
    expect(result.current.hasDuplicates).toBe(false);
    expect(result.current.isDismissed).toBe(false);
  });

  it('ignores input if not enough data provided', async () => {
    const { result } = renderHook(() => useDuplicateCheck({ minNameLength: 3, minPhoneLength: 5 }));

    act(() => {
      result.current.checkDuplicates({ phone: '123' }); // Too short
    });

    expect(checkClientDuplicates).not.toHaveBeenCalled();

    act(() => {
      result.current.checkDuplicates({ firstName: 'A', lastName: 'B' }); // Too short
    });

    expect(checkClientDuplicates).not.toHaveBeenCalled();
  });

  it('debounces the search request', async () => {
    (checkClientDuplicates as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, data: [] });

    const { result } = renderHook(() => useDuplicateCheck({ debounceMs: 500 }));

    act(() => {
      result.current.checkDuplicates({ phone: '1234567890' });
      result.current.checkDuplicates({ phone: '12345678901' });
      result.current.checkDuplicates({ phone: '123456789012' }); // Only this should trigger
    });

    expect(checkClientDuplicates).not.toHaveBeenCalled();

    // Fast-forward debounce time
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(checkClientDuplicates).toHaveBeenCalledTimes(1);
  });

  it('sets duplicates when matches found', async () => {
    const mockDuplicates = [
      { id: '1', firstName: 'Ivan', phone: '1234567890', clientType: 'b2c' }
    ];

    (checkClientDuplicates as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, data: mockDuplicates });

    const { result } = renderHook(() => useDuplicateCheck({ debounceMs: 0 }));

    await act(async () => {
      result.current.checkDuplicates({ phone: '1234567890' });
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.duplicates).toHaveLength(1);
    expect(result.current.hasDuplicates).toBe(true);
  });

  it('filters out excluded client ID', async () => {
    const mockDuplicates = [
      { id: '1', firstName: 'Ivan', phone: '1234567890', clientType: 'b2c' },
      { id: 'excluded-id', firstName: 'Ivan', phone: '1234567890', clientType: 'b2c' },
    ];

    (checkClientDuplicates as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, data: mockDuplicates });

    const { result } = renderHook(() => useDuplicateCheck({ debounceMs: 0, excludeClientId: 'excluded-id' }));

    await act(async () => {
      result.current.checkDuplicates({ phone: '1234567890' });
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.duplicates).toHaveLength(1);
    expect(result.current.duplicates[0].id).toBe('1');
  });

  it('handles dismissing duplicates', async () => {
    const mockDuplicates = [
      { id: '1', firstName: 'Ivan', phone: '1234567890', clientType: 'b2c' }
    ];

    (checkClientDuplicates as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, data: mockDuplicates });

    const { result } = renderHook(() => useDuplicateCheck({ debounceMs: 0 }));

    await act(async () => {
      result.current.checkDuplicates({ phone: '1234567890' });
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.duplicates).toHaveLength(1);

    act(() => {
      result.current.dismissDuplicates();
    });

    expect(result.current.isDismissed).toBe(true);
    expect(result.current.duplicates).toEqual([]); // Should be empty after dismissal
    expect(result.current.allDuplicates).toHaveLength(1); // But all duplicates should still be there
  });

  it('handles clearing duplicates', async () => {
    const mockDuplicates = [
      { id: '1', firstName: 'Ivan', phone: '1234567890', clientType: 'b2c' }
    ];

    (checkClientDuplicates as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, data: mockDuplicates });

    const { result } = renderHook(() => useDuplicateCheck({ debounceMs: 0 }));

    await act(async () => {
      result.current.checkDuplicates({ phone: '1234567890' });
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.duplicates).toHaveLength(1);

    act(() => {
      result.current.clearDuplicates();
    });

    expect(result.current.duplicates).toEqual([]);
    expect(result.current.hasDuplicates).toBe(false);
  });

  it('prevents repeated checks for same data', async () => {
    (checkClientDuplicates as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, data: [] });

    const { result } = renderHook(() => useDuplicateCheck({ debounceMs: 0 }));

    await act(async () => {
      result.current.checkDuplicates({ phone: '1234567890' });
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(checkClientDuplicates).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.checkDuplicates({ phone: '1234567890' }); // Same data
      await vi.advanceTimersByTimeAsync(0);
    });

    // Shouldn't be called again
    expect(checkClientDuplicates).toHaveBeenCalledTimes(1);
  });
});
