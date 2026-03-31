"use server";

import { db } from "@/lib/db";
import { clients, users, loyaltyLevels } from "@/lib/schema";
import { eq, and, inArray, asc, sql, gte, lte, isNull, or, ilike } from "drizzle-orm";
import { logAction } from "@/lib/audit";
import { z } from "zod";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { ActionResult, ok } from "@/lib/types";

import { ExportColumn, EXPORT_COLUMNS } from "./export.types";

// Схема параметров экспорта
const ExportParamsSchema = z.object({
    columns: z.array(z.string()).min(1, "Выберите хотя бы одну колонку"),
    format: z.enum(["csv", "xlsx"]).default("csv"),
    filters: z.object({
        clientType: z.enum(["all", "b2c", "b2b"]).optional(),
        managerId: z.string().optional(),
        funnelStage: z.string().optional(),
        loyaltyLevelId: z.string().optional(),
        rfmSegment: z.string().optional(),
        acquisitionSource: z.string().optional(),
        activityStatus: z.enum(["all", "active", "at_risk", "inactive"]).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        search: z.string().optional(),
    }).optional(),
    clientIds: z.array(z.string().uuid()).optional(), // Для экспорта выбранных
    includeArchived: z.boolean().default(false),
});

type ExportParams = z.infer<typeof ExportParamsSchema>;

export interface ExportPreset {
    id: string;
    name: string;
    description: string;
    columns: string[];
}

// Маппинг этапов воронки
const funnelStageLabels: Record<string, string> = {
    lead: "Лид",
    first_contact: "Первый контакт",
    negotiation: "Переговоры",
    first_order: "Первый заказ",
    regular: "Постоянный клиент",
};

// Маппинг RFM-сегментов
const rfmSegmentLabels: Record<string, string> = {
    champions: "Чемпионы",
    loyal: "Лояльные",
    potential: "Потенциальные",
    new: "Новые",
    promising: "Перспективные",
    need_attention: "Требуют внимания",
    about_to_sleep: "Засыпающие",
    at_risk: "В зоне риска",
    hibernating: "Спящие",
    lost: "Потерянные",
};

// Маппинг типов клиентов
const clientTypeLabels: Record<string, string> = {
    b2c: "Частное лицо",
    b2b: "Организация",
};

/**
 * Получить данные для экспорта
 */
export async function getExportData(params: ExportParams): Promise<ActionResult<{
    data: string;
    filename: string;
}>> {
    return withAuth(async () => {
        const validated = ExportParamsSchema.safeParse(params);
        if (!validated.success) {
            return { 
                success: false, 
                error: validated.error.issues[0]?.message || "Ошибка параметров экспорта",
                code: "VALIDATION_ERROR"
            };
        }
        const { columns, filters, clientIds, includeArchived } = validated.data;

        // Формируем условия
        const conditions = [];

        if (!includeArchived) {
            conditions.push(eq(clients.isArchived, false));
        }

        if (clientIds && clientIds.length > 0) {
            conditions.push(inArray(clients.id, clientIds));
        }

        if (filters) {
            if (filters.clientType && filters.clientType !== "all") {
                conditions.push(eq(clients.clientType, filters.clientType));
            }
            if (filters.managerId) {
                if (filters.managerId === "none") {
                    conditions.push(isNull(clients.managerId));
                } else {
                    conditions.push(eq(clients.managerId, filters.managerId));
                }
            }
            if (filters.funnelStage) {
                conditions.push(eq(clients.funnelStage, filters.funnelStage));
            }
            if (filters.loyaltyLevelId) {
                conditions.push(eq(clients.loyaltyLevelId, filters.loyaltyLevelId));
            }
            if (filters.rfmSegment) {
                conditions.push(eq(clients.rfmSegment, filters.rfmSegment));
            }
            if (filters.acquisitionSource) {
                if (filters.acquisitionSource === "none") {
                    conditions.push(or(isNull(clients.acquisitionSource), eq(clients.acquisitionSource, "")));
                } else {
                    conditions.push(eq(clients.acquisitionSource, filters.acquisitionSource));
                }
            }
            if (filters.activityStatus) {
                switch (filters.activityStatus) {
                    case "active":
                        conditions.push(sql`(${clients.daysSinceLastOrder} < 90 OR ${clients.daysSinceLastOrder} IS NULL)`);
                        break;
                    case "at_risk":
                        conditions.push(sql`${clients.daysSinceLastOrder} >= 90 AND ${clients.daysSinceLastOrder} < 180`);
                        break;
                    case "inactive":
                        conditions.push(sql`${clients.daysSinceLastOrder} >= 180`);
                        break;
                }
            }
            if (filters.dateFrom) {
                conditions.push(gte(clients.createdAt, new Date(filters.dateFrom)));
            }
            if (filters.dateTo) {
                conditions.push(lte(clients.createdAt, new Date(filters.dateTo)));
            }
            if (filters.search) {
                conditions.push(
                    or(
                        ilike(clients.lastName, `%${filters.search}%`),
                        ilike(clients.firstName, `%${filters.search}%`),
                        ilike(clients.company, `%${filters.search}%`),
                        ilike(clients.phone, `%${filters.search}%`),
                        ilike(clients.email, `%${filters.search}%`)
                    )
                );
            }
        }

        // Запрос данных
        const data = await db
            .select({
                id: clients.id,
                lastName: clients.lastName,
                firstName: clients.firstName,
                patronymic: clients.patronymic,
                clientType: clients.clientType,
                company: clients.company,
                phone: clients.phone,
                email: clients.email,
                telegram: clients.telegram,
                instagram: clients.instagram,
                city: clients.city,
                address: clients.address,
                totalOrdersCount: clients.totalOrdersCount,
                totalOrdersAmount: clients.totalOrdersAmount,
                averageCheck: clients.averageCheck,
                lastOrderAt: clients.lastOrderAt,
                daysSinceLastOrder: clients.daysSinceLastOrder,
                loyaltyLevel: loyaltyLevels.levelName,
                rfmSegment: clients.rfmSegment,
                funnelStage: clients.funnelStage,
                acquisitionSource: clients.acquisitionSource,
                managerName: users.name,
                createdAt: clients.createdAt,
                comments: clients.comments,
            })
            .from(clients)
            .leftJoin(users, eq(clients.managerId, users.id))
            .leftJoin(loyaltyLevels, eq(clients.loyaltyLevelId, loyaltyLevels.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(asc(clients.lastName), asc(clients.firstName));

        // Формируем CSV
        const selectedColumns = EXPORT_COLUMNS.filter(col => columns.includes(col.key));

        // Заголовки
        const headers = selectedColumns.map(col => col.label);

        // Строки данных
        const rows = (data || []).map(row => {
            return selectedColumns.map(col => {
                const value = row[col.key as keyof typeof row];

                // Форматирование значений
                if (value === null || value === undefined) return "";

                if (col.key === "clientType") {
                    return clientTypeLabels[value as string] || value;
                }
                if (col.key === "funnelStage") {
                    return funnelStageLabels[value as string] || value;
                }
                if (col.key === "rfmSegment") {
                    return rfmSegmentLabels[value as string] || value;
                }
                if (col.key === "lastOrderAt" || col.key === "createdAt") {
                    const dateVal = value instanceof Date ? value : new Date(value as string);
                    return isNaN(dateVal.getTime()) ? "" : dateVal.toLocaleDateString("ru-RU");
                }
                if (col.key === "totalOrdersAmount" || col.key === "averageCheck") {
                    return typeof value === "number" ? value.toFixed(2) : value;
                }

                // Экранирование для CSV
                const strValue = String(value);
                if (strValue.includes(",") || strValue.includes('"') || strValue.includes("\n")) {
                    return `"${strValue.replace(/"/g, '""')}"`;
                }
                return strValue;
            });
        });

        // Собираем CSV
        const csvContent = [
            headers.join(","),
            ...(rows || []).map(row => row.join(","))
        ].join("\n");

        // BOM для корректного отображения кириллицы в Excel
        const bom = "\uFEFF";
        const csvWithBom = bom + csvContent;

        // Логируем экспорт
        await logAction(
            "Экспорт клиентов",
            "client",
            "bulk",
            {
                count: (data || []).length,
                columns: columns,
                filters: filters,
            }
        );

        // Формируем имя файла
        const date = new Date().toISOString().split("T")[0];
        const filename = `clients_export_${date}.csv`;

        return ok({ data: csvWithBom, filename });
    }, { 
        roles: ROLE_GROUPS.CAN_VIEW_ANALYTICS,
        errorPath: "getExportData" 
    });
}

/**
 * Получить доступные колонки для экспорта
 */
export async function getExportColumns(): Promise<ActionResult<ExportColumn[]>> {
    return withAuth(async () => {
        await logAction("Запрос колонок экспорта", "client", "config");
        return ok(EXPORT_COLUMNS as ExportColumn[]);
    }, { 
        roles: ROLE_GROUPS.CAN_VIEW_ANALYTICS,
        errorPath: "getExportColumns" 
    });
}

/**
 * Получить пресеты экспорта
 */
export async function getExportPresets(): Promise<ActionResult<ExportPreset[]>> {
    return withAuth(async () => {
        const presets: ExportPreset[] = [
            {
                id: "basic",
                name: "Базовый",
                description: "ФИО, контакты, тип клиента",
                columns: ["lastName", "firstName", "patronymic", "clientType", "company", "phone", "email", "city"],
            },
            {
                id: "analytics",
                name: "Аналитика",
                description: "Данные по заказам и активности",
                columns: ["lastName", "firstName", "company", "phone", "totalOrdersCount", "totalOrdersAmount", "averageCheck", "lastOrderAt", "loyaltyLevel", "rfmSegment"],
            },
            {
                id: "marketing",
                name: "Маркетинг",
                description: "Для рассылок и сегментации",
                columns: ["lastName", "firstName", "phone", "email", "telegram", "instagram", "acquisitionSource", "rfmSegment", "funnelStage"],
            },
            {
                id: "full",
                name: "Полный",
                description: "Все доступные поля",
                columns: EXPORT_COLUMNS.map(c => c.key),
            },
        ];

        await logAction("Запрос пресетов экспорта", "client", "config");
        return ok(presets);
    }, { 
        roles: ROLE_GROUPS.CAN_VIEW_ANALYTICS,
        errorPath: "getExportPresets" 
    });
}
