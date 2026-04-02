import { db } from "@/lib/db";
import { customerFeedback } from "@/lib/schema/clients/feedback";
import { orders } from "@/lib/schema/orders";
import { eq, and, isNull, lt } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

export class NPSService {
    /**
     * Планирует или отправляет запрос NPS для заказа.
     * Обычно вызывается через 3 дня после доставки.
     */
    static async createNPSRequest(orderId: string) {
        try {
            // 1. Получаем данные заказа и клиента
            const order = await db.query.orders.findFirst({
                where: eq(orders.id, orderId),
                with: {
                    client: true
                }
            });

            if (!order || !order.clientId) {
                console.error(`Order ${orderId} not found or has no client.`);
                return null;
            }

            // 2. Проверяем, не отправляли ли уже отзыв по этому заказу
            const existing = await db.query.customerFeedback.findFirst({
                where: eq(customerFeedback.orderId, orderId)
            });

            if (existing) {
                return existing;
            }

            // 3. Создаем запись фидбека (ожидающую заполнения)
            const [feedback] = await db.insert(customerFeedback).values({
                clientId: order.clientId,
                orderId: order.id,
                score: 0, // 0 означает, что еще не заполнено
                token: crypto.randomUUID(),
            }).returning();

            // 4. Логика отправки (Email)
            if (order.client?.email) {
                await this.sendNPSEmail(order.client.email, feedback.token, order.orderNumber || "без номера");
                console.log(`NPS Email sent to ${order.client.email} for order ${order.orderNumber}`);
            }

            return feedback;
        } catch (error) {
            console.error("Error creating NPS request:", error);
            return null;
        }
    }

    /**
     * Отправляет письмо с ссылкой на NPS опрос.
     */
    static async sendNPSEmail(email: string, token: string, orderNumber: string) {
        const surveyUrl = `${env.NEXT_PUBLIC_APP_URL}/feedback/nps?token=${token}`;
        
        try {
            await sendEmail({
                to: email,
                subject: `Как вам ваш заказ #${orderNumber}?`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #1e293b;">Нам важно ваше мнение!</h2>
                        <p>Здравствуйте!</p>
                        <p>Недавно вы получили ваш заказ <strong>#${orderNumber}</strong>. Мы очень надеемся, что он вам понравился!</p>
                        <p>Пожалуйста, уделите 30 секунд, чтобы оценить нашу работу. Это поможет нам стать лучше.</p>
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${surveyUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                Оценить заказ
                            </a>
                        </div>
                        <p style="color: #64748b; font-size: 13px;">Если кнопка не работает, скопируйте эту ссылку: <br/> ${surveyUrl}</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="color: #94a3b8; font-size: 12px;">С уважением, команда MerchCRM.</p>
                    </div>
                `
            });
        } catch (error) {
            console.error(`Failed to send NPS email to ${email}:`, error);
        }
    }

    /**
     * Ищет заказы, доставленные > 3 дней назад, для которых еще нет NPS запроса.
     * Может запускаться по крону.
     */
    static async processPendingNPS() {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        try {
            // Находим заказы: статус доставки 'delivered', дата доставки < 3 дней назад, нет записи в feedback
            const pendingOrders = await db.select({ id: orders.id })
                .from(orders)
                .leftJoin(customerFeedback, eq(orders.id, customerFeedback.orderId))
                .where(and(
                    eq(orders.deliveryStatus, 'delivered'),
                    lt(orders.actualDeliveryDate, threeDaysAgo),
                    isNull(customerFeedback.id)
                ))
                .limit(100);

            console.log(`Found ${pendingOrders.length} pending NPS requests.`);

            for (const order of pendingOrders) {
                await this.createNPSRequest(order.id);
            }
        } catch (error) {
            console.error("Error processing pending NPS:", error);
        }
    }
}
