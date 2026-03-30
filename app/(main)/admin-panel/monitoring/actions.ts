"use server";

import { HeatmapService } from "@/lib/services/production/heatmap.service";
import { createSafeAction } from "@/lib/action-helpers";
import { z } from "zod";

const HeatmapSchema = z.object({
  days: z.number().int().min(1).max(90).default(7)
});

/**
 * Action to fetch production heatmap data for monitoring.
 */
export const getHeatmapData = createSafeAction(HeatmapSchema, async ({ days }) => {
  return await HeatmapService.getProductionBottlenecks(days);
});

/**
 * Action to fetch slow stages directly.
 */
export const getSlowStages = createSafeAction(z.object({}), async () => {
  return await HeatmapService.getSlowStages();
});
