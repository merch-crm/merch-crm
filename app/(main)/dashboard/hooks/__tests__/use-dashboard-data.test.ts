import { renderHook, act } from '@testing-library/react';
import { useDashboardData } from '../use-dashboard-data';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDashboardStatsByPeriod, getDashboardNotifications } from '../../actions';

// --- Mocks ---
vi.mock('../../actions', () => ({
    getDashboardStatsByPeriod: vi.fn(),
    getDashboardNotifications: vi.fn(),
}));

const mockStats = {
    totalClients: 100,
    newClients: 10,
    totalOrders: 50,
    inProduction: 5,
    revenue: "100 000 ₽",
    averageCheck: "2 000 ₽",
    rawRevenue: 100000,
};

describe('useDashboardData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.mocked(getDashboardStatsByPeriod).mockResolvedValue(mockStats);
        vi.mocked(getDashboardNotifications).mockResolvedValue([]);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes with initialStats', () => {
        const { result } = renderHook(() => useDashboardData(mockStats, 'month'));

        expect(result.current.statsData).toEqual(mockStats);
        expect(result.current.isMounted).toBe(false);
    });

    it('sets isMounted after timeout', async () => {
        const { result } = renderHook(() => useDashboardData(mockStats, 'month'));

        act(() => {
            vi.advanceTimersByTime(0);
        });

        expect(result.current.isMounted).toBe(true);
    });

    it('fetches data on mount and period change', async () => {
        const { result: _result, rerender } = renderHook(({ period }) => useDashboardData(mockStats, period), {
            initialProps: { period: 'month' }
        });

        // on mount
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });

        expect(getDashboardStatsByPeriod).toHaveBeenCalledWith('month');
        expect(getDashboardNotifications).toHaveBeenCalled();

        // on period change
        rerender({ period: 'year' });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });

        expect(getDashboardStatsByPeriod).toHaveBeenCalledWith('year');
    });

    it('updates data on interval', async () => {
        renderHook(() => useDashboardData(mockStats, 'month'));

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0); // initial fetch
        });

        expect(getDashboardStatsByPeriod).toHaveBeenCalledTimes(1);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(15000); // interval fetch
        });

        expect(getDashboardStatsByPeriod).toHaveBeenCalledTimes(2);
    });

    it('formats time and date correctly', async () => {
        const mockDate = new Date('2024-03-16T10:00:00');
        vi.setSystemTime(mockDate);

        const { result } = renderHook(() => useDashboardData(mockStats, 'month'));

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });

        expect(result.current.formattedTime).toBe('10:00');
        expect(result.current.formattedDate).toContain('16 марта');
    });
});
