import { describe, it, expect, vi, beforeEach } from 'vitest'
import { forgotPasswordAction } from '../actions'

// ─── Поднимаем моки через vi.hoisted ────────────────────────────────────────
const { mockRateLimit, mockLogSecurityEvent, mockLogError, mockRequestPasswordReset } =
  vi.hoisted(() => {
    return {
      mockRateLimit: vi.fn(),
      mockLogSecurityEvent: vi.fn().mockResolvedValue(undefined),
      mockLogError: vi.fn().mockResolvedValue(undefined),
      mockRequestPasswordReset: vi.fn().mockResolvedValue({ data: {}, error: null }),
    }
  })

// ─── Моки зависимостей ───────────────────────────────────────────────────────
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: mockRateLimit,
}))

vi.mock('@/lib/security-logger', () => ({
  logSecurityEvent: mockLogSecurityEvent,
}))

vi.mock('@/lib/error-logger', () => ({
  logError: mockLogError,
}))

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      requestPasswordReset: mockRequestPasswordReset,
    },
  },
}))

// Мок next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: (name: string) => {
      const map: Record<string, string> = {
        'x-forwarded-for': '1.2.3.4',
        'user-agent': 'Mozilla/5.0 Test Browser',
      }
      return map[name] ?? null
    },
  }),
}))

// ─── Хелперы ─────────────────────────────────────────────────────────────────
const SUCCESS_RATE_LIMIT = { success: true, remaining: 2, resetIn: 0 }
const BLOCKED_RATE_LIMIT = { success: false, remaining: 0, resetIn: 3540 }

const TEST_EMAIL = 'user@merch-crm.ru'
const TEST_IP = '1.2.3.4'

// ════════════════════════════════════════════════════════════════════════════
describe('forgotPasswordAction()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequestPasswordReset.mockResolvedValue({ data: {}, error: null })
    process.env.BETTER_AUTH_URL = 'https://merch-crm.ru'
    // По умолчанию сбрасываем мок возвращаемого значения для каждого теста
    mockRateLimit.mockReset()
  })

  // ─── Успешный путь ────────────────────────────────────────────────────
  describe('успешный запрос', () => {
    beforeEach(() => {
      mockRateLimit.mockResolvedValue(SUCCESS_RATE_LIMIT)
    })

    it('должен вернуть success=true при прохождении обоих лимитов', async () => {
      const result = await forgotPasswordAction(TEST_EMAIL)
      expect(result.success).toBe(true)
    })

    it('должен вызвать rateLimit дважды (по IP и по email)', async () => {
      await forgotPasswordAction(TEST_EMAIL)
      expect(mockRateLimit).toHaveBeenCalledTimes(2)
    })

    it('должен проверить лимит по IP первым', async () => {
      await forgotPasswordAction(TEST_EMAIL)
      const firstCall = mockRateLimit.mock.calls[0]
      expect(firstCall[0]).toContain(`ip:${TEST_IP}`)
    })

    it('должен проверить лимит по email вторым', async () => {
      await forgotPasswordAction(TEST_EMAIL)
      const secondCall = mockRateLimit.mock.calls[1]
      expect(secondCall[0]).toContain(`email:${TEST_EMAIL.toLowerCase()}`)
    })

    it('должен использовать lowercase для email-ключа', async () => {
      await forgotPasswordAction('USER@MERCH-CRM.RU')
      const emailCall = mockRateLimit.mock.calls[1]
      expect(emailCall[0]).toContain('user@merch-crm.ru')
    })

    it('должен вызвать auth.api.requestPasswordReset с корректными данными', async () => {
      await forgotPasswordAction(TEST_EMAIL)
      expect(mockRequestPasswordReset).toHaveBeenCalledOnce()
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        body: {
          email: TEST_EMAIL,
          redirectTo: expect.stringContaining('/reset-password'),
        },
      })
    })

    it('должен логировать событие password_reset_requested при успехе', async () => {
      await forgotPasswordAction(TEST_EMAIL)
      expect(mockLogSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'password_reset_requested',
          severity: 'info',
        })
      )
    })

    it('НЕ должен раскрывать ошибку Better Auth (anti-enumeration)', async () => {
      mockRequestPasswordReset.mockRejectedValueOnce(new Error('User not found'))
      const result = await forgotPasswordAction(TEST_EMAIL)
      expect(result.success).toBe(true)
    })

    it('должен логировать ошибку при сбое Better Auth', async () => {
      const error = new Error('Internal error')
      mockRequestPasswordReset.mockRejectedValueOnce(error)
      await forgotPasswordAction(TEST_EMAIL)
      expect(mockLogError).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/forgot-password',
          method: 'forgotPasswordAction',
        })
      )
    })
  })

  // ─── Блокировка по IP ─────────────────────────────────────────────────
  describe('блокировка по IP', () => {
    beforeEach(() => {
      mockRateLimit
        .mockResolvedValueOnce(BLOCKED_RATE_LIMIT)
        .mockResolvedValue(SUCCESS_RATE_LIMIT)
    })

    it('должен вернуть success=false при превышении IP-лимита', async () => {
      const result = await forgotPasswordAction(TEST_EMAIL)
      expect(result.success).toBe(false)
    })

    it('должен вернуть error-сообщение при превышении IP-лимита', async () => {
      const result = await forgotPasswordAction(TEST_EMAIL)
      expect(result.error).toBeTruthy()
    })

    it('должен вернуть retryAfter при превышении IP-лимита', async () => {
      const result = await forgotPasswordAction(TEST_EMAIL)
      expect(result.retryAfter).toBe(3540)
    })

    it('НЕ должен вызывать requestPasswordReset при блокировке по IP', async () => {
      await forgotPasswordAction(TEST_EMAIL)
      expect(mockRequestPasswordReset).not.toHaveBeenCalled()
    })

    it('должен логировать событие rate_limit_exceeded при блокировке по IP', async () => {
      await forgotPasswordAction(TEST_EMAIL)
      expect(mockLogSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'rate_limit_exceeded',
          severity: 'warning',
          details: expect.objectContaining({
            action: 'password_reset',
            reason: 'ip_limit',
          }),
        })
      )
    })

    it('НЕ должен проверять email-лимит после блокировки по IP', async () => {
      await forgotPasswordAction(TEST_EMAIL)
      expect(mockRateLimit).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Блокировка по email ──────────────────────────────────────────────
  describe('блокировка по email', () => {
    beforeEach(() => {
      mockRateLimit
        .mockResolvedValueOnce(SUCCESS_RATE_LIMIT)
        .mockResolvedValueOnce(BLOCKED_RATE_LIMIT)
    })

    it('должен вернуть success=false при превышении email-лимита', async () => {
      const result = await forgotPasswordAction(TEST_EMAIL)
      expect(result.success).toBe(false)
    })

    it('должен вернуть retryAfter при превышении email-лимита', async () => {
      const result = await forgotPasswordAction(TEST_EMAIL)
      expect(result.retryAfter).toBe(3540)
    })

    it('НЕ должен вызывать requestPasswordReset при блокировке по email', async () => {
      await forgotPasswordAction(TEST_EMAIL)
      expect(mockRequestPasswordReset).not.toHaveBeenCalled()
    })

    it('должен логировать rate_limit_exceeded с reason=email_limit', async () => {
      await forgotPasswordAction(TEST_EMAIL)
      expect(mockLogSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'rate_limit_exceeded',
          details: expect.objectContaining({
            reason: 'email_limit',
          }),
        })
      )
    })

    it('НЕ должен раскрывать что лимит именно по email (anti-enumeration)', async () => {
      const result1 = await forgotPasswordAction(TEST_EMAIL)
      
      mockRateLimit.mockReset()
      mockRateLimit
        .mockResolvedValueOnce(SUCCESS_RATE_LIMIT)
        .mockResolvedValueOnce(BLOCKED_RATE_LIMIT)
      
      const result2 = await forgotPasswordAction('other@example.com')
      expect(result1.error).toBe(result2.error)
    })
  })

  // ─── Параметры rateLimit ──────────────────────────────────────────────
  describe('параметры вызова rateLimit', () => {
    beforeEach(() => {
      mockRateLimit.mockResolvedValue(SUCCESS_RATE_LIMIT)
    })

    it('должен использовать лимит из RATE_LIMITS.passwordReset', async () => {
      await forgotPasswordAction(TEST_EMAIL)
      for (const call of mockRateLimit.mock.calls) {
        expect(call[1]).toBe(3)
        expect(call[2]).toBe(3600)
      }
    })

    it('IP-ключ должен содержать IP адрес клиента', async () => {
      await forgotPasswordAction(TEST_EMAIL)
      const ipCall = mockRateLimit.mock.calls[0]
      expect(ipCall[0]).toBe(`password-reset:ip:${TEST_IP}`)
    })

    it('email-ключ должен содержать нормализованный email', async () => {
      await forgotPasswordAction('Test@Example.COM')
      const emailCall = mockRateLimit.mock.calls[1]
      expect(emailCall[0]).toBe('password-reset:email:test@example.com')
    })
  })

  // ─── Обработка отсутствующих заголовков ──────────────────────────────
  describe('обработка IP-заголовков', () => {
    it('должен использовать "unknown" если заголовки отсутствуют', async () => {
      mockRateLimit.mockResolvedValue(SUCCESS_RATE_LIMIT)
      const { headers } = await import('next/headers')
      vi.mocked(headers).mockResolvedValueOnce({
        get: () => null,
      } as unknown as Awaited<ReturnType<typeof headers>>)

      await forgotPasswordAction(TEST_EMAIL)
      const ipCall = mockRateLimit.mock.calls[0]
      expect(ipCall[0]).toContain('unknown')
    })
  })
})
