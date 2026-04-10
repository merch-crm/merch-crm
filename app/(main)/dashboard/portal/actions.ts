"use server";

import { db } from "@/lib/db";
import { 
  productionTasks, 
  productionStaff, 
} from "@/lib/schema/production";
import { userAchievements } from "@/lib/schema/achievements";
import { dailyWorkStats, workSessions } from "@/lib/schema/presence/sessions";
import { tickets } from "@/lib/schema/tickets";
import { eq, and, desc, gte, sql, isNull } from "drizzle-orm";
import { subDays } from "date-fns";
import { revalidatePath } from "next/cache";

import { z } from "zod";
import { withAuth } from "@/lib/action-helpers";
import { type PortalData } from "./types";

const createTicketSchema = z.object({
  title: z.string().min(3, "Заголовок должен быть не менее 3 символов"),
  description: z.string().optional(),
  category: z.enum(["equipment", "materials", "design", "other"]),
  priority: z.enum(["low", "normal", "high", "critical"]),
  orderId: z.string().uuid().optional().or(z.literal("")),
});

export async function createTicket(values: z.infer<typeof createTicketSchema>) {
  return withAuth(async (session) => {
    const validated = createTicketSchema.parse(values);
    
    try {
      // Generate ticket number T-XXXX
      const ticketNumber = `T-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      await db.insert(tickets).values({
        number: ticketNumber,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        orderId: validated.orderId || null,
        createdById: session.id,
        status: "open",
        priority: validated.priority
      });

      revalidatePath("/dashboard/portal");
      return { success: true, data: { number: ticketNumber } };
    } catch (error) {
      console.error("Error creating ticket:", error);
      return { success: false, error: "Не удалось создать тикет" };
    }
  }, { errorPath: "portal/createTicket" });
}

export async function getPortalData() {
  return withAuth<PortalData>(async (session) => {
    // 1. Get Production Staff profile
    const staff = await db.query.productionStaff.findFirst({
      where: eq(productionStaff.userId, session.id),
      with: {
        user: true
      }
    });

    if (!staff) {
      // If not a production staff, basic user info
      return {
        success: true,
        data: {
          isStaff: false,
          session: {
            id: session.id,
            name: session.name,
            email: session.email
          }
        }
      };
    }

    // 2. Get Active/Pending Tasks
    const activeTasks = await db.query.productionTasks.findMany({
      where: and(
        eq(productionTasks.assigneeId, staff.id),
        sql`${productionTasks.status} IN ('pending', 'in_progress', 'paused')`
      ),
      with: {
        order: true,
        applicationType: true
      },
      orderBy: [desc(productionTasks.priority), desc(productionTasks.createdAt)],
      limit: 10
    });

    // 3. Get Recent Achievements
    const recentAchievements = await db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, session.id),
      with: {
        achievement: true
      },
      orderBy: [desc(userAchievements.achievedAt)],
      limit: 5
    });

    // 4. Get Piecework Estimate (Current Month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const completedTasksInMonth = await db.query.productionTasks.findMany({
      where: and(
        eq(productionTasks.assigneeId, staff.id),
        eq(productionTasks.status, 'completed'),
        gte(productionTasks.completedAt, startOfMonth)
      ),
      with: {
        applicationType: true
      }
    });

    // Piecework rate: 15% of costPerUnit or a minimum fallback
    let pieceworkTotal = 0;
    completedTasksInMonth.forEach(task => {
      const rate = task.applicationType?.costPerUnit || 1500;
      const staffRate = Math.floor(rate * 0.15);
      pieceworkTotal += (task.completedQuantity || 0) * staffRate;
    });

    // 5. Get Work Stats (Last 7 days)
    const sevenDaysAgo = subDays(new Date(), 7);
    const stats = await db.query.dailyWorkStats.findMany({
      where: and(
        eq(dailyWorkStats.userId, session.id),
        gte(dailyWorkStats.date, sevenDaysAgo)
      ),
      orderBy: [desc(dailyWorkStats.date)]
    });

    // 6. Get Current Active Session (Shift Timer)
    const currentSession = await db.query.workSessions.findFirst({
      where: and(
        eq(workSessions.userId, session.id),
        isNull(workSessions.endTime)
      ),
      orderBy: [desc(workSessions.startTime)]
    });

    return {
      success: true,
      data: {
        isStaff: true as const,
        staff,
        activeTasks,
        achievements: recentAchievements,
        pieceworkTotal,
        stats,
        currentSession,
        session: {
          id: session.id,
          name: session.name,
          email: session.email
        }
      } satisfies PortalData
    };
  }, { errorPath: "portal/getPortalData" });
}
