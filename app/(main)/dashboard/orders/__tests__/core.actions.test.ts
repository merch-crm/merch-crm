import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest'
import { 
 getOrders, 
 createOrder, 
 updateOrderField,
} from '../actions/core.actions'
import { getTestDb, cleanupTestDb, closeTestDb, seedTestData } from '@/test-utils/db'
import { clients } from '@/lib/schema/clients/main'
import { orders } from '@/lib/schema/orders'
import { eq } from 'drizzle-orm'

// Мокаем getSession
vi.mock('@/lib/session', () => ({
 getSession: vi.fn()
}))

// Мокаем revalidatePath
vi.mock('next/cache', () => ({
 revalidatePath: vi.fn()
}))

import { getSession } from '@/lib/session'

describe('Order Actions (Integration)', () => {
 let testData: Awaited<ReturnType<typeof seedTestData>>
 let db: Awaited<ReturnType<typeof getTestDb>>

 beforeEach(async () => {
  db = await getTestDb()
  await cleanupTestDb()
  testData = await seedTestData()
  
  // По умолчанию авторизован как админ
  vi.mocked(getSession).mockResolvedValue({
   id: testData.user.id,
   sessionId: 'test-session',
   email: testData.user.email,
   name: testData.user.name,
   roleSlug: 'admin',
   departmentName: 'Тестовый отдел',
   // Fields to satisfy the mock type
   ua: 'test-ua',
   expires: new Date(Date.now() + 3600000),
   betterAuthUser: { id: testData.user.id, name: testData.user.name, email: testData.user.email, emailVerified: true, createdAt: new Date(), updatedAt: new Date() },
   betterAuthSession: { id: 'test-session', userId: testData.user.id, expiresAt: new Date(), token: 'token', createdAt: new Date(), updatedAt: new Date() }
  } as unknown as any) // eslint-disable-line @typescript-eslint/no-explicit-any
 })

 afterEach(async () => {
  vi.clearAllMocks()
 })

 afterAll(async () => {
  await closeTestDb()
 })

 describe('getOrders', () => {
  it('возвращает список заказов с клиентами', async () => {
   // Создаём клиента и заказ
   const [client] = await db.insert(clients).values({
    firstName: 'Тест',
    lastName: 'Клиент',
    phone: '+79991234567',
   }).returning()

   await db.insert(orders).values({
    orderNumber: 'ORD-24-0001',
    clientId: client.id,
    status: 'new',
    priority: 'medium',
    totalAmount: '5000.00',
    createdBy: testData.user.id,
   })

   const result = await getOrders();
   
   if (result.success) {
    expect(result.data?.orders).toHaveLength(1)
   } else {
    throw new Error(result.error);
   }
  })
 })

 describe('createOrder', () => {
  let testClient: typeof clients.$inferSelect

  beforeEach(async () => {
   const [client] = await db.insert(clients).values({
    firstName: 'Тестовый',
    lastName: 'Клиент',
    phone: '+79991234567',
   }).returning()
   testClient = client
  })

  it('создаёт заказ с минимальными данными', async () => {
   const formData = new FormData()
   formData.set('clientId', testClient.id)
   formData.set('priority', 'medium')
   formData.set('isUrgent', 'false')
   formData.set('advanceAmount', '0')
   formData.set('items', JSON.stringify([
    { description: 'Футболка белая XL', quantity: 10, price: 500 }
   ]))

   const result = await createOrder(formData)
   expect(result.success).toBe(true)

   // Проверяем что заказ создан в БД
   const ordersInDb = await db.select().from(orders).limit(1)
   expect(ordersInDb!.length).toBe(1)
   expect(ordersInDb[0].totalAmount).toBe('5000.00')
  })
 })

 describe('updateOrderField', () => {
  let testOrder: typeof orders.$inferSelect

  beforeEach(async () => {
   const [client] = await db.insert(clients).values({
    firstName: 'Тестовый',
    lastName: 'Клиент',
    phone: '+79991234567',
   }).returning();

   [testOrder] = await db.insert(orders).values({
    orderNumber: 'ORD-24-0001',
    clientId: client.id,
    status: 'new',
    priority: 'medium',
    isUrgent: false,
    totalAmount: '5000.00',
    createdBy: testData.user.id,
   }).returning()
  })

  it('обновляет приоритет заказа', async () => {
   const result = await updateOrderField(testOrder.id, 'priority', 'high')
   
   expect(result.success).toBe(true)

   const [updated] = await db.select()
    .from(orders)
    .where(eq(orders.id, testOrder.id))
    .limit(1)
   expect(updated.priority).toBe('high')
  })
 })
})
