'use server'

import { db } from '@/lib/db'
import { users } from '@/lib/schema/users'
import { desc } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { logError } from '@/lib/error-logger'

export async function getEmployees() {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const allUsers = await db.query.users.findMany({
            limit: 1000,
            columns: {
                id: true,
                name: true,
                email: true,
                avatar: true
            },
            with: { role: true },
            orderBy: [desc(users.createdAt)]
        })

        const employees = allUsers.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatar,
            role: (user.role as any)?.name || 'Сотрудник'
        }))

        return { success: true, data: employees }
    } catch (error) {
        logError({ error: error as Error, path: 'employees.actions', method: 'getEmployees' })
        return { success: false, error: 'Failed to fetch employees' }
    }
}

// Fallback for types if needed elsewhere, but logic is gone
export async function getEmployeesWithFaces() {
    return getEmployees()
}

export async function getEmployeesWithoutFaces() {
    return { success: true, data: [] }
}

export async function addEmployeeFace() {
    return { success: false, error: 'Функционал биометрии отключен' }
}

export async function deleteEmployeeFace() {
    return { success: false, error: 'Функционал биометрии отключен' }
}

export async function setPrimaryFace() {
    return { success: false, error: 'Функционал биометрии отключен' }
}
