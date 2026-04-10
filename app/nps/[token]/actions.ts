"use server";

import { db } from "@/lib/db";
import { customerFeedback } from "@/lib/schema/clients/feedback";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const tokenSchema = z.string().uuid("Неверный формат токена");

const submitFeedbackSchema = z.object({
  token: z.string().uuid("Неверный формат токена"),
  score: z.number().min(1, "Минимальная оценка 1").max(10, "Максимальная оценка 10"),
  comment: z.string().max(2000, "Комментарий слишком длинный").optional()
});


/**
 * Валидирует публичный доступ по токену.
 * Заменяет стандартный withAuth для публичных страниц NPS.
 */
async function validatePublicAccess(token: string) {
  tokenSchema.parse(token);
  const feedback = await db.query.customerFeedback.findFirst({
    where: eq(customerFeedback.token, token),
    with: {
      client: {
        columns: {
          name: true,
        }
      },
      order: {
        columns: {
          orderNumber: true,
        }
      }
    }
  });

  if (!feedback) {
    throw new Error("Отзыв не найден");
  }

  return feedback;
}

export async function getFeedbackByToken(token: string) {
  try {
    // getSession() не требуется для публичного доступа по токену
    const feedback = await validatePublicAccess(token);
    
    if (feedback.score > 0) {
      return { success: false, error: "Вы уже оставили отзыв. Спасибо!", alreadySubmitted: true };
    }

    // Возвращаем только необходимые данные (санитизация)
    return { 
      success: true, 
      data: {
        id: feedback.id,
        token: feedback.token,
        clientName: feedback.client?.name || "Клиент",
        orderNumber: feedback.order?.orderNumber || "Заказ",
        createdAt: feedback.createdAt
      } 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: error instanceof Error ? error.message : "Произошла ошибка при загрузке" };
  }
}

export async function submitFeedback(token: string, score: number, comment?: string) {
  try {
    const validated = submitFeedbackSchema.parse({ token, score, comment });
    
    // Проверка через централизованный метод
    // getSession() не требуется для публичного доступа по токену
    const feedback = await validatePublicAccess(validated.token);
    
    if (feedback.score > 0) return { success: false, error: "Отзыв уже был отправлен" };

    await db.update(customerFeedback)
      .set({ 
        score: validated.score, 
        comment: validated.comment, 
        updatedAt: new Date() 
      })
      .where(eq(customerFeedback.token, validated.token));

    revalidatePath("/dashboard/clients"); 
    
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Error submitting feedback:", error);
    return { success: false, error: "Не удалось отправить отзыв" };
  }
}
