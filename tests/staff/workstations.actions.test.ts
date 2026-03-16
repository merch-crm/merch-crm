import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getWorkstations,
    getCameras,
    getUsers,
    createWorkstation,
    updateWorkstation,
    deleteWorkstation
} from '@/app/(staff)/staff/workstations/workstations.actions';

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
        workstations: { findMany: vi.fn().mockResolvedValue([]) },
        cameras: { findMany: vi.fn().mockResolvedValue([]) },
        users: { findMany: vi.fn().mockResolvedValue([]) },
    };

    const mockDb = {
        query: queryMock,
        select: vi.fn().mockReturnValue(chainable),
        update: vi.fn().mockReturnValue(chainable),
        insert: vi.fn().mockReturnValue(chainable),
        delete: vi.fn().mockReturnValue(chainable),
    };

    return { mockDb, queryMock, chainable };
});

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { getSession, type Session as _Session } from '@/lib/auth';
import { mockSession } from '../helpers/mocks';

describe('Workstations Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession() as _Session);
        chainable.then.mockImplementation((cb: (args: unknown[]) => void) => cb([]));
    });

    describe('getWorkstations', () => {
        it('should return all workstations with relations', async () => {
            const mockData = [
                { id: 'w1', name: 'Station 1', camera: { name: 'Cam 1' }, assignedUser: { name: 'User 1' } }
            ];
            queryMock.workstations.findMany.mockResolvedValueOnce(mockData);

            const result = await getWorkstations();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toHaveLength(1);
            }
        });
    });

    describe('getCameras', () => {
        it('should return enabled cameras', async () => {
            const mockCameras = [{ id: 'c1', name: 'Front Desk' }];
            queryMock.cameras.findMany.mockResolvedValueOnce(mockCameras);

            const result = await getCameras();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(mockCameras);
            }
        });
    });

    describe('getUsers', () => {
        it('should return all users sorted by name', async () => {
            const mockUsers = [{ id: 'u1', name: 'A' }, { id: 'u2', name: 'B' }];
            queryMock.users.findMany.mockResolvedValueOnce(mockUsers);

            const result = await getUsers();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toHaveLength(2);
            }
        });
    });

    describe('createWorkstation', () => {
        it('should create new workstation from valid data', async () => {
            const validData = {
                name: 'New Station',
                sortOrder: 1
            };
            chainable.returning.mockResolvedValueOnce([{ id: 'w-new', ...validData }]);

            const result = await createWorkstation(validData);

            expect(result.success).toBe(true);
            expect(mockDb.insert).toHaveBeenCalled();
        });
    });

    describe('updateWorkstation', () => {
        it('should update workstation by ID', async () => {
            const validId = '55555555-5555-4555-8555-000000000001';
            chainable.returning.mockResolvedValueOnce([{ id: validId, name: 'Updated' }]);

            const result = await updateWorkstation(validId, { name: 'Updated' });

            expect(result.success).toBe(true);
            expect(mockDb.update).toHaveBeenCalled();
        });
    });

    describe('deleteWorkstation', () => {
        it('should delete workstation by ID', async () => {
            const validId = '55555555-5555-4555-8555-000000000001';
            const result = await deleteWorkstation(validId);

            expect(result.success).toBe(true);
            expect(mockDb.delete).toHaveBeenCalled();
        });
    });
});
