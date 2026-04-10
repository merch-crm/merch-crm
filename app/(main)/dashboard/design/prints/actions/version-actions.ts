"use server";

import { revalidatePath } from "next/cache";
import { eq, sql, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  printDesignVersions,
  printDesigns,
  printDesignFiles,
  printCollections,
} from "@/lib/schema/designs";
import { invalidateCache } from "@/lib/redis";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { generateId } from "@/lib/utils";
import { type ActionResult, okVoid } from "@/lib/types";

type PrintDesignVersion = InferSelectModel<typeof printDesignVersions>;

const VersionSchema = z.object({
  designId: z.string().uuid("Некорректный ID макета"),
  name: z.string().min(1, "Название обязательно").max(100, "Максимум 100 символов"),
  preview: z.string().url("Некорректный URL").optional().nullable(),
});

export async function createDesignVersion(data: {
  designId: string;
  name: string;
  preview?: string | null;
}): Promise<ActionResult<PrintDesignVersion>> {
  const session = await getSession();
  if (!session) return { success: false, error: "Не авторизован" };

  const validated = VersionSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  try {
    const [design] = await db
      .select({ id: printDesigns.id, collectionId: printDesigns.collectionId })
      .from(printDesigns)
      .where(eq(printDesigns.id, validated.data.designId))
      .limit(1);

    if (!design) {
      return { success: false, error: "Макет не найден" };
    }

    const [maxSort] = await db
      .select({ max: sql<number>`coalesce(max(${printDesignVersions.sortOrder}), 0)` })
      .from(printDesignVersions)
      .where(eq(printDesignVersions.designId, validated.data.designId));

    const [version] = await db
      .insert(printDesignVersions)
      .values({
        id: generateId(),
        designId: validated.data.designId,
        name: validated.data.name,
        preview: validated.data.preview || null,
        sortOrder: Number(maxSort.max) + 1,
      })
      .returning();

    await logAction("Создана версия макета", "print_design_version", version.id, {
      name: version.name,
      designId: version.designId,
    });

    invalidateCache("design:collections");
    revalidatePath(`/dashboard/design/prints/${design.collectionId}/${validated.data.designId}`);

    return { success: true, data: version };
  } catch (error) {
    await logError({
      error,
      path: "/dashboard/design/prints/actions/version-actions",
      method: "createDesignVersion",
    });
    return { success: false, error: "Не удалось создать версию" };
  }
}

export async function updateDesignVersion(
  id: string,
  data: {
    name?: string;
    preview?: string | null;
    sortOrder?: number;
  }
): Promise<ActionResult<PrintDesignVersion>> {
  const idValidation = z.string().uuid().safeParse(id);
  if (!idValidation.success) {
    return { success: false, error: "Некорректный ID версии" };
  }

  const session = await getSession();
  if (!session) return { success: false, error: "Не авторизован" };

  try {
    const [version] = await db
      .update(printDesignVersions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(printDesignVersions.id, id))
      .returning();

    if (!version) {
      return { success: false, error: "Версия не найдена" };
    }

    const [design] = await db
      .select({ collectionId: printDesigns.collectionId })
      .from(printDesigns)
      .where(eq(printDesigns.id, version.designId))
      .limit(1);

    await logAction("Обновлена версия макета", "print_design_version", id, {
      name: version.name
    });

    invalidateCache("design:collections");
    if (design) {
      revalidatePath(`/dashboard/design/prints/${design.collectionId}/${version.designId}`);
    }

    return { success: true, data: version };
  } catch (error) {
    await logError({
      error,
      path: "/dashboard/design/prints/actions/version-actions",
      method: "updateDesignVersion",
      details: { id },
    });
    return { success: false, error: "Не удалось обновить версию" };
  }
}

export async function deleteDesignVersion(id: string): Promise<ActionResult> {
  const idValidation = z.string().uuid().safeParse(id);
  if (!idValidation.success) {
    return { success: false, error: "Некорректный ID версии" };
  }

  const session = await getSession();
  if (!session) return { success: false, error: "Не авторизован" };

  try {
    const [version] = await db
      .select({
        id: printDesignVersions.id,
        designId: printDesignVersions.designId,
        creator: printCollections.createdBy
      })
      .from(printDesignVersions)
      .innerJoin(printDesigns, eq(printDesignVersions.designId, printDesigns.id))
      .innerJoin(printCollections, eq(printDesigns.collectionId, printCollections.id))
      .where(eq(printDesignVersions.id, id))
      .limit(1);

    if (!version) {
      return { success: false, error: "Версия не найдена" };
    }

    const isAdmin = session.roleSlug === "admin" || session.roleSlug === "management";
    if (!isAdmin && version.creator !== session.id) {
      return { success: false, error: "Недостаточно прав для удаления" }
    }

    const [filesCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(printDesignFiles)
      .where(eq(printDesignFiles.versionId, id));

    if (filesCount.count > 0) {
      return { success: false, error: "Нельзя удалить версию с файлами" };
    }

    const [design] = await db
      .select({ collectionId: printDesigns.collectionId })
      .from(printDesigns)
      .where(eq(printDesigns.id, version.designId))
      .limit(1);

    await db.delete(printDesignVersions).where(eq(printDesignVersions.id, id));

    await logAction("Удалена версия макета", "print_design_version", id);
    invalidateCache("design:collections");
    if (design) {
      revalidatePath(`/dashboard/design/prints/${design.collectionId}/${version.designId}`);
    }

    return okVoid();
  } catch (error) {
    await logError({
      error,
      path: "/dashboard/design/prints/actions/version-actions",
      method: "deleteDesignVersion",
      details: { id },
    });
    return { success: false, error: "Не удалось удалить версию" };
  }
}

export async function updateVersionsOrder(
  designId: string,
  items: Array<{ id: string; sortOrder: number }>
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Не авторизован" };

  try {
    const [design] = await db
      .select({ collectionId: printDesigns.collectionId })
      .from(printDesigns)
      .where(eq(printDesigns.id, designId))
      .limit(1);

    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(printDesignVersions)
          .set({
            sortOrder: item.sortOrder,
            updatedAt: new Date(),
          })
          .where(eq(printDesignVersions.id, item.id));
      }
    });

    invalidateCache("design:collections");
    if (design) {
      revalidatePath(`/dashboard/design/prints/${design.collectionId}/${designId}`);
    }

    return okVoid();
  } catch (error) {
    await logError({
      error,
      path: "/dashboard/design/prints/actions/version-actions",
      method: "updateVersionsOrder",
      details: { designId },
    });
    return { success: false, error: "Не удалось сохранить порядок версий" };
  }
}
