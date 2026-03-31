import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validatePromocode } from '@/lib/promocodes'
import { db } from '@/lib/db'
import { getBrandingSettings } from '@/app/(main)/admin-panel/branding/actions'
import { BrandingSettings } from '@/lib/types/branding'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      promocodes: {
        findFirst: vi.fn(),
      },
    },
  },
}))

vi.mock('@/app/(main)/admin-panel/branding/actions', () => ({
  getBrandingSettings: vi.fn(),
}))

describe('validatePromocode', () => {
  const validPromo = {
    id: 'promo-1',
    code: 'SALE20',
    discountType: 'percentage' as const,
    value: '20',
    minOrderAmount: '1000',
    usageLimit: 100,
    usageCount: 50,
    isActive: true,
    expiresAt: new Date(Date.now() + 86400000), // завтра
    startDate: new Date(Date.now() - 86400000), // вчера
    maxDiscountAmount: '2000',
    constraints: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getBrandingSettings).mockResolvedValue({ currencySymbol: '₽' } as unknown as BrandingSettings)
  })

  it('возвращает успех для валидного промокода', async () => {
    vi.mocked(db.query.promocodes.findFirst).mockResolvedValue(validPromo as unknown as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    
    const result = await validatePromocode('SALE20', 5000)
    
    expect(result.isValid).toBe(true)
    expect(result.discount).toBe(1000) // 20% от 5000
  })

  it('возвращает ошибку для неактивного промокода', async () => {
    vi.mocked(db.query.promocodes.findFirst).mockResolvedValue({ ...validPromo, isActive: false } as unknown as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    
    const result = await validatePromocode('SALE20', 5000)
    
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('деактивирован')
  })

  it('возвращает ошибку для истёкшего промокода', async () => {
    vi.mocked(db.query.promocodes.findFirst).mockResolvedValue({ 
      ...validPromo, 
      expiresAt: new Date(Date.now() - 1000) 
    } as unknown as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    
    const result = await validatePromocode('SALE20', 5000)
    
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('истек')
  })

  it('возвращает ошибку при нехватке суммы заказа', async () => {
    vi.mocked(db.query.promocodes.findFirst).mockResolvedValue(validPromo as unknown as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    
    const result = await validatePromocode('SALE20', 500)
    
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Минимальная сумма')
  })

  it('ограничивает скидку максимумом', async () => {
    vi.mocked(db.query.promocodes.findFirst).mockResolvedValue(validPromo as unknown as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    
    // 20% от 20000 = 4000, но максимум 2000
    const result = await validatePromocode('SALE20', 20000)
    
    expect(result.isValid).toBe(true)
    expect(result.discount).toBe(2000)
    expect(result.message).toContain('Скидка ограничена')
  })

  it('рассчитывает фиксированную скидку', async () => {
    vi.mocked(db.query.promocodes.findFirst).mockResolvedValue({
      ...validPromo,
      discountType: 'fixed',
      value: '500',
    } as unknown as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    
    const result = await validatePromocode('SALE20', 5000)
    
    expect(result.isValid).toBe(true)
    expect(result.discount).toBe(500)
  })
})
