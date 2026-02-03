import { db } from "@/lib/db";
import { promocodes } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

import { type InferSelectModel } from "drizzle-orm";

export interface ValidationResult {
    isValid: boolean;
    discount: number;
    error?: string;
    promo?: InferSelectModel<typeof promocodes> | null;
    message?: string;
}

/**
 * Валидация промокода и расчет скидки
 */
export async function validatePromocode(
    code: string,
    totalAmount: number,
    cartItems: Array<{ inventoryId?: string; price: number; quantity: number; category?: string }> = []
): Promise<ValidationResult> {
    if (!code) return { isValid: false, discount: 0, error: "Код не введен" };

    try {
        const promo = await db.query.promocodes.findFirst({
            where: eq(sql`UPPER(${promocodes.code})`, code.toUpperCase()),
        });

        if (!promo) {
            return { isValid: false, discount: 0, error: "Промокод не найден" };
        }

        if (!promo.isActive) {
            return { isValid: false, discount: 0, error: "Промокод деактивирован" };
        }

        // Проверка даты
        const now = new Date();
        if (promo.expiresAt && new Date(promo.expiresAt) < now) {
            return { isValid: false, discount: 0, error: "Срок действия промокода истек" };
        }
        if (promo.startDate && new Date(promo.startDate) > now) {
            return { isValid: false, discount: 0, error: "Промокод еще не активирован" };
        }

        // Проверка лимита использований
        if (promo.usageLimit !== null && (promo.usageCount || 0) >= promo.usageLimit) {
            return { isValid: false, discount: 0, error: "Лимит использований промокода исчерпан" };
        }

        // Проверка минимальной суммы заказа
        const minAmount = Number(promo.minOrderAmount || 0);
        if (totalAmount < minAmount) {
            return {
                isValid: false,
                discount: 0,
                error: `Минимальная сумма заказа для этого промокода: ${minAmount} ₽`
            };
        }

        // --- Логика ограничений (Исключения товаров/категорий) ---
        let applicableAmount = totalAmount;
        const rawConstraints = promo.constraints as Record<string, string[] | null | undefined> | null;
        const includedProducts = rawConstraints?.includedProducts ?? [];
        const excludedProducts = rawConstraints?.excludedProducts ?? [];
        const excludedCategories = rawConstraints?.excludedCategories ?? [];

        if (excludedProducts.length > 0 || excludedCategories.length > 0 || includedProducts.length > 0) {
            const validItems = cartItems.filter(item => {
                // Если есть список разрешенных товаров и товара в нем нет - скидка не действует
                if (includedProducts.length > 0 && item.inventoryId && !includedProducts.includes(item.inventoryId)) {
                    return false;
                }
                // Если товар в списке исключений
                if (item.inventoryId && excludedProducts.includes(item.inventoryId)) {
                    return false;
                }
                // Если категория в списке исключений
                if (item.category && excludedCategories.includes(item.category)) {
                    return false;
                }
                return true;
            });

            applicableAmount = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            if (applicableAmount === 0 && cartItems.length > 0) {
                return {
                    isValid: false,
                    discount: 0,
                    error: "В корзине нет товаров, на которые распространяется этот промокод"
                };
            }
        }

        // Расчет скидки
        let discount = 0;
        let message = "";

        switch (promo.discountType) {
            case "percentage":
                discount = (applicableAmount * Number(promo.value)) / 100;
                // Ограничение максимальной скидки если есть
                const maxDiscount = Number(promo.maxDiscountAmount || 0);
                if (maxDiscount > 0 && discount > maxDiscount) {
                    discount = maxDiscount;
                    message = `Скидка ограничена максимумом в ${maxDiscount} ₽`;
                }
                break;
            case "fixed":
                discount = Math.min(Number(promo.value), applicableAmount);
                break;
            case "free_shipping":
                // В данной логике возвращаем 0, но помечаем тип. 
                // Фронтенд или процесс заказа должен обнулить стоимость доставки.
                discount = 0;
                message = "Бесплатная доставка активирована";
                break;
            case "gift":
                // Возвращаем 0, логика добавления подарка должна быть на уровне корзины
                discount = 0;
                message = "Подарок будет добавлен к заказу";
                break;
        }

        // Скидка не может быть больше суммы заказа
        if (discount > totalAmount) {
            discount = totalAmount;
        }

        return {
            isValid: true,
            discount: Math.round(discount),
            promo,
            message
        };
    } catch (error) {
        console.error("Promocode validation error:", error);
        return { isValid: false, discount: 0, error: "Ошибка при проверке промокода" };
    }
}
