"use server";

import { db } from "@/lib/db";
import { clientContacts, clients, type ClientContact } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { z } from "zod";
import type { ActionResult } from "@/lib/types";

// === Схемы валидации ===

const ContactRoleSchema = z.enum(["lpr", "accountant", "buyer", "other"]);

const ClientContactSchema = z.object({
    clientId: z.string().uuid("Некорректный ID клиента"),
    name: z.string().min(1, "Имя контакта обязательно").max(200),
    position: z.string().max(200).optional().or(z.literal("")),
    role: ContactRoleSchema.default("other"),
    phone: z.string().max(50).optional().or(z.literal("")),
    email: z.union([z.literal(""), z.string().email("Некорректный Email")]).optional(),
    telegram: z.string().max(100).optional().or(z.literal("")),
    isPrimary: z.boolean().default(false),
    notes: z.string().max(1000).optional().or(z.literal("")),
});

const UpdateContactSchema = ClientContactSchema.omit({ clientId: true }).partial();

// === Server Actions ===

/**
 * Получить все контакты клиента
 */
export async function getClientContacts(clientId: string): Promise<ActionResult<ClientContact[]>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const contacts = await db.query.clientContacts.findMany({
            where: eq(clientContacts.clientId, clientId),
            orderBy: [desc(clientContacts.isPrimary), desc(clientContacts.createdAt)],
            limit: 100,
        });

        return { success: true, data: contacts };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients/contacts", method: "getClientContacts" });
        return { success: false, error: "Не удалось загрузить контакты" };
    }
}

/**
 * Добавить контактное лицо
 */
export async function addClientContact(data: z.infer<typeof ClientContactSchema>): Promise<ActionResult<ClientContact>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validation = ClientContactSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { clientId, isPrimary, ...contactData } = validation.data;

    try {
        // Проверяем, что клиент существует и является B2B
        const client = await db.query.clients.findFirst({
            where: eq(clients.id, clientId),
            columns: { id: true, clientType: true, name: true },
        });

        if (!client) {
            return { success: false, error: "Клиент не найден" };
        }

        if (client.clientType !== "b2b") {
            return { success: false, error: "Контактные лица доступны только для организаций (B2B)" };
        }

        // Проверяем лимит контактов (максимум 5)
        const existingContacts = await db.query.clientContacts.findMany({
            where: eq(clientContacts.clientId, clientId),
            columns: { id: true },
            limit: 10,
        });

        if (existingContacts.length >= 5) {
            return { success: false, error: "Достигнут лимит контактных лиц (максимум 5)" };
        }

        // Если это первый контакт или isPrimary=true, сбрасываем primary у других
        const shouldBePrimary = isPrimary || existingContacts.length === 0;

        const newContact = await db.transaction(async (tx) => {
            if (shouldBePrimary) {
                await tx.update(clientContacts)
                    .set({ isPrimary: false, updatedAt: new Date() })
                    .where(eq(clientContacts.clientId, clientId));
            }

            const [insertedContact] = await tx.insert(clientContacts)
                .values({
                    clientId,
                    ...contactData,
                    isPrimary: shouldBePrimary,
                })
                .returning();

            await logAction(
                "Добавлено контактное лицо",
                "client",
                clientId,
                { contactName: contactData.name, role: contactData.role },
                tx
            );

            return insertedContact;
        });

        revalidatePath(`/dashboard/clients`);

        return { success: true, data: newContact };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients/contacts", method: "addClientContact" });
        return { success: false, error: "Не удалось добавить контакт" };
    }
}

/**
 * Обновить контактное лицо
 */
export async function updateClientContact(
    contactId: string,
    data: z.infer<typeof UpdateContactSchema>
): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validation = UpdateContactSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    try {
        const existingContact = await db.query.clientContacts.findFirst({
            where: eq(clientContacts.id, contactId),
        });

        if (!existingContact) {
            return { success: false, error: "Контакт не найден" };
        }

        const { isPrimary, ...updateData } = validation.data;

        await db.transaction(async (tx) => {
            // Если устанавливаем как primary, сбрасываем у других
            if (isPrimary && !existingContact.isPrimary) {
                await tx.update(clientContacts)
                    .set({ isPrimary: false, updatedAt: new Date() })
                    .where(eq(clientContacts.clientId, existingContact.clientId));
            }

            await tx.update(clientContacts)
                .set({
                    ...updateData,
                    isPrimary: isPrimary ?? existingContact.isPrimary,
                    updatedAt: new Date(),
                })
                .where(eq(clientContacts.id, contactId));

            await logAction(
                "Обновлено контактное лицо",
                "client",
                existingContact.clientId,
                { contactId, updates: Object.keys(updateData) },
                tx
            );
        });

        revalidatePath(`/dashboard/clients`);
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients/contacts", method: "updateClientContact" });
        return { success: false, error: "Не удалось обновить контакт" };
    }
}

/**
 * Удалить контактное лицо
 */
export async function deleteClientContact(contactId: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };
    if (!["Администратор", "Руководство", "Отдел продаж"].includes(session.roleName)) return { success: false, error: "Недостаточно прав" };

    try {
        const contact = await db.query.clientContacts.findFirst({
            where: eq(clientContacts.id, contactId),
        });

        if (!contact) {
            return { success: false, error: "Контакт не найден" };
        }

        await db.transaction(async (tx) => {
            await tx.delete(clientContacts).where(eq(clientContacts.id, contactId));

            // Если удалили primary контакт, назначаем нового
            if (contact.isPrimary) {
                const remainingContacts = await tx.query.clientContacts.findMany({
                    where: eq(clientContacts.clientId, contact.clientId),
                    orderBy: [desc(clientContacts.createdAt)],
                    limit: 1,
                });

                if (remainingContacts.length > 0) {
                    await tx.update(clientContacts)
                        .set({ isPrimary: true, updatedAt: new Date() })
                        .where(eq(clientContacts.id, remainingContacts[0].id));
                }
            }

            await logAction(
                "Удалено контактное лицо",
                "client",
                contact.clientId,
                { contactName: contact.name },
                tx
            );
        });

        revalidatePath(`/dashboard/clients`);
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients/contacts", method: "deleteClientContact" });
        return { success: false, error: "Не удалось удалить контакт" };
    }
}

/**
 * Установить контакт как основной
 */
export async function setPrimaryContact(contactId: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const contact = await db.query.clientContacts.findFirst({
            where: eq(clientContacts.id, contactId),
        });

        if (!contact) {
            return { success: false, error: "Контакт не найден" };
        }

        if (contact.isPrimary) {
            return { success: true }; // Уже основной
        }

        await db.transaction(async (tx) => {
            // Сбрасываем primary у всех контактов клиента
            await tx.update(clientContacts)
                .set({ isPrimary: false, updatedAt: new Date() })
                .where(eq(clientContacts.clientId, contact.clientId));

            // Устанавливаем primary для выбранного
            await tx.update(clientContacts)
                .set({ isPrimary: true, updatedAt: new Date() })
                .where(eq(clientContacts.id, contactId));

            await logAction(
                "Назначен основной контакт",
                "client",
                contact.clientId,
                { contactName: contact.name },
                tx
            );
        });

        revalidatePath(`/dashboard/clients`);
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients/contacts", method: "setPrimaryContact" });
        return { success: false, error: "Не удалось назначить основной контакт" };
    }
}
