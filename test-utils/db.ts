import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '@/lib/schema'
import { sql } from 'drizzle-orm'

// Тестовая БД (используется для интеграционных тестов)
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
  'postgresql://postgres:postgres@localhost:5432/merch_crm_test'

let testPool: Pool | null = null
let testDb: ReturnType<typeof drizzle> | null = null

export async function getTestDb() {
  if (!testDb) {
    testPool = new Pool({ connectionString: TEST_DATABASE_URL, max: 5 })
    testDb = drizzle(testPool, { schema })
  }
  return testDb
}

export async function cleanupTestDb() {
  const db = await getTestDb()
  
  // Отключаем foreign key checks временно
  await db.execute(sql`SET session_replication_role = 'replica'`)
  
  // Очищаем таблицы в правильном порядке
  const tables = [
    'order_items', 'order_attachments', 'payments', 'orders',
    'inventory_transactions', 'inventory_stocks', 'inventory_items',
    'clients', 'sessions', 'users', 'roles', 'departments'
  ]
  
  for (const table of tables) {
    // ship-safe-ignore: Table name is from fixed static list above
    await db.execute(sql`TRUNCATE TABLE ${sql.identifier(table)} CASCADE`)
  }
  
  // Включаем обратно
  await db.execute(sql`SET session_replication_role = 'origin'`)
}

export async function closeTestDb() {
  if (testPool) {
    await testPool.end()
    testPool = null
    testDb = null
  }
}

// Сид базовых данных
export async function seedTestData() {
  const db = await getTestDb()
  
  // Создаём отдел и роль
  const [department] = await db.insert(schema.departments).values({
    name: 'Тестовый отдел',
    isActive: true,
  }).returning()
  
  const [role] = await db.insert(schema.roles).values({
    name: 'Администратор',
    slug: 'admin',
    departmentId: department.id,
    permissions: { all: true },
  }).returning()
  
  // Создаём тестового пользователя
  const [user] = await db.insert(schema.users).values({
    name: 'Тест Админ',
    email: 'admin@test.com',
    roleId: role.id,
    departmentId: department.id,
  }).returning()
  
  return { department, role, user }
}
