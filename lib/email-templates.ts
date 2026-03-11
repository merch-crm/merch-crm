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
