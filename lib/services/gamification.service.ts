import { db } from "@/lib/db";
import { achievements, userAchievements } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export class GamificationService {
    /**
     * Выдает достижение пользователю по его коду.
     * Если достижение уже есть, ничего не делает.
     */
    static async awardAchievement(userId: string, achievementCode: string, details?: Record<string, unknown>) {
        try {
            // 1. Находим достижение по коду
            const achievement = await db.query.achievements.findFirst({
                where: and(
                    eq(achievements.code, achievementCode),
                    eq(achievements.isActive, true)
                )
            });

            if (!achievement) {
                console.warn(`Achievement with code ${achievementCode} not found or inactive.`);
                return null;
            }

            // 2. Проверяем, есть ли оно уже у пользователя
            const existing = await db.query.userAchievements.findFirst({
                where: and(
                    eq(userAchievements.userId, userId),
                    eq(userAchievements.achievementId, achievement.id)
                )
            });

            if (existing) {
                return null; // Уже получено
            }

            // 3. Выдаем достижение
            const [newUserAchievement] = await db.insert(userAchievements).values({
                userId,
                achievementId: achievement.id,
                details: details || { awardedAt: new Date().toISOString() }
            }).returning();

            console.log(`User ${userId} awarded achievement: ${achievement.name}`);
            
            // Здесь можно добавить триггер уведомления (Toast / Push)
            
            return newUserAchievement;
        } catch (error: unknown) {
            console.error("Error awarding achievement:", error);
            return null;
        }
    }

    /**
     * Проверяет прогресс и выдает "скрытые" или "накопительные" достижения.
     * Вызывается после завершения задачи.
     */
    static async checkTaskCompletionAchievements(userId: string) {
        // Пример логики: Первая задача
        await this.awardAchievement(userId, 'first_task_completed');
        
        // Здесь будет более сложная логика в будущем (проверка кол-ва задач и т.д.)
    }
}
