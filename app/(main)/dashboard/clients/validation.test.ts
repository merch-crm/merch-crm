import { describe, it, expect } from 'vitest'
import {
    ClientSchema,
    ClientUpdateSchema,
    ClientFiltersSchema,
    ClientIdSchema,
    BulkClientsSchema,
    UpdateClientFieldSchema,
} from './validation'

// ─── ClientSchema ──────────────────────────────────────────

describe('ClientSchema', () => {
    const validClient = {
        lastName: 'Иванов',
        firstName: 'Иван',
        phone: '+7 999 123-45-67',
    }

    it('проходит валидацию с минимальными полями', () => {
        const result = ClientSchema.safeParse(validClient)
        expect(result.success).toBe(true)
    })

    it('проходит валидацию со всеми полями', () => {
        const result = ClientSchema.safeParse({
            ...validClient,
            patronymic: 'Иванович',
            company: 'ООО Ромашка',
            telegram: '@ivanov',
            instagram: '@ivan_design',
            email: 'ivan@example.com',
            city: 'Москва',
            address: 'ул. Ленина, д. 1',
            comments: 'VIP клиент',
            socialLink: 'https://vk.com/ivanov',
            acquisitionSource: 'Instagram',
            managerId: '550e8400-e29b-41d4-a716-446655440000',
            clientType: 'b2b',
        })
        expect(result.success).toBe(true)
    })

    it('отклоняет пустую фамилию', () => {
        const result = ClientSchema.safeParse({ ...validClient, lastName: '' })
        expect(result.success).toBe(false)
    })

    it('отклоняет пустое имя', () => {
        const result = ClientSchema.safeParse({ ...validClient, firstName: '' })
        expect(result.success).toBe(false)
    })

    it('отклоняет пустой телефон', () => {
        const result = ClientSchema.safeParse({ ...validClient, phone: '' })
        expect(result.success).toBe(false)
    })

    it('отклоняет некорректный email', () => {
        const result = ClientSchema.safeParse({ ...validClient, email: 'not-an-email' })
        expect(result.success).toBe(false)
    })

    it('принимает пустой email (nullable)', () => {
        const result = ClientSchema.safeParse({ ...validClient, email: '' })
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.email).toBeNull()
        }
    })

    it('принимает пустой managerId и трансформирует в null', () => {
        const result = ClientSchema.safeParse({ ...validClient, managerId: '' })
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.managerId).toBeNull()
        }
    })

    it('clientType по умолчанию b2c', () => {
        const result = ClientSchema.safeParse(validClient)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.clientType).toBe('b2c')
        }
    })

    it('ignoreDuplicates принимает строку "true"', () => {
        const result = ClientSchema.safeParse({ ...validClient, ignoreDuplicates: 'true' })
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.ignoreDuplicates).toBe(true)
        }
    })
})

// ─── ClientUpdateSchema ────────────────────────────────────

describe('ClientUpdateSchema', () => {
    it('не содержит поле ignoreDuplicates', () => {
        const result = ClientUpdateSchema.safeParse({
            lastName: 'Петров',
            firstName: 'Пётр',
            phone: '+7 999 111-22-33',
            ignoreDuplicates: true,
        })
        expect(result.success).toBe(true)
        if (result.success) {
            expect('ignoreDuplicates' in result.data).toBe(false)
        }
    })
})

// ─── ClientFiltersSchema ───────────────────────────────────

describe('ClientFiltersSchema', () => {
    it('применяет значения по умолчанию', () => {
        const result = ClientFiltersSchema.safeParse({})
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.page).toBe(1)
            expect(result.data.limit).toBe(50)
            expect(result.data.sortBy).toBe('alphabet')
            expect(result.data.period).toBe('all')
            expect(result.data.orderCount).toBe('any')
            expect(result.data.status).toBe('all')
            expect(result.data.showArchived).toBe(false)
        }
    })

    it('принимает корректный sortBy', () => {
        for (const sortBy of ['alphabet', 'last_order', 'order_count', 'revenue']) {
            const result = ClientFiltersSchema.safeParse({ sortBy })
            expect(result.success).toBe(true)
        }
    })

    it('отклоняет неизвестный sortBy', () => {
        const result = ClientFiltersSchema.safeParse({ sortBy: 'invalid' })
        expect(result.success).toBe(false)
    })

    it('page не может быть меньше 1', () => {
        const result = ClientFiltersSchema.safeParse({ page: 0 })
        expect(result.success).toBe(false)
    })

    it('limit не может превышать 100', () => {
        const result = ClientFiltersSchema.safeParse({ limit: 200 })
        expect(result.success).toBe(false)
    })

    it('принимает строковые числа (coerce)', () => {
        const result = ClientFiltersSchema.safeParse({ page: '3', limit: '25' })
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.page).toBe(3)
            expect(result.data.limit).toBe(25)
        }
    })
})

// ─── ClientIdSchema ────────────────────────────────────────

describe('ClientIdSchema', () => {
    it('принимает корректный UUID', () => {
        const result = ClientIdSchema.safeParse({
            clientId: '550e8400-e29b-41d4-a716-446655440000',
        })
        expect(result.success).toBe(true)
    })

    it('отклоняет некорректный ID', () => {
        const result = ClientIdSchema.safeParse({ clientId: 'not-a-uuid' })
        expect(result.success).toBe(false)
    })
})

// ─── BulkClientsSchema ─────────────────────────────────────

describe('BulkClientsSchema', () => {
    it('принимает массив UUID', () => {
        const result = BulkClientsSchema.safeParse({
            clientIds: [
                '550e8400-e29b-41d4-a716-446655440000',
                '550e8400-e29b-41d4-a716-446655440001',
            ],
        })
        expect(result.success).toBe(true)
    })

    it('отклоняет пустой массив', () => {
        const result = BulkClientsSchema.safeParse({ clientIds: [] })
        expect(result.success).toBe(false)
    })

    it('отклоняет некорректные UUID в массиве', () => {
        const result = BulkClientsSchema.safeParse({
            clientIds: ['not-uuid', '550e8400-e29b-41d4-a716-446655440000'],
        })
        expect(result.success).toBe(false)
    })
})

// ─── UpdateClientFieldSchema ───────────────────────────────

describe('UpdateClientFieldSchema', () => {
    it('принимает допустимое поле managerId', () => {
        const result = UpdateClientFieldSchema.safeParse({
            clientId: '550e8400-e29b-41d4-a716-446655440000',
            field: 'managerId',
            value: '550e8400-e29b-41d4-a716-446655440001',
        })
        expect(result.success).toBe(true)
    })

    it('отклоняет недопустимое поле', () => {
        const result = UpdateClientFieldSchema.safeParse({
            clientId: '550e8400-e29b-41d4-a716-446655440000',
            field: 'password',
            value: '123',
        })
        expect(result.success).toBe(false)
    })

    it('принимает все допустимые поля', () => {
        const fields = ['managerId', 'clientType', 'city', 'lastName', 'firstName', 'company']
        for (const field of fields) {
            const result = UpdateClientFieldSchema.safeParse({
                clientId: '550e8400-e29b-41d4-a716-446655440000',
                field,
                value: 'test',
            })
            expect(result.success).toBe(true)
        }
    })
})
