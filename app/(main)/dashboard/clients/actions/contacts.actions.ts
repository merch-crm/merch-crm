"use server";

import { db } from "@/lib/db";
import { clientContacts } from "@/lib/schema/clients/contacts";
import { clients } from "@/lib/schema/clients/main";
import type { ClientContact } from "@/lib/schema/clients/contacts";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { z } from "zod";
import { ActionResult, ok, okVoid, ERRORS } from "@/lib/types";
import { withAuth, ROLE_GROUPS, ActionError } from "@/lib/action-helpers";

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
    return withAuth(async () => {
        try {
            const contacts = await db.query.clientContacts.findMany({
                where: eq(clientContacts.clientId, clientId),
                orderBy: [desc(clientContacts.isPrimary), desc(clientContacts.createdAt)],
                limit: 100,
            });

            return ok(contacts);
        } catch (_error) {
            throw new ActionError("Не удалось загрузить контакты", "INTERNAL_ERROR");
        }
    }, { errorPath: "getClientContacts" });
}

/**
 * Добавить контактное лицо
 */
export async function addClientContact(data: z.infer<typeof ClientContactSchema>): Promise<ActionResult<ClientContact>> {
    return withAuth(async () => {
        const validation = ClientContactSchema.safeParse(data);
        if (!validation.success) {
            return ERRORS.VALIDATION(validation.error.issues[0].message);
        }

        const { clientId, isPrimary, ...contactData } = validation.data;

        // Проверяем, что клиент существует и является B2B
        const client = await db.query.clients.findFirst({
            where: eq(clients.id, clientId),
            columns: { id: true, clientType: true, name: true },
        });

        if (!client) {
            return ERRORS.NOT_FOUND("Клиент");
        }

        if (client.clientType !== "b2b") {
            return ERRORS.VALIDATION("Контактные лица доступны только для организаций (B2B)");
        }

        // Проверяем лимит контактов (максимум 5)
        const existingContacts = await db.query.clientContacts.findMany({
            where: eq(clientContacts.clientId, clientId),
            columns: { id: true },
            limit: 10,
        });

        if (existingContacts.length >= 5) {
            return ERRORS.VALIDATION("Достигнут лимит контактных лиц (максимум 5)");
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

        return ok(newContact);
    }, { errorPath: "addClientContact" });
}

/**
 * Обновить контактное лицо
 */
export async function updateClientContact(
    contactId: string,
    data: z.infer<typeof UpdateContactSchema>
): Promise<ActionResult> {
    return withAuth(async () => {
        const validation = UpdateContactSchema.safeParse(data);
        if (!validation.success) {
            return ERRORS.VALIDATION(validation.error.issues[0].message);
        }

        const existingContact = await db.query.clientContacts.findFirst({
            where: eq(clientContacts.id, contactId),
        });

        if (!existingContact) {
            return ERRORS.NOT_FOUND("Контакт");
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
        return okVoid();
    }, { errorPath: "updateClientContact" });
}

/**
 * Удалить контактное лицо
 */
export async function deleteClientContact(contactId: string): Promise<ActionResult> {
    return withAuth(async (session) => {
        if (!["admin", "management", "sales"].includes(session.roleSlug)) {
            return ERRORS.FORBIDDEN();
        }

        const contact = await db.query.clientContacts.findFirst({
            where: eq(clientContacts.id, contactId),
        });

        if (!contact) {
            return ERRORS.NOT_FOUND("Контакт");
        }

        try {
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
        } catch (_error) {
            throw new ActionError("Ошибка при удалении контакта", "INTERNAL_ERROR");
        }

        revalidatePath(`/dashboard/clients`);
        return okVoid();
    }, { 
        roles: ROLE_GROUPS.CAN_EDIT_CLIENTS,
        errorPath: "deleteClientContact" 
    });
}

/**
 * Установить контакт как основной
 */
export async function setPrimaryContact(contactId: string): Promise<ActionResult> {
    return withAuth(async () => {
        const contact = await db.query.clientContacts.findFirst({
            where: eq(clientContacts.id, contactId),
        });

        if (!contact) {
            return ERRORS.NOT_FOUND("Контакт");
        }

        if (contact.isPrimary) {
            return okVoid(); // Уже основной
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
        return okVoid();
    }, { errorPath: "setPrimaryContact" });
}
