import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '@/lib/schema'
import { sql } from 'drizzle-orm'
import * as fs from 'fs'

const LOG_FILE = '/tmp/vitest-db.log'
function logToFile(msg: string) {
  try {
    const timestamp = new Date().toISOString()
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`)
  } catch (e) {
    // Ignore log errors
  }
}

// Тестовая БД (используется для интеграционных тестов)
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
  'postgresql://postgres:postgres@localhost:5432/merch_crm_test'

let testPool: Pool | null = null
let testDb: ReturnType<typeof drizzle> | null = null

export async function getTestDb() {
  if (!testDb) {
    logToFile('🔌 Initializing test connection pool (max: 10)...')
    testPool = new Pool({ 
      connectionString: TEST_DATABASE_URL, 
      max: 10,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 30000,
    })
    testDb = drizzle(testPool, { schema })
  }
  return testDb
}

export async function cleanupTestDb() {
  const start = Date.now()
  logToFile('🧪 Starting cleanupTestDb...')
  const db = await getTestDb()
  
  // Очищаем таблицы в правильном порядке
  const tables = [
    'order_items', 'order_attachments', 'payments', 'orders',
    'inventory_transactions', 'inventory_stocks', 'inventory_items',
    'clients', 'sessions', 'users', 'roles', 'departments'
  ]
  
  const tableNames = tables.map(t => `"${t}"`).join(', ')
  await db.execute(sql.raw(`TRUNCATE TABLE ${tableNames} CASCADE`))
  
  logToFile(`✅ cleanupTestDb finished in ${Date.now() - start}ms`)
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
  const start = Date.now()
  logToFile('🌱 Starting seedTestData...')
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
  
  logToFile(`✅ seedTestData finished in ${Date.now() - start}ms`)
  return { department, role, user }
}
