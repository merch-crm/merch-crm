import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getExportData, getExportColumns, getExportPresets } from '../export.actions';
import { getSession } from "@/lib/session";
import { logAction } from '@/lib/audit';

// --- Mocks ---
const mockOrderBy = vi.fn().mockResolvedValue([]);
const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
const mockLeftJoin2 = vi.fn().mockReturnValue({ where: mockWhere });
const mockLeftJoin1 = vi.fn().mockReturnValue({ leftJoin: mockLeftJoin2 });
const mockFrom = vi.fn().mockReturnValue({ leftJoin: mockLeftJoin1 });
const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

vi.mock('@/lib/db', () => ({
    db: {
        select: (...args: unknown[]) => mockSelect(...args),
        query: {
            users: {
                findFirst: vi.fn().mockResolvedValue({
                    id: 'user-id',
                    name: 'Test User',
                    email: 'test@example.com',
                    role: { name: 'Администратор', slug: 'admin', permissions: {} },
                }),
            },
        },
    },
}));

vi.mock('@/lib/session', () => ({
    getSession: vi.fn().mockResolvedValue({ id: 'user-id', roleSlug: 'admin' }),
}));

vi.mock('@/lib/audit', () => ({
    logAction: vi.fn(),
}));

vi.mock('@/lib/error-logger', () => ({
    logError: vi.fn(),
}));

// --- Test Data ---
const mockSession = { id: 'user-id', email: 'test@example.com', name: 'Test User', roleSlug: 'admin' };

describe('export.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
        mockOrderBy.mockResolvedValue([]);
    });

    describe('getExportColumns', () => {
        it('should return export columns', async () => {
            const result = await getExportColumns();
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeDefined();
                expect(result.data!.length).toBeGreaterThan(0);
            }
        });
    });

    describe('getExportPresets', () => {
        it('should return export presets', async () => {
            const result = await getExportPresets();
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeDefined();
                expect(result.data!.length).toBeGreaterThan(0);
            }
        });

        it('should include basic, analytics, marketing, and full presets', async () => {
            const result = await getExportPresets();
            expect(result.success).toBe(true);
            if (result.success) {
                const ids = result.data!.map(p => p.id);
                expect(ids).toEqual(['basic', 'analytics', 'marketing', 'full']);
            }
        });
    });

    describe('getExportData', () => {
        it('should require authentication', async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

            const result = await getExportData({
                columns: ['lastName'],
                format: 'csv',
                includeArchived: false,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('Не авторизован');
            }
        });

        it('should reject empty columns array', async () => {
            const result = await getExportData({
                columns: [],
                format: 'csv',
                includeArchived: false,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('Выберите хотя бы одну колонку');
            }
        });

        it('should generate CSV with correct headers and data', async () => {
            const mockData = [
                {
                    lastName: 'Ivanov',
                    firstName: 'Ivan',
                    clientType: 'b2c',
                    email: null,
                    totalOrdersAmount: 1500.5,
                },
                {
                    lastName: 'Petrov',
                    firstName: 'Petr',
                    clientType: 'b2b',
                    email: 'test@example.com',
                    totalOrdersAmount: null,
                },
            ];
            mockOrderBy.mockResolvedValue(mockData);

            const result = await getExportData({
                columns: ['lastName', 'firstName', 'clientType', 'email', 'totalOrdersAmount'],
                format: 'csv',
                includeArchived: false,
            });

            if (result.success) {
                const data = result.data;
                expect(data.filename).toMatch(/^clients_export_\d{4}-\d{2}-\d{2}\.csv$/);
                // Columns are ordered by EXPORT_COLUMNS definition
                expect(data.data).toContain('Фамилия,Имя,Тип клиента,Email,Сумма заказов');
                expect(data.data).toContain('Ivanov,Ivan,Частное лицо,,1500.50');
                expect(data.data).toContain('Petrov,Petr,Организация,test@example.com,');
            }
            expect(logAction).toHaveBeenCalled();
        });

        it('should apply filters correctly', async () => {
            mockOrderBy.mockResolvedValue([]);

            const result = await getExportData({
                columns: ['lastName'],
                format: 'csv',
                filters: { clientType: 'b2c', activityStatus: 'active' },
                includeArchived: false,
            });

            expect(result.success).toBe(true);
            expect(mockSelect).toHaveBeenCalled();
        });

        it('should include BOM for Excel compatibility', async () => {
            mockOrderBy.mockResolvedValue([]);

            const result = await getExportData({
                columns: ['lastName'],
                format: 'csv',
                includeArchived: false,
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.filename).toMatch(/^clients_export_\d{4}-\d{2}-\d{2}\.csv$/); // BOM at the start
            }
        });
    });
});
