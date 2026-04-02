"use server";

import { okVoid } from "@/lib/types";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { taskFilterPresets } from "@/lib/schema/task-filter-presets";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import type { TaskActionResult, TaskFilterPreset, TaskFilters } from "@/lib/types/tasks";
import { createFilterPresetSchema, deleteFilterPresetSchema } from "../validation";
import { z } from "zod";

interface SavePresetInput {
  name: string;
  filters: TaskFilters;
}

/**
 * Сохранение пресета фильтров
 */
export async function saveFilterPreset(
  input: SavePresetInput
): Promise<TaskActionResult<TaskFilterPreset>> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" }
    createFilterPresetSchema.parse(input);;
    }

    const [preset] = await db
      .insert(taskFilterPresets)
      .values({
        id: crypto.randomUUID(),
        userId: session.id,
        name: input.name,
        filters: input.filters,
        isFavorite: false,
      })
      .returning();

    revalidatePath("/dashboard/tasks");

    return {
      success: true,
      data: {
        id: preset.id,
        name: preset.name,
        filters: preset.filters as TaskFilters,
        isSystem: false,
        isFavorite: preset.isFavorite,
        userId: preset.userId,
        createdAt: preset.createdAt,
      },
    };
  } catch (error) {
    logError({ error, method: "saveFilterPreset" });
    return { success: false, error: "Не удалось сохранить пресет" };
  }
}

/**
 * Удаление пресета
 */
export async function deleteFilterPreset(
  presetId: string
): Promise<TaskActionResult<void>> {
  // audit-ignore - Пресеты фильтров это локальные настройки пользователя
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" }
    deleteFilterPresetSchema.parse({ presetId });;
    }

    await db
      .delete(taskFilterPresets)
      .where(
        and(
          eq(taskFilterPresets.id, presetId),
          eq(taskFilterPresets.userId, session.id)
        )
      );

    revalidatePath("/dashboard/tasks");
    return okVoid();
  } catch (error) {
    logError({ error, method: "deleteFilterPreset" });
    return { success: false, error: "Не удалось удалить пресет" };
  }
}

/**
 * Переключение избранного статуса пресета
 */
export async function togglePresetFavorite(
  presetId: string,
  isFavorite: boolean
): Promise<TaskActionResult<void>> {
  try {
    z.string().uuid().parse(presetId);
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" };
    }

    await db
      .update(taskFilterPresets)
      .set({ isFavorite })
      .where(
        and(
          eq(taskFilterPresets.id, presetId),
          eq(taskFilterPresets.userId, session.id)
        )
      );

    revalidatePath("/dashboard/tasks");
    return okVoid();
  } catch (error) {
    logError({ error, method: "togglePresetFavorite" });
    return { success: false, error: "Не удалось обновить пресет" };
  }
}

/**
 * Получение всех пресетов пользователя
 */
export async function getUserFilterPresets(): Promise<
  TaskActionResult<TaskFilterPreset[]>
> {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Не авторизован" };
    }

    const presets = await db
      .select()
      .from(taskFilterPresets)
      .where(eq(taskFilterPresets.userId, session.id))
      .limit(50);

    return {
      success: true,
      data: presets.map((p) => ({
        id: p.id,
        name: p.name,
        filters: p.filters as TaskFilters,
        isSystem: false,
        isFavorite: p.isFavorite,
        userId: p.userId,
        createdAt: p.createdAt,
      })),
    };
  } catch (error) {
    logError({ error, method: "getUserFilterPresets" });
    return { success: false, error: "Не удалось загрузить пресеты" };
  }
}
