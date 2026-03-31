
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./schema";
import { admin, twoFactor } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

/** 
 * Конфигурация аутентификации Better-Auth 
 * Поддерживает сессии в БД, 2FA и управление ролями
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verificationTokens,
      twoFactor: schema.twoFactors,
      role: schema.roles,
    },
  }),

  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => {
        const { hashPassword } = await import("./password");
        return await hashPassword(password);
      },
      verify: async ({ hash, password }: { hash: string; password: string }) => {
        const { comparePassword } = await import("./password");
        return await comparePassword(password, hash);
      },
    },
  },

  // Секретный ключ для подписи сессий (берется из .env)
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,

  // Социальные провайдеры и другие методы
  socialProviders: {},

  // Настройки сессии
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 дней
    updateAge: 60 * 60 * 24, // 1 день
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 минут
    },
  },

  // Название приложения
  appName: "MerchCRM",

  // Плагины расширения функционала
  plugins: [
    nextCookies(),
    
    twoFactor({
      issuer: "MerchCRM",
    }),

    admin({
      impersonationSessionDuration: 60 * 60,
    }),
  ],

  // ── Trusted origins ───────────────────────────────
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],

  // ── Настройки куки для безопасности ───────────────
  cookies: {
    sessionToken: {
      name: "merch_crm_session",
      attributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // ── Обработка событий ───────────────────────────────
  onSessionCreate: async (_session: unknown) => {
    // Можно добавить логирование входа
  },
});
