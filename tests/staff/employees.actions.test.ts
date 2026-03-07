import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getEmployeesWithFaces,
    getEmployeesWithoutFaces,
    addEmployeeFace,
    deleteEmployeeFace,
    setPrimaryFace
} from '@/app/(staff)/staff/employees/employees.actions';

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
        users: { findMany: vi.fn().mockResolvedValue([]) },
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
vi.mock('@/lib/admin', () => ({ checkIsAdmin: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { type Session } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { checkIsAdmin } from '@/lib/admin';
import { mockSession } from '../helpers/mocks';

describe('Employees Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession() as Session);
        vi.mocked(checkIsAdmin).mockResolvedValue(true);
        chainable.then.mockImplementation((cb: (args: unknown[]) => void) => cb([]));
    });

    describe('getEmployeesWithFaces', () => {
        it('should return employees mapped with their faces', async () => {
            const mockUsers = [{ id: 'u1', name: 'User 1' }, { id: 'u2', name: 'User 2' }];
            const mockFaces = [{ userId: 'u1', id: 'f1' }];

            queryMock.users.findMany.mockResolvedValueOnce(mockUsers);
            queryMock.employeeFaces.findMany.mockResolvedValueOnce(mockFaces);

            const result = await getEmployeesWithFaces();

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data).toHaveLength(2);
                expect(result.data[0].hasFace).toBe(true);
                expect(result.data[1].hasFace).toBe(false);
            }
        });

        it('should return error if not authenticated', async () => {
            vi.mocked(getSession).mockResolvedValue(null);
            const result = await getEmployeesWithFaces();
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unauthorized');
        });
    });

    describe('getEmployeesWithoutFaces', () => {
        it('should return only users without active faces', async () => {
            const mockUsers = [{ id: 'u1' }, { id: 'u2' }];
            const mockFaces = [{ userId: 'u1' }];

            queryMock.users.findMany.mockResolvedValueOnce(mockUsers);
            queryMock.employeeFaces.findMany.mockResolvedValueOnce(mockFaces);

            const result = await getEmployeesWithoutFaces();

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data).toHaveLength(1);
                expect(result.data[0].id).toBe('u2');
            }
        });
    });

    describe('addEmployeeFace', () => {
        const validParams = {
            userId: '55555555-5555-4555-8555-000000000001',
            photoUrl: 'http://example.com/photo.jpg',
            faceEncoding: Array(128).fill(0.5)
        };

        it('should insert new face and set primary if first', async () => {
            queryMock.employeeFaces.findFirst.mockResolvedValueOnce(null); // No existing primary
            chainable.returning.mockResolvedValueOnce([{ id: 'new-f' }]);

            const result = await addEmployeeFace(validParams);

            expect(result.success).toBe(true);
            expect(mockDb.insert).toHaveBeenCalled();
            // Should set isPrimary to true
            expect(chainable.values).toHaveBeenCalledWith(expect.objectContaining({ isPrimary: true }));
        });

        it('should fail if not admin', async () => {
            vi.mocked(checkIsAdmin).mockResolvedValueOnce(false);
            const result = await addEmployeeFace(validParams);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Forbidden');
        });
    });

    describe('deleteEmployeeFace', () => {
        it('should soft delete face by setting isActive false', async () => {
            const validSession = mockSession();
            vi.mocked(getSession).mockResolvedValue(validSession as Session);
            vi.mocked(checkIsAdmin).mockResolvedValue(true);

            const result = await deleteEmployeeFace('55555555-5555-4555-8555-000000000001');

            expect(result.success).toBe(true);
            expect(mockDb.update).toHaveBeenCalled();
            expect(chainable.set).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
        });
    });

    describe('setPrimaryFace', () => {
        it('should un-primary other faces and set selected to primary', async () => {
            const faceId = '55555555-5555-4555-8555-000000000001';
            const userId = '55555555-5555-4555-8555-000000000002';

            const result = await setPrimaryFace(faceId, userId);

            expect(result.success).toBe(true);
            // First update resets all
            expect(mockDb.update).toHaveBeenCalledTimes(2);
            // Second update sets new primary
            expect(chainable.set).toHaveBeenNthCalledWith(2, expect.objectContaining({ isPrimary: true }));
        });
    });
});
