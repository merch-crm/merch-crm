"use server";

import { db } from "@/lib/db";
import { systemFonts } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { z } from "zod";

const AddFontSchema = z.object({
    name: z.string().min(1),
    family: z.string().min(1),
    category: z.string().optional(),
    files: z.object({
        regular: z.instanceof(File).optional(),
        bold: z.instanceof(File).optional(),
        italic: z.instanceof(File).optional(),
        boldItalic: z.instanceof(File).optional(),
    }),
});

type ActionResult<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
};

type SystemFont = typeof systemFonts.$inferSelect;

// Получить системные шрифты
export async function getSystemFonts(): Promise<ActionResult<SystemFont[]>> {
    try {
        const result = await db.query.systemFonts.findMany({
            where: eq(systemFonts.isActive, true),
            orderBy: [asc(systemFonts.sortOrder), asc(systemFonts.name)],
            limit: 500,
        });

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching fonts:", error);
        return { success: false, error: "Не удалось загрузить шрифты" };
    }
}

// Добавить кастомный шрифт
export async function addCustomFont(rawData: z.infer<typeof AddFontSchema>): Promise<ActionResult<SystemFont>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const validated = AddFontSchema.safeParse(rawData);
        if (!validated.success) return { success: false, error: "Неверные данные: " + validated.error.message };
        const data = validated.data;

        // Проверяем уникальность family
        const existing = await db.query.systemFonts.findFirst({
            where: eq(systemFonts.family, data.family),
        });

        if (existing) {
            return { success: false, error: "Шрифт с таким названием уже существует" };
        }

        // Сохраняем файлы шрифтов
        const fontDir = join(process.cwd(), "public", "fonts", data.family.toLowerCase().replace(/\s+/g, "-"));
        await mkdir(fontDir, { recursive: true });

        const paths: Record<string, string | null> = {
            regularPath: null,
            boldPath: null,
            italicPath: null,
            boldItalicPath: null,
        };

        for (const [key, file] of Object.entries(data.files)) {
            if (file) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const filename = `${key}.${file.name.split(".").pop()}`;
                await writeFile(join(fontDir, filename), buffer);
                paths[`${key}Path`] = `/fonts/${data.family.toLowerCase().replace(/\s+/g, "-")}/${filename}`;
            }
        }

        const results = await db
            .insert(systemFonts)
            .values({
                name: data.name,
                family: data.family,
                category: data.category || "sans-serif",
                ...paths,
            })
            .returning();

        const result = results[0] as SystemFont;

        return { success: true, data: result };
    } catch (error) {
        console.error("Error adding font:", error);
        return { success: false, error: "Не удалось добавить шрифт" };
    }
}
