"use server";

import { z } from "zod";
import { getSession } from "@/lib/session";
import { logAction } from "@/lib/audit";

// СХЕМЫ ВАЛИДАЦИИ
const dateRangeSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

const exportParamsSchema = dateRangeSchema.extend({
  type: z.enum(["overview", "defects", "staff", "materials"]),
});

/**
 * Экспорт отчёта в PDF
 */
export async function exportReportToPDF(params: z.infer<typeof exportParamsSchema>) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    if (session.roleSlug !== "admin" && session.roleSlug !== "management") {
      return { success: false, error: "У вас нет прав на экспорт отчётов" };
    }
    const validated = exportParamsSchema.parse(params);

    await logAction("Экспорт отчета в PDF", "report", "all", {
      type: validated.type,
      startDate: validated.startDate,
      endDate: validated.endDate
    });

    return {
      success: true,
      data: {
        url: `/api/reports/pdf?type=${validated.type}&start=${validated.startDate}&end=${validated.endDate}`,
      },
    };
  } catch (error) {
    console.error("[exportReportToPDF]", error);
    return { success: false, error: "Ошибка генерации PDF" };
  }
}

/**
 * Экспорт отчёта в Excel
 */
export async function exportReportToExcel(params: z.infer<typeof exportParamsSchema>) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    if (session.roleSlug !== "admin" && session.roleSlug !== "management") {
      return { success: false, error: "У вас нет прав на экспорт отчётов" };
    }
    const validated = exportParamsSchema.parse(params);

    await logAction("Экспорт отчета в Excel", "report", "all", {
      type: validated.type,
      startDate: validated.startDate,
      endDate: validated.endDate
    });

    return {
      success: true,
      data: {
        url: `/api/reports/excel?type=${validated.type}&start=${validated.startDate}&end=${validated.endDate}`,
      },
    };
  } catch (error) {
    console.error("[exportReportToExcel]", error);
    return { success: false, error: "Ошибка генерации Excel" };
  }
}
