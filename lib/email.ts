import { Resend } from "resend";

// Инициализируем клиент один раз (singleton)
const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string; // plain-text fallback
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<void> {
    const from = process.env.FROM_EMAIL ?? "noreply@merch-crm.ru";

    const { error } = await resend.emails.send({
        from: `MerchCRM <${from}>`,
        to,
        subject,
        html,
        ...(text ? { text } : {}),
    });

    if (error) {
        // Логируем ошибку, но не бросаем исключение чтобы не блокировать UX
        console.error("[Email] Ошибка отправки письма:", {
            to,
            subject,
            error,
        });
        throw new Error(`Ошибка отправки email: ${error.message}`);
    }
}
