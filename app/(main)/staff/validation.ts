import { z } from "zod";

// ============================================
// REPORTS
// ============================================

export const ReportFilterSchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    userId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
});
