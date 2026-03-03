'use server'

import { db } from '@/lib/db'
import { employeeFaces } from '@/lib/schema/presence'
import { users } from '@/lib/schema/users'
import { eq, desc, and } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { checkIsAdmin } from '@/lib/admin'
import { logError } from '@/lib/error-logger'
import { logAction } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { AddEmployeeFaceInputSchema, DeleteEmployeeFaceSchema, SetPrimaryFaceSchema } from '../validation'

export async function getEmployeesWithFaces() {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        // Получаем всех пользователей
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

        // Получаем все лица
        const faces = await db.query.employeeFaces.findMany({
            limit: 1000,
            where: eq(employeeFaces.isActive, true)
        })

        // Группируем лица по userId
        const facesByUser = faces.reduce((acc, face) => {
            if (!acc[face.userId]) {
                acc[face.userId] = []
            }
            acc[face.userId].push(face)
            return acc
        }, {} as Record<string, typeof faces>)

        // Объединяем данные
        const employeesWithFaces = allUsers.map(user => ({
            ...user,
            faces: facesByUser[user.id] || [],
            hasFace: (facesByUser[user.id]?.length || 0) > 0
        }))

        return { success: true, data: employeesWithFaces }
    } catch (error) {
        logError({ error: error as Error, path: 'employees.actions', method: 'getEmployeesWithFaces' })
        return { success: false, error: 'Failed to fetch employees' }
    }
}

export async function getEmployeesWithoutFaces() {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        // Получаем всех пользователей
        const allUsers = await db.query.users.findMany({
            limit: 1000,
            columns: {
                id: true,
                name: true,
                email: true
            }
        })

        // Получаем ID пользователей, у которых уже есть активные лица
        const usersWithFaces = await db.query.employeeFaces.findMany({
            limit: 1000,
            where: eq(employeeFaces.isActive, true),
            columns: {
                userId: true
            }
        })

        const userIdsWithFaces = new Set(usersWithFaces.map(f => f.userId))

        // Фильтруем пользователей без лиц
        const usersWithoutFaces = allUsers.filter(u => !userIdsWithFaces.has(u.id))

        return { success: true, data: usersWithoutFaces }
    } catch (error) {
        logError({ error: error as Error, path: 'employees.actions', method: 'getEmployeesWithoutFaces' })
        return { success: false, error: 'Failed to fetch employees' }
    }
}

export async function addEmployeeFace(data: {
    userId: string
    photoUrl: string
    faceEncoding: number[]
    quality?: number
}) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const isAdmin = await checkIsAdmin(session)
        if (!isAdmin) {
            return { success: false, error: 'Forbidden' }
        }

        const parsed = AddEmployeeFaceInputSchema.safeParse(data)
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message }
        }

        // Проверяем, есть ли уже primary face
        const existingPrimary = await db.query.employeeFaces.findFirst({
            where: and(
                eq(employeeFaces.userId, parsed.data.userId),
                eq(employeeFaces.isActive, true),
                eq(employeeFaces.isPrimary, true)
            )
        })

        const [face] = await db.insert(employeeFaces).values({
            userId: parsed.data.userId,
            photoUrl: parsed.data.photoUrl,
            faceEncoding: parsed.data.faceEncoding,
            quality: parsed.data.quality?.toString(),
            isActive: true,
            isPrimary: !existingPrimary,
            createdById: session.id
        }).returning()

        await logAction('Добавление лица сотрудника', 'employee_face', face.id, { userId: parsed.data.userId })
        revalidatePath('/staff/employees')

        return { success: true, data: face }
    } catch (error) {
        logError({ error: error as Error, path: 'employees.actions', method: 'addEmployeeFace' })
        return { success: false, error: 'Failed to add face' }
    }
}

export async function deleteEmployeeFace(faceId: string) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const isAdmin = await checkIsAdmin(session)
        if (!isAdmin) {
            return { success: false, error: 'Forbidden' }
        }

        const parsed = DeleteEmployeeFaceSchema.safeParse({ faceId })
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message }
        }

        // Софт-удаление
        await db.update(employeeFaces)
            .set({
                isActive: false,
                updatedAt: new Date()
            })
            .where(eq(employeeFaces.id, parsed.data.faceId))

        await logAction('Удаление лица сотрудника', 'employee_face', parsed.data.faceId, {})
        revalidatePath('/staff/employees')

        return { success: true }
    } catch (error) {
        logError({ error: error as Error, path: 'employees.actions', method: 'deleteEmployeeFace' })
        return { success: false, error: 'Failed to delete face' }
    }
}

export async function setPrimaryFace(faceId: string, userId: string) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const isAdmin = await checkIsAdmin(session)
        if (!isAdmin) {
            return { success: false, error: 'Forbidden' }
        }

        const parsed = SetPrimaryFaceSchema.safeParse({ faceId, userId })
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message }
        }

        // Убираем primary у всех лиц пользователя
        await db.update(employeeFaces)
            .set({ isPrimary: false, updatedAt: new Date() })
            .where(eq(employeeFaces.userId, parsed.data.userId))

        // Устанавливаем выбранное лицо основным
        await db.update(employeeFaces)
            .set({ isPrimary: true, updatedAt: new Date() })
            .where(eq(employeeFaces.id, parsed.data.faceId))

        await logAction('Изменение основного лица', 'employee_face', parsed.data.faceId, { isPrimary: true })
        revalidatePath('/staff/employees')

        return { success: true }
    } catch (error) {
        logError({ error: error as Error, path: 'employees.actions', method: 'setPrimaryFace' })
        return { success: false, error: 'Failed to set primary face' }
    }
}
