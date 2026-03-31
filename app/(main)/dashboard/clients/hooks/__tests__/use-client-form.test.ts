import { renderHook, act } from '@testing-library/react';
import { useClientForm } from '../use-client-form';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateClient } from '../../actions/core.actions';
import { useToast } from '@/components/ui/toast';
import { useDuplicateCheck } from '../use-duplicate-check';

// --- Mocks ---
vi.mock('../../actions/core.actions', () => ({
    updateClient: vi.fn(),
}));

const mockToast = vi.fn();
vi.mock('@/components/ui/toast', () => ({
    useToast: vi.fn(() => ({
        toast: mockToast,
    })),
}));

vi.mock('@/lib/sounds', () => ({
    playSound: vi.fn(),
}));

const mockCheckDuplicates = vi.fn();
const mockClearDuplicates = vi.fn();
const mockDismissDuplicates = vi.fn();
vi.mock('../use-duplicate-check', () => ({
    useDuplicateCheck: vi.fn(() => ({
        duplicates: [],
        checkDuplicates: mockCheckDuplicates,
        clearDuplicates: mockClearDuplicates,
        dismissDuplicates: mockDismissDuplicates,
        hasDuplicates: false,
    })),
}));

const mockClient = {
    id: '1',
    lastName: 'Test',
    firstName: 'User',
    clientType: 'b2c' as const,
};

describe('useClientForm', () => {
    const onClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with client data', () => {
        const { result } = renderHook(() => useClientForm(mockClient, onClose));

        expect(result.current.form.lastName).toBe('Test');
        expect(result.current.form.firstName).toBe('User');
        expect(result.current.form.clientType).toBe('b2c');
    });

    it('updates form field and checks duplicates', () => {
        const { result } = renderHook(() => useClientForm(mockClient, onClose));
        const mockCheckDuplicates = vi.mocked(useDuplicateCheck)().checkDuplicates;

        act(() => {
            result.current.handleFieldChange('phone', '1234567890');
        });

        expect(result.current.form.phone).toBe('1234567890');
        expect(mockCheckDuplicates).toHaveBeenCalled();
    });

    it('validates B2B company requirement', async () => {
        const { result } = renderHook(() => useClientForm({ ...mockClient, clientType: 'b2b' }, onClose));
        const { toast: _toast } = vi.mocked(useToast)();

        const mockEvent = {
            preventDefault: vi.fn(),
            currentTarget: document.createElement('form'),
        } as unknown as React.FormEvent<HTMLFormElement>;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });

        expect(mockToast).toHaveBeenCalledWith(expect.stringContaining('название компании'), 'error');
        expect(updateClient).not.toHaveBeenCalled();
    });

    it('handles successful submission', async () => {
        vi.mocked(updateClient).mockResolvedValue({ success: true, data: undefined });
        const { result } = renderHook(() => useClientForm(mockClient, onClose));

        const mockForm = document.createElement('form');
        const mockEvent = {
            preventDefault: vi.fn(),
            currentTarget: mockForm,
        } as unknown as React.FormEvent<HTMLFormElement>;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });

        expect(updateClient).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it('handles failed submission', async () => {
        vi.mocked(updateClient).mockResolvedValue({ success: false, error: 'Failed' });
        const { result } = renderHook(() => useClientForm(mockClient, onClose));
        const { toast: _toast } = vi.mocked(useToast)();

        const mockForm = document.createElement('form');
        const mockEvent = {
            preventDefault: vi.fn(),
            currentTarget: mockForm,
        } as unknown as React.FormEvent<HTMLFormElement>;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });

        expect(mockToast).toHaveBeenCalledWith('Failed', 'error');
        expect(onClose).not.toHaveBeenCalled();
    });
});
