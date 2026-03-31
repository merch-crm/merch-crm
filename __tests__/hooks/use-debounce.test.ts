import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('возвращает начальное значение сразу', () => {
    const { result } = renderHook(() => useDebounce('initial', 300))
    expect(result.current).toBe('initial')
  })

  it('не обновляет значение до истечения задержки', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })
    
    // Прошло 100мс - значение не должно измениться
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('initial')
  })

  it('обновляет значение после истечения задержки', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current).toBe('updated')
  })

  it('сбрасывает таймер при каждом изменении', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    )

    // Быстрые последовательные изменения
    rerender({ value: 'ab' })
    act(() => vi.advanceTimersByTime(100))
    
    rerender({ value: 'abc' })
    act(() => vi.advanceTimersByTime(100))
    
    rerender({ value: 'abcd' })
    act(() => vi.advanceTimersByTime(100))

    // Всё ещё исходное значение
    expect(result.current).toBe('a')

    // После полной задержки - последнее значение
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('abcd')
  })
})
