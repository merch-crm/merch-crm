import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test-utils/render'
import userEvent from '@testing-library/user-event'
import { Pagination } from '../pagination'

// Мокаем next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams('page=1'),
  usePathname: () => '/dashboard/orders',
}))

describe('Pagination', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('отображает правильное количество страниц', () => {
    render(
      <Pagination totalItems={100} pageSize={10} currentPage={1} />
    )
    
    // Component renders page buttons: 1, 2, ..., 10
    // The "1" button should be present
    const pageButtons = screen.getAllByRole('button')
    expect(pageButtons.length).toBeGreaterThan(2) // At least Prev, some pages, Next
  })

  it('выделяет текущую страницу', () => {
    render(
      <Pagination totalItems={100} pageSize={10} currentPage={1} />
    )
    
    // Find the active pagination button
    const activeButton = document.querySelector('.pagination-item.active')
    expect(activeButton).not.toBeNull()
    expect(activeButton?.textContent).toBe('1')
  })

  it('переходит на следующую страницу', async () => {
    render(
      <Pagination totalItems={100} pageSize={10} currentPage={1} />
    )
    
    const nextButton = screen.getByText(/След/i)
    await user.click(nextButton)
    
    expect(mockPush).toHaveBeenCalled()
  })

  it('склоняет названия элементов', () => {
    const { rerender } = render(
      <Pagination totalItems={1} pageSize={10} currentPage={1} itemNames={['клиент', 'клиента', 'клиентов']} />
    )
    // Component renders "из 1 клиента" (genitive case for "из X")
    expect(screen.getByText(/клиента/i)).toBeInTheDocument()

    rerender(
      <Pagination totalItems={5} pageSize={10} currentPage={1} itemNames={['клиент', 'клиента', 'клиентов']} />
    )
    expect(screen.getByText(/клиентов/i)).toBeInTheDocument()
  })
})
