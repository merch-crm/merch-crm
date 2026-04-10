import { faker } from '@faker-js/faker/locale/ru'
import type { Order, OrderItem } from '@/lib/types/order'
import type { ClientSummary, ClientType } from '@/lib/types/client'

// Генератор уникальных ID
let idCounter = 0
export const generateId = () => `test-${++idCounter}-${Date.now()}`

// Фабрика клиентов
export function createClient(overrides?: Partial<ClientSummary>): ClientSummary {
 return {
  id: generateId(),
  name: faker.person.fullName(),
  displayName: faker.person.fullName(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  phone: faker.phone.number({ style: 'international' }),
  email: faker.internet.email(),
  clientType: (overrides?.clientType || faker.helpers.arrayElement(['b2c', 'b2b'] as const)) as ClientType,
  company: faker.helpers.maybe(() => faker.company.name()) ?? null,
  city: faker.location.city(),
  totalOrders: faker.number.int({ min: 0, max: 50 }),
  totalSpent: faker.number.int({ min: 0, max: 500000 }),
  lastOrderDate: faker.date.recent().toISOString(),
  createdAt: faker.date.past(),
  isArchived: false,
  managerId: null,
  isVip: false,
  type: (overrides?.type || overrides?.clientType || faker.helpers.arrayElement(['b2c', 'b2b'] as const)) as ClientType,
  ...overrides,
 }
}

// Фабрика позиций заказа
export function createOrderItem(overrides?: Partial<OrderItem>): OrderItem {
 const quantity = faker.number.int({ min: 1, max: 100 })
 const price = faker.number.int({ min: 100, max: 5000 })
 
 return {
  id: generateId(),
  orderId: generateId(),
  description: faker.commerce.productName(),
  quantity,
  price: String(price),
  inventoryId: faker.helpers.maybe(() => generateId()) ?? null,
  createdAt: new Date().toISOString(),
  ...overrides,
 }
}

// Фабрика заказов
export function createOrder(overrides?: Partial<Order>): Order {
 const items = (overrides?.items || [createOrderItem(), createOrderItem()]) as OrderItem[]
 const totalAmount = items.reduce(
  (sum, item) => sum + (item.quantity * Number(item.price || 0)), 
  0
 )
 
 return {
  id: generateId(),
  orderNumber: `ORD-24-${faker.number.int({ min: 1000, max: 9999 })}`,
  status: faker.helpers.arrayElement(['new', 'confirmed', 'in_production', 'shipped', 'completed'] as const),
  priority: faker.helpers.arrayElement(['low', 'normal', 'high', 'urgent'] as const),
  isUrgent: faker.datatype.boolean({ probability: 0.2 }),
  clientId: generateId(),
  client: createClient(),
  items,
  totalAmount: String(totalAmount),
  paidAmount: faker.number.int({ min: 0, max: totalAmount }),
  createdAt: faker.date.recent(),
  updatedAt: new Date(),
  createdBy: generateId(),
  creator: {
   id: generateId(),
   name: faker.person.fullName(),
   role: { name: 'Менеджер' },
  },
  isArchived: false,
  ...overrides,
 }
}

// Массовое создание
export function createOrders(count: number, overrides?: Partial<Order>): Order[] {
 return Array.from({ length: count }, () => createOrder(overrides))
}

export function createClients(count: number, overrides?: Partial<ClientSummary>): ClientSummary[] {
 return Array.from({ length: count }, () => createClient(overrides))
}
