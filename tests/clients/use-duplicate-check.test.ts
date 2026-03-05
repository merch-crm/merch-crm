import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDuplicateCheck } from '@/app/(main)/dashboard/clients/hooks/use-duplicate-check';

// ─── Mock the server action ────────────────────────────────────────────────────

const mockCheckClientDuplicates = vi.fn();

vi.mock('@/app/(main)/dashboard/clients/actions/core.actions', () => ({
    checkClientDuplicates: (...args: any[]) => mockCheckClientDuplicates(...args),
}));

describe('useDuplicateCheck', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCheckClientDuplicates.mockResolvedValue({ success: true, data: [] });
    });

    it('should initialize with empty state', () => {
        const { result } = renderHook(() => useDuplicateCheck());

        expect(result.current.duplicates).toEqual([]);
        expect(result.current.isChecking).toBe(false);
        expect(result.current.hasDuplicates).toBe(false);
        expect(result.current.isDismissed).toBe(false);
    });

    it('should not check with insufficient data', async () => {
        const { result } = renderHook(() => useDuplicateCheck({ debounceMs: 10 }));

        act(() => {
            result.current.checkDuplicates({ phone: '12' }); // too short
        });

        // Wait enough for debounce
        await new Promise(r => setTimeout(r, 50));

        expect(mockCheckClientDuplicates).not.toHaveBeenCalled();
    });

    it('should check duplicates with valid phone after debounce', async () => {
        mockCheckClientDuplicates.mockResolvedValue({ success: true, data: [] });

        const { result } = renderHook(() => useDuplicateCheck({ debounceMs: 10 }));

        act(() => {
            result.current.checkDuplicates({ phone: '+7999111222333' });
        });

        await waitFor(() => {
            expect(mockCheckClientDuplicates).toHaveBeenCalledTimes(1);
        }, { timeout: 2000 });
    });

    it('should check duplicates with valid email', async () => {
        mockCheckClientDuplicates.mockResolvedValue({ success: true, data: [] });

        const { result } = renderHook(() => useDuplicateCheck({ debounceMs: 10 }));

        act(() => {
            result.current.checkDuplicates({ email: 'test@example.com' });
        });

        await waitFor(() => {
            expect(mockCheckClientDuplicates).toHaveBeenCalledTimes(1);
        }, { timeout: 2000 });
    });

    it('should clear duplicates', () => {
        const { result } = renderHook(() => useDuplicateCheck());

        act(() => {
            result.current.clearDuplicates();
        });

        expect(result.current.duplicates).toEqual([]);
        expect(result.current.hasDuplicates).toBe(false);
    });

    it('should set found duplicates and allow dismissal', async () => {
        const mockDuplicates = [{
            id: 'd1',
            firstName: 'Ivan',
            lastName: 'Ivanov',
            phone: '+7999111222333',
            email: null,
            patronymic: null,
            company: null,
            clientType: 'b2c'
        }];
        mockCheckClientDuplicates.mockResolvedValue({ success: true, data: mockDuplicates });

        const { result } = renderHook(() => useDuplicateCheck({ debounceMs: 10 }));

        act(() => {
            result.current.checkDuplicates({ phone: '+7999111222333' });
        });

        await waitFor(() => {
            expect(result.current.hasDuplicates).toBe(true);
        }, { timeout: 2000 });

        expect(result.current.duplicates).toHaveLength(1);

        // Dismiss
        act(() => {
            result.current.dismissDuplicates();
        });

        expect(result.current.duplicates).toEqual([]);       // dismissed view
        expect(result.current.allDuplicates).toHaveLength(1); // still tracked
        expect(result.current.isDismissed).toBe(true);
    });

    it('should exclude current client from results', async () => {
        const mockDuplicates = [
            { id: 'current', firstName: 'A', lastName: 'B', phone: '123456', email: null, patronymic: null, company: null, clientType: 'b2c' },
            { id: 'other', firstName: 'C', lastName: 'D', phone: '123456', email: null, patronymic: null, company: null, clientType: 'b2c' }
        ];
        mockCheckClientDuplicates.mockResolvedValue({ success: true, data: mockDuplicates });

        const { result } = renderHook(() => useDuplicateCheck({ excludeClientId: 'current', debounceMs: 10 }));

        act(() => {
            result.current.checkDuplicates({ phone: '+7999111222333' });
        });

        await waitFor(() => {
            expect(result.current.hasDuplicates).toBe(true);
        }, { timeout: 2000 });

        expect(result.current.duplicates).toHaveLength(1);
        expect(result.current.duplicates[0].id).toBe('other');
    });

    it('should deduplicate consecutive identical checks', async () => {
        mockCheckClientDuplicates.mockResolvedValue({ success: true, data: [] });

        const { result } = renderHook(() => useDuplicateCheck({ debounceMs: 10 }));

        act(() => {
            result.current.checkDuplicates({ email: 'dup@test.com' });
        });

        await waitFor(() => {
            expect(mockCheckClientDuplicates).toHaveBeenCalledTimes(1);
        }, { timeout: 2000 });

        // Same data again — should be skipped
        act(() => {
            result.current.checkDuplicates({ email: 'dup@test.com' });
        });

        await new Promise(r => setTimeout(r, 50));

        expect(mockCheckClientDuplicates).toHaveBeenCalledTimes(1);
    });
});
