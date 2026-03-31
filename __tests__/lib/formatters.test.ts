import { describe, it, expect } from 'vitest'
import { 
  formatCurrency, 
  formatPhone, 
  formatTimeAgo,
  truncate 
} from '@/lib/formatters'

describe('formatCurrency', () => {
  it('форматирует число с разделителями тысяч', () => {
    // Note: depending on locale settings in vitest, whitespace might be non-breaking space
    const result = formatCurrency(1234567).replace(/\s/g, ' ')
    expect(result).toBe('1 234 567 ₽')
  })
  
  it('добавляет символ валюты', () => {
    const result = formatCurrency(1000, '₽').replace(/\s/g, ' ')
    expect(result).toBe('1 000 ₽')
  })
  
  it('возвращает 0 для 0', () => {
    expect(formatCurrency(0)).toContain('0')
  })
  
  it('округляет дробные числа', () => {
    const result = formatCurrency(1234.567).replace(/\s/g, ' ')
    // Note: space might be NBSP, and we expect 1 234,57 ₽
    expect(result).toBe('1 234,57 ₽')
  })
})

describe('formatPhone', () => {
  it('форматирует российский номер', () => {
    expect(formatPhone('79991234567')).toBe('+7 (999) 123-45-67')
  })
  
  it('обрабатывает номер с +7', () => {
    expect(formatPhone('+79991234567')).toBe('+7 (999) 123-45-67')
  })
  
  it('обрабатывает номер с 8', () => {
    expect(formatPhone('89991234567')).toBe('+7 (999) 123-45-67')
  })
  
  it('возвращает исходное значение если формат неизвестен', () => {
    expect(formatPhone('12345')).toBe('12345')
  })
  
  it('возвращает пустую строку для null', () => {
    expect(formatPhone(null)).toBe('')
  })
})

describe('formatTimeAgo', () => {
  it('показывает "меньше минуты назад" для очень недавних дат', () => {
    const now = new Date()
    expect(formatTimeAgo(now)).toContain('назад')
  })
  
  it('показывает минуты', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatTimeAgo(fiveMinutesAgo)).toContain('5 минут')
  })
  
  it('показывает часы', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    expect(formatTimeAgo(twoHoursAgo)).toContain('часов')
  })
  
  it('показывает дни', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    expect(formatTimeAgo(threeDaysAgo)).toContain('3 дня')
  })
})

describe('truncate', () => {
  it('обрезает длинную строку', () => {
    expect(truncate('Очень длинный текст', 10)).toBe('Очень длин...')
  })
  
  it('не обрезает короткую строку', () => {
    expect(truncate('Короткий', 20)).toBe('Короткий')
  })
  
  it('использует кастомный suffix', () => {
    expect(truncate('Длинный текст', 10, '…')).toBe('Длинный те…')
  })
})
