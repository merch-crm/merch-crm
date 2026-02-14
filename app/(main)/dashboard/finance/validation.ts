import { z } from "zod";

export const CreateExpenseSchema = z.object({
    category: z.string().min(2, "Категория должна содержать минимум 2 символа"),
    amount: z.preprocess((val) => Number(val), z.number().positive("Сумма должна быть положительной")),
    description: z.string().optional().or(z.literal("")),
    date: z.preprocess((val) => {
        if (!val) return new Date();
        const d = new Date(val as string);
        return isNaN(d.getTime()) ? new Date() : d;
    }, z.date()).optional(),
});
