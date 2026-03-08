import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getClientContacts,
    addClientContact,
    updateClientContact,
    deleteClientContact,
    setPrimaryContact
} from '@/app/(main)/dashboard/clients/actions/contacts.actions';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockDb, queryMock, chainable } = vi.hoisted(() => {
    const chainable = {
        where: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
        delete: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((cb: (arg: unknown[]) => void) => cb([])),
    };

    const queryMock = {
        clientContacts: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
        clients: { findFirst: vi.fn().mockResolvedValue(null) },
    };

    const mockDb = {
        query: queryMock,
        select: vi.fn().mockReturnValue(chainable),
        update: vi.fn().mockReturnValue(chainable),
        insert: vi.fn().mockReturnValue(chainable),
        delete: vi.fn().mockReturnValue(chainable),
        transaction: vi.fn().mockImplementation(async (cb: (arg: typeof mockDb) => Promise<unknown>) => cb(mockDb)),
    };

    return { mockDb, queryMock, chainable };
});

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { getSession, type Session } from '@/lib/auth';
import { mockSession } from '../helpers/mocks';

describe('Contacts Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession() as Session);
        chainable.then.mockImplementation((cb: (arg: unknown[]) => void) => cb([]));
    });

    describe('getClientContacts', () => {
        it('should return contacts for a client', async () => {
            const mockContacts = [{ id: '1', name: 'John Doe' }];
            queryMock.clientContacts.findMany.mockResolvedValueOnce(mockContacts);
            const result = await getClientContacts('uuid');
            expect(result.success).toBe(true);
            if (result.success) expect(result.data).toEqual(mockContacts);
        });
    });

    describe('addClientContact', () => {
        const validData = {
            clientId: '55555555-5555-4555-8555-000000000001',
            name: 'John Doe',
            role: 'lpr' as const,
            isPrimary: true
        };

        it('should add contract for B2B client', async () => {
            queryMock.clients.findFirst.mockResolvedValueOnce({ id: validData.clientId, clientType: 'b2b' });
            queryMock.clientContacts.findMany.mockResolvedValueOnce([]); // No existing contacts
            chainable.returning.mockResolvedValueOnce([{ id: 'new-id', ...validData }]);

            const result = await addClientContact(validData);

            expect(result.success).toBe(true);
            expect(mockDb.insert).toHaveBeenCalled();
        });

        it('should block B2C clients', async () => {
            queryMock.clients.findFirst.mockResolvedValueOnce({ id: validData.clientId, clientType: 'b2c' });
            const result = await addClientContact(validData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("B2B");
            }
        });

        it('should enforce limit of 5 contacts', async () => {
            queryMock.clients.findFirst.mockResolvedValueOnce({ id: validData.clientId, clientType: 'b2b' });
            queryMock.clientContacts.findMany.mockResolvedValueOnce(new Array(5).fill({}));
            const result = await addClientContact(validData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("лимит");
            }
        });
    });

    describe('updateClientContact', () => {
        it('should update existing contact', async () => {
            queryMock.clientContacts.findFirst.mockResolvedValueOnce({ id: 'c1', clientId: 'cli1' });
            const result = await updateClientContact('c1', { name: 'New Name' });
            expect(result.success).toBe(true);
            expect(mockDb.update).toHaveBeenCalled();
        });
    });

    describe('deleteClientContact', () => {
        it('should delete contact and reassign primary if needed', async () => {
            queryMock.clientContacts.findFirst.mockResolvedValueOnce({ id: 'c1', clientId: 'cli1', isPrimary: true });
            queryMock.clientContacts.findMany.mockResolvedValueOnce([{ id: 'c2' }]); // Remaining contact

            const result = await deleteClientContact('c1');

            expect(result.success).toBe(true);
            expect(mockDb.delete).toHaveBeenCalled();
            expect(mockDb.update).toHaveBeenCalled(); // Reassigning primary
        });
    });

    describe('setPrimaryContact', () => {
        it('should set contact as primary and unset others', async () => {
            queryMock.clientContacts.findFirst.mockResolvedValueOnce({ id: 'c2', clientId: 'cli1', isPrimary: false });
            const result = await setPrimaryContact('c2');
            expect(result.success).toBe(true);
            expect(mockDb.update).toHaveBeenCalledTimes(2); // Clear others + set this one
        });
    });
});
