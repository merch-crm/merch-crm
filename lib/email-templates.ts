/** Шаблон письма для сброса пароля */
export function resetPasswordEmailTemplate(resetUrl: string): string {
    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Сброс пароля — MerchCRM</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:16px;padding:40px;
                      border:1px solid #e4e4e7;box-shadow:0 2px 8px rgba(0,0,0,.06);">

          <!-- Шапка -->
          <tr>
            <td style="border-bottom:1px solid #f0f0f0;padding-bottom:24px;text-align:center;">
              <span style="font-size:28px;">🛍️</span>
              <h1 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#18181b;">
                MerchCRM
              </h1>
            </td>
          </tr>

          <!-- Основной текст -->
          <tr>
            <td style="padding:32px 0 8px;">
              <h2 style="margin:0 0 12px;font-size:18px;color:#18181b;font-weight:600;">
                Сброс пароля
              </h2>
              <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.65;">
                Мы получили запрос на сброс пароля для вашего аккаунта в MerchCRM.
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.65;">
                Нажмите кнопку ниже, чтобы задать новый пароль.
                Ссылка действительна <strong>1 час</strong>.
              </p>
            </td>
          </tr>

          <!-- Кнопка -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="${resetUrl}"
                 style="display:inline-block;background:#18181b;color:#fff;
                        text-decoration:none;padding:14px 36px;border-radius:10px;
                        font-size:15px;font-weight:600;letter-spacing:0.02em;">
                Сбросить пароль →
              </a>
            </td>
          </tr>

          <!-- Запасная ссылка -->
          <tr>
            <td style="background:#fafafa;border:1px solid #e4e4e7;
                        border-radius:8px;padding:16px 20px;">
              <p style="margin:0 0 6px;font-size:12px;color:#71717a;font-weight:500;">
                Если кнопка не работает — скопируйте ссылку:
              </p>
              <p style="margin:0;font-size:12px;word-break:break-all;color:#3b82f6;">
                ${resetUrl}
              </p>
            </td>
          </tr>

          <!-- Предупреждение -->
          <tr>
            <td style="padding-top:20px;">
              <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.5;">
                Если вы не запрашивали сброс пароля — просто проигнорируйте это письмо.
                Ваш пароль останется без изменений.
              </p>
            </td>
          </tr>

          <!-- Футер -->
          <tr>
            <td style="padding-top:28px;border-top:1px solid #f0f0f0;margin-top:24px;
                        text-align:center;">
              <p style="margin:0;font-size:12px;color:#d4d4d8;">
                MerchCRM · Это автоматическое письмо, не отвечайте на него
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Шаблон письма для подтверждения email */
export function verifyEmailTemplate(verifyUrl: string): string {
    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Подтверждение email — MerchCRM</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:16px;padding:40px;
                      border:1px solid #e4e4e7;">
          <tr>
            <td style="text-align:center;padding-bottom:24px;">
              <span style="font-size:28px;">✉️</span>
              <h1 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#18181b;">
                MerchCRM
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px;">
              <h2 style="margin:0 0 12px;font-size:18px;color:#18181b;">
                Подтвердите email
              </h2>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.65;">
                Нажмите кнопку ниже, чтобы подтвердить ваш email-адрес и активировать аккаунт.
              </p>
              <div style="text-align:center;">
                <a href="${verifyUrl}"
                   style="display:inline-block;background:#18181b;color:#fff;
                          text-decoration:none;padding:14px 36px;border-radius:10px;
                          font-size:15px;font-weight:600;">
                  Подтвердить email →
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-top:20px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#d4d4d8;">
                MerchCRM · Автоматическое письмо
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
/** Шаблон письма для смены статуса заказа */
export function orderStatusEmailTemplate(orderNumber: string, statusLabel: string, clientName: string, statusColor: string = "#5d00ff"): string {
    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Статус заказа #${orderNumber} — MerchCRM</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:24px;padding:48px;
                      border:1px solid #e2e8f0;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
          
          <!-- Logo Section -->
          <tr>
            <td style="text-align:left;padding-bottom:12px;">
              <span style="font-size:32px;line-height:1;">⚡</span>
              <h1 style="margin:16px 0 4px;font-size:24px;font-weight:800;color:#0f172a;letter-spacing:-0.025em;">
                MerchCRM
              </h1>
              <p style="margin:0;font-size:14px;color:#64748b;font-weight:500;">Мануфактура мерча</p>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding:40px 0 32px;">
              <h2 style="margin:0 0 16px;font-size:20px;color:#1e293b;font-weight:700;">
                Здравствуйте, ${clientName}!
              </h2>
              <p style="margin:0 0 24px;font-size:16px;color:#475569;line-height:1.6;">
                Статус вашего заказа <strong>#${orderNumber}</strong> был обновлен. Мы работаем над тем, чтобы вы получили результат как можно скорее.
              </p>
              
              <!-- Status Badge -->
              <div style="background:#f1f5f9;border-radius:16px;padding:24px;border:1px solid #e2e8f0;text-align:center;">
                <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;font-weight:600;">
                  Текущий статус
                </p>
                <span style="display:inline-block;padding:10px 24px;background:${statusColor};color:#ffffff;
                             border-radius:99px;font-size:18px;font-weight:700;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
                  ${statusLabel}
                </span>
              </div>
            </td>
          </tr>

          <!-- CTA / Link -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <p style="margin:0 0 20px;font-size:14px;color:#94a3b8;">
                Вы можете отслеживать детали в личном кабинете.
              </p>
              <a href="${process.env.NEXTAUTH_URL}/dashboard/orders"
                 style="display:inline-block;background:#0f172a;color:#ffffff;
                        text-decoration:none;padding:16px 32px;border-radius:14px;
                        font-size:15px;font-weight:600;letter-spacing:0.01em;">
                Посмотреть заказ
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                Это системное уведомление MerchCRM.<br/>
                Пожалуйста, не отвечайте на это письмо.
              </p>
              <div style="margin-top:16px;font-size:12px;color:#cbd5e1;">
                &copy; ${new Date().getFullYear()} MerchCRM
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
