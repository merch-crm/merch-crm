import { describe, it, expect } from 'vitest'
import { RATE_LIMITS, type RateLimitType } from '@/lib/rate-limit-config'

// ════════════════════════════════════════════════════════════════════════════
describe('RATE_LIMITS', () => {
  // ─── Наличие всех обязательных ключей ─────────────────────────────────
  describe('структура конфига', () => {
    const REQUIRED_KEYS: RateLimitType[] = [
      'login',
      'register',
      'passwordReset',
      'api',
      'upload',
      'search',
    ]

    it.each(REQUIRED_KEYS)(
      'должен содержать конфиг для "%s"',
      (key) => {
        expect(RATE_LIMITS).toHaveProperty(key)
      }
    )

    it.each(REQUIRED_KEYS)(
      'конфиг "%s" должен содержать limit, windowSec, message',
      (key) => {
        const config = RATE_LIMITS[key]
        expect(config).toHaveProperty('limit')
        expect(config).toHaveProperty('windowSec')
        expect(config).toHaveProperty('message')
      }
    )

    it.each(REQUIRED_KEYS)(
      'limit для "%s" должен быть положительным числом',
      (key) => {
        expect(RATE_LIMITS[key].limit).toBeGreaterThan(0)
      }
    )

    it.each(REQUIRED_KEYS)(
      'windowSec для "%s" должен быть положительным числом',
      (key) => {
        expect(RATE_LIMITS[key].windowSec).toBeGreaterThan(0)
      }
    )

    it.each(REQUIRED_KEYS)(
      'message для "%s" не должен быть пустой строкой',
      (key) => {
        expect(RATE_LIMITS[key].message).toBeTruthy()
        expect(RATE_LIMITS[key].message.length).toBeGreaterThan(0)
      }
    )
  })

  // ─── Конкретные значения ───────────────────────────────────────────────
  describe('конкретные значения лимитов', () => {
    describe('login', () => {
      it('лимит = 5 попыток', () => {
        expect(RATE_LIMITS.login.limit).toBe(5)
      })

      it('окно = 15 минут (900 секунд)', () => {
        expect(RATE_LIMITS.login.windowSec).toBe(15 * 60)
        expect(RATE_LIMITS.login.windowSec).toBe(900)
      })

      it('сообщение упоминает ожидание', () => {
        expect(RATE_LIMITS.login.message).toMatch(/подождите/i)
      })
    })

    describe('register', () => {
      it('лимит = 3 попытки', () => {
        expect(RATE_LIMITS.register.limit).toBe(3)
      })

      it('окно = 1 час (3600 секунд)', () => {
        expect(RATE_LIMITS.register.windowSec).toBe(60 * 60)
        expect(RATE_LIMITS.register.windowSec).toBe(3600)
      })
    })

    describe('passwordReset', () => {
      it('лимит = 3 запроса', () => {
        expect(RATE_LIMITS.passwordReset.limit).toBe(3)
      })

      it('окно = 1 час (3600 секунд)', () => {
        expect(RATE_LIMITS.passwordReset.windowSec).toBe(60 * 60)
        expect(RATE_LIMITS.passwordReset.windowSec).toBe(3600)
      })

      it('лимит passwordReset строже или равен лимиту login', () => {
        expect(RATE_LIMITS.passwordReset.limit).toBeLessThanOrEqual(
          RATE_LIMITS.login.limit
        )
      })

      it('окно passwordReset шире окна login (более строгое)', () => {
        expect(RATE_LIMITS.passwordReset.windowSec).toBeGreaterThan(
          RATE_LIMITS.login.windowSec
        )
      })
    })

    describe('api', () => {
      it('лимит = 100 запросов', () => {
        expect(RATE_LIMITS.api.limit).toBe(100)
      })

      it('окно = 1 минута (60 секунд)', () => {
        expect(RATE_LIMITS.api.windowSec).toBe(60)
      })

      it('лимит API больше лимита auth-эндпоинтов', () => {
        expect(RATE_LIMITS.api.limit).toBeGreaterThan(RATE_LIMITS.login.limit)
        expect(RATE_LIMITS.api.limit).toBeGreaterThan(RATE_LIMITS.passwordReset.limit)
      })
    })

    describe('upload', () => {
      it('лимит = 20 запросов', () => {
        expect(RATE_LIMITS.upload.limit).toBe(20)
      })

      it('окно = 1 минута', () => {
        expect(RATE_LIMITS.upload.windowSec).toBe(60)
      })
    })

    describe('search', () => {
      it('лимит = 30 запросов', () => {
        expect(RATE_LIMITS.search.limit).toBe(30)
      })

      it('окно = 1 минута', () => {
        expect(RATE_LIMITS.search.windowSec).toBe(60)
      })
    })
  })

  // ─── Иерархия строгости ────────────────────────────────────────────────
  describe('иерархия безопасности', () => {
    it('auth-лимиты строже API-лимита (по limit)', () => {
      expect(RATE_LIMITS.login.limit).toBeLessThan(RATE_LIMITS.api.limit)
      expect(RATE_LIMITS.passwordReset.limit).toBeLessThan(RATE_LIMITS.api.limit)
    })

    it('passwordReset имеет наибольшее окно среди auth-лимитов', () => {
      expect(RATE_LIMITS.passwordReset.windowSec).toBeGreaterThanOrEqual(
        RATE_LIMITS.login.windowSec
      )
      expect(RATE_LIMITS.passwordReset.windowSec).toBeGreaterThanOrEqual(
        RATE_LIMITS.register.windowSec
      )
    })

    it('все windowSec — целые числа', () => {
      for (const key of Object.keys(RATE_LIMITS) as RateLimitType[]) {
        expect(Number.isInteger(RATE_LIMITS[key].windowSec)).toBe(true)
      }
    })

    it('все limit — целые числа', () => {
      for (const key of Object.keys(RATE_LIMITS) as RateLimitType[]) {
        expect(Number.isInteger(RATE_LIMITS[key].limit)).toBe(true)
      }
    })
  })
})
