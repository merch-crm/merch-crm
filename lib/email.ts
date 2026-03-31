import { env } from "@/lib/env";
import { Resend } from "resend";

// Инициализируем клиент лениво, чтобы не падать при импорте если нет ключа (например, в CI)
let resendInstance: Resend | null = null;
function getResend() {
    if (!resendInstance) {
        resendInstance = new Resend(env.RESEND_API_KEY || "re_123");
    }
    return resendInstance;
}

export interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string; // plain-text fallback
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<void> {
    const from = env.FROM_EMAIL;

    const resend = getResend();
    const { error } = await resend.emails.send({
        from: `MerchCRM <${from}>`,
        to,
        subject,
        html,
        ...(text ? { text } : {}),
    });

    if (error) {
        // Логируем ошибку и пробрасываем исключение
        console.error("[Email] Ошибка отправки письма:", {
            to,
            subject,
            error,
        });
        throw new Error(`Ошибка отправки email: ${error.message}`);
    }
}
