import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getClientContacts,
    addClientContact,
    updateClientContact,
    deleteClientContact,
    setPrimaryContact,
} from '../contacts.actions';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// --- Mocks ---

function createTxMock() {
    return {
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([]),
            }),
        }),
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{
                    id: 'new-contact-id',
                    clientId: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'Pavel',
                    phone: '1234567890',
                    role: 'lpr',
                    isPrimary: true,
                }]),
            }),
        }),
        delete: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
        }),
        query: {
            clientContacts: {
                findMany: vi.fn().mockResolvedValue([]),
            },
        },
    };
}

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            clientContacts: {
                findMany: vi.fn(),
                findFirst: vi.fn(),
            },
            clients: {
                findFirst: vi.fn(),
            },
        },
        transaction: vi.fn(async (cb: (tx: ReturnType<typeof createTxMock>) => Promise<unknown>) => {
            const tx = createTxMock();
            return cb(tx);
        }),
    },
}));

vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
}));

vi.mock('@/lib/audit', () => ({
    logAction: vi.fn(),
}));

vi.mock('@/lib/error-logger', () => ({
    logError: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// --- Test Data ---
const mockClientId = '550e8400-e29b-41d4-a716-446655440000';
const mockContactId = '550e8400-e29b-41d4-a716-446655440001';
const mockSession = { id: 'user-id', email: 'test@example.com', name: 'Test User', roleName: 'Администратор' };

describe('contacts.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
    });

    // ─── getClientContacts ─────────────────────────

    describe('getClientContacts', () => {
        it('returns contacts successfully', async () => {
            const mockContacts = [{ id: '1', name: 'Ivan' }];
            (db.query.clientContacts.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockContacts);

            const result = await getClientContacts(mockClientId);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(mockContacts);
            }
        });

        it('handles errors gracefully', async () => {
            (db.query.clientContacts.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB'));

            const result = await getClientContacts(mockClientId);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('Не удалось загрузить контакты');
            }
        });
    });

    // ─── addClientContact ─────────────────────────

    describe('addClientContact', () => {
        const validPayload = {
            clientId: mockClientId,
            name: 'Pavel',
            phone: '1234567890',
            role: 'lpr' as const,
            isPrimary: false,
        };

        it('requires authentication', async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            const result = await addClientContact(validPayload);
            expect(result.success).toBe(false);
            if (!result.success) expect(result.error).toBe('Не авторизован');
        });

        it('validates input data', async () => {
            const result = await addClientContact({ ...validPayload, name: '' });
            expect(result.success).toBe(false);
        });

        it('rejects non-b2b clients', async () => {
            (db.query.clients.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: mockClientId, clientType: 'b2c', name: 'Test',
            });
            const result = await addClientContact(validPayload);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('Контактные лица доступны только для организаций (B2B)');
            }
        });

        it('rejects when contact limit reached', async () => {
            (db.query.clients.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: mockClientId, clientType: 'b2b', name: 'Test',
            });
            (db.query.clientContacts.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
                Array(5).fill({ id: 'x' })
            );
            const result = await addClientContact(validPayload);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('Достигнут лимит контактных лиц (максимум 5)');
            }
        });

        it('adds contact for b2b client successfully', async () => {
            (db.query.clients.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: mockClientId, clientType: 'b2b', name: 'Test Corp',
            });
            (db.query.clientContacts.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

            const result = await addClientContact(validPayload);
            expect(result.success).toBe(true);
            expect(db.transaction).toHaveBeenCalled();
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard/clients');
        });
    });

    // ─── updateClientContact ─────────────────────────

    describe('updateClientContact', () => {
        it('requires authentication', async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            const result = await updateClientContact(mockContactId, { name: 'X' });
            expect(result.success).toBe(false);
            if (!result.success) expect(result.error).toBe('Не авторизован');
        });

        it('returns error for non-existent contact', async () => {
            (db.query.clientContacts.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            const result = await updateClientContact(mockContactId, { name: 'X' });
            expect(result.success).toBe(false);
            if (!result.success) expect(result.error).toBe('Контакт не найден');
        });

        it('updates contact successfully', async () => {
            (db.query.clientContacts.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: mockContactId, clientId: mockClientId, isPrimary: false,
            });
            const result = await updateClientContact(mockContactId, { name: 'Pavel Updated' });
            expect(result.success).toBe(true);
            expect(db.transaction).toHaveBeenCalled();
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard/clients');
        });
    });

    // ─── deleteClientContact ─────────────────────────

    describe('deleteClientContact', () => {
        it('requires authentication', async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            const result = await deleteClientContact(mockContactId);
            expect(result.success).toBe(false);
            if (!result.success) expect(result.error).toBe('Не авторизован');
        });

        it('returns error for non-existent contact', async () => {
            (db.query.clientContacts.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
            const result = await deleteClientContact(mockContactId);
            expect(result.success).toBe(false);
            if (!result.success) expect(result.error).toBe('Контакт не найден');
        });

        it('deletes contact successfully', async () => {
            (db.query.clientContacts.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: mockContactId, clientId: mockClientId, isPrimary: false, name: 'Pavel',
            });
            const result = await deleteClientContact(mockContactId);
            expect(result.success).toBe(true);
            expect(db.transaction).toHaveBeenCalled();
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard/clients');
        });
    });

    // ─── setPrimaryContact ─────────────────────────

    describe('setPrimaryContact', () => {
        it('returns immediately if already primary', async () => {
            (db.query.clientContacts.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: mockContactId, clientId: mockClientId, isPrimary: true, name: 'Pavel',
            });
            const result = await setPrimaryContact(mockContactId);
            expect(result.success).toBe(true);
            expect(db.transaction).not.toHaveBeenCalled();
        });

        it('sets primary contact successfully', async () => {
            (db.query.clientContacts.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
                id: mockContactId, clientId: mockClientId, isPrimary: false, name: 'Pavel',
            });
            const result = await setPrimaryContact(mockContactId);
            expect(result.success).toBe(true);
            expect(db.transaction).toHaveBeenCalled();
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard/clients');
        });
    });
});
