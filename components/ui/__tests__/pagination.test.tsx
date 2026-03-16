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
      <Pagination 
        totalItems={100} 
        pageSize={10} 
        currentPage={1} 
      />
    )
    
    // Должны быть страницы 1, 2 и т.д.
    expect(screen.getByText(/1$/)).toBeInTheDocument() // Exact match for page 1
    expect(screen.getByText(/2$/)).toBeInTheDocument()
    expect(screen.getByText(/10$/)).toBeInTheDocument()
  })

  it('выделяет текущую страницу', () => {
    render(
      <Pagination 
        totalItems={100} 
        pageSize={10} 
        currentPage={1} 
      />
    )
    
    const currentPageButton = screen.getByText(/1$/)
    expect(currentPageButton).toHaveClass('active')
  })

  it('переходит на следующую страницу', async () => {
    render(
      <Pagination 
        totalItems={100} 
        pageSize={10} 
        currentPage={1} 
      />
    )
    
    const nextButton = screen.getByText(/След/i)
    await user.click(nextButton)
    
    expect(mockPush).toHaveBeenCalled()
  })

  it('склоняет названия элементов', () => {
    const { rerender } = render(
      <Pagination 
        totalItems={1} 
        pageSize={10} 
        currentPage={1} 
        itemNames={['клиент', 'клиента', 'клиентов']}
      />
    )
    // The component uses itemNames[1] for single item in genitive context "из 1 клиента"
    expect(screen.getByText(/1 клиент/i)).toBeInTheDocument()

    rerender(
      <Pagination 
        totalItems={5} 
        pageSize={10} 
        currentPage={1} 
        itemNames={['клиент', 'клиента', 'клиентов']}
      />
    )
    expect(screen.getByText(/5 клиентов/i)).toBeInTheDocument()
  })
})
