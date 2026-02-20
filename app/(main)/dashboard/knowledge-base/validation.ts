import { z } from "zod";

export const WikiFolderSchema = z.object({
    name: z.string().min(1, "Название папки обязательно").max(100, "Название слишком длинное"),
    parentId: z.string().uuid().nullable().optional(),
});

export const WikiPageSchema = z.object({
    title: z.string().min(1, "Заголовок обязателен").max(200, "Заголовок слишком длинный"),
    content: z.string().optional(),
    folderId: z.string().uuid().nullable().optional(),
});

export const WikiPageUpdateSchema = WikiPageSchema.partial();
