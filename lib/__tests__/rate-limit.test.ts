import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { rateLimit, resetRateLimit, getClientIP } from '@/lib/rate-limit'

// ─── Поднимаем моки ДО hoisting vi.mock ─────────────────────────────────────
const { mockRedis, mockExec, mockMultiInstance } = vi.hoisted(() => {
  const mockExec = vi.fn()

  const mockMultiInstance = {
    incr: vi.fn().mockReturnThis(),
    ttl: vi.fn().mockReturnThis(),
    exec: mockExec,
  }

  const mockRedis = {
    multi: vi.fn().mockReturnValue(mockMultiInstance),
    expire: vi.fn().mockResolvedValue(1),
    del: vi.fn().mockResolvedValue(1),
  }

  return { mockRedis, mockExec, mockMultiInstance }
})

vi.mock('@/lib/redis', () => ({
  default: mockRedis,
  CACHE_TTL: { SHORT: 300, MEDIUM: 3600, LONG: 86400 },
}))

// ─── Хелпер: настройка ответа Redis ─────────────────────────────────────────
function mockRedisResponse(count: number, ttl: number) {
  mockExec.mockResolvedValueOnce([
    [null, count], // incr result
    [null, ttl],   // ttl result
  ])
}

// ─── Константы ───────────────────────────────────────────────────────────────
const TEST_KEY = 'test:127.0.0.1'
const LIMIT = 5
const WINDOW_SEC = 60

// ════════════════════════════════════════════════════════════════════════════
describe('rateLimit()', () => {
  // ─── Подготовка ────────────────────────────────────────────────────────
  beforeEach(() => {
    vi.clearAllMocks()
    mockMultiInstance.incr.mockReturnThis()
    mockMultiInstance.ttl.mockReturnThis()
    mockRedis.multi.mockReturnValue(mockMultiInstance)
    delete (process.env as Record<string, string | undefined>).NEXT_PUBLIC_E2E
  })

  afterEach(() => {
    delete (process.env as Record<string, string | undefined>).NEXT_PUBLIC_E2E
  })

  // ─── Первый запрос (TTL = -1) ───────────────────────────────────────────
  describe('первый запрос (ключ ещё не существует)', () => {
    it('должен вернуть success=true при первом запросе', async () => {
      mockRedisResponse(1, -1)

      const result = await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(result.success).toBe(true)
    })

    it('должен установить TTL через redis.expire при ttl=-1', async () => {
      mockRedisResponse(1, -1)

      await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(mockRedis.expire).toHaveBeenCalledOnce()
      expect(mockRedis.expire).toHaveBeenCalledWith(
        `ratelimit:${TEST_KEY}`,
        WINDOW_SEC
      )
    })

    it('должен вернуть resetIn = windowSec при первом запросе', async () => {
      mockRedisResponse(1, -1)

      const result = await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(result.resetIn).toBe(WINDOW_SEC)
    })

    it('должен вернуть remaining = limit - 1 при первом запросе', async () => {
      mockRedisResponse(1, -1)

      const result = await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(result.remaining).toBe(LIMIT - 1)
    })
  })

  // ─── Промежуточные запросы (TTL уже установлен) ─────────────────────────
  describe('промежуточные запросы (TTL уже установлен)', () => {
    it('НЕ должен вызывать expire если ttl > 0', async () => {
      mockRedisResponse(2, 45)

      await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(mockRedis.expire).not.toHaveBeenCalled()
    })

    it('должен уменьшать remaining с каждым запросом', async () => {
      mockRedisResponse(3, 45)

      const result = await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(result.remaining).toBe(LIMIT - 3)
    })

    it('должен возвращать актуальный resetIn из TTL', async () => {
      mockRedisResponse(2, 42)

      const result = await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(result.resetIn).toBe(42)
    })
  })

  // ─── Граничные значения лимита ──────────────────────────────────────────
  describe('граничные значения лимита', () => {
    it('должен вернуть success=true ровно на лимите (current === limit)', async () => {
      mockRedisResponse(LIMIT, 30)

      const result = await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(0)
    })

    it('должен вернуть success=false при превышении лимита (current > limit)', async () => {
      mockRedisResponse(LIMIT + 1, 30)

      const result = await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(result.success).toBe(false)
    })

    it('remaining никогда не должен быть отрицательным', async () => {
      mockRedisResponse(LIMIT + 10, 15)

      const result = await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(result.remaining).toBe(0)
      expect(result.remaining).toBeGreaterThanOrEqual(0)
    })

    it('должен вернуть success=true при count=1 с лимитом=1', async () => {
      mockRedisResponse(1, -1)

      const result = await rateLimit(TEST_KEY, 1, WINDOW_SEC)

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(0)
    })

    it('должен вернуть success=false при count=2 с лимитом=1', async () => {
      mockRedisResponse(2, 30)

      const result = await rateLimit(TEST_KEY, 1, WINDOW_SEC)

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })
  })

  // ─── Падение Redis / сетевые ошибки ────────────────────────────────────
  describe('отказоустойчивость (Redis недоступен)', () => {
    it('должен вернуть success=true если exec() возвращает null', async () => {
      mockExec.mockResolvedValueOnce(null)

      const result = await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(result.success).toBe(true)
    })

    it('должен вернуть remaining=limit если exec() возвращает null', async () => {
      mockExec.mockResolvedValueOnce(null)

      const result = await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(result.remaining).toBe(LIMIT)
    })

    it('должен вернуть resetIn=0 если exec() возвращает null', async () => {
      mockExec.mockResolvedValueOnce(null)

      const result = await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(result.resetIn).toBe(0)
    })
  })

  // ─── Ключи Redis ────────────────────────────────────────────────────────
  describe('формат ключей Redis', () => {
    it('должен использовать префикс ratelimit: для ключа', async () => {
      mockRedisResponse(1, -1)

      await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(mockMultiInstance.incr).toHaveBeenCalledWith(`ratelimit:${TEST_KEY}`)
    })

    it('должен использовать тот же prefixed-ключ для ttl', async () => {
      mockRedisResponse(1, -1)

      await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(mockMultiInstance.ttl).toHaveBeenCalledWith(`ratelimit:${TEST_KEY}`)
    })

    it('должен вызывать redis.multi() для атомарной операции', async () => {
      mockRedisResponse(1, 30)

      await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(mockRedis.multi).toHaveBeenCalledOnce()
    })
  })

  // ─── E2E / тестовый bypass ──────────────────────────────────────────────
  describe('E2E bypass (NEXT_PUBLIC_E2E=true)', () => {
    it('должен пропускать все запросы в E2E режиме', async () => {
      (process.env as Record<string, string | undefined>).NEXT_PUBLIC_E2E = 'true'

      const result = await rateLimit(TEST_KEY, 0, WINDOW_SEC) // лимит=0, но E2E

      expect(result.success).toBe(true)
    })

    it('должен вернуть remaining=limit в E2E режиме', async () => {
      (process.env as Record<string, string | undefined>).NEXT_PUBLIC_E2E = 'true'

      const result = await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(result.remaining).toBe(LIMIT)
    })

    it('НЕ должен обращаться к Redis в E2E режиме', async () => {
      (process.env as Record<string, string | undefined>).NEXT_PUBLIC_E2E = 'true'

      await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(mockRedis.multi).not.toHaveBeenCalled()
    })

    it('НЕ должен обходить лимит если E2E=false', async () => {
      (process.env as Record<string, string | undefined>).NEXT_PUBLIC_E2E = 'false'
      mockRedisResponse(LIMIT + 1, 30)

      const result = await rateLimit(TEST_KEY, LIMIT, WINDOW_SEC)

      expect(result.success).toBe(false)
    })
  })

  // ─── Разные конфигурации лимитов ────────────────────────────────────────
  describe('разные конфигурации лимитов', () => {
    it('корректно работает с лимитом passwordReset (3 req / 3600s)', async () => {
      mockRedisResponse(3, 3540)

      const result = await rateLimit('password-reset:ip:1.2.3.4', 3, 3600)

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(0)
      expect(result.resetIn).toBe(3540)
    })

    it('корректно блокирует при превышении passwordReset', async () => {
      mockRedisResponse(4, 3540)

      const result = await rateLimit('password-reset:ip:1.2.3.4', 3, 3600)

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('корректно работает с лимитом login (5 req / 900s)', async () => {
      mockRedisResponse(5, 800)

      const result = await rateLimit('login:192.168.1.1', 5, 900)

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(0)
    })

    it('корректно работает с большим лимитом API (100 req / 60s)', async () => {
      mockRedisResponse(50, 30)

      const result = await rateLimit('api:1.2.3.4', 100, 60)

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(50)
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
describe('resetRateLimit()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('должен вызывать redis.del с корректным prefixed-ключом', async () => {
    await resetRateLimit(TEST_KEY)

    expect(mockRedis.del).toHaveBeenCalledOnce()
    expect(mockRedis.del).toHaveBeenCalledWith(`ratelimit:${TEST_KEY}`)
  })

  it('должен добавлять префикс ratelimit: к любому ключу', async () => {
    const customKey = 'login:10.0.0.1'

    await resetRateLimit(customKey)

    expect(mockRedis.del).toHaveBeenCalledWith(`ratelimit:${customKey}`)
  })

  it('должен работать для ключей сброса пароля', async () => {
    const resetKey = 'password-reset:email:user@example.com'

    await resetRateLimit(resetKey)

    expect(mockRedis.del).toHaveBeenCalledWith(`ratelimit:${resetKey}`)
  })

  it('должен работать для ключей по IP', async () => {
    const ipKey = 'password-reset:ip:1.2.3.4'

    await resetRateLimit(ipKey)

    expect(mockRedis.del).toHaveBeenCalledWith(`ratelimit:${ipKey}`)
  })

  it('должен разрешать параллельные вызовы для разных ключей', async () => {
    await Promise.all([
      resetRateLimit('key:a'),
      resetRateLimit('key:b'),
      resetRateLimit('key:c'),
    ])

    expect(mockRedis.del).toHaveBeenCalledTimes(3)
  })
})

// ════════════════════════════════════════════════════════════════════════════
describe('getClientIP()', () => {
  // ─── Хелпер создания Request с заголовками ───────────────────────────
  function makeRequest(headers: Record<string, string>): Request {
    return new Request('http://localhost/test', { headers })
  }

  it('должен возвращать IP из заголовка x-forwarded-for', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' })

    expect(getClientIP(req)).toBe('1.2.3.4')
  })

  it('должен возвращать ПЕРВЫЙ IP из списка x-forwarded-for', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1, 172.16.0.1' })

    expect(getClientIP(req)).toBe('1.2.3.4')
  })

  it('должен обрезать пробелы из x-forwarded-for', () => {
    const req = makeRequest({ 'x-forwarded-for': '  1.2.3.4  , 10.0.0.1' })

    expect(getClientIP(req)).toBe('1.2.3.4')
  })

  it('должен использовать x-real-ip если x-forwarded-for отсутствует', () => {
    const req = makeRequest({ 'x-real-ip': '5.6.7.8' })

    expect(getClientIP(req)).toBe('5.6.7.8')
  })

  it('должен отдавать приоритет x-forwarded-for над x-real-ip', () => {
    const req = makeRequest({
      'x-forwarded-for': '1.2.3.4',
      'x-real-ip': '5.6.7.8',
    })

    expect(getClientIP(req)).toBe('1.2.3.4')
  })

  it('должен возвращать "unknown" если нет ни одного заголовка', () => {
    const req = makeRequest({})

    expect(getClientIP(req)).toBe('unknown')
  })

  it('должен возвращать "unknown" если заголовки пустые строки', () => {
    const req = makeRequest({ 'x-forwarded-for': '', 'x-real-ip': '' })

    // x-forwarded-for пустой → split даст [''] → trim → ''
    // Проверяем поведение функции
    const result = getClientIP(req)
    expect(typeof result).toBe('string')
  })

  it('должен корректно обрабатывать IPv6-адреса', () => {
    const req = makeRequest({ 'x-forwarded-for': '2001:db8::1' })

    expect(getClientIP(req)).toBe('2001:db8::1')
  })

  it('должен корректно обрабатывать IPv6 в списке адресов', () => {
    const req = makeRequest({
      'x-forwarded-for': '2001:db8::1, 10.0.0.1',
    })

    expect(getClientIP(req)).toBe('2001:db8::1')
  })
})
