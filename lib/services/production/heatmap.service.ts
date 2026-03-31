import { db } from "@/lib/db";
import { productionTasks, productionLogs } from "@/lib/schema/production";
import { eq, and, gte, sql } from "drizzle-orm";
import { logError } from "@/lib/error-logger";

export interface StageStat {
  stageName: string;
  appTypeId: string | null;
  avgDurationMinutes: number;
  totalTasks: number;
  estimatedTime: number;
  efficiency: number; // actual / estimated
}

export class HeatmapService {
  /**
   * Analyzes production logs to find bottlenecks in the production hall.
   * Calculates the average actual time spent on tasks vs estimated time.
   */
  static async getProductionBottlenecks(days: number = 7): Promise<StageStat[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const tasks = await db.query.productionTasks.findMany({
        where: and(
          eq(productionTasks.status, "completed"),
          gte(productionTasks.completedAt, startDate)
        ),
        limit: 1000,
        with: {
          logs: {
            where: sql`${productionLogs.event} IN ('started', 'completed')`,
            orderBy: [productionLogs.createdAt],
          },
          applicationType: true,
        },
      });

      const statsMap: Record<string, { totalDuration: number, count: number, estimated: number, name: string }> = {};

      for (const task of tasks) {
        const startedLog = task.logs.find(l => l.event === "started");
        const completedLog = task.logs.find(l => l.event === "completed");

        if (startedLog && completedLog) {
          const durationMs = completedLog.createdAt.getTime() - startedLog.createdAt.getTime();
          const durationMins = durationMs / (1000 * 60);
          
          const appId = task.applicationTypeId || "manual";
          const appName = task.applicationType?.name || task.title;

          if (!statsMap[appId]) {
            statsMap[appId] = { totalDuration: 0, count: 0, estimated: 0, name: appName };
          }

          statsMap[appId].totalDuration += durationMins;
          statsMap[appId].count += 1;
          statsMap[appId].estimated += (task.estimatedTime || 0);
        }
      }

      // 2. Format results
      const results: StageStat[] = Object.entries(statsMap).map(([id, data]) => {
        const avgDuration = data.totalDuration / data.count;
        const avgEstimated = data.estimated / data.count;
        const efficiency = avgEstimated > 0 ? (avgDuration / avgEstimated) : 1;

        return {
          stageName: data.name,
          appTypeId: id === "manual" ? null : id,
          avgDurationMinutes: Math.round(avgDuration),
          totalTasks: data.count,
          estimatedTime: Math.round(avgEstimated),
          efficiency: Number(efficiency.toFixed(2)),
        };
      });

      // Sort by efficiency descending (highest efficiency = worst bottleneck)
      return results.sort((a, b) => b.efficiency - a.efficiency);
    } catch (error) {
      await logError({
        error,
        path: "HeatmapService.getProductionBottlenecks",
        method: "GET"
      });
      return [];
    }
  }

  /**
   * Returns a simplified list of app types that are currently running slow.
   */
  static async getSlowStages() {
    const stats = await this.getProductionBottlenecks(30);
    return stats.filter(s => s.efficiency > 1.25); // 25% slower than estimated
  }
}
