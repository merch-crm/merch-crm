import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSession } from '../../tests/helpers/mocks';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { 
    startTaskTimerAction, 
    stopTaskTimerAction, 
    getOrCreateTaskAndTimerStatusAction 
} from '@/app/(main)/dashboard/production/actions/time-actions';
import { TimeTrackingService } from '@/lib/services/production/time-tracking.service';

// Mock dependencies
vi.mock('@/lib/session', () => ({
    getSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/services/production/time-tracking.service', () => ({
    TimeTrackingService: {
        startTimer: vi.fn(),
        stopTimer: vi.fn(),
        getOrCreateTaskForOrderItem: vi.fn(),
        getTimerStatus: vi.fn(),
    },
}));

const VALID_TASK_ID = '4242a424-b424-4242-a424-c123456789ab';
const VALID_STAFF_ID = '4242a424-b424-4242-a424-c123456789ac';
const VALID_ORDER_ITEM_ID = '4242a424-b424-4242-a424-c123456789ad';
const USER_ID = 'user-123';

describe('Time Actions', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession({ 
            id: USER_ID,
            roleSlug: 'admin' 
        }));
    });

    describe('startTaskTimerAction', () => {
        it('should successfully start timer', async () => {
            vi.mocked(TimeTrackingService.startTimer).mockResolvedValue({ success: true });
            
            const result = await startTaskTimerAction({ taskId: VALID_TASK_ID, staffId: VALID_STAFF_ID });
            
            expect(result.success).toBe(true);
            expect(TimeTrackingService.startTimer).toHaveBeenCalledWith(VALID_TASK_ID, VALID_STAFF_ID, USER_ID);
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard/production');
        });

        it('should return error if service fails', async () => {
            vi.mocked(TimeTrackingService.startTimer).mockResolvedValue({ success: false, error: 'Service error' });
            
            const result = await startTaskTimerAction({ taskId: VALID_TASK_ID });
            
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('Service error');
            }
        });
    });

    describe('stopTaskTimerAction', () => {
        it('should successfully stop timer', async () => {
            vi.mocked(TimeTrackingService.stopTimer).mockResolvedValue({ success: true });
            
            const result = await stopTaskTimerAction({ taskId: VALID_TASK_ID });
            
            expect(result.success).toBe(true);
            expect(TimeTrackingService.stopTimer).toHaveBeenCalledWith(VALID_TASK_ID, USER_ID);
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard/production');
        });
    });

    describe('getOrCreateTaskAndTimerStatusAction', () => {
        it('should get or create task and return status', async () => {
            vi.mocked(TimeTrackingService.getOrCreateTaskForOrderItem).mockResolvedValue(VALID_TASK_ID);
            vi.mocked(TimeTrackingService.getTimerStatus).mockResolvedValue({ 
                isRunning: true, 
                startTime: new Date(), 
                staffId: VALID_STAFF_ID
            });
            
            const result = await getOrCreateTaskAndTimerStatusAction({ 
                orderItemId: VALID_ORDER_ITEM_ID, 
                stage: 'Печать' 
            });
            
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.taskId).toBe(VALID_TASK_ID);
                expect(result.data.isRunning).toBe(true);
            }
        });
    });
});
