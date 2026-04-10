import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils/render'
import { OrdersTable } from '../orders-table'
import { createOrders, createOrder } from '@/test-utils/factories'

// Мокаем server actions
vi.mock('../actions/core.actions', () => ({
 updateOrderField: vi.fn(() => Promise.resolve({ success: true })),
 archiveOrder: vi.fn(() => Promise.resolve({ success: true })),
}))

// Мокаем next/navigation
vi.mock('next/navigation', () => ({
 useRouter: vi.fn(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
 })),
 useSearchParams: vi.fn(() => new URLSearchParams()),
 usePathname: vi.fn(() => '/dashboard/orders'),
}))

// Мокаем звуки
vi.mock('@/lib/sounds', () => ({
 playSound: vi.fn(),
 initSoundSettings: vi.fn(),
 setGlobalSoundConfig: vi.fn(),
}))

vi.mock('@/components/branding-provider', () => ({
 useBranding: vi.fn(() => ({
  currencySymbol: '₽',
  primaryColor: '#5d00ff',
  companyName: 'MerchCRM',
 })),
 BrandingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { updateOrderField } from '../actions/core.actions'

describe('OrdersTable', () => {
 beforeEach(() => {
  vi.clearAllMocks()
 })

 it('отображает список заказов', () => {
  const orders = createOrders(3)
  
  render(<OrdersTable orders={orders} isAdmin={false} />)
  
  orders!.forEach(order => {
   expect(screen.getAllByText(new RegExp(`ORD-.*${order.id.slice(0, 4)}`, 'i'))[0]).toBeInTheDocument()
  })
 })

 it('отображает сообщение если заказов нет', () => {
  render(<OrdersTable orders={[]} isAdmin={false} />)
  
  expect(screen.getByText(/Заказов пока нет/i)).toBeInTheDocument()
 })

 it('отображает имя клиента', () => {
  const order = createOrder({ 
   client: { 
    id: '1', 
    displayName: 'Иван Петров',
    name: 'Иван Петров',
   } as unknown as { id: string; displayName: string; name: string }
  })
  
  render(<OrdersTable orders={[order]} isAdmin={false} />)
  
  expect(screen.getAllByText('Иван Петров')[0]).toBeInTheDocument()
 })

 it('скрывает колонку бюджета если showFinancials=false', () => {
  const order = createOrder({ totalAmount: '50000' })
  
  render(<OrdersTable orders={[order]} isAdmin={false} showFinancials={false} />)
  
  expect(screen.queryByText(/50 000/)).not.toBeInTheDocument()
 })

 describe('Выбор заказов', () => {
  it('выбирает заказ по клику на чекбокс', async () => {
   const orders = createOrders(2)
   
   const { container } = render(<OrdersTable orders={orders} isAdmin={false} />)
   
   // Find the first row checkbox in the table
   const checkbox = container.querySelector('table tbody tr:first-child input[type="checkbox"]') as HTMLElement 
    || screen.getAllByRole('checkbox', { hidden: true }).find(c => c.id.startsWith('select-order-'))!
   
   fireEvent.click(checkbox)
   
   expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })

  it('выбирает все заказы', () => {
   const orders = createOrders(3)
   
   const { container } = render(<OrdersTable orders={orders} isAdmin={false} />)
   
   const selectAll = container.querySelector('#select-all-orders') as HTMLElement
    || screen.getByRole('checkbox', { name: /Выбрать все заказы/i, hidden: true })
    
   fireEvent.click(selectAll)
   
   expect(selectAll).toHaveAttribute('aria-checked', 'true')
  })
 })

 describe('Действия с заказами', () => {
  it('переключает флаг срочности', () => {
   const order = createOrder({ isUrgent: false })
   
   render(<OrdersTable orders={[order]} isAdmin={false} />)
   
   const urgentButton = screen.getByLabelText(/Сделать срочным/i)
   fireEvent.click(urgentButton)
   
   expect(updateOrderField).toHaveBeenCalledWith(order.id, 'isUrgent', true)
  })
 })
})
