import { getSession, type Session } from "@/lib/session";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getEmployeeFaces,
    createFace,
    updateFace,
    deleteFace,
    getEmployeesWithoutFaces
} from '@/app/(main)/staff/actions/faces.actions';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockDb, queryMock, chainable } = vi.hoisted(() => {
    const chainable = {
        where: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
        values: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((cb: (args: unknown[]) => void) => cb([])),
    };

    const queryMock = {
        employeeFaces: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
        users: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
    };

    const mockDb = {
        query: queryMock,
        select: vi.fn().mockReturnValue(chainable),
        update: vi.fn().mockReturnValue(chainable),
        insert: vi.fn().mockReturnValue(chainable),
    };

    return { mockDb, queryMock, chainable };
});

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/admin', () => ({ requireAdmin: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { requireAdmin } from '@/lib/admin';
import { mockSession } from '../helpers/mocks';

describe('Faces Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession() as Session);
        vi.mocked(requireAdmin).mockResolvedValue(undefined as never);
        chainable.then.mockImplementation((cb: (args: unknown[]) => void) => cb([]));
    });

    describe('getEmployeeFaces', () => {
        it('should return active employee faces', async () => {
            const mockFaces = [{ id: 'f1', userId: 'u1' }];
            queryMock.employeeFaces.findMany.mockResolvedValueOnce(mockFaces);
            const result = await getEmployeeFaces();
            expect(result.success).toBe(true);
            if (result.success) expect(result.data).toEqual(mockFaces);
        });

        it('should throw if not admin', async () => {
            vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("Admin required"));
            const result = await getEmployeeFaces();
            expect(result.success).toBe(false);
            expect(result.error).toBe("Не удалось загрузить данные лиц");
        });
    });

    describe('createFace', () => {
        const validData = {
            userId: '4242XXXX-XXXX-4242-4242-XXXXXXXX4242',
            faceEncoding: new Array(128).fill(0.1),
            isPrimary: true
        };

        it('should create new face and unset other primary', async () => {
            queryMock.users.findFirst.mockResolvedValueOnce({ id: 'u1', name: 'Test' });
            chainable.returning.mockResolvedValueOnce([{ id: 'new-f', ...validData }]);

            const result = await createFace(validData);

            expect(result.success).toBe(true);
            expect(mockDb.update).toHaveBeenCalled(); // Unsetting other primary
            expect(mockDb.insert).toHaveBeenCalled();
        });
    });

    describe('updateFace', () => {
        it('should update face metadata', async () => {
            const formData = new FormData();
            formData.append('isPrimary', 'true');
            queryMock.employeeFaces.findFirst.mockResolvedValueOnce({ id: 'f1', userId: 'u1' });
            chainable.returning.mockResolvedValueOnce([{ id: 'f1', isPrimary: true }]);

            const result = await updateFace('f1', formData);

            expect(result.success).toBe(true);
            expect(mockDb.update).toHaveBeenCalled();
        });
    });

    describe('deleteFace', () => {
        it('should soft delete face entry', async () => {
            queryMock.employeeFaces.findFirst.mockResolvedValueOnce({ id: 'f1', userId: 'u1' });
            const result = await deleteFace('f1');
            expect(result.success).toBe(true);
            expect(mockDb.update).toHaveBeenCalledWith(expect.anything());
            // Verify soft delete flag
            expect(chainable.set).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
        });
    });

    describe('getEmployeesWithoutFaces', () => {
        it('should filter out users who already have faces', async () => {
            const allUsers = [
                { id: 'u1', name: 'User 1' },
                { id: 'u2', name: 'User 2' }
            ];
            const usersWithFaces = [{ userId: 'u1' }];

            queryMock.users.findMany.mockResolvedValueOnce(allUsers);
            queryMock.employeeFaces.findMany.mockResolvedValueOnce(usersWithFaces);

            const result = await getEmployeesWithoutFaces();

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data).toHaveLength(1);
                expect(result.data[0].id).toBe('u2');
            }
        });
    });
});
