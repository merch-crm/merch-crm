import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getExportData,
    getExportColumns,
    getExportPresets
} from '@/app/(main)/dashboard/clients/actions/export.actions';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockDb, chainable } = vi.hoisted(() => {
    const chainable = {
        where: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((cb: (arg: unknown[]) => void) => cb([])),
    };

    const mockDb = {
        select: vi.fn().mockReturnValue(chainable),
        query: {
            users: {
                findFirst: vi.fn().mockResolvedValue({
                    id: 'user-id',
                    role: { name: 'Администратор', permissions: {} }
                })
            }
        }
    };

    return { mockDb, chainable };
});

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { getSession } from '@/lib/session';
import { type Session as _Session } from "@/lib/auth";
import type { Session } from "@/lib/session";
import type { Session } from "@/lib/session";;
import { mockSession } from '../helpers/mocks';

describe('Export Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession() as _Session);
        chainable.then.mockImplementation((cb: (arg: unknown[]) => void) => cb([]));
    });

    describe('getExportData', () => {
        const validParams = {
            columns: ['lastName', 'firstName', 'phone'],
            format: 'csv' as const,
            filters: {},
            includeArchived: false
        };

        it('should generate CSV with BOM and headers', async () => {
            const mockData = [
                { lastName: 'Ivanov', firstName: 'Ivan', phone: '123' },
                { lastName: 'Petrov', firstName: 'Petr', phone: '456' }
            ];
            chainable.then.mockImplementationOnce((cb: (arg: typeof mockData) => void) => cb(mockData));

            const result = await getExportData(validParams);

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                const data = result.data as unknown as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                expect(data.data.startsWith('\uFEFF')).toBe(true);
                expect(data.data).toContain('Фамилия,Имя,Телефон');
                expect(data.data).toContain('Ivanov,Ivan,123');
            }
        });

        it('should handle filters and generate correct filename', async () => {
            const paramsWithFilters = {
                ...validParams,
                filters: { clientType: 'b2b' as const }
            };
            const result = await getExportData(paramsWithFilters);
            expect(result.success).toBe(true);
            if (result.success) {
                expect((result.data as unknown as any).filename).toMatch(/^clients_export_\d{4}-\d{2}-\d{2}\.csv$/); // eslint-disable-line @typescript-eslint/no-explicit-any
            }
        });

        it('should return error on invalid columns', async () => {
            const invalidParams = { ...validParams, columns: [] };
            const result = await getExportData(invalidParams as Parameters<typeof getExportData>[0]);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Выберите хотя бы одну колонку");
            }
        });
    });

    describe('getExportColumns', () => {
        it('should return list of available columns', async () => {
            const result = await getExportColumns();
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data?.length).toBeGreaterThan(0);
            }
        });
    });

    describe('getExportPresets', () => {
        it('should return default presets', async () => {
            const result = await getExportPresets();
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toContainEqual(expect.objectContaining({ id: 'basic' }));
            }
        });
    });
});
