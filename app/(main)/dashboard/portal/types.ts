import { type Achievement, type UserAchievement, type ProductionTask, type DailyWorkStat, type Order, type WorkSession } from "@/lib/schema";

export interface PortalData {
  isStaff: boolean;
  session?: { id: string; name?: string | null; image?: string | null; email?: string | null };
  user?: { id: string; name?: string | null; image?: string | null };
  staff?: { id: string; name?: string; position?: string | null };
  activeTasks?: (ProductionTask & { order?: Pick<Order, "orderNumber"> })[];
  achievements?: (UserAchievement & { achievement: Achievement })[];
  pieceworkTotal?: number;
  stats?: DailyWorkStat[];
  currentSession?: WorkSession | null;
}
