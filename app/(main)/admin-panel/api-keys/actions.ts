"use server";

import { db } from "@/lib/db";
import { apiKeys } from "@/lib/schema/api";
import { createSafeAction } from "@/lib/action-helpers";
import { z } from "zod";
import { eq, desc, type InferSelectModel } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { type ActionResult, ok, ERRORS } from "@/lib/types";

export type ApiKey = InferSelectModel<typeof apiKeys>;

const CreateApiKeySchema = z.object({
 name: z.string().min(1, "Название обязательно"),
});

const RevokeApiKeySchema = z.object({
 id: z.string().uuid(),
});

/**
 * Action to list all API keys for the current user.
 */
export async function getApiKeysAction(): Promise<ActionResult<ApiKey[]>> {
 const session = await getSession();
 if (!session) return { success: false, error: "Unauthorized" };

 try {
  const keys = await db.query.apiKeys.findMany({
   where: eq(apiKeys.userId, session.id),
   orderBy: [desc(apiKeys.createdAt)],
  });
  return ok(keys);
 } catch (_error) {
  return ERRORS.INTERNAL("Failed to fetch API keys");
 }
}

/**
 * Action to generate a new API key.
 */
export const createApiKey = createSafeAction(CreateApiKeySchema, async ({ name }): Promise<ActionResult<ApiKey>> => {
 const session = await getSession();
 if (!session) return { success: false, error: "Unauthorized" };

 // Generate a random secure key: "mc_" prefix + 48 chars hex
 const keyContent = `mc_${randomBytes(24).toString("hex")}`;

 try {
  const [newKey] = await db.insert(apiKeys).values({
   name,
   key: keyContent,
   userId: session.id,
  }).returning();

  await logAction(
    `Создан API-ключ: ${name}`, 
    "api_key", 
    newKey.id, 
    { name, keyPrefix: keyContent.substring(0, 6) }
  );

  revalidatePath("/admin-panel/api-keys");
  return { success: true, data: newKey };
 } catch (_error) {
  return { success: false, error: "Failed to create API key" };
 }
});

/**
 * Action to revoke an API key.
 */
export const revokeApiKey = createSafeAction(RevokeApiKeySchema, async ({ id }) => {
 const session = await getSession();
 if (!session) return { success: false, error: "Unauthorized" };

 try {
  const key = await db.query.apiKeys.findFirst({ where: eq(apiKeys.id, id) });
  if (!key) return { success: false, error: "Key not found" };

  await db.delete(apiKeys).where(eq(apiKeys.id, id));
  
  await logAction(
    `Отозван API-ключ: ${key.name}`, 
    "api_key", 
    id, 
    { name: key.name }
  );

  revalidatePath("/admin-panel/api-keys");
  return { success: true };
 } catch (_error) {
  return { success: false, error: "Failed to revoke API key" };
 }
});
