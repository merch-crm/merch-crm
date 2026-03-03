import { type DetectionZone } from '@/lib/schema/presence'

export interface WorkstationInput {
    name: string;
    description?: string | null;
    cameraId?: string | null;
    assignedUserId?: string | null;
    requiresAssignedUser?: boolean;
    zone?: DetectionZone | null;
    color?: string | null;
}
