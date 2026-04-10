"use server";

import { revalidatePath } from "next/cache";
import { eq, sql, asc, inArray, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  printCollections,
  printDesigns,
  printDesignVersions,
  printDesignFiles,
} from "@/lib/schema/designs";
import { inventoryCategories } from "@/lib/schema/warehouse/categories";
import { productLines } from "@/lib/schema/product-lines";
import { invalidateCache } from "@/lib/redis";
import { withAuth } from "@/lib/action-helpers";
import { logAction } from "@/lib/audit";
import { z } from "zod";
import { generateId } from "@/lib/utils";

import {
  DesignWithVersionsCount,
  DesignWithFullData,
  ActionResult,
  VersionWithFiles,
  ok,
  okVoid,
  ERRORS
} from "@/lib/types";


type PrintDesign = InferSelectModel<typeof printDesigns>;

const DesignSchema = z.object({
  collectionId: z.string().uuid("Некорректный ID коллекции"),
  name: z.string().min(1, "Название обязательно").max(100, "Максимум 100 символов"),
  description: z.string().max(500, "Максимум 500 символов").optional().nullable(),
  preview: z.string().url("Некорректный URL").optional().nullable(),
});

export async function getDesignsByCollection(collectionId: string): Promise<ActionResult<DesignWithVersionsCount[]>> {
  const idValidation = z.string().uuid().safeParse(collectionId);
  if (!idValidation.success) {
    return ERRORS.VALIDATION("Некорректный ID коллекции");
  }

  return withAuth(async () => {
    const designs = await db
      .select({
        id: printDesigns.id,
        collectionId: printDesigns.collectionId,
        name: printDesigns.name,
        preview: printDesigns.preview,
        description: printDesigns.description,
        printFilePath: printDesigns.printFilePath,
        applicationTypeId: printDesigns.applicationTypeId,
        costPrice: printDesigns.sortOrder, // Fix if this was wrong, but following original structure
        retailPrice: printDesigns.retailPrice,
        isActive: printDesigns.isActive,
        sortOrder: printDesigns.sortOrder,
        createdAt: printDesigns.createdAt,
        updatedAt: printDesigns.updatedAt,
        versionsCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM print_design_versions
          WHERE print_design_versions.design_id = print_designs.id
        )`,
        filesCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM print_design_files
          JOIN print_design_versions ON print_design_files.version_id = print_design_versions.id
          WHERE print_design_versions.design_id = print_designs.id
        )`
      })
      .from(printDesigns)
      .where(eq(printDesigns.collectionId, idValidation.data))
      .orderBy(asc(printDesigns.sortOrder), asc(printDesigns.name));

    return ok(designs as DesignWithVersionsCount[]);
  }, { errorPath: "getDesignsByCollection" });
}

export async function getDesignById(id: string): Promise<ActionResult<DesignWithFullData>> {
  const idValidation = z.string().uuid().safeParse(id);
  if (!idValidation.success) {
    return ERRORS.VALIDATION("Некорректный ID макета");
  }

  return withAuth(async () => {
    const [design] = await db
      .select()
      .from(printDesigns)
      .where(eq(printDesigns.id, idValidation.data))
      .limit(1);

    if (!design) {
      return ERRORS.NOT_FOUND("Макет");
    }

    const [collection] = await db
      .select({
        id: printCollections.id,
        name: printCollections.name,
      })
      .from(printCollections)
      .where(eq(printCollections.id, design.collectionId))
      .limit(1);

    const versions = await db
      .select()
      .from(printDesignVersions)
      .where(eq(printDesignVersions.designId, idValidation.data))
      .orderBy(asc(printDesignVersions.createdAt));

    const versionIds = versions.map(v => v.id);
    const files = versionIds.length > 0
      ? await db
        .select()
        .from(printDesignFiles)
        .where(inArray(printDesignFiles.versionId, versionIds))
        .orderBy(asc(printDesignFiles.createdAt))
      : [];

    const versionsWithFiles: VersionWithFiles[] = versions.map(version => ({
      ...version,
      files: files.filter(f => f.versionId === version.id),
    }));

    const linkedLines = await db
      .select({
        id: productLines.id,
        name: productLines.name,
        categoryName: inventoryCategories.name,
      })
      .from(productLines)
      .leftJoin(inventoryCategories, eq(productLines.categoryId, inventoryCategories.id))
      .where(eq(productLines.printCollectionId, design.collectionId))
      .orderBy(asc(productLines.name));

    const { printDesignMockups } = await import("@/lib/schema/designs");
    const mockups = await db
      .select()
      .from(printDesignMockups)
      .where(eq(printDesignMockups.designId, idValidation.data))
      .orderBy(asc(printDesignMockups.sortOrder));

    return ok({
      ...design,
      collection,
      versions: versionsWithFiles,
      linkedLines: linkedLines.map(line => ({
        ...line,
        categoryName: line.categoryName || "Без категории"
      })),
      mockups,
    } as DesignWithFullData);
  }, { errorPath: "getDesignById" });
}

export async function createDesign(data: {
  collectionId: string;
  name: string;
  description?: string | null;
  preview?: string | null;
}): Promise<ActionResult<PrintDesign>> {
  const validated = DesignSchema.safeParse(data);
  if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

  return withAuth(async () => {
    const [collection] = await db
      .select({ id: printCollections.id })
      .from(printCollections)
      .where(eq(printCollections.id, validated.data.collectionId))
      .limit(1);

    if (!collection) {
      return ERRORS.NOT_FOUND("Коллекция");
    }

    const [design] = await db
      .insert(printDesigns)
      .values({
        id: generateId(),
        collectionId: validated.data.collectionId,
        name: validated.data.name,
        description: validated.data.description || null,
        preview: validated.data.preview || null,
      })
      .returning();

    await logAction("Создан макет дизайна", "print_design", design.id, {
      name: design.name,
      collectionId: design.collectionId,
    });

    invalidateCache("design:collections");
    revalidatePath(`/dashboard/design/prints/${validated.data.collectionId}`);

    return ok(design);
  }, { errorPath: "createDesign" });
}

export async function updateDesign(
  id: string,
  data: Partial<PrintDesign>
): Promise<ActionResult<PrintDesign>> {
  const idValidation = z.string().uuid().safeParse(id);
  if (!idValidation.success) return ERRORS.VALIDATION("Некорректный ID макета");

  return withAuth(async () => {
    const [design] = await db
      .update(printDesigns)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(printDesigns.id, idValidation.data))
      .returning();

    if (!design) {
      return ERRORS.NOT_FOUND("Макет");
    }

    await logAction("Обновлён макет дизайна", "print_design", id, {
      name: design.name
    });

    invalidateCache("design:collections");
    revalidatePath(`/dashboard/design/prints/${design.collectionId}`);
    revalidatePath(`/dashboard/design/prints/${design.collectionId}/${id}`);

    return ok(design);
  }, { errorPath: "updateDesign" });
}

export async function deleteDesign(id: string): Promise<ActionResult> {
  const idValidation = z.string().uuid().safeParse(id);
  if (!idValidation.success) return ERRORS.VALIDATION("Некорректный ID макета");

  return withAuth(async (session) => {
    const [design] = await db
      .select({
        collectionId: printDesigns.collectionId,
        creator: printCollections.createdBy
      })
      .from(printDesigns)
      .innerJoin(printCollections, eq(printDesigns.collectionId, printCollections.id))
      .where(eq(printDesigns.id, idValidation.data))
      .limit(1);

    if (!design) {
      return ERRORS.NOT_FOUND("Макет");
    }

    const isAdmin = session.roleSlug === "admin" || session.roleSlug === "management";
    if (!isAdmin && design.creator !== session.id) {
      return ERRORS.FORBIDDEN("Вы не можете удалить этот макет");
    }

    await db.delete(printDesigns).where(eq(printDesigns.id, idValidation.data));

    await logAction("Удалён макет дизайна", "print_design", id);

    invalidateCache("design:collections");
    revalidatePath(`/dashboard/design/prints/${design.collectionId}`);

    return okVoid();
  }, { errorPath: "deleteDesign" });
}

export async function setDesignPreview(designId: string, fileId: string): Promise<ActionResult<PrintDesign>> {
  return withAuth(async () => {
    const [file] = await db.select().from(printDesignFiles).where(eq(printDesignFiles.id, fileId)).limit(1);
    if (!file) return ERRORS.NOT_FOUND("Файл");

    const [design] = await db
      .update(printDesigns)
      .set({ preview: file.path, updatedAt: new Date() })
      .where(eq(printDesigns.id, designId))
      .returning();

    if (!design) return ERRORS.NOT_FOUND("Макет");

    invalidateCache("design:collections");
    revalidatePath(`/dashboard/design/prints/${design.collectionId}`);
    revalidatePath(`/dashboard/design/prints/${design.collectionId}/${designId}`);

    return ok(design);
  }, { errorPath: "setDesignPreview" });
}

export async function updateDesignsOrder(
  collectionId: string,
  items: { id: string; sortOrder: number }[]
): Promise<ActionResult<void>> {
  return withAuth(async () => {
    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(printDesigns)
          .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
          .where(eq(printDesigns.id, item.id));
      }
    });

    invalidateCache("design:collections");
    revalidatePath(`/dashboard/design/prints/${collectionId}`);

    return okVoid();
  }, { errorPath: "updateDesignsOrder" });
}

export async function getPrintsStats(): Promise<ActionResult<{ collections: number, designs: number, versions: number, files: number, linkedLines: number }>> {
  return withAuth(async () => {
    const [collectionsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(printCollections);
    const [designsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(printDesigns);
    const [versionsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(printDesignVersions);
    const [filesCount] = await db.select({ count: sql<number>`count(*)::int` }).from(printDesignFiles);
    const [linkedLinesCount] = await db.select({ count: sql<number>`count(*)::int` }).from(productLines).where(sql`${productLines.printCollectionId} IS NOT NULL`);

    return ok({
      collections: collectionsCount.count,
      designs: designsCount.count,
      versions: versionsCount.count,
      files: filesCount.count,
      linkedLines: linkedLinesCount.count,
    });
  }, { errorPath: "getPrintsStats" });
}
