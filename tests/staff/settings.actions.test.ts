import type { Session } from "@/lib/session";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getPresenceSettings,
    updatePresenceSetting,
    updateAllPresenceSettings
} from '@/app/(main)/staff/actions/settings.actions';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockDb, queryMock, chainable } = vi.hoisted(() => {
    const chainable = {
        where: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((cb: (args: unknown[]) => void) => cb([])),
    };

    const queryMock = {
        presenceSettings: { findMany: vi.fn().mockResolvedValue([]) },
    };

    const mockDb = {
        query: queryMock,
        update: vi.fn().mockReturnValue(chainable),
        transaction: vi.fn().mockImplementation(async (cb: (db: unknown) => Promise<unknown>) => cb(mockDb)),
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

describe('Settings Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession() as Session);
        vi.mocked(requireAdmin).mockResolvedValue(undefined as never);
        chainable.then.mockImplementation((cb: (args: unknown[]) => void) => cb([]));
    });

    describe('getPresenceSettings', () => {
        it('should return settings as an object', async () => {
            const mockSettings = [
                { key: 'work_start_time', value: '09:00' },
                { key: 'work_end_time', value: '18:00' }
            ];
            queryMock.presenceSettings.findMany.mockResolvedValueOnce(mockSettings);

            const result = await getPresenceSettings();

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data.work_start_time).toBe('09:00');
            }
        });
    });

    describe('updatePresenceSetting', () => {
        it('should update single setting', async () => {
            const formData = new FormData();
            formData.append('key', 'work_start_time');
            formData.append('value', '10:00');

            const result = await updatePresenceSetting(formData);

            expect(result.success).toBe(true);
            expect(mockDb.update).toHaveBeenCalled();
        });

        it('should return error on invalid key', async () => {
            const formData = new FormData();
            formData.append('key', '');
            const result = await updatePresenceSetting(formData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("обязателен");
            }
        });
    });

    describe('updateAllPresenceSettings', () => {
        it('should update multiple settings in a transaction', async () => {
            const formData = new FormData();
            formData.append('work_start_time', '09:00');
            formData.append('work_end_time', '18:00');
            formData.append('idle_threshold_seconds', '60');
            formData.append('late_threshold_minutes', '15');
            formData.append('recognition_confidence', '0.7');
            formData.append('go2rtc_url', 'http://localhost:1984');
            formData.append('telegram_alerts_enabled', 'true');
            formData.append('auto_clock_out_hours', '8');

            const result = await updateAllPresenceSettings(formData);

            expect(result.success).toBe(true);
            expect(mockDb.transaction).toHaveBeenCalled();
        });

        it('should fail validation for missing fields', async () => {
            const formData = new FormData();
            formData.append('work_start_time', '09:00');
            // Missing other required fields

            const result = await updateAllPresenceSettings(formData);
            if (!result.success) {
                expect(result.error).toBeDefined();
            }
        });
    });
});
