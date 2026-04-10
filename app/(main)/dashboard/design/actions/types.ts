import { orders, orderItems } from "@/lib/schema/orders";
import { orderDesignTasks, orderDesignFiles, orderDesignHistory } from "@/lib/schema/design-tasks";
import { printDesigns } from "@/lib/schema/designs";
import { clients } from "@/lib/schema/clients/main";
import { clientBranding } from "@/lib/schema/clients/branding";

export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type DesignTask = typeof orderDesignTasks.$inferSelect;
export type DesignFile = typeof orderDesignFiles.$inferSelect;

export type DesignTaskFull = DesignTask & {
  order?: (typeof orders.$inferSelect & {
    client?: (typeof clients.$inferSelect & {
      branding?: (typeof clientBranding.$inferSelect)[];
    }) | null;
  }) | null;
  orderItem?: typeof orderItems.$inferSelect | null;
  applicationType?: { id: string, name: string, color: string | null } | null;
  sourceDesign?: (typeof printDesigns.$inferSelect & { collection?: { id: string, name: string } | null }) | null;
  assignee?: { id: string; name: string; image: string | null } | null;
  createdByUser?: { id: string; name: string } | null;
  files?: DesignFile[];
  history?: (typeof orderDesignHistory.$inferSelect & {
    performedByUser?: { id: string; name: string; image: string | null } | null;
  })[];
};

export interface DesignQueueStats {
  total: number;
  byStatus: Record<string, number>;
  pending: number;
  inProgress: number;
  review: number;
  overdue: number;
  completedToday: number;
  myTasks: number;
}
