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
    };

    return { mockDb, chainable };
});

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { getSession } from '@/lib/auth';
import { mockSession } from '../helpers/mocks';

describe('Export Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession() as Session);
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
                expect(result.data.startsWith('\uFEFF')).toBe(true);
                expect(result.data).toContain('Фамилия,Имя,Телефон');
                expect(result.data).toContain('Ivanov,Ivan,123');
            }
        });

        it('should handle filters and generate correct filename', async () => {
            const paramsWithFilters = {
                ...validParams,
                filters: { clientType: 'b2b' as const }
            };
            const result = await getExportData(paramsWithFilters);
            expect(result.success).toBe(true);
            expect(result.filename).toMatch(/^clients_export_\d{4}-\d{2}-\d{2}\.csv$/);
        });

        it('should return error on invalid columns', async () => {
            const invalidParams = { ...validParams, columns: [] };
            const result = await getExportData(invalidParams as Parameters<typeof getExportData>[0]);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Ошибка параметров экспорта");
        });
    });

    describe('getExportColumns', () => {
        it('should return list of available columns', async () => {
            const result = await getExportColumns();
            expect(result.success).toBe(true);
            expect(result.data?.length).toBeGreaterThan(0);
        });
    });

    describe('getExportPresets', () => {
        it('should return default presets', async () => {
            const result = await getExportPresets();
            expect(result.success).toBe(true);
            expect(result.data).toContainEqual(expect.objectContaining({ id: 'basic' }));
        });
    });
});
