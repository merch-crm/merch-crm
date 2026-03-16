import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSession } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockDelete, mockSelect } = vi.hoisted(() => {
    const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ success: true })
    });
    const mockSelect = vi.fn();
    return { mockDelete, mockSelect };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/redis', () => ({ invalidateCache: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('@/lib/db', () => ({
    db: {
        delete: mockDelete,
        select: mockSelect,
    },
}));

import { getSession } from '@/lib/session';
import { type Session as _Session } from '@/lib/auth';;
import { deleteProductLine } from '@/app/(main)/dashboard/warehouse/lines/line-mutation-actions';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('deleteProductLine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSelect.mockReset();
        mockDelete.mockClear();
    });

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await deleteProductLine('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('администратор может удалить любую линейку', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Администратор' }));

        // 1. Permission check: select({ createdBy }).from().where().limit(1)
        mockSelect.mockReturnValueOnce({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve([{ createdBy: 'other-user-id' }]))
                }))
            }))
        });

        // 2. Dependency check: select({ count }).from().where()
        mockSelect.mockReturnValueOnce({
            from: vi.fn(() => ({
                where: vi.fn(() => Promise.resolve([{ count: 0 }]))
            }))
        });

        const result = await deleteProductLine('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
        expect(result.success).toBe(true);
    });

    it('создатель может удалить свою линейку', async () => {
        const userId = 'user-uuid';
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ id: userId, roleName: 'Склад' }));

        mockSelect.mockReturnValueOnce({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve([{ createdBy: userId }]))
                }))
            }))
        });

        mockSelect.mockReturnValueOnce({
            from: vi.fn(() => ({
                where: vi.fn(() => Promise.resolve([{ count: 0 }]))
            }))
        });

        const result = await deleteProductLine('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
        expect(result.success).toBe(true);
    });

    it('обычный пользователь не может удалить чужую линейку (IDOR)', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ id: 'my-user-id', roleName: 'Склад' }));

        mockSelect.mockReturnValueOnce({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve([{ createdBy: 'other-user-id' }]))
                }))
            }))
        });

        const result = await deleteProductLine('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
        expect(result).toEqual({ success: false, error: 'Недостаточно прав для удаления' });
    });

    it('нельзя удалить линейку с товарами', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Администратор' }));

        mockSelect.mockReturnValueOnce({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve([{ createdBy: 'some-user' }]))
                }))
            }))
        });

        mockSelect.mockReturnValueOnce({
            from: vi.fn(() => ({
                where: vi.fn(() => Promise.resolve([{ count: 5 }]))
            }))
        });

        const result = await deleteProductLine('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
        expect(result.success).toBe(false);
        expect(result.error).toContain('в ней 5 позиций');
    });
});
